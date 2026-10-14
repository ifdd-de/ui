import {describe, expect, it, vi} from 'vitest';
import {createIfddDataProvider} from '../src/ifdd_backend_provider';

const headers = new Headers({'x-total-count': '2'});

describe('data provider', () => {
    it('implements the object interface react-admin 5 expects', () => {
        const provider = createIfddDataProvider('http://api');
        ['getList', 'getOne', 'getMany', 'getManyReference'].forEach(method => {
            expect(typeof provider[method]).toBe('function');
        });
    });

    it('keeps typed JSON-LD values intact', async () => {
        const typed = {'@type': 'https://www.w3.org/2001/XMLSchema#dateTime', '@value': '2026-01-01T00:00:00Z'};
        const httpClient = vi.fn().mockResolvedValue({
            headers,
            json: {'@id': 'http://api/products/1', 'product:created': typed},
        });
        const provider = createIfddDataProvider('http://api', httpClient);
        const {data} = await provider.getOne('products', {id: 'http://api/products/1'});
        expect(data['product:created']).toEqual(typed);
        expect(data.id).toBe('http://api/products/1');
    });

    it('unwraps @id objects when posting reference ids', async () => {
        const httpClient = vi.fn().mockResolvedValue({headers, json: []});
        const provider = createIfddDataProvider('http://api', httpClient);
        await provider.getMany('products', {ids: [{'@id': 'http://api/products/1'}, 'http://api/products/2']});
        const body = JSON.parse(httpClient.mock.calls[0][1].body);
        expect(body.ids).toEqual(['http://api/products/1', 'http://api/products/2']);
    });

    it('fails loudly when the total count header is missing', async () => {
        const httpClient = vi.fn().mockResolvedValue({headers: new Headers(), json: []});
        const provider = createIfddDataProvider('http://api', httpClient);
        await expect(provider.getList('products', {
            pagination: {page: 1, perPage: 10},
            sort: {field: 'c_cacheUpdated', order: 'DESC'},
            filter: {},
        })).rejects.toThrow(/X-Total-Count/);
    });
});

describe('sorting', () => {
    const listUrl = async (field) => {
        const httpClient = vi.fn().mockResolvedValue({headers, json: []});
        const provider = createIfddDataProvider('http://api', httpClient);
        await provider.getList('products', {
            pagination: {page: 1, perPage: 10},
            sort: {field, order: 'DESC'},
            filter: {},
        });
        return new URL(httpClient.mock.calls[0][0]);
    };

    it('passes a sort key the backend accepts', async () => {
        const url = await listUrl('c_cacheUpdated');
        expect(url.searchParams.get('sort')).toBe('c_cacheUpdated');
        expect(url.searchParams.get('order')).toBe('DESC');
    });

    it('leaves out a key the backend would refuse, e.g. the react-admin default id', async () => {
        const url = await listUrl('id');
        expect(url.searchParams.has('sort')).toBe(false);
        expect(url.searchParams.has('order')).toBe(false);
    });

    it('sorts references by objName, which the documents have', async () => {
        const httpClient = vi.fn().mockResolvedValue({headers, json: []});
        const provider = createIfddDataProvider('http://api', httpClient);
        await provider.getMany('products', {ids: ['http://api/products/1']});
        expect(new URL(httpClient.mock.calls[0][0]).searchParams.get('sort')).toBe('objName');
    });
});

describe('query serialisation', () => {
    it('skips empty values and expands arrays', async () => {
        const {stringify} = await import('../src/ifdd_backend_provider');
        expect(stringify({a: 1, b: undefined, c: null, d: '', e: ['x', 'y']}))
            .toBe('a=1&e=x&e=y');
    });

    it('encodes reserved characters', async () => {
        const {stringify} = await import('../src/ifdd_backend_provider');
        expect(stringify({q: 'a b&c'})).toBe('q=a+b%26c');
    });
});
