import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor, within} from '@testing-library/react';
import {AdminContext, RecordContextProvider, TabbedShowLayout, TestMemoryRouter} from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import {contextTabs, contextTitle, rowsOf} from '../src/ifdd/tab/contextTab';
import {QuantityValueField} from '../src/ifdd/fields/QuantityValueField';
import german from '../src/i18n/de';
import {ifddUrlType, ifddUrlUnit} from '../src/Env';

const NS = `${ifddUrlType}/breaker.grid.example.ifdd.de/`;
const NAME = 'breaker.grid.example.ifdd.de';
const VOCABULARY = {'@graph': [
    {'@id': NS, label: {en: 'Circuit breaker', de: 'Leistungsschalter'}},
    {'@id': `${NS}serialNumber`, label: {en: 'Serial number', de: 'Fabriknummer'},
        comment: {en: 'Serial number on the rating plate.'}, order: 20},
    {'@id': `${NS}objName`, label: {en: 'Name', de: 'Name'}, order: 10},
    {'@id': `${NS}feeder`, label: {en: 'Feeder'}, order: 30,
        range: `${ifddUrlType}/feeder.grid.example.ifdd.de/schema`},
    {'@id': `${NS}c_created`, label: {en: 'Created (source)'}, order: 901},
]};
const UNITS = {'@graph': [
    {'@id': `${ifddUrlUnit}/unit/`, label: {en: 'Units'}},
    {'@id': `${ifddUrlUnit}/unit/KiloV`, label: {en: 'Kilovolt', de: 'Kilovolt'}, symbol: 'kV'},
]};
const RECORD = {
    id: 'https://rest/products/1',
    '@context': {product: `${ifddUrlType}/product/`, base: `${ifddUrlType}/base/`, [NAME]: NS,
                 'maintenance.ops.example.ifdd.de': `${ifddUrlType}/maintenance.ops.example.ifdd.de/`},
    [`${NAME}:c_created`]: {'@type': 'http://www.w3.org/2001/XMLSchema#dateTime', '@value': '2026-01-01T00:00:00+00:00'},
    [`${NAME}:serialNumber`]: 'SN-1',
    [`${NAME}:objName`]: 'Q1',
    [`${NAME}:ratedVoltage`]: {
        '@type': 'http://qudt.org/schema/qudt/QuantityValue',
        'http://qudt.org/schema/qudt/numericValue': 110,
        'http://qudt.org/schema/qudt/unit': {'@id': `${ifddUrlUnit}/unit/KiloV`},
    },
    'product:objName': 'Breaker 1',
};

const MAINTENANCE = 'maintenance.ops.example.ifdd.de';

// The breaker vocabulary only; every other namespace has none.
const respond = (url) => ({
    ok: true,
    json: async () => (url.startsWith(ifddUrlUnit) ? UNITS : url === NS ? VOCABULARY : {'@graph': []}),
});

afterEach(() => vi.restoreAllMocks());

describe('rows of a context', () => {
    it('come in vocabulary order with labels, help texts and target tabs', () => {
        const nodes = Object.fromEntries(VOCABULARY['@graph'].map(n => [n['@id'], n]));
        const rows = rowsOf({...RECORD, [`${NAME}:feeder`]: {'@id': 'x'}}, NAME, NS, nodes, 'de');
        expect(rows.map(r => r.term)).toEqual(['objName', 'serialNumber', 'feeder', 'ratedVoltage', 'c_created']);
        expect(rows[1]).toMatchObject({label: 'Fabriknummer', comment: 'Serial number on the rating plate.'});
        expect(rows[2].tabPath).toBe('feeder.grid.example.ifdd.de');
    });

    it('fall back to the term names, cache metadata last, without a vocabulary', () => {
        const rows = rowsOf(RECORD, NAME, NS);
        expect(rows.map(r => r.label)).toEqual(['objName', 'ratedVoltage', 'serialNumber', 'c_created']);
    });

    it('fall back to the translation of the term before its name', () => {
        const translate = (key, {_: fallback}) => ({'ifdd.field.serialNumber': 'Seriennummer'}[key] ?? fallback);
        const rows = rowsOf(RECORD, NAME, NS, {}, 'de', translate);
        expect(rows.map(r => r.label)).toEqual(['objName', 'ratedVoltage', 'Seriennummer', 'c_created']);
    });

    it('leave out empty values', () => {
        const rows = rowsOf({...RECORD, [`${NAME}:manufacturer`]: '', [`${NAME}:tags`]: []}, NAME, NS);
        expect(rows.map(r => r.term)).not.toContain('manufacturer');
        expect(rows.map(r => r.term)).not.toContain('tags');
    });
});

