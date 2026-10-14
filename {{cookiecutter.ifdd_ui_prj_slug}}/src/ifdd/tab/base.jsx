import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import {buildTab} from './buildTab';

const NS = 'base';

// The c_* terms are the cache metadata ifdd-be-core keeps per stored
// document; they are shown here only, not in the aspect tabs.
export const fields = [
    {label: 'resources.base.fields.name', source: `${NS}:objName`},
    {label: 'resources.base.fields.aspect', source: `${NS}:aspect`},
    {label: 'resources.base.fields.description', source: `${NS}:description`},
    {label: 'resources.base.fields.c_created', source: `${NS}:c_created`},
    {label: 'resources.base.fields.c_modified', source: `${NS}:c_modified`},
    {label: 'resources.base.fields.c_validNotBefore', source: `${NS}:c_validNotBefore`},
    {label: 'resources.base.fields.c_validNotAfter', source: `${NS}:c_validNotAfter`},
    {label: 'resources.base.fields.c_cacheUpdated', source: `${NS}:c_cacheUpdated`},
    {label: 'resources.base.fields.origin', source: `${NS}:origin`},
    {label: 'resources.base.fields.scope.one', source: `${NS}:objScope`},
    {label: 'resources.base.fields.type.one', source: `${NS}:objType`},
    {kind: 'rawApi', source: 'id', label: 'ifdd.ui.rawApiData'},
];

export const baseTab = (record) => buildTab({
    record,
    path: NS,
    label: 'resources.base.name',
    icon: <ChangeHistoryIcon/>,
    fields,
});

export default baseTab;
