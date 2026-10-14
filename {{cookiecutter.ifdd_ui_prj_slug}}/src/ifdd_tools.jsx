import {useRecordContext} from 'react-admin';

/**
 * Read a JSON-LD value that may be a typed object or a plain literal.
 *
 * Detail responses wrap values as {"@type":…, "@value":…}; list responses
 * deliver them flat.
 */
export const literalValue = (value) => {
    if (value && typeof value === 'object') {
        if ('@value' in value) return value['@value'];
        if ('@id' in value) return value['@id'];
        return undefined;
    }
    return value;
};

export const NodeTitle = () => {
    const node = useRecordContext();
    if (!node) return null;

    const name = literalValue(node['base:objName']);
    const type = literalValue(node['base:objType']);
    const scope = literalValue(node['base:objScope']);

    return <span>{name} ({type} / {scope})</span>;
};