describe('context titles', () => {
    const translate = (key, {_: fallback}) => ({
        'ifdd.aspect.product': 'Produkt',
        [`ifdd.context.${MAINTENANCE}`]: 'Wartung',
    }[key] ?? fallback);

    it('come from the vocabulary in the UI language', () => {
        expect(contextTitle(NAME, VOCABULARY['@graph'][0], 'de', translate)).toBe('Leistungsschalter');
    });

    it('fall back to the translation: ifdd.aspect.<name> or ifdd.context.<name>, then the name', () => {
        expect(contextTitle('product', undefined, 'de', translate)).toBe('Produkt');
        expect(contextTitle(MAINTENANCE, undefined, 'de', translate)).toBe('Wartung');
        expect(contextTitle('feeder.grid.example.ifdd.de', undefined, 'de', translate)).toBe('feeder.grid.example.ifdd.de');
    });
});

describe('context tabs of a record', () => {
    it('one per context: the aspect first, then the domains by name, base left out', () => {
        const tabs = contextTabs(RECORD, {aspect: 'product'});
        expect(tabs.map(tab => tab.props.path)).toEqual(['product', NAME, 'maintenance.ops.example.ifdd.de']);
    });

    it('leave out contexts a private tab replaces, and records without contexts', () => {
        expect(contextTabs(RECORD, {aspect: 'product', skip: [NAME]}).map(t => t.props.path))
            .toEqual(['product', 'maintenance.ops.example.ifdd.de']);
        expect(contextTabs({}, {aspect: 'product'})).toEqual([]);
    });
});

describe('rendering', () => {
    const renderInAdmin = (ui, {tab = NAME, record = RECORD} = {}) => render(
        <TestMemoryRouter initialEntries={[`/${tab}`]}>
            <AdminContext i18nProvider={polyglotI18nProvider(() => german, 'de')}>
                <RecordContextProvider value={record}>{ui}</RecordContextProvider>
            </AdminContext>
        </TestMemoryRouter>
    );
    const showTabs = (record = RECORD) => (
        <TabbedShowLayout>{contextTabs(record, {aspect: 'product'})}</TabbedShowLayout>
    );

    it('shows every value in a row of its own, one below the other', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => respond(url));
        renderInAdmin(showTabs());
        await waitFor(() => expect(screen.getByText('Fabriknummer')).toBeInTheDocument());
        const rowOf = text => screen.getByText(text).closest('.RaTab-row');
        expect(within(rowOf('SN-1')).getByText('Fabriknummer')).toBeInTheDocument();
        expect(rowOf('SN-1')).not.toContainElement(screen.getByText('Q1'));
        expect(rowOf('Q1')).not.toContainElement(screen.getByText('SN-1'));
    });

    it('labels the values from the vocabulary and fetches each namespace once', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => respond(url));
        renderInAdmin(showTabs());
        await waitFor(() => expect(screen.getByText('Fabriknummer')).toBeInTheDocument());
        expect(screen.getByText('Fabriknummer').getAttribute('title')).toBe('Serial number on the rating plate.');
        // tab header and tab content ask for the same namespace
        expect(fetchMock.mock.calls.filter(([url]) => url === NS)).toHaveLength(1);
    });

    it('titles the tabs from the vocabulary, else from the translation, else with the name', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => respond(url));
        renderInAdmin(showTabs());
        expect(await screen.findByText('Leistungsschalter')).toBeInTheDocument();
        expect(screen.getByText('Produkt')).toBeInTheDocument();      // ifdd.aspect.product
        expect(screen.getByText(MAINTENANCE)).toBeInTheDocument();   // neither: the name
    });

    it('labels terms without a vocabulary from the translation', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => respond(url));
        const record = {...RECORD, 'product:description': 'A breaker', 'product:objType': 'Breaker'};
        renderInAdmin(showTabs(record), {tab: 'product', record});
        expect(await screen.findByText('Beschreibung')).toBeInTheDocument();  // ifdd.field.description
        expect(screen.getByText('Typ')).toBeInTheDocument();                  // ifdd.field.objType
    });

    it('shows a quantity value with the symbol of its unit, linked to the unit', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => respond(url));
        renderInAdmin(<QuantityValueField source={`${NAME}:ratedVoltage`} label="Rated voltage"/>);
        const unit = await screen.findByText('kV');
        expect(unit.closest('a').getAttribute('href')).toBe(`${ifddUrlUnit}/unit/KiloV`);
        expect(unit.getAttribute('title')).toBe('Kilovolt');
        expect(screen.getByText(/^110/)).toBeInTheDocument();
    });
});
