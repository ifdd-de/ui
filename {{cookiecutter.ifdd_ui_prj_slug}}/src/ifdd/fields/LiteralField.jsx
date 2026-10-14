import {
    ChipField,
    DateField,
    FunctionField,
    Link,
    Pagination,
    ReferenceField,
    RecordContextProvider,
    ReferenceManyField,
    SingleFieldList,
    TextField,
    useRecordContext,
} from 'react-admin';
import {ifddUrlRest, ifddUrlSchema} from '../../Env';
import {aspectOfResource, showPath} from '../tabs';
import {QuantityValueField} from './QuantityValueField';

// The XML Schema namespace is canonically http://; some backends emit https://.
// Both are accepted so that a scheme mismatch cannot silently blank a field.
const XSD = ['http://www.w3.org/2001/XMLSchema#', 'https://www.w3.org/2001/XMLSchema#'];
const QUDT_QUANTITY_VALUE = ['http://qudt.org/schema/qudt/QuantityValue', 'https://qudt.org/schema/qudt/QuantityValue'];

const SINGLE_REFERENCE = 'single_reference';
const MULTIPLE_REFERENCE = 'multiple_reference';

const xsdType = (type, name) => XSD.some(base => type === base + name);

/**
 * Classify a JSON-LD value without writing to it.
 *
 * The record comes out of the query cache, so it must not be mutated here.
 * Plain JSON values (a string, a number) are what the backend's compaction
 * gives for terms without a datatype.
 */
const kindOf = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (['string', 'number', 'boolean'].includes(typeof value)) return 'plain';
    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return value.every(item => item && typeof item === 'object' && '@id' in item)
            ? MULTIPLE_REFERENCE : 'list';
    }
    if (typeof value !== 'object') return null;
    if ('@id' in value) return SINGLE_REFERENCE;
    const type = value['@type'];
    if (QUDT_QUANTITY_VALUE.includes(type)) return 'quantityValue';
    if ('@value' in value) {
        if (xsdType(type, 'dateTime')) return 'dateTime';
        if (xsdType(type, 'date')) return 'date';
        return 'string';
    }
    return null;
};

/** Text of a list of plain or typed values, e.g. tags. */
const listText = (values) => values
    .map(item => (item && typeof item === 'object' ? item['@value'] ?? item['@id'] : item))
    .filter(item => item !== undefined && item !== null)
    .join(', ');

/**
 * The react-admin resource of a node IRI: the first path segment of an IRI
 * of this backend, if the UI has that resource; otherwise null (the IRI is
 * shown as a plain link).
 */
export const resourceOf = (iri) => {
    if (typeof iri !== 'string' || !iri.startsWith(ifddUrlRest.replace(/\/+$/, '') + '/')) return null;
    const segment = iri.slice(ifddUrlRest.replace(/\/+$/, '').length + 1).split('/')[0];
    return aspectOfResource(segment) ? segment : null;
};

/**
 * Shows a typed value or a reference from its own record context.
 *
 * react-admin reads `source` as a path and splits it at dots, so
 * `breaker.grid.example.ifdd.de:c_created.@value` would never be found (a
 * whole key such as `breaker.grid.example.ifdd.de:c_created` is found, as it
 * exists in the record). Inside the value the source is just `@value` or `@id`.
 */
const InValue = ({value, children}) => <RecordContextProvider value={value}>{children}</RecordContextProvider>;

const applyUrlTemplate = (template, values = {}) =>
    Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, value),
        template
    );

const LinkWrapper = ({url, urlComment, values, children}) => {
    if (!url) return children;
    return (
        <a href={applyUrlTemplate(url, values)} target="_blank" rel="noopener noreferrer">
            {children}{urlComment ? ` (${urlComment})` : null}
        </a>
    );
};

/**
 * Renders one JSON-LD value, choosing the field component from its shape
 * and @type.
 *
 * This is what lets a tab be built from a list of {label, source, ...}
 * entries, or from a vocabulary, instead of hand-written JSX per field.
 * References find their resource from the IRI they point to and open the
 * target in the tab `tabPath` (from the vocabulary), else in the aspect tab
 * of that resource (`organisations` -> `organisation`).
 */
export const LiteralField = ({
    source,
    label,
    url = null,
    urlComment = null,
    tabPath = null,
    ...rest
}) => {
    const record = useRecordContext();
    if (!record) return null;

    const value = record[source];
    const kind = kindOf(value);
    if (!kind) return null;

    let field = null;

    switch (kind) {
        case 'plain':
            field = <TextField label={label} source={source} {...rest} />;
            break;
        case 'list':
            field = <FunctionField label={label} render={() => listText(value)}/>;
            break;
        case 'string':
            field = <InValue value={value}><TextField label={label} source="@value" {...rest} /></InValue>;
            break;
        case 'dateTime':
            field = <InValue value={value}><DateField label={label} source="@value" showTime {...rest} /></InValue>;
            break;
        case 'date':
            field = <InValue value={value}><DateField label={label} source="@value" {...rest} /></InValue>;
            break;
        case 'quantityValue':
            field = <QuantityValueField label={label} source={source} {...rest} />;
            break;
        case SINGLE_REFERENCE: {
            const resource = resourceOf(value['@id']);
            const tab = tabPath || aspectOfResource(resource);
            field = resource ? (
                <InValue value={value}>
                    <ReferenceField
                        label={label}
                        source="@id"
                        reference={resource}
                        link={referenced => showPath(resource, referenced.id, tab)}
                    >
                        <ChipField source="objName" clickable/>
                    </ReferenceField>
                </InValue>
            ) : (
                <a href={value['@id']} target="_blank" rel="noopener noreferrer">{value['@id']}</a>
            );
            break;
        }
        case MULTIPLE_REFERENCE: {
            const resource = resourceOf(value[0]['@id']);
            const tab = tabPath || aspectOfResource(resource);
            field = resource ? (
                <ReferenceManyField
                    label={label}
                    source={source}
                    target="id"
                    reference={resource}
                    perPage={10}
                    pagination={<Pagination rowsPerPageOptions={[10, 50, 100, 500]}/>}
                    sort={{field: 'objName', order: 'ASC'}}
                    filter={{context: `${ifddUrlSchema}/base.jsonld`}}
                >
                    <SingleFieldList linkType={false}>
                        <FunctionField render={referenced => (
                            <Link to={showPath(resource, referenced.id, tab)}>
                                <ChipField source="objName" clickable/>
                            </Link>
                        )}/>
                    </SingleFieldList>
                </ReferenceManyField>
            ) : (
                <FunctionField label={label} render={() => listText(value)}/>
            );
            break;
        }
        default:
            return null;
    }

    return (
        <LinkWrapper url={url} urlComment={urlComment} values={Array.isArray(value) ? {} : value}>
            {field}
        </LinkWrapper>
    );
};

export {kindOf};
