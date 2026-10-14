import {fetchUtils} from 'react-admin';
import {ifddUrlSchema} from './Env';

/**
 * Data provider for the IFDD backend.
 *
 * Implements the react-admin data provider object interface. The previous
 * implementation used the legacy (type, resource, params) signature, which
 * react-admin only still accepts through convertLegacyDataProvider.
 *
 * Values are passed through in their JSON-LD shape. Detail responses carry
 * typed value objects ({"@type":…,"@value":…} / {"@id":…}); the field
 * components resolve them. Flattening them here would destroy the type
 * information the declarative field lists rely on.
 */

const stripSchemaPrefix = (json) => {
    Object.keys(json).forEach(key => {
        if (key.includes(ifddUrlSchema)) {
            const newKey = key.replace(ifddUrlSchema, '').replace(/\//g, '_');
            json[newKey] = json[key];
            delete json[key];
        }
    });
    return json;
};

const processJson = (json) => {
    if (!json || typeof json !== 'object') return json;

    const propertiesKey = Object.keys(json).find(k => k.includes('properties'));
    if (propertiesKey && !Array.isArray(json[propertiesKey])) {
        json[propertiesKey] = [json[propertiesKey]];
    }

    return stripSchemaPrefix(json);
};

const withId = (json) => {
    if (Array.isArray(json)) {
        json.forEach(entry => {
            entry.id = entry['@id'];
        });
    } else if (json) {
        json.id = json['@id'];
    }
    return json;
};

/** Reference lists may hold plain ids or {"@id": …} objects. */
const toIds = (ids) => (ids || []).map(item => item?.['@id'] ?? item);

const totalFrom = (headers) => {
    if (!headers.has('x-total-count')) {
        throw new Error('The X-Total-Count header is missing in the HTTP Response.');
    }
    return parseInt(headers.get('x-total-count').split('/').pop(), 10);
};

/**
 * Serialise a query object.
 *
 * Replaces the query-string dependency: version 9 dropped its named exports
 * and react-admin pulls an incompatible version 7 of its own.
 */
const stringify = (query) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach(entry => params.append(key, entry));
        } else {
            params.append(key, value);
        }
    });
    return params.toString();
};

// The sort keys ifdd-be-core accepts (each backed by an index); any other key
// is answered with 422. react-admin falls back to 'id' where no sort is
// given, so other keys are left out and the backend default applies.
export const SORT_KEYS = [
    'c_cacheUpdated', 'c_cacheCreated', 'c_created', 'c_modified',
    'c_validNotBefore', 'c_validNotAfter', 'objName', 'objType', 'objScope',
];

const listQuery = ({pagination, sort = {}, filter}) => {
    const {page, perPage} = pagination;
    const {field, order} = sort;
    const sortable = SORT_KEYS.includes(field);
    return {
        ...fetchUtils.flattenObject(filter),
        sort: sortable ? field : undefined,
        order: sortable ? order : undefined,
        start: (page - 1) * perPage,
        end: page * perPage,
    };
};

const asArray = (json) => (Array.isArray(json) ? json : [json]);

export {stringify};

export const createIfddDataProvider = (apiUrl, httpClient = fetchUtils.fetchJson) => ({
    getList: async (resource, params) => {
        const url = `${apiUrl}/${resource}?${stringify(listQuery(params))}`;
        const {headers, json} = await httpClient(url);
        return {
            data: asArray(withId(json)).map(processJson),
            total: totalFrom(headers),
        };
    },

    getOne: async (resource, params) => {
        // Node ids are absolute URLs served by the backend itself.
        const {json} = await httpClient(String(params.id));
        return {data: processJson(withId(json))};
    },

    getMany: async (resource, params) => {
        const query = {
            order: 'ASC',
            sort: 'objName',
            compact: `${ifddUrlSchema}/base.jsonld`,
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const {json} = await httpClient(url, {
            method: 'POST',
            body: JSON.stringify({ids: toIds(params.ids)}),
        });
        return {data: asArray(withId(json))};
    },

    getManyReference: async (resource, params) => {
        const url = `${apiUrl}/${resource}?${stringify(listQuery(params))}`;
        const {headers, json} = await httpClient(url, {
            method: 'POST',
            body: JSON.stringify({ids: toIds(Array.isArray(params.id) ? params.id : [params.id])}),
        });
        return {
            data: asArray(withId(json)).map(processJson),
            total: totalFrom(headers),
        };
    },
});

export default createIfddDataProvider;
