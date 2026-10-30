# ifdd-de/ui - Frontend Template

Cookiecutter template for an IFDD react-admin frontend. It talks to the
backend generated from `ifdd-de/be`.

## What is in here

The template ships the generic frontend: routing, OIDC authentication, the
react-admin data provider for the IFDD backend, the aspect views and the graph
tab. Nothing in it is specific to one deployment.

There is deliberately **no** separate `ui-core` package. The Jinja footprint of
this template is four files, none of which is application code, so the reason
that made the backend split worthwhile - template placeholders blinding the
IDE - does not apply here.

## Configuration

`src/Env.js` is the single source of configuration and is rendered by
cookiecutter. There are no build-time environment variables in the application
code; `.env` only carries what docker compose needs.

| Variable | Purpose |
|---|---|
| `ifdd_ui_aspects` | JSON array of the aspects this instance exposes |
| `ifdd_ui_show_explorer` | enables the graph tab |
| `ifdd_be_url` | backend base URL |
| `ifdd_schema_url`, `ifdd_type_url`, `ifdd_unit_url` | schema, type and unit services; the UI reads vocabularies and units from the last two, so the CSP of the proxy must allow them in `connect-src` |
| `ifdd_oidc_realm`, `ifdd_oidc_client_id` | OIDC endpoint and client |
| `ifdd_proxy_network` | shared: external Docker network of the proxy, default `proxy-net`; the compose files join it and name it in `traefik.docker.network` |

## Tabs come from the vocabularies

A record of ifdd-be-core carries one prefix per JSON-LD context, the
context name, and maps it to its namespace in `@context`
(`{"product": "https://type/v1/product/", "sub1.dom1.ifdd.de": "..."}`).
The show view has one generic tab per context (`src/ifdd/tab/contextTab.jsx`):
the aspect context first, then the domain contexts the user may read
(ifdd-be-core leaves out the others), then the graph and the base tab.

A tab lists the values with its prefix. Label (in the UI language), help
text (on hover), order and, for references, the tab to open come from the
**vocabulary** of the namespace, one JSON-LD document per namespace on the
type service (ifdd-de/type); units of quantity values come from the unit
service (ifdd-de/unit) and link to their document there. Without a
vocabulary the translation is used (`ifdd.field.<term>`; tab titles
`ifdd.aspect.<name>` for base and aspects, `ifdd.context.<name>` for domain
contexts), then the plain name. No field list has to be written per
context. The values are direct children of the tab, so they stand one below
the other like the fields of the base tab.

The field component is chosen from the value: plain values, `xsd:string`,
`xsd:dateTime`, `xsd:date` and other typed literals, lists, QUDT
`QuantityValue`, single references and reference lists. A reference finds
its resource from the IRI it points to (`…/products/<id>` -> `products`);
an IRI of another backend is shown as a link. A property whose
`rdfs:range` is the class of a context (`<type url>/<name>/schema`) opens
the target in that context's tab; without such a range a reference opens
the aspect tab of its target (`…/organisations/<id>` -> `organisation`).

The path of a tab is its context name (`product`,
`breaker.grid.example.ifdd.de`) or a fixed name (`base`, `explore`). One
rule decides the tab a record opens with (`src/ifdd/tabs.js`): the aspect
tab, else the first tab. The list opens `/<resource>/<id>/show/<aspect>`; a
URL without a tab is redirected there silently, a URL with a tab the record
does not have (or a domain context the user may not read: ifdd-be-core
leaves it out, so the UI cannot tell the two apart) with a notice. The view
decides only on the single document of ifdd-be-core: lists and references
put a short form of each record into react-admin's cache, which has none of
the context tabs.

Every vocabulary and unit document is fetched once per session and shared by
all tabs and records (react-query, no expiry); the browser's HTTP cache keeps
them across reloads. Only the type and unit services of the instance are
asked.

The base tab (`src/ifdd/tab/base.jsx`) stays a declared field list
(`buildTab`); so may a private tab that replaces a generic one.

## The private tree

Instance-specific tabs and the translations of internal namespaces live
outside this repository. Mount them at `src/private` - as a git submodule, a
symlink or a container volume - and they are discovered automatically:

| Path | Purpose |
|---|---|
| `tab_<aspect>_<name>.jsx` at any depth | an extra show tab for that aspect; with `export const context = '<name>'` it replaces the generic tab of that context |
| `i18n/<locale>.js` | translations merged over the built-in messages |

No file in this repository imports them by name, so a cruft update never
removes your registrations. `src/private` is excluded from version control in
the generated instance.

## Usage

```bash
cruft create --checkout v26.10.2 https://github.com/ifdd-de/ui
cd <instance>
npm install
npm run dev
npm test
```

Recommended skip list when generating, so that instance-owned paths survive a
template update:

```bash
--skip .env --skip envs --skip certs --skip src/private --skip src/Env.js
```

`certs/` takes additional CA certificates (PEM) for the image build, e.g. of a
TLS-intercepting web proxy in front of the npm registry; the Node stages of
the `Dockerfile` trust them through `NODE_EXTRA_CA_CERTS` (see
`docs/en/setup.md` of an instance).

## Toolchain

Vite and Vitest. Create React App was deprecated by the React team on
2025-02-14 and `react-scripts` cannot build or test this application against
current React versions.

## Documentation of the instance (`docs/`)

Every instance carries its operating documentation as Sphinx sources in
MyST Markdown, in English (`docs/en`) and German (`docs/de`), with the same
files, labels and headings in both. The pages follow the work around the
service: `index` (purpose, how records are shown, architecture), `setup`,
`build-release`, `operations`, `security`, `troubleshooting`, `reference`.
cookiecutter fills in the values of the instance. The instance README is
only an entry point that links to them. `docs` is in `.dockerignore`, so the
pages do not reach the image.

