import {describe, expect, it} from 'vitest';
import {kindOf, resourceOf} from '../src/ifdd/fields/LiteralField';
import {ifddAspects, ifddUrlRest} from '../src/Env';

describe('JSON-LD value classification', () => {
    it('accepts both the http and the https XML Schema namespace', () => {
        expect(kindOf({'@type': 'http://www.w3.org/2001/XMLSchema#string', '@value': 'x'})).toBe('string');
        expect(kindOf({'@type': 'https://www.w3.org/2001/XMLSchema#string', '@value': 'x'})).toBe('string');
        expect(kindOf({'@type': 'http://www.w3.org/2001/XMLSchema#dateTime', '@value': 'x'})).toBe('dateTime');
        expect(kindOf({'@type': 'https://www.w3.org/2001/XMLSchema#dateTime', '@value': 'x'})).toBe('dateTime');
    });

    it('recognises quantity values', () => {
        expect(kindOf({'@type': 'https://qudt.org/schema/qudt/QuantityValue'})).toBe('quantityValue');
    });

    it('recognises single and multiple references', () => {
        expect(kindOf({'@id': 'http://example.org/a'})).toBe('single_reference');
        expect(kindOf([{'@id': 'http://example.org/a'}])).toBe('multiple_reference');
    });

    it('does not mutate the value it classifies', () => {
        const value = {'@id': 'http://example.org/a'};
        const before = JSON.stringify(value);
        kindOf(value);
        expect(JSON.stringify(value)).toBe(before);
    });

    it('shows plain values, as the backend compacts terms without a datatype', () => {
        expect(kindOf('plain')).toBe('plain');
        expect(kindOf(110)).toBe('plain');
        expect(kindOf(['a', 'b'])).toBe('list');
    });

    it('recognises dates and other typed values', () => {
        expect(kindOf({'@type': 'http://www.w3.org/2001/XMLSchema#date', '@value': '2026-01-15'})).toBe('date');
        expect(kindOf({'@type': 'http://www.w3.org/2001/XMLSchema#gYear', '@value': '1998'})).toBe('string');
        expect(kindOf({'@type': 'http://qudt.org/schema/qudt/QuantityValue'})).toBe('quantityValue');
    });

    it('returns null for empty and unknown values', () => {
        expect(kindOf(undefined)).toBeNull();
        expect(kindOf('')).toBeNull();
        expect(kindOf([])).toBeNull();
        expect(kindOf({foo: 'bar'})).toBeNull();
    });
});

describe('reference targets', () => {
    it('take the resource from the IRI of this backend, for the configured aspects', () => {
        ifddAspects.forEach(aspect => {
            expect(resourceOf(`${ifddUrlRest}/${aspect}s/1`)).toBe(`${aspect}s`);
        });
    });

    it('give no resource for other backends or unknown segments (shown as a link)', () => {
        expect(resourceOf('https://elsewhere.example/products/1')).toBeNull();
        expect(resourceOf(`${ifddUrlRest}/contracts/42`)).toBeNull();
        expect(resourceOf(undefined)).toBeNull();
    });
});
