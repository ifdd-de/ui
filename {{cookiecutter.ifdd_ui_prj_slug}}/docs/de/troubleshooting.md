(ifdd-ui-troubleshooting)=
# Fehlersuche

Die meisten Fehler zeigen sich nur im Browser: zuerst seine
Entwicklerwerkzeuge öffnen (Konsole und Netzwerk).

## Anmeldung

| Symptom | Ursache | Abhilfe |
|---|---|---|
| Keycloak antwortet `Invalid parameter: redirect_uri` | der Ursprung im Browser gehört nicht zu den Redirect-URIs des Clients | die UI unter `{{ cookiecutter.ifdd_ui_url }}` öffnen; für einen anderen Ursprung dessen `/authentication/callback` und `/authentication/silent-callback` am Client ergänzen |
| Konsole: `Silent token renewal error` | der versteckte Frame erreicht den Realm nicht (`frame-src` von `csp-ui`), oder die Sitzung am Realm ist beendet | `frame-src` prüfen; neu anmelden |
| Benutzer werden abgemeldet, wenn mehrere Tabs offen sind | der Realm rotiert Refresh-Tokens, jedes gilt einmal | erwartet |
| die Seite lädt von selbst neu | das Access-Token lief ab, bevor es erneuert werden konnte | die stille Erneuerung wie oben prüfen |

## Daten

| Symptom | Ursache | Abhilfe |
|---|---|---|
| Konsole: `Refused to connect to '...'` | `connect-src` von `csp-ui` fehlt dieser Ursprung | ihn in `ifdd_proxy_csp_ui` (Proxy) ergänzen |
| Konsole: `400 Disallowed CORS origin` vom Backend | die UI läuft auf einem anderen Ursprung, als das Backend erlaubt | den UI-Ursprung in der `.env` des Backends setzen, es neu starten |
| Listen bleiben leer, das Backend antwortet 403 | der Benutzer hat keine Knotenrolle | ihn in Keycloak einer Knotengruppe zuordnen |
| das Dashboard zeigt „no backend version“ | `/prot_version` scheiterte: Backend aus, CORS, CSP oder kein Token | die Anfrage im Netzwerk-Tab prüfen |
| Werte zeigen ihre bloßen Namen statt Beschriftungen | das Vokabular des Namensraums fehlt im Dienst type oder ist nicht erreichbar | die Anfrage an `{{ cookiecutter.ifdd_type_url }}` im Netzwerk-Tab prüfen |
| ein Link öffnet den Aspekt-Reiter mit einem Hinweis | der Datensatz hat diesen Reiter nicht, oder der Benutzer darf den Domain-Kontext nicht lesen | erwartet; die Kontextmuster des Benutzers prüfen |
| ein Aspekt fehlt im Menü | er fehlt in `ifddAspects` oder in `src/ifdd/registry.jsx` | ergänzen, neu bauen |

## Build und privater Baum

| Symptom | Ursache | Abhilfe |
|---|---|---|
| ein privater Reiter erscheint nicht | Dateiname nicht `tab_<aspect>_<name>.jsx`, kein `context`-Export für einen Domain-Kontext, oder der Baum war beim Build nicht eingebunden | siehe `src/private/README.md`; neu bauen |
| ein Build scheitert, obwohl sich hier nichts geändert hat | ohne Lockdatei hat `npm install` neuere Abhängigkeiten genommen | eine `package-lock.json` eines funktionierenden Builds committen |
| der Container ist über den Proxy nicht erreichbar | er hängt nicht in `{{ cookiecutter.ifdd_proxy_network }}`, oder `IFDD_UI_HOST` weicht vom angefragten Host ab | den Router `{{ cookiecutter.ifdd_ui_prj_slug }}@docker` im Dashboard des Proxys prüfen |
{%- if cookiecutter.ifdd_ui_enable_tls == "y" or cookiecutter.ifdd_ui_enable_letsencrypt == "y" %}
| die UI wird ohne das Zertifikat des Proxys ausgeliefert | diese Instanz setzt `tls`-Labels am Router | `ifdd_ui_enable_tls` und `ifdd_ui_enable_letsencrypt` auf `n` setzen ({ref}`ifdd-ui-security`) |
{%- endif %}