The pages have no `conf.py` of their own: they are meant to be copied into a
Sphinx project that documents all services. That project needs `myst_parser`
and `sphinxcontrib.mermaid`. Labels start with `ifdd-ui-`; references to
`ifdd-instances-ui` (the instance chapter of the meta repository) resolve
only there.

Rules for editing the pages in the template:

- change both languages in the same commit;
- no Jinja syntax in examples (`{{`, `{%`, `{#`); wrap such text in
  `{% raw %}`;
- the placeholder check of the CI greps the rendered instance for the text
  `cookiecutter` followed by a dot; do not write it literally.

`tests/check_docs.py` checks a rendered instance: same files, labels and
headings per level in both languages, every label with the prefix, every
reference to an own label resolvable, and a Sphinx build of each language
with `-W` (configuration `tests/docs/conf.py`, versions
`tests/docs/requirements.txt`).

## CI

| Workflow | Trigger | Does |
|---|---|---|
| `template-test.yml` | push, PR | renders against three fixture configurations, installs, tests and builds each, checks and builds the documentation (`tests/check_docs.py`); fails if the private tree ships anything but its README |
| `template-update-test.yml` | push, PR | generates from the latest tag, applies the current template with `cruft update`, then tests and builds the result |

Generated instances carry `ci.yml` (test, build, plus `cruft check` and
`cruft diff` as drift indicators) and `release.yml` (image build and push to
ghcr.io on a `v*` tag). Both check out submodules, so a private tree mounted
as a submodule is included; without it the build still succeeds and the
private tabs are simply absent.

The workflow files are on the template's copy-without-render list, because
GitHub Actions expressions use the same `${{ }}` syntax as Jinja.

## Honesty notes

Documentation `docs/` (2026-10-13): rendered with cookiecutter 2.7.1 for the
three fixtures and with the `cookiecutter_all.yaml` of the meta repository;
`tests/check_docs.py` passes for each (Sphinx 9.1.0, myst-parser 5.1.0,
sphinxcontrib-mermaid 2.1.1, Python 3.13) and the placeholder check finds
nothing. The workflow file passes actionlint 1.7.12; the workflow itself has
not run. Content: taken from the previous instance README, this README, the
`Dockerfile`, `nginx.conf`, the compose files and `src/auth/`. Not checked:
the Vitest suite after this change (no file it reads was changed). Also
checked (2026-10-13): one Sphinx project per language with the pages of all
ten service templates (rendered with `cookiecutter_all.yaml`), the instance
chapter of the meta repository and ifdd-be-core with its OpenAPI document
builds with `-W` and no suppressed warnings, so every cross reference
resolves; the Mermaid diagrams of all services, and of the option variants
of the fixtures, render in headless Chromium 141.0.7390.37 (Playwright
1.56.0, Mermaid 11.12.1 served locally).

Bitemporal backend (2026-10-06): the time fields follow the c_* terms of
the schemas (`schemaVersion` 0.10.0). `c_created`, `c_modified`,
`c_validNotBefore`, `c_validNotAfter` and `c_cacheUpdated` are shown in the
base tab only; the aspect tabs no longer list `created`, `modified` and
`expired` (the latter never matched a schema term, the schemas called it
`expire`). Lists show `c_created`/`c_modified` and sort by
`c_cacheUpdated DESC` by default (`c_modified` may be empty, and PostgreSQL
puts empty values first when sorting descending). References sort by
`objName`; before they asked for `name`, which no document has. The data
provider sends only the sort keys ifdd-be-core accepts and leaves others out
(react-admin falls back to `id`). The UI always shows the current state; it
does not offer an instant in valid time. Checked: vitest (39 tests; 8 of the
9 new ones fail against the previous state) and `vite build` on Node 22,
rendering of all three fixtures with cookiecutter 2.7.1. Not checked: the
running UI in a browser against the new backend.

Generic context tabs (2026-10-12): tested with vitest (49 tests, all three
fixtures) and `vite build`; the new tests (context matching by name,
vocabulary fetch and language, rows and order of a context, one fetch per
namespace for two tabs, quantity value with unit symbol and link, plain and
typed values, reference targets) fail against the previous template. The
vocabulary documents of the tests have the shape of the ifdd-de/type and
ifdd-de/unit examples; the real services were checked separately with nginx
1.24.0. Not checked: a browser against a running backend, type and unit
service (CSP, CORS, tab switching), and the private tab of an existing
deployment (it needs `context:` instead of `schemaSuffix:` and the context
name as prefix).

Tabs and translations (2026-10-12, second round): values one below the
other, the aspect tab as the default (list, references, redirect with a
notice for unknown tabs), titles and labels from the vocabulary, then the
translation, then the name. Found and fixed on the way: typed values (dates,
`xsd:string`, `xsd:gYear`, `xsd:duration`) and single references of a domain
context were empty, because react-admin splits `source` at dots
(`breaker.grid.example.ifdd.de:c_created.@value`); they are now read inside
the value. Tested with vitest (64 tests in all three fixtures) and `vite
build`. Of the 16 new or changed tests 12 fail against the previous
template; the other four cover what it already did (vocabulary labels, a tab
the record has, a target tab from `rdfs:range`) or guard the redirect (the
cache test fails against the redirect without the single-document check); in
Chromium 1194 (headless) with a scratch harness: the real list and show views,
the rendered type and unit examples, a fake backend whose list entries look
like those of ifdd-be-core. Not checked: a running ifdd-be-core and the real
type and unit services behind the proxy (CSP, CORS), the login.
