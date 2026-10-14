(ifdd-ui-operations)=
# Betrieb

## Starten, Stoppen, Reihenfolge

```bash
docker compose -f docker-compose-production.yml up -d
docker compose -f docker-compose-production.yml ps
docker compose -f docker-compose-production.yml down
```

Der Container braucht beim Start nur das Proxy-Netz. Die Anwendung braucht
Realm und Backend, sobald sich jemand anmeldet; sie also nach diesen starten
(`.adm_03_up_services.sh` des Meta-Repositorys tut das).

## Healthchecks

| Image-Stufe | Prüfung | Intervall |
|---|---|---|
| production | `wget` auf `http://127.0.0.1/healthz` (antwortet 200, wird nicht protokolliert) | 30 s, Timeout 5 s, 3 Versuche, Startphase 10 s |
| development | `wget` auf `http://127.0.0.1:3000/` | 30 s, Timeout 10 s, 3 Versuche, Startphase 60 s |

Die Prüfungen gehören zum Image (`HEALTHCHECK` im `Dockerfile`), nicht zu
den Compose-Dateien. Von außen: `{{ cookiecutter.ifdd_ui_url }}` lädt die
Anwendung; das Dashboard zeigt nach der Anmeldung die Backend-Version oder
„no backend version“, wenn `/prot_version` scheitert.

## Logs

```bash
docker compose -f docker-compose-production.yml logs -f ui
```

nginx protokolliert jede Anfrage außer `/healthz`. Was in der Anwendung
schiefgeht (Token-Erneuerung, abgewiesene Aufrufe, CSP-Verstöße), zeigt nur
die Konsole des Browsers.

## Caching

| Was | Header |
|---|---|
| Bilder (`jpg`, `png`, `svg`, ...) | `expires 7d`, `Cache-Control: public` |
| `css`, `js` | `Cache-Control: no-cache, public, must-revalidate, proxy-revalidate` |
| übrige Pfade | Vorgaben von nginx; unbekannte Pfade antworten mit `index.html` (Single-Page-Anwendung) |

Vokabulare und Einheiten speichert der Browser je Sitzung und in seinem
HTTP-Cache, so wie die Dienste type und unit es erlauben.

## Ressourcen

Der Container startet mit `restart: always` neu und hat keine
Speichergrenze.

## Aktualisieren

Jede Änderung am Code, an `src/Env.js` oder am privaten Baum braucht ein
neues Image (`docker compose -f docker-compose-production.yml build`, dann
`up -d`). Template-Updates kommen mit `cruft update`; `.env`, `envs`,
`src/private` und `src/Env.js` stehen auf der Skip-Liste.

## Sicherung

Die Instanz hält keine Daten. `src/Env.js` und `.env` (instanzeigen, nicht
aus dem Template) aufbewahren, den privaten Baum in seinem eigenen
Repository.
