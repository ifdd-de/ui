(ifdd-ui-index)=
# {{ cookiecutter.ifdd_ui_prj_name }} (ui)

The web frontend of an IFDD node: a react-admin application that signs
people in at the realm, lists and shows the documents of the backend, and
explains their values with the vocabularies of the type and unit services.
This chapter describes the instance `{{ cookiecutter.ifdd_ui_prj_slug }}`,
generated from the template `ifdd-de/ui`, from the point of view of the
people who set it up, build, run and secure it.

| | |
|---|---|
| Public URL | `{{ cookiecutter.ifdd_ui_url }}` (host `{{ cookiecutter.ifdd_ui_host }}`, routed by the proxy) |
| Version | `{{ cookiecutter.ifdd_ui_version }}` |
| Backend | `{{ cookiecutter.ifdd_be_url }}` |
| Vocabularies, units | `{{ cookiecutter.ifdd_type_url }}`, `{{ cookiecutter.ifdd_unit_url }}` |
| Realm, client | `{{ cookiecutter.ifdd_oidc_realm }}`, `{{ cookiecutter.ifdd_oidc_client_id }}` |
| Aspects | `{{ cookiecutter.ifdd_ui_aspects }}` |
| Graph tab | {{ "on" if cookiecutter.ifdd_ui_show_explorer == "y" else "off" }} |

## What the instance contains

The application (`src/`, built with Vite), its single configuration file
`src/Env.js`, a `Dockerfile` that serves the built files with nginx, two
compose files, and the tests (Vitest). There is no separate core package:
the application code lives in this repository. Instance-specific tabs and
translations come from a private tree mounted at `src/private`
({ref}`ifdd-ui-setup`).

## How records are shown

A document of the backend carries one prefix per JSON-LD context. The show
view has one generic tab per context: the aspect context first, then the
domain contexts the user may read (the backend leaves out the others), then
the graph tab (if on) and the base tab. Label, help text, order and, for
references, the tab to open come from the vocabulary of the context's
namespace on the type service; units come from the unit service. Where the
vocabulary has no label, the translation is used (`ifdd.field.<term>`, tab
titles `ifdd.aspect.<name>` or `ifdd.context.<name>`), then the plain name.
To change a label, change the vocabulary, not this repository.

A record opens in the tab of its aspect (`/<resource>/<id>/show/<aspect>`).
A URL with a tab the record does not have, or a domain context the user may
not read, opens the aspect tab with a notice. Every vocabulary and unit
document is fetched once per session; the browser's HTTP cache keeps them
across reloads.

## Architecture

```{mermaid}
flowchart LR
  Browser -->|"{{ cookiecutter.ifdd_ui_host }}"| Proxy[proxy: Traefik]
  Proxy --> UI[ui: nginx with the built app]
  Browser -->|token, userinfo| KC[Keycloak]
  Browser -->|documents, /prot_version| BE[be]
  Browser -->|vocabularies| Type[type]
  Browser -->|units| Unit[unit]
```

The container only serves static files. Every call to the backend, the
realm and the type and unit services comes from the browser, cross-origin
and through the proxy; the CSP of the proxy (`csp-ui`) and the CORS settings
of those services must allow them.

| The browser calls | For |
|---|---|
| Keycloak (`{{ cookiecutter.ifdd_oidc_realm }}`) | login, token renewal, userinfo, logout |
| be (`{{ cookiecutter.ifdd_be_url }}`) | lists and documents; the version on the dashboard (`/prot_version`) |
| type (`{{ cookiecutter.ifdd_type_url }}`) | labels, help texts, order |
| unit (`{{ cookiecutter.ifdd_unit_url }}`) | units and their symbols |

## Chapters

```{toctree}
:maxdepth: 2

setup
build-release
operations
security
troubleshooting
reference
```

The values of the variables of this instance and how they relate to the
other services are listed in the chapter on the service instances
({ref}`ifdd-instances-ui`).
