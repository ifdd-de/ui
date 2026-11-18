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
cruft create --checkout v26.11.2 https://github.com/ifdd-de/ui
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
and `sphinxcontrib.plantuml` (PlantUML with Java and Graphviz).
Labels start with `ifdd-ui-`; references to
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

The check runs PlantUML, so it needs Java and Graphviz.
`tests/docs/get_plantuml.sh` downloads the pinned PlantUML jar into the user
cache, checks its SHA-256 and prints its path:

```bash
export IFDD_PLANTUML_JAR="$(tests/docs/get_plantuml.sh)"
```

## CI

| Workflow | Trigger | Does |
|---|---|---|
| `template-test.yml` | push, PR | renders against three fixture configurations, installs, tests and builds each, checks and builds the documentation (`tests/check_docs.py`), checks that two instances with different project names share no Traefik or image name (`tests/check_two_instances.py`, with a counter-check); fails if the private tree ships anything but its README |
| `template-update-test.yml` | push, PR | generates from the latest tag, applies the current template with `cruft update`, then tests and builds the result |

Generated instances carry `ci.yml` (test, build, plus `cruft check` and
`cruft diff` as drift indicators) and `release.yml` (image build and push to
ghcr.io on a `v*` tag). Both check out submodules, so a private tree mounted
as a submodule is included; without it the build still succeeds and the
private tabs are simply absent.

The workflow files are on the template's copy-without-render list, because
GitHub Actions expressions use the same `${{ }}` syntax as Jinja.

## AI assistance

Some parts of this repository, in particular the tests, the test data and the
documentation, were developed or improved with the help of large language
models (LLMs). All changes were reviewed and released by the maintainer.
