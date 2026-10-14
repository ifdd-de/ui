import {useQuery} from '@tanstack/react-query';
import {useLocale} from 'react-admin';
import {ifddUrlType, ifddUrlUnit} from '../Env';

/**
 * Vocabularies of the type and unit services.
 *
 * A namespace is one JSON-LD document, <namespace>/index.jsonld, served at
 * the namespace IRI and at every IRI below it (ifdd-de/type, ifdd-de/unit).
 * Its nodes (in @graph) describe the namespace, its terms or its units:
 *
 *   {"@id": ".../product/serial_number", "label": {"en": …, "de": …},
 *    "comment": {…}, "order": 20, "range": "…", "quantityKind": "…",
 *    "symbol": "kV"}
 *
 * The UI reads this compact form directly. Every namespace is fetched once
 * per session and shared by all tabs and records (react-query, no expiry);
 * the HTTP cache of the browser keeps it across reloads (Cache-Control of
 * the services). Only namespaces of the configured type and unit services
 * are fetched (the CSP allows no other origin); for any other the UI falls
 * back to the term names.
 */

/** The namespace of an IRI: everything up to and including the last '/' or '#'. */
export const namespaceOf = (iri) => {
    const cut = Math.max(iri.lastIndexOf('/'), iri.lastIndexOf('#'));
    return cut < 0 ? iri : iri.slice(0, cut + 1);
};

const SERVICES = [ifddUrlType, ifddUrlUnit].filter(Boolean).map(url => url.replace(/\/+$/, '') + '/');

/** True for namespaces of the type and unit services of this instance. */
export const isServed = (namespace) =>
    typeof namespace === 'string' && SERVICES.some(base => namespace.startsWith(base));

/** Fetch a vocabulary and index its nodes by @id. */
export const fetchVocabulary = async (namespace) => {
    const response = await fetch(namespace, {headers: {Accept: 'application/ld+json, application/json'}});
    if (!response.ok) throw new Error(`HTTP ${response.status} - ${namespace}`);
    const document = await response.json();
    const nodes = Array.isArray(document['@graph']) ? document['@graph'] : [document];
    return Object.fromEntries(nodes.filter(node => node?.['@id']).map(node => [node['@id'], node]));
};

/** The vocabulary of a namespace: {nodes, isLoading}; nodes is {} until loaded or if unavailable. */
export const useVocabulary = (namespace) => {
    const served = isServed(namespace);
    const {data, isLoading} = useQuery({
        queryKey: ['ifdd-vocabulary', namespace],
        queryFn: () => fetchVocabulary(namespace),
        enabled: served,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
    });
    return {nodes: data || {}, isLoading: served && isLoading};
};

/** The language part of the UI locale, e.g. "de" for "de-DE". */
export const useLanguage = () => (useLocale() || 'en').split('-')[0];

/** A language map ({"en": …, "de": …}) in the UI language, then English, then any. */
export const inLanguage = (map, language) => {
    if (!map) return undefined;
    if (typeof map === 'string') return map;
    return map[language] ?? map.en ?? Object.values(map)[0];
};

/** The node of an IRI from its vocabulary, or undefined. */
export const useNode = (iri) => {
    const {nodes, isLoading} = useVocabulary(iri ? namespaceOf(iri) : undefined);
    return {node: iri ? nodes[iri] : undefined, isLoading};
};
