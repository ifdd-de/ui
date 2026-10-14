(ifdd-ui-security)=
# Sicherheit

Die UI entscheidet nichts allein: Das Backend prüft jede Anfrage gegen das
Access-Token. Was die UI einem Benutzer nicht zeigt, verweigert das Backend
ohnehin.

## Anmeldung und Tokens

- Authorization Code Flow mit PKCE (`oidc-client-ts`) gegen den public Client
  `{{ cookiecutter.ifdd_oidc_client_id }}` des Realms
  `{{ cookiecutter.ifdd_oidc_realm }}`, Scopes `openid profile email`.
- Redirects gehen an `/authentication/callback`; Tokens werden zehn Minuten
  vor Ablauf still in einem versteckten Frame erneuert
  (`/authentication/silent-callback`). Läuft das Access-Token trotzdem ab,
  lädt die Seite neu.
- Die Sitzung (Tokens und Benutzer) liegt im `localStorage` des
  UI-Ursprungs. Jedes Skript auf diesem Ursprung kann sie lesen; deshalb
  zählen die CSP des Proxys (`csp-ui`) und das Fehlen fremder Skripte.
- Beim Abmelden wird das Access-Token beim Realm widerrufen.

## Rollen in der UI

Die UI liest die Client-Rollen von `{{ cookiecutter.ifdd_oidc_client_id }}`
(`resource_access`) aus ID-Token und Userinfo. Sie kennt die Rollen
`ifdd_nodes_ro`, `ifdd_nodes_rw` und `ifdd_nodes_priv`; diese Namen stehen
fest in `src/permissions.js` und kommen nicht aus den Variablen. Ein
Benutzer ohne eine davon bekommt keine Daten: Das Backend antwortet 403.

## Härtung im Browser

Der Proxy hängt `security-headers` und `csp-ui` an den Router. `csp-ui` muss
in `connect-src` jeden Ursprung nennen, den der Browser aufruft (Realm,
Backend, type, unit), und in `frame-src` den Auth-Endpunkt des Realms für die
stille Erneuerung; sonst nichts. Die Werte kommen aus
`.cookiecutter_all.yaml` (`ifdd_proxy_csp_ui`); nach einer Änderung in der
Browser-Konsole prüfen. Das Backend erlaubt ursprungsübergreifende Aufrufe
nur von `{{ cookiecutter.ifdd_ui_url }}`.

## Proxy-Labels

{% if cookiecutter.ifdd_ui_enable_tls == "y" or cookiecutter.ifdd_ui_enable_letsencrypt == "y" -%}
**Diese Instanz setzt `tls`-Labels am Router** (`ifdd_ui_enable_tls`,
`ifdd_ui_enable_letsencrypt`). Hinter dem IFDD-Proxy verliert ein Router mit
eigenem `tls`-Abschnitt die TLS-Konfiguration des Entry Points, einschließlich
des Let's-Encrypt-Resolvers. Beide Variablen auf `n` setzen.
{%- else -%}
Der Router setzt keine `tls`-Labels; TLS ist am Entry Point des Proxys
konfiguriert. `ifdd_ui_enable_tls` und `ifdd_ui_enable_letsencrypt` auf `n`
lassen: Mit `y` bekommt der Router einen eigenen `tls`-Abschnitt und verliert
diese Konfiguration.
{%- endif %}

## Private Inhalte

Der private Baum (`src/private`) wird in diesem Repository nie versioniert.
Er wird ins Image gebaut; was er enthält, geht also an jeden Browser, der die
UI lädt: Secrets gehören nicht hinein.
