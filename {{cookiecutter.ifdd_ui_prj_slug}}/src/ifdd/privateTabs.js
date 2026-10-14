/**
 * Discovery of private tabs.
 *
 * Private tabs live outside this repository. Mount your private tree at
 * src/private (a git submodule, a symlink or a container volume) and it is
 * picked up automatically - there are no imports to edit here or anywhere
 * else, so a cruft update never touches your registrations.
 *
 * Contract for a private tab module:
 *   - default export: (record) => TabbedShowLayout.Tab element or null
 *   - optional named export `aspect`: the aspect it belongs to
 *   - optional named export `context`: the context name whose generic tab
 *     this one replaces (e.g. a tab with links into another system)
 * When `aspect` is absent it is taken from the file name, which must follow
 * tab_<aspect>_<name>.jsx. Without `context` the tab is shown in addition to
 * the generic context tabs.
 */

const modules = import.meta.glob('../private/**/tab_*.{js,jsx}', {eager: true});

const aspectFromPath = (path) => {
    const file = path.split('/').pop() || '';
    const match = file.match(/^tab_([a-z0-9]+)_/i);
    return match ? match[1].toLowerCase() : null;
};

const byAspect = {};

Object.entries(modules).forEach(([path, module]) => {
    const build = module.default;
    if (typeof build !== 'function') {
        console.warn(`Private tab ${path} has no default-exported builder function; skipped.`);
        return;
    }
    const aspect = module.aspect || aspectFromPath(path);
    if (!aspect) {
        console.warn(`Cannot determine the aspect of private tab ${path}; skipped.`);
        return;
    }
    const context = typeof module.context === 'string' ? module.context : null;
    (byAspect[aspect] = byAspect[aspect] || []).push({path, build, context});
});

// Stable order, so the tab sequence does not depend on glob order.
Object.values(byAspect).forEach(entries => entries.sort((a, b) => a.path.localeCompare(b.path)));

export const privateTabsFor = (aspect) => (byAspect[aspect] || []).map(entry => entry.build);

/** The context names whose generic tab a private tab of the aspect replaces. */
export const privateContextsFor = (aspect) =>
    (byAspect[aspect] || []).map(entry => entry.context).filter(Boolean);

export const privateTabCount = Object.values(byAspect).reduce((sum, e) => sum + e.length, 0);
