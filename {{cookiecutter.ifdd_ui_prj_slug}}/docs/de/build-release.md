(ifdd-ui-build-release)=
# Bauen und Freigeben

## Image

`Dockerfile` hat fünf Stufen:

| Stufe | Basis | Tut |
|---|---|---|
| `base` | `node:26-alpine` | zusätzliche CA-Zertifikate aus `certs/` ({ref}`ifdd-ui-setup-certs`) |
| `deps` | `base` | `npm install` |
| `development` | `base` | der Vite-Dev-Server auf Port 3000 (`docker-compose-development.yml`) |
| `builder` | `base` | `npm run build` nach `build/` |
| `production` | `nginx:1.30-alpine` | liefert `build/` mit `nginx.conf` auf Port 80 aus |

```bash
docker compose -f docker-compose-production.yml build
```

Das Produktions-Image heißt
`{{ cookiecutter.ifdd_registry_url }}/{{ cookiecutter.ifdd_ui_prj_slug }}:{{ cookiecutter.ifdd_ui_version }}`.
`src/Env.js` und der private Baum in `src/private` werden hineingebaut; jede
Änderung an einem von beiden braucht ein neues Image.

## Abhängigkeiten

`package.json` nennt Versionsbereiche (`^`); das Template liefert keine
Lockdatei, weil der Projektname in `package.json` gerendert wird. Jedes
`npm install` ohne Lockdatei, also jeder Image-Build, nimmt die neuesten
Versionen innerhalb dieser Bereiche. In der Instanz eine
`package-lock.json` committen, wenn Builds wiederholbar sein müssen.

## Versionen

| Wert | Hier | Quelle |
|---|---|---|
| Version der Instanz | `{{ cookiecutter.ifdd_ui_version }}` | Template-Variable `ifdd_ui_version`; `package.json`, Image-Tag, `ifddVersion` in `src/Env.js` |

Das Schema ist `YY.MM.N`. Die Version kommt aus dem Template, nicht aus
`.cookiecutter_all.yaml`; eine neue Template-Version bringt sie also mit
`cruft update`; `src/Env.js` steht auf der Skip-Liste und behält seinen Wert,
bis man ihn ändert.

## Tests

```bash
npm test           # Vitest, jsdom
npm run build
```

## CI der Instanz

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request:

- **Test und Build**: `npm install`, `npm test`, `npm run build` mit Node 26;
- **Template drift**: `cruft check` und `cruft diff`, nur informativ.

Beide checken Submodule mit aus; ein als Submodul eingebundener privater
Baum ist also dabei; ohne ihn gelingt der Build trotzdem, nur fehlen die
privaten Reiter.

## Freigabe

`.github/workflows/release.yml` baut das Produktions-Image und schiebt es nach
`ghcr.io/<owner>/<repository>`, wenn ein Tag `v*` gepusht wird. Es nutzt das
`GITHUB_TOKEN` des Laufs. Der lokale Image-Name oben
(`{{ cookiecutter.ifdd_registry_url }}/...`) ist davon unabhängig.

```{note}
Nicht getestet: der Release-Workflow auf GitHub und der Image-Build selbst;
die Template-Tests installieren, testen und bauen die Anwendung ohne Docker.
```
