import {FunctionField, useLocale, useRecordContext} from 'react-admin';
import {inLanguage, useLanguage, useNode} from '../vocabulary';

// QUDT is http://qudt.org/schema/qudt/; https:// is accepted as well.
const QUDT = ['http://qudt.org/schema/qudt/', 'https://qudt.org/schema/qudt/'];

/** A QUDT property of a quantity value, under either namespace or as a plain key. */
const qudt = (quantity, name) => {
    for (const base of QUDT) {
        if (quantity[base + name] !== undefined) return quantity[base + name];
    }
    return quantity[`qudt:${name}`] ?? quantity[name];
};

const plain = (value) => (value && typeof value === 'object' ? value['@value'] ?? value['@id'] : value);

/**
 * Renders a QUDT QuantityValue as "<number> <unit>".
 *
 * The unit is an IRI of the unit service (ifdd-de/unit). Its symbol and its
 * name in the UI language come from the unit's document, fetched once per
 * session; the unit links to that document, so a user can read what it
 * means. Without the document the last segment of the IRI is shown.
 */
export const QuantityValueField = ({source, label}) => {
    const record = useRecordContext();
    const locale = useLocale() || navigator.language || 'en-US';
    const language = useLanguage();
    const quantity = record ? record[source] : undefined;
    const unitIri = quantity ? plain(qudt(quantity, 'unit')) : undefined;
    const {node: unit} = useNode(unitIri);

    if (!quantity) return null;

    const value = plain(qudt(quantity, 'numericValue') ?? quantity.value);
    const formatted = value === undefined || value === null || value === ''
        ? ''
        : new Intl.NumberFormat(locale, {maximumFractionDigits: 3}).format(Number(value));
    const name = inLanguage(unit?.label, language);
    const shown = unit?.symbol || name || (unitIri ? unitIri.split('/').pop() : '');

    return (
        <FunctionField label={label} render={() => (
            <span>
                {formatted}{formatted && shown ? ' ' : ''}
                {unitIri ? (
                    <a href={unitIri} target="_blank" rel="noopener noreferrer" title={name || unitIri}>{shown}</a>
                ) : shown}
            </span>
        )}/>
    );
};
