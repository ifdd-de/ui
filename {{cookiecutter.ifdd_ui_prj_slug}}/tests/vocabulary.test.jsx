import {afterEach, describe, expect, it, vi} from 'vitest';
import {fetchVocabulary, inLanguage, isServed, namespaceOf} from '../src/ifdd/vocabulary';
import {ifddUrlType, ifddUrlUnit} from '../src/Env';

afterEach(() => vi.restoreAllMocks());

describe('vocabularies', () => {
    it('finds the namespace of a term or unit IRI', () => {
        expect(namespaceOf('https://type/v1/product/serial_number')).toBe('https://type/v1/product/');
        expect(namespaceOf('https://type/v1/sub1.dom1.ifdd.de/x')).toBe('https://type/v1/sub1.dom1.ifdd.de/');
        expect(namespaceOf('http://example.org/vocab#term')).toBe('http://example.org/vocab#');
    });

    it('fetches only from the type and unit services of the instance', () => {
        expect(isServed(`${ifddUrlType}/product/`)).toBe(true);
        expect(isServed(`${ifddUrlUnit}/unit/`)).toBe(true);
        expect(isServed('https://schema.org/')).toBe(false);
        expect(isServed(undefined)).toBe(false);
    });

    it('picks the UI language, then English, then any', () => {
        const label = {en: 'Serial number', de: 'Seriennummer'};
        expect(inLanguage(label, 'de')).toBe('Seriennummer');
        expect(inLanguage(label, 'fr')).toBe('Serial number');
        expect(inLanguage({it: 'Numero'}, 'de')).toBe('Numero');
        expect(inLanguage(undefined, 'de')).toBeUndefined();
    });

    it('indexes the nodes of a vocabulary by @id', async () => {
        const graph = [{'@id': 'https://type/v1/product/'}, {'@id': 'https://type/v1/product/a', order: 10}];
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ok: true, json: async () => ({'@graph': graph})});
        const nodes = await fetchVocabulary('https://type/v1/product/');
        expect(Object.keys(nodes)).toEqual(['https://type/v1/product/', 'https://type/v1/product/a']);
        expect(globalThis.fetch).toHaveBeenCalledWith('https://type/v1/product/', expect.objectContaining({
            headers: {Accept: 'application/ld+json, application/json'},
        }));
    });

    it('fails on an HTTP error instead of reading an error page', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ok: false, status: 404});
        await expect(fetchVocabulary('https://type/v1/none/')).rejects.toThrow('HTTP 404');
    });
});
