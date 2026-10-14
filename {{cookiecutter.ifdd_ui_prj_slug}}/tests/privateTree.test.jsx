import {describe, expect, it} from 'vitest';
import {privateTabCount, privateTabsFor} from '../src/ifdd/privateTabs';
import {mergeWithPrivate} from '../src/i18n/private';
import english from '../src/i18n/en';

// These assertions hold whether or not a private tree is mounted, so the
// suite stays green in the template and in a deployment that mounts one.
describe('private tree mount point', () => {
    it('discovers only well-formed tab builders', () => {
        const discovered = ['product', 'function', 'location', 'organisation', 'project']
            .flatMap(aspect => privateTabsFor(aspect));
        discovered.forEach(build => expect(typeof build).toBe('function'));
        expect(discovered.length).toBeLessThanOrEqual(privateTabCount);
    });

    it('returns an empty list for an aspect nobody extended', () => {
        expect(privateTabsFor('no-such-aspect')).toEqual([]);
    });

    it('keeps the built-in messages when merging', () => {
        const merged = mergeWithPrivate(english, 'en');
        expect(merged.resources.products.name).toBe(english.resources.products.name);
        expect(merged.ifdd.field.name).toBe(english.ifdd.field.name);
    });

    it('does not mutate the built-in messages while merging', () => {
        const before = JSON.stringify(english);
        mergeWithPrivate(english, 'en');
        expect(JSON.stringify(english)).toBe(before);
    });
});
