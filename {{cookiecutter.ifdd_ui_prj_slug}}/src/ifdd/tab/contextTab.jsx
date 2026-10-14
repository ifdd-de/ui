import {TabbedShowLayout, useRecordContext, useTranslate} from 'react-admin';
import ExtensionIcon from '@mui/icons-material/Extension';
import {kindOf, LiteralField} from '../fields/LiteralField';
import {PropertiesField} from '../fields/PropertiesField';
import {inLanguage, useLanguage, useVocabulary} from '../vocabulary';

/**
 * One generic tab per context of a record.
 *
 * A single document of ifdd-be-core carries one prefix per context, the
 * context name, and maps it to its namespace in @context:
 *
 *   {"@context": {"product": "https://type/v1/product/", ...},
 *    "product:objName": "Q1", "product:serial_number": "4711", ...}
 *
 * The tab of a context lists the values with that prefix. Label, help text
 * (shown on hover), order and the tab to open for a reference come from the
 * vocabulary of the namespace (vocabulary.js). Without a label there, the
 * translation is used (ifdd.field.<term>, ifdd.aspect.<name>,
 * ifdd.context.<name>), then the plain name. No field list has to be written
 * per context.
 */

const PROPERTIES = 'properties';     // the id/value/validity table of the IFDD schemas
const CACHE_PREFIX = 'c_';           // cache metadata: after the other values
const ORDER_UNKNOWN = 500;
const ORDER_CACHE = 1000;

/** The context name of a class IRI <type url>/<name>/schema, else null. */
const contextOfClass = (iri) => {
    const match = typeof iri === 'string' && iri.match(/\/([^/]+)\/schema$/);
    return match ? match[1] : null;
};

/** The label of a term: vocabulary, then translation (ifdd.field.<term>), then the term. */
const termLabel = (node, term, language, translate) =>
    inLanguage(node.label, language) || (translate ? translate(`ifdd.field.${term}`, {_: term}) : term);

/**
 * The translation key of a context title: generic contexts (base and the
 * aspects) have names without a dot, domain contexts names with dots.
 */
export const titleKey = (name) => (name.includes('.') ? `ifdd.context.${name}` : `ifdd.aspect.${name}`);

/** The title of a context: vocabulary, then translation, then the name. */
export const contextTitle = (name, node, language, translate) =>
    inLanguage(node?.label, language) || (translate ? translate(titleKey(name), {_: name}) : name);

/** The rows of a context: one per non-empty term of the record, in vocabulary order. */
export const rowsOf = (record, name, namespace, nodes = {}, language = 'en', translate = null) => {
    const prefix = `${name}:`;
    return Object.keys(record || {})
        .filter(key => key.startsWith(prefix) && kindOf(record[key]) !== null)
        .map(source => {
            const term = source.slice(prefix.length);
            const node = nodes[namespace + term] || {};
            const order = node.order ?? (term.startsWith(CACHE_PREFIX) ? ORDER_CACHE : ORDER_UNKNOWN);
            return {
                source,
                term,
                label: termLabel(node, term, language, translate),
                comment: inLanguage(node.comment, language),
                order,
                tabPath: contextOfClass(node.range),
            };
        })
        .sort((a, b) => a.order - b.order || a.term.localeCompare(b.term));
};

const RowLabel = ({label, comment}) => <span title={comment || undefined}>{label}</span>;

/** The tab title: see contextTitle. The context name is shown on hover. */
export const ContextLabel = ({name, namespace}) => {
    const language = useLanguage();
    const translate = useTranslate();
    const {nodes} = useVocabulary(namespace);
    return <span title={name}>{contextTitle(name, nodes[namespace], language, translate)}</span>;
};

/**
 * The tab of one context.
 *
 * The rows are direct children of the tab, so react-admin lays them out one
 * below the other like the fields of the base tab (each child gets its own
 * labelled row). `path` is the context name, so references and links from
 * outside can open the tab.
 */
export const ContextTab = ({name, namespace, ...props}) => {
    const record = useRecordContext();
    const language = useLanguage();
    const translate = useTranslate();
    const {nodes} = useVocabulary(namespace);
    return (
        <TabbedShowLayout.Tab {...props} label={<ContextLabel name={name} namespace={namespace}/>}>
            {rowsOf(record, name, namespace, nodes, language, translate).map(row => {
                const label = <RowLabel label={row.label} comment={row.comment}/>;
                return row.term === PROPERTIES
                    ? <PropertiesField key={row.source} source={row.source} label={label}/>
                    : <LiteralField key={row.source} source={row.source} label={label} tabPath={row.tabPath}/>;
            })}
        </TabbedShowLayout.Tab>
    );
};

/** The tab of one context, as an element for TabbedShowLayout. */
export const contextTab = (name, namespace, icon = <ExtensionIcon/>) => (
    <ContextTab key={`context-${name}`} path={name} icon={icon} name={name} namespace={namespace}/>
);

/**
 * The context tabs of a record, in this order: the aspect context (with the
 * aspect's icon), then the domain contexts by name. `base` has a tab of its
 * own (base.jsx); `skip` names contexts a private tab replaces.
 */
export const contextTabs = (record, {aspect, icon, skip = []} = {}) => {
    const contexts = record?.['@context'];
    if (!contexts || typeof contexts !== 'object' || Array.isArray(contexts)) return [];
    const names = Object.keys(contexts)
        .filter(name => name !== 'base' && !skip.includes(name) && typeof contexts[name] === 'string')
        .sort((a, b) => (b === aspect) - (a === aspect) || a.localeCompare(b));
    return names.map(name => contextTab(name, contexts[name], name === aspect && icon ? icon : undefined));
};
