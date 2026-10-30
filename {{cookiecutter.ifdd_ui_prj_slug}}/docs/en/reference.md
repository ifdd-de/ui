(ifdd-ui-reference)=
# Reference

The variables of the template and their values in this instance are listed
in {ref}`ifdd-instances-ui`. This page lists what is not a template
variable.

## Layout

| Path | Purpose |
|---|---|
| `src/Env.js` | the configuration of the instance (rendered, on the skip list) |
| `src/auth/` | OIDC login, token renewal, roles, the authenticated data provider |
| `src/ifdd/` | aspects (`registry.jsx`), resources, tabs, field components, vocabularies |
| `src/ifdd_backend_provider.js` | the react-admin data provider for the backend |
| `src/i18n/` | built-in translations |
| `src/private/` | mount point of the private tree (not versioned) |
| `tests/` | Vitest tests |
| `Dockerfile`, `nginx.conf` | image: build with Node, serve with nginx |
| `docker-compose-production.yml`, `docker-compose-development.yml` | production image, Vite dev server |
| `dotenv.dist` → `.env` | `IFDD_UI_HOST`, `IFDD_UI_VERSION` for docker compose |

## Exports of `src/Env.js`

| Export | Value here |
|---|---|
| `ifddUrlRest` | `{{ cookiecutter.ifdd_be_url }}` |
| `ifddUrlSchema` | `{{ cookiecutter.ifdd_schema_url }}` |
| `ifddUrlType` | `{{ cookiecutter.ifdd_type_url }}` |
| `ifddUrlUnit` | `{{ cookiecutter.ifdd_unit_url }}` |
| `ifddTitle` | `{{ cookiecutter.ifdd_ui_title }}` |
| `ifddVersion` | `{{ cookiecutter.ifdd_ui_version }}` |
| `ifddAspects` | `{{ cookiecutter.ifdd_ui_aspects }}` |
| `ifddShowExplorer` | `{{ "true" if cookiecutter.ifdd_ui_show_explorer == "y" else "false" }}` |
| `ifddAuthProvider` | `{{ cookiecutter.ifdd_oidc_provider }}` |
| `ifddOidcRealm` | `{{ cookiecutter.ifdd_oidc_realm }}` |
| `ifddOidcClientId` | `{{ cookiecutter.ifdd_oidc_client_id }}` |

The values are those rendered at generation; the file is on the skip list
and may have been edited since.

## Paths of the application

| Path | Purpose |
|---|---|
| `/authentication/callback` | end of the login (redirect URI) |
| `/authentication/silent-callback` | silent token renewal in a hidden frame (redirect URI) |
| `/<resource>/<id>/show/<tab>` | a record in a tab: the context name, `base` or `explore` |
| `/healthz` | health check of the production image |

## Container

| | Production | Development |
|---|---|---|
| port | 80 (nginx) | 3000 (Vite) |
| router and service | `{{ cookiecutter.ifdd_ui_prj_slug }}`, rule `Host(<IFDD_UI_HOST>)` | the same |
| middlewares | `security-headers@file`, `csp-ui@file` | none |
| network | `{{ cookiecutter.ifdd_proxy_network }}` (external) | the same |
| restart | `always` | `always` |
