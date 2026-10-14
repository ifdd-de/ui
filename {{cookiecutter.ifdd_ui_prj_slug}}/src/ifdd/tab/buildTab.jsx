import {TabbedShowLayout} from 'react-admin';
import {LiteralField} from '../fields/LiteralField';
import {PropertiesField} from '../fields/PropertiesField';
import {RawApiField} from '../fields/RawApiField';

/**
 * True when the record carries the context of that name.
 *
 * A single document of ifdd-be-core maps each context name to its namespace
 * in @context ({"product": ".../product/", "sub1.dom1.ifdd.de": "..."}).
 */
export const matchesContext = (record, context) =>
    Boolean(record?.['@context'] && Object.prototype.hasOwnProperty.call(record['@context'], context));

const FIELD_KINDS = {
    literal: LiteralField,
    properties: PropertiesField,
    rawApi: RawApiField,
};

const renderField = ({kind = 'literal', source, ...props}, index) => {
    const Component = FIELD_KINDS[kind];
    if (!Component) {
        console.warn(`Unknown field kind "${kind}" for source "${source}"`);
        return null;
    }
    return <Component key={source || `${kind}-${index}`} source={source} {...props} />;
};

/**
 * Build a show tab from a declarative field list.
 *
 * A tab is data, not code: each entry of `fields` is
 * {label, source, url?, urlComment?, tabPath?, kind?}. The field
 * component is chosen from the JSON-LD @type of the value at render time.
 *
 * When `context` (a context name) is given the tab only appears for records
 * carrying that context; without it the tab is always shown. Tabs of
 * contexts are usually generic (contextTab.jsx); buildTab is for the base
 * tab and for private tabs that replace a generic one.
 */
export const buildTab = ({record, context = null, path, label, icon, fields}) => {
    if (context && !matchesContext(record, context)) return null;

    return (
        <TabbedShowLayout.Tab path={path} label={label} icon={icon}>
            {fields.map(renderField)}
        </TabbedShowLayout.Tab>
    );
};
