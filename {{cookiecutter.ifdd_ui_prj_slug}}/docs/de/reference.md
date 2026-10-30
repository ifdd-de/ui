(ifdd-ui-reference)=
# Referenz

Die Variablen des Templates und ihre Werte in dieser Instanz stehen in
{ref}`ifdd-instances-ui`. Diese Seite führt auf, was keine Template-Variable
ist.

## Aufbau

| Pfad | Zweck |
|---|---|
| `src/Env.js` | die Konfiguration der Instanz (gerendert, auf der Skip-Liste) |
| `src/auth/` | OIDC-Anmeldung, Token-Erneuerung, Rollen, der angemeldete Data Provider |
| `src/ifdd/` | Aspekte (`registry.jsx`), Ressourcen, Reiter, Feldkomponenten, Vokabulare |
| `src/ifdd_backend_provider.js` | der react-admin-Data-Provider für das Backend |
| `src/i18n/` | eingebaute Übersetzungen |
| `src/private/` | Einhängepunkt des privaten Baums (nicht versioniert) |
| `tests/` | Vitest-Tests |
| `certs/` | zusätzliche CA-Zertifikate für den Image-Build (nicht versioniert, auf der Skip-Liste) |
| `Dockerfile`, `nginx.conf` | Image: bauen mit Node, ausliefern mit nginx |
| `docker-compose-production.yml`, `docker-compose-development.yml` | Produktions-Image, Vite-Dev-Server |
| `dotenv.dist` → `.env` | `IFDD_UI_HOST`, `IFDD_UI_VERSION` für docker compose |

## Exporte von `src/Env.js`

| Export | Wert hier |
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

Die Werte sind die beim Erzeugen gerenderten; die Datei steht auf der
Skip-Liste und kann seitdem geändert worden sein.

## Pfade der Anwendung

| Pfad | Zweck |
|---|---|
| `/authentication/callback` | Ende der Anmeldung (Redirect-URI) |
| `/authentication/silent-callback` | stille Token-Erneuerung in einem versteckten Frame (Redirect-URI) |
| `/<resource>/<id>/show/<tab>` | ein Datensatz in einem Reiter: der Kontextname, `base` oder `explore` |
| `/healthz` | Healthcheck des Produktions-Images |

## Container

| | Produktion | Entwicklung |
|---|---|---|
| Port | 80 (nginx) | 3000 (Vite) |
| Router und Dienst | `{{ cookiecutter.ifdd_ui_prj_slug }}`, Regel `Host(<IFDD_UI_HOST>)` | dieselben |
| Middlewares | `security-headers@file`, `csp-ui@file` | keine |
| Netz | `{{ cookiecutter.ifdd_proxy_network }}` (extern) | dasselbe |
| Neustart | `always` | `always` |
