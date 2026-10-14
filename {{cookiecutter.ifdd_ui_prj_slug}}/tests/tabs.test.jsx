import {describe, expect, it} from 'vitest';
import {buildTab, matchesContext} from '../src/ifdd/tab/buildTab';
import {baseTab, fields as baseFields} from '../src/ifdd/tab/base';

const recordWith = (...names) => ({
    '@context': Object.fromEntries(names.map(name => [name, `https://type.example/v1/${name}/`])),
});

describe('context matching', () => {
    it('matches a record carrying the context name (key of @context)', () => {
        expect(matchesContext(recordWith('product'), 'product')).toBe(true);
        expect(matchesContext(recordWith('product', 'sub1.dom1.ifdd.de'), 'sub1.dom1.ifdd.de')).toBe(true);
    });

    it('does not match another context or a context URL in the values', () => {
        expect(matchesContext(recordWith('location'), 'product')).toBe(false);
        expect(matchesContext({'@context': {x: 'https://schema/v1/product.jsonld'}}, 'product.jsonld')).toBe(false);
    });

    it('does not match a record without a context', () => {
        expect(matchesContext({}, 'product')).toBe(false);
    });
});

describe('declarative tabs', () => {
    const fields = [{label: 'x', source: 'sub1.dom1.ifdd.de:objName'}];

    it('renders a tab with a context only for records carrying it', () => {
        expect(buildTab({record: recordWith('sub1.dom1.ifdd.de'), context: 'sub1.dom1.ifdd.de', path: 'p', label: 'l', fields}))
            .not.toBeNull();
        expect(buildTab({record: recordWith('product'), context: 'sub1.dom1.ifdd.de', path: 'p', label: 'l', fields}))
            .toBeNull();
    });

    it('always renders the base tab', () => {
        expect(baseTab({})).not.toBeNull();
    });
});

describe('cache metadata (c_*)', () => {
    it('is shown in the base tab', () => {
        expect(baseFields.map(f => f.source)).toEqual(expect.arrayContaining([
            'base:c_created', 'base:c_modified', 'base:c_validNotBefore',
            'base:c_validNotAfter', 'base:c_cacheUpdated',
        ]));
    });
});
