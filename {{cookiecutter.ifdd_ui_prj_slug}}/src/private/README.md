# Private tree (mount point)

This directory is empty on purpose and is excluded from version control.

Content placed here is discovered automatically:

| Path | Purpose |
|---|---|
| `tab_<aspect>_<name>.jsx` (at any depth) | an extra show tab for that aspect |
| `i18n/<locale>.js` | translations merged into the built-in messages |

A tab module default-exports `(record) => <TabbedShowLayout.Tab .../>` — build
it with `buildTab` from `src/ifdd/tab/buildTab`, with `context: '<context
name>'` so that it only appears for records carrying that context. Export
`aspect` explicitly if the file name does not carry it. Export
`context = '<context name>'` to replace the generic tab of that context, e.g.
for links into another system; without it the tab is shown in addition.

Sources are `<context name>:<term>`, e.g. `sub1.dom1.ifdd.de:serialNumber`:
the single document of ifdd-be-core uses the context name as prefix. Give the
tab the context name as `path`: links and references open tabs by path.

Translations are the fallback where a vocabulary has no label: tab titles
under `ifdd.context.<context name>` (dots allowed), field labels under
`ifdd.field.<term>`, e.g. in `i18n/de.js`:

```js
export default {ifdd: {context: {'sub1.dom1.ifdd.de': 'Schaltanlagen'}}};
```

Mount your private repository here as a git submodule, a symlink or a
container volume. Nothing in this repository imports it by name, so a cruft
update never removes your registrations.
