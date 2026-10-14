import englishMessages from 'ra-language-english';

// Every aspect gets the same field keys, so the generated list, filter and
// tab components can rely on them. The previous translations were uneven:
// products had no fields at all and organisations used a flat structure.
const aspectFields = {
    name: 'Name',
    created: 'Created',
    modified: 'Modified',
    type: {one: 'Type', other: 'Types'},
    scope: {one: 'Scope', other: 'Scopes'},
    fulltext: 'Full text (slow)',
};

const selectEmpty = {type: 'Select type', scope: 'Select scope'};

const aspect = (name, description) => ({
    name,
    description,
    fields: aspectFields,
    selectEmpty,
});

export default {
    ...englishMessages,
    navigation: {label: 'Aspects'},
    ifdd: {
        aspect: {
            product: 'Product',
            function: 'Function',
            location: 'Location',
            organisation: 'Organisation',
            project: 'Project',
        },
        field: {
            name: 'Name',
            description: 'Description',
            longDescription: 'Long description',
            properties: 'Properties',
            tags: 'Tags',
            hasPart: 'Has part',
            isPartOf: 'Is part of',
            containedIn: 'Contained in',
            containsProduct: 'Contains product',
            providesFunction: 'Provides function',
            implementedBy: 'Implemented by',
            usedBy: 'Used by',
            responsibleOrganisation: 'Responsible organisation',
            roleClientOf: 'Client of',
            roleDeliversTo: 'Delivers to',
            functionalResponsibility: 'Functional responsibility',
            productResponsibility: 'Product responsibility',
            vendor: 'Vendor',
            manufacturer: 'Manufacturer',
            serialNumber: 'Serial number',
            uid: 'UID',
            // Terms of every context (fallback when the vocabulary is missing)
            objName: 'Name',
            objType: 'Type',
            objScope: 'Scope',
            origin: 'Origin',
            publisher: 'Publisher',
            c_created: 'Created (source)',
            c_modified: 'Modified (source)',
            c_cacheCreated: 'First stored',
            c_cacheUpdated: 'Last confirmed',
            c_validNotBefore: 'Valid from',
            c_validNotAfter: 'Valid until',
        },
        ui: {
            showAllProperties: 'Show all properties',
            hideAllProperties: 'Hide all properties',
            rawApiData: 'Raw API data',
            tabNotFound: 'Tab "%{tab}": not present for this object or not visible to you.',
        },
    },
    resources: {
        base: {
            name: 'Base',
            fields: {
                aspect: 'Aspect',
                name: 'Name',
                description: 'Description',
                c_created: 'Created (source)',
                c_modified: 'Modified (source)',
                c_validNotBefore: 'Valid from',
                c_validNotAfter: 'Valid until',
                c_cacheUpdated: 'Last confirmed',
                origin: 'Origin of the data',
                scope: {one: 'Scope', other: 'Scopes'},
                type: {one: 'Type', other: 'Types'},
            },
        },
        products: aspect('Products', 'All products, components, instances, devices and systems.'),
        functions: aspect('Functions', 'Customer requirements, functional requests and product-independent functions.'),
        locations: aspect('Locations', 'Location coordinates, building dependencies and spatial arrangements.'),
        organisations: aspect('Organisations', 'Organisational information.'),
        projects: aspect('Projects', 'Project information.'),
        types: {name: 'Types'},
        scopes: {name: 'Scopes'},
        aspects: {name: 'Aspects'},
        tags: {name: 'Tags'},
    },
};
