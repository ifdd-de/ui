import DeveloperBoardTwoToneIcon from '@mui/icons-material/DeveloperBoardTwoTone';
import FunctionsIcon from '@mui/icons-material/Functions';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

import {ifddAspects} from '../Env';
import {createAspectList} from './resources/createAspectList';
import {createAspectShow} from './resources/createAspectShow';

/**
 * Known aspects: their REST resource and icon.
 *
 * Which of these an instance exposes is decided by ifddAspects in Env.js, so
 * enabling an aspect is a configuration change, not a code change. The tabs
 * of a record are generic, one per context (tab/contextTab.jsx).
 */
const REGISTRY = {
    product: {resource: 'products', icon: DeveloperBoardTwoToneIcon},
    function: {resource: 'functions', icon: FunctionsIcon},
    location: {resource: 'locations', icon: LocationCityIcon},
    organisation: {resource: 'organisations', icon: AccountTreeIcon},
    project: {resource: 'projects', icon: FolderSpecialIcon},
};

export const knownAspects = Object.keys(REGISTRY);

export const unknownAspects = ifddAspects.filter(aspect => !REGISTRY[aspect]);

export const aspects = ifddAspects
    .filter(aspect => REGISTRY[aspect])
    .map(aspect => {
        const {resource, icon} = REGISTRY[aspect];
        return {
            aspect,
            resource,
            icon,
            list: createAspectList({resource, aspect}),
            show: createAspectShow({resource, aspect, icon}),
        };
    });

if (unknownAspects.length > 0) {
    console.warn(`Env.js lists aspects that are not in the registry: ${unknownAspects.join(', ')}`);
}
