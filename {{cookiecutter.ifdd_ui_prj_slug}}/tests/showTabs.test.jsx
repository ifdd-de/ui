import {afterEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {QueryClient} from '@tanstack/react-query';
import {
    AdminContext,
    Notification,
    RecordContextProvider,
    ResourceContextProvider,
    TestMemoryRouter,
} from 'react-admin';
import {Route, Routes} from 'react-router-dom';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import {createAspectShow} from '../src/ifdd/resources/createAspectShow';
import {createAspectList} from '../src/ifdd/resources/createAspectList';
import {LiteralField} from '../src/ifdd/fields/LiteralField';
import english from '../src/i18n/en';
import {ifddUrlRest, ifddUrlType} from '../src/Env';

/**
 * Which tab a show view opens: from the list, from a reference, and for a
 * URL without a tab or with a tab the record does not have.
 */

const ID = `${ifddUrlRest}/products/1`;
const OTHER = `${ifddUrlRest}/products/2`;
const SHOW = `/products/${encodeURIComponent(ID)}/show`;
const RECORD = {
    id: ID,
    '@context': {product: `${ifddUrlType}/product/`},
    'product:objName': 'Breaker 1',
    'product:isPartOf': {'@id': OTHER},
    objName: 'Breaker 1',
};

const dataProvider = {
    getOne: async () => ({data: RECORD}),
    getMany: async (resource, {ids}) => ({data: ids.map(id => ({id, objName: `Node ${id.split('/').pop()}`}))}),
    getManyReference: async () => ({data: [], total: 0}),
    getList: async () => ({data: [RECORD], total: 1}),
};

// No vocabulary: references have no target tab from rdfs:range.
afterEach(() => vi.restoreAllMocks());
const noVocabulary = () => vi.spyOn(globalThis, 'fetch')
    .mockImplementation(async () => ({ok: true, json: async () => ({'@graph': []})}));

const renderAt = (path, ui, {provider = dataProvider, queryClient = new QueryClient()} = {}) => {
    const location = {};
    render(
        <TestMemoryRouter initialEntries={[path]} locationCallback={l => Object.assign(location, l)}>
            <AdminContext dataProvider={provider} queryClient={queryClient}
                          i18nProvider={polyglotI18nProvider(() => english, 'en')}>
                <ResourceContextProvider value="products">{ui}</ResourceContextProvider>
                <Notification/>
            </AdminContext>
        </TestMemoryRouter>
    );
    return location;
};

const ProductShow = createAspectShow({resource: 'products', aspect: 'product'});
const showRoutes = <Routes><Route path="/products/:id/show/*" element={<ProductShow/>}/></Routes>;

describe('the show view', () => {
    it('opens the aspect tab when the URL names no tab', async () => {
        noVocabulary();
        const location = renderAt(SHOW, showRoutes);
        await waitFor(() => expect(location.pathname).toBe(`${SHOW}/product`));
        expect(await screen.findByText('Breaker 1', {selector: '.RaTab-row *'})).toBeInTheDocument();
        expect(screen.queryByText(/not present for this object/)).not.toBeInTheDocument();
    });

    it('opens the aspect tab, with a notice, for a tab the record does not have', async () => {
        noVocabulary();
        const location = renderAt(`${SHOW}/maintenance.ops.example.ifdd.de`, showRoutes);
        await waitFor(() => expect(location.pathname).toBe(`${SHOW}/product`));
        expect(await screen.findByText(/maintenance\.ops\.example\.ifdd\.de.*not present for this object/))
            .toBeInTheDocument();
    });

    it('waits for the single document when the cache holds the short form of a list or reference', async () => {
        noVocabulary();
        // a list entry of ifdd-be-core: @context is the context URL, no prefixes
        const queryClient = new QueryClient();
        queryClient.setQueryData(['products', 'getOne', {id: ID}],
            {id: ID, '@context': `${ifddUrlType}/../product.jsonld`, objName: 'Breaker 1'});
        const slow = {...dataProvider, getOne: () => new Promise(resolve => setTimeout(() => resolve({data: RECORD}), 300))};
        const location = renderAt(`${SHOW}/product`, showRoutes, {provider: slow, queryClient});
        expect(await screen.findByText('Breaker 1', {selector: '.RaTab-row *'})).toBeInTheDocument();
        expect(location.pathname).toBe(`${SHOW}/product`);
        expect(screen.queryByText(/not present for this object/)).not.toBeInTheDocument();
    });

    it('keeps a tab the record has', async () => {
        noVocabulary();
        const location = renderAt(`${SHOW}/base`, showRoutes);
        await screen.findByText('Base');
        expect(location.pathname).toBe(`${SHOW}/base`);
    });
});

describe('a domain context', () => {
    it('shows typed values and dates although its name has dots', async () => {
        noVocabulary();
        const name = 'maintenance.ops.example.ifdd.de';
        const record = {...RECORD, '@context': {...RECORD['@context'], [name]: `${ifddUrlType}/${name}/`},
            [`${name}:condition`]: 'good',
            [`${name}:maintenanceInterval`]: {'@type': 'http://www.w3.org/2001/XMLSchema#duration', '@value': 'P4Y'},
            [`${name}:lastInspection`]: {'@type': 'http://www.w3.org/2001/XMLSchema#date', '@value': '2025-03-01'},
            [`${name}:inspected`]: {'@id': OTHER}};
        renderAt(`${SHOW}/${name}`, showRoutes, {provider: {...dataProvider, getOne: async () => ({data: record})}});
        expect(await screen.findByText('good')).toBeInTheDocument();
        expect(screen.getByText('P4Y')).toBeInTheDocument();
        expect(screen.getByText(new Date('2025-03-01').toLocaleDateString())).toBeInTheDocument();
        expect((await screen.findByText('Node 2')).closest('a').getAttribute('href'))
            .toBe(`/products/${encodeURIComponent(OTHER)}/show/product`);
    });
});

describe('the list', () => {
    it('opens a record in its aspect tab', async () => {
        noVocabulary();
        const ProductList = createAspectList({resource: 'products', aspect: 'product'});
        const location = renderAt('/products', <ProductList/>);
        fireEvent.click(await screen.findByText('Breaker 1'));
        await waitFor(() => expect(location.pathname).toBe(`${SHOW}/product`));
    });
});

describe('a reference', () => {
    it('opens its target in the aspect tab of the target when the vocabulary names no tab', async () => {
        noVocabulary();
        renderAt('/', (
            <RecordContextProvider value={RECORD}>
                <LiteralField source="product:isPartOf" label="Part of"/>
            </RecordContextProvider>
        ));
        const chip = await screen.findByText('Node 2');
        expect(chip.closest('a').getAttribute('href'))
            .toBe(`/products/${encodeURIComponent(OTHER)}/show/product`);
    });

    it('opens the tab the vocabulary names (rdfs:range)', async () => {
        noVocabulary();
        renderAt('/', (
            <RecordContextProvider value={RECORD}>
                <LiteralField source="product:isPartOf" label="Part of" tabPath="breaker.grid.example.ifdd.de"/>
            </RecordContextProvider>
        ));
        const chip = await screen.findByText('Node 2');
        expect(chip.closest('a').getAttribute('href'))
            .toBe(`/products/${encodeURIComponent(OTHER)}/show/breaker.grid.example.ifdd.de`);
    });
});
