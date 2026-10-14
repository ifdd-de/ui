(ifdd-ui-security)=
# Security

The UI decides nothing on its own: the backend checks every request against
the access token. What the UI hides from a user, the backend refuses anyway.

## Login and tokens

- Authorization code flow with PKCE (`oidc-client-ts`) against the public
  client `{{ cookiecutter.ifdd_oidc_client_id }}` of the realm
  `{{ cookiecutter.ifdd_oidc_realm }}`, scopes `openid profile email`.
- Redirects go to `/authentication/callback`; tokens are renewed silently in
  a hidden frame (`/authentication/silent-callback`) ten minutes before they
  expire. When the access token expires anyway, the page reloads.
- The session (tokens and user) is kept in `localStorage` of the UI origin.
  Every script running on that origin can read it, which is why the CSP of
  the proxy (`csp-ui`) and the absence of foreign scripts matter.
- On logout the access token is revoked at the realm.

## Roles in the UI

The UI reads the client roles of `{{ cookiecutter.ifdd_oidc_client_id }}`
(`resource_access`) from the ID token and the userinfo response. It knows
the roles `ifdd_nodes_ro`, `ifdd_nodes_rw` and `ifdd_nodes_priv`; these
names are fixed in `src/permissions.js`, not taken from the variables. A
user without one of them gets no data: the backend answers 403.

## Browser hardening

The proxy attaches `security-headers` and `csp-ui` to the router. `csp-ui`
must list in `connect-src` every origin the browser calls (realm, backend,
type, unit) and the realm's auth endpoint in `frame-src` for the silent
renewal; nothing else. The values come from `.cookiecutter_all.yaml`
(`ifdd_proxy_csp_ui`); verify them in the browser console after a change.
The backend allows cross-origin calls only from
`{{ cookiecutter.ifdd_ui_url }}`.

## Proxy labels

{% if cookiecutter.ifdd_ui_enable_tls == "y" or cookiecutter.ifdd_ui_enable_letsencrypt == "y" -%}
**This instance sets router `tls` labels** (`ifdd_ui_enable_tls`,
`ifdd_ui_enable_letsencrypt`). Behind the IFDD proxy a router with its own
`tls` section loses the TLS configuration of the entry point, including the
Let's Encrypt resolver. Set both variables to `n`.
{%- else -%}
The router sets no `tls` labels; TLS is configured on the entry point of the
proxy. Keep `ifdd_ui_enable_tls` and `ifdd_ui_enable_letsencrypt` at `n`:
with `y` the router gets its own `tls` section and loses that configuration.
{%- endif %}

## Private content

The private tree (`src/private`) is never versioned in this repository. It
is built into the image, so whatever it contains is delivered to every
browser that loads the UI: no secrets belong there.
