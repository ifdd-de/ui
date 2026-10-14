(ifdd-ui-troubleshooting)=
# Troubleshooting

Most failures show only in the browser: open its developer tools (console
and network) first.

## Login

| Symptom | Cause | Remedy |
|---|---|---|
| Keycloak answers `Invalid parameter: redirect_uri` | the origin in the browser is not among the redirect URIs of the client | open the UI under `{{ cookiecutter.ifdd_ui_url }}`; for another origin add its `/authentication/callback` and `/authentication/silent-callback` to the client |
| console: `Silent token renewal error` | the hidden frame cannot reach the realm (`frame-src` of `csp-ui`), or the session at the realm ended | check `frame-src`; sign in again |
| users are signed out with several tabs open | the realm rotates refresh tokens, each is valid once | expected |
| the page reloads by itself | the access token expired before it could be renewed | check the silent renewal as above |

## Data

| Symptom | Cause | Remedy |
|---|---|---|
| console: `Refused to connect to '...'` | `connect-src` of `csp-ui` lacks that origin | add it to `ifdd_proxy_csp_ui` (proxy) |
| console: `400 Disallowed CORS origin` from the backend | the UI runs on another origin than the backend allows | set the UI origin in the backend's `.env`, restart it |
| lists stay empty, the backend answers 403 | the user has no node role | add the user to a node group in Keycloak |
| the dashboard shows "no backend version" | `/prot_version` failed: backend down, CORS, CSP or no token | check the request in the network tab |
| values show their plain names instead of labels | the vocabulary of the namespace is missing or unreachable on the type service | check the request to `{{ cookiecutter.ifdd_type_url }}` in the network tab |
| a link opens the aspect tab with a notice | the record has no such tab, or the user may not read that domain context | expected; check the context patterns of the user |
| an aspect is missing in the menu | it is not in `ifddAspects`, or not in `src/ifdd/registry.jsx` | add it, rebuild |

## Build and private tree

| Symptom | Cause | Remedy |
|---|---|---|
| a private tab does not appear | file name not `tab_<aspect>_<name>.jsx`, no `context` export for a domain context, or the tree was not mounted at build time | see `src/private/README.md`; rebuild |
| a build fails although nothing changed here | without a lockfile `npm install` took newer dependency versions | commit a `package-lock.json` of a working build |
| the container is not reachable through the proxy | it is not on `proxy-net` (fixed name in the compose files), or `IFDD_UI_HOST` differs from the requested host | check the router in the proxy dashboard |
{%- if cookiecutter.ifdd_ui_enable_tls == "y" or cookiecutter.ifdd_ui_enable_letsencrypt == "y" %}
| the UI is served without the proxy's certificate | this instance sets router `tls` labels | set `ifdd_ui_enable_tls` and `ifdd_ui_enable_letsencrypt` to `n` ({ref}`ifdd-ui-security`) |
{%- endif %}
