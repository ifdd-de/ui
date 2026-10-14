import {Datagrid, DateField, List, Pagination, TextField} from 'react-admin';
import {createAspectFilters} from './createAspectFilters';
import {showPath} from '../tabs';

const AspectPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100]}/>;

/**
 * Build the list view for one aspect.
 *
 * All four aspects used to ship their own list.js; the files differed only in
 * whitespace and in the resource name, so they are generated from here now.
 * `label` values are translation keys and are resolved by react-admin. A row
 * opens the aspect tab of its record (every entry of the list has the aspect
 * context, see ifdd-be-core), the same tab the show view opens with.
 */
export const createAspectList = ({resource, aspect}) => {
    const field = key => `resources.${resource}.fields.${key}`;

    const AspectList = () => (
        <List
            empty={false}
            filters={createAspectFilters({resource, aspect})}
            sort={{field: 'c_cacheUpdated', order: 'DESC'}}
            exporter={false}
            pagination={<AspectPagination/>}
        >
            <Datagrid rowClick={id => showPath(resource, id, aspect)} bulkActionButtons={false}>
                <TextField label={field('name')} source="objName"/>
                <TextField label={field('type.one')} source="objType"/>
                <TextField label={field('scope.one')} source="objScope"/>
                <DateField label={field('created')} source="c_created" showTime/>
                <DateField label={field('modified')} source="c_modified" showTime/>
            </Datagrid>
        </List>
    );

    AspectList.displayName = `${resource}List`;
    return AspectList;
};
