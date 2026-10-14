import {describe, expect, it} from 'vitest';
import {aspects, knownAspects, unknownAspects} from '../src/ifdd/registry';
import {ifddAspects} from '../src/Env';

describe('aspect registry', () => {
    it('exposes exactly the aspects configured in Env.js', () => {
        expect(aspects.map(entry => entry.aspect)).toEqual(ifddAspects);
    });

    it('reports no unknown aspects for the shipped configuration', () => {
        expect(unknownAspects).toEqual([]);
    });

    it('derives the REST resource name from the aspect', () => {
        aspects.forEach(({aspect, resource}) => {
            expect(resource).toBe(`${aspect}s`);
        });
    });

    it('builds a list and a show component for every aspect', () => {
        aspects.forEach(({list, show}) => {
            expect(typeof list).toBe('function');
            expect(typeof show).toBe('function');
        });
    });

    it('knows every aspect that ships a tab', () => {
        expect(knownAspects).toContain('product');
        expect(knownAspects).toContain('project');
    });
});
