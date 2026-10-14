import {ReferenceInput, SelectInput, TextInput} from 'react-admin';

/**
 * Build the filter inputs for one aspect.
 *
 * react-admin 5 takes filters as an array of inputs; the `<Filter>` wrapper
 * element the previous version used is the legacy form.
 */
export const createAspectFilters = ({resource, aspect}) => {
    const field = key => `resources.${resource}.fields.${key}`;
    const empty = key => `resources.${resource}.selectEmpty.${key}`;

    return [
        <ReferenceInput
            key="type_id"
            source="type_id"
            reference="types"
            filter={{aspect_id: aspect}}
        >
            <SelectInput
                optionText="name"
                label={field('type.one')}
                emptyText={empty('type')}
            />
        </ReferenceInput>,
        <ReferenceInput
            key="scope_id"
            source="scope_id"
            reference="scopes"
            filter={{aspect_id: aspect}}
        >
            <SelectInput
                optionText="name"
                label={field('scope.one')}
                emptyText={empty('scope')}
            />
        </ReferenceInput>,
        <TextInput key="query" label={field('fulltext')} source="query"/>,
    ];
};
