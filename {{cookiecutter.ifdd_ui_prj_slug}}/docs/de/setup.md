(ifdd-ui-setup)=
# Einrichtung

## Voraussetzungen

| Was | Warum |
|---|---|
| Docker mit Compose; Node.js 26 für Arbeit außerhalb des Containers | das Image entsteht aus `Dockerfile` (Node 26 zum Bauen, nginx zum Ausliefern) |
| das externe Netz `{{ cookiecutter.ifdd_proxy_network }}` und eine laufende Proxy-Instanz | Traefik routet `{{ cookiecutter.ifdd_ui_host }}` zum Container |
| im Realm der public Client `{{ cookiecutter.ifdd_oidc_client_id }}` mit den Redirect-URIs `{{ cookiecutter.ifdd_ui_url }}/authentication/callback` und `{{ cookiecutter.ifdd_ui_url }}/authentication/silent-callback` | Anmeldung und stille Token-Erneuerung; das Keycloak-Template legt sie an |
| das Backend erlaubt den Ursprung `{{ cookiecutter.ifdd_ui_url }}` (CORS) | der Browser ruft das Backend ursprungsübergreifend auf |
| `csp-ui` des Proxys erlaubt Realm, Backend und die Dienste type und unit in `connect-src` sowie den Auth-Endpunkt des Realms in `frame-src` | sonst verweigert der Browser diese Aufrufe |

## Instanz anlegen

Üblicherweise legt das Meta-Repository alle Instanzen in einem Zug an
(`.adm_meta_01_all.sh`, Schritt `.adm_01_create_services.sh`), mit der
gemeinsamen Variablendatei `.cookiecutter_all.yaml`. Von Hand, im
Verzeichnis der Instanzen, mit der Skip-Liste, die dieses Template empfiehlt:

```bash
cruft create --no-input --config-file .cookiecutter_all.yaml \
  --skip .env --skip envs --skip certs --skip src/private --skip src/Env.js \
  https://github.com/ifdd-de/ui
```

Die Skip-Liste hält die Pfade der Instanz aus jedem späteren `cruft update`
heraus. Das Meta-Repository übergibt `--skip envs --skip .env --skip certs`.

## Konfiguration

`src/Env.js` ist die einzige Quelle der Konfiguration; cookiecutter rendert
sie aus den Variablen des Templates, die mit ihren Werten und ihrer Bedeutung
in {ref}`ifdd-instances-ui` stehen. Die Anwendung liest keine
Umgebungsvariablen zur Build-Zeit. Ihre Exporte stehen in
{ref}`ifdd-ui-reference`.

`.env` (vom Post-Generation-Hook aus `dotenv.dist` geschrieben) enthält nur,
was docker compose braucht: `IFDD_UI_HOST` und `IFDD_UI_VERSION`.

`src/Env.js` wird ins Image gebaut: nach einer Änderung neu bauen. Steht
`src/Env.js` auf der Skip-Liste, ändert `cruft update --variables-to-update`
sie nicht; dann von Hand bearbeiten.

Die Aspekte dieser Instanz stehen in `ifddAspects` in `src/Env.js`; ein
Aspekt muss zusätzlich in `src/ifdd/registry.jsx` vorhanden sein.

(ifdd-ui-setup-certs)=
## Zusätzliche CA-Zertifikate für den Build

Erreicht der Build die npm-Registry über einen Web-Proxy, der TLS aufbricht,
bricht `npm install` mit einem Fehler wie `UNABLE_TO_VERIFY_LEAF_SIGNATURE`,
`SELF_SIGNED_CERT_IN_CHAIN` oder `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` ab. Die CA-Zertifikate dieses Proxys als
PEM-Dateien (`*.crt` oder `*.pem`) nach `certs/` legen und neu bauen:

```bash
cp /pfad/zu/proxy-ca.crt certs/
docker compose -f docker-compose-production.yml build
```

Die Node-Stufen fassen die Dateien zu einem Bündel zusammen und setzen
`NODE_EXTRA_CA_CERTS` darauf: Node und npm vertrauen diesen CAs zusätzlich
zu den eingebauten. Ohne Dateien ändert sich nichts. Der Build bricht bei
einer Datei mit privatem Schlüssel oder ohne PEM-Zertifikat ab; DER-Dateien
vorher umwandeln (`certs/README.md`). Das Produktions-Image bekommt weder
die Zertifikate noch die Variable. `certs/` ist bis auf die README von Git
ausgenommen und steht auf der Skip-Liste.

Für `npm install` außerhalb des Containers die Variable in der Shell setzen:
`NODE_EXTRA_CA_CERTS=/pfad/zu/proxy-ca.crt npm install`.

```{note}
Nicht getestet: das veröffentlichte Image `node:26-alpine`; geprüft wurde
der Build mit einem Ersatz-Image (Node 26 auf Ubuntu) und einem
aufbrechenden Test-Proxy.
```

## Der private Baum

Instanzeigene Reiter und Übersetzungen liegen außerhalb dieses Repositorys.
Sie unter `src/private` einbinden, als Git-Submodul, Symlink oder
Container-Volume; sie werden automatisch gefunden:

| Pfad | Zweck |
|---|---|
| `tab_<aspect>_<name>.jsx` in beliebiger Tiefe | ein zusätzlicher Reiter für diesen Aspekt; mit `export const context = '<context name>'` ersetzt er den generischen Reiter dieses Kontexts |
| `i18n/<locale>.js` | Übersetzungen über den eingebauten Texten |

Keine Datei des Templates importiert sie namentlich, daher entfernt ein
`cruft update` sie nie. `src/private` ist hier von der Versionsverwaltung
ausgenommen; `src/private/README.md` erklärt, wie man einen Reiter schreibt.

## Erster Start

```bash
docker compose -f docker-compose-production.yml build
docker compose -f docker-compose-production.yml up -d
```

Dann `{{ cookiecutter.ifdd_ui_url }}` öffnen; das Dashboard zeigt nach der
Anmeldung die Version des Backends.

## Lokale Entwicklung

Ohne Docker:

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run build
```

Mit Docker startet `docker-compose-development.yml` den Vite-Dev-Server auf
Port 3000 hinter dem Proxy, mit eingebundenem `src/` und `index.html`;
Änderungen wirken ohne neuen Build:

```bash
docker compose -f docker-compose-development.yml up --build
```

Eine Anmeldung braucht Redirect-URIs des Realms, die zum Ursprung im Browser
passen; `http://localhost:3000` gehört nicht dazu.
