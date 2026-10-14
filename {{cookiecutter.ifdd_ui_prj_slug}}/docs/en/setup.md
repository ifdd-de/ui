(ifdd-ui-setup)=
# Setup

## Prerequisites

| What | Why |
|---|---|
| Docker with Compose; Node.js 24 for work outside the container | the image is built from `Dockerfile` (Node 24 to build, nginx to serve) |
| the external network `proxy-net` and a running proxy instance | Traefik routes `{{ cookiecutter.ifdd_ui_host }}` to the container; the compose files name `proxy-net` literally |
| in the realm, the public client `{{ cookiecutter.ifdd_oidc_client_id }}` with the redirect URIs `{{ cookiecutter.ifdd_ui_url }}/authentication/callback` and `{{ cookiecutter.ifdd_ui_url }}/authentication/silent-callback` | login and silent token renewal; the keycloak template creates them |
| the backend allows the origin `{{ cookiecutter.ifdd_ui_url }}` (CORS) | the browser calls the backend cross-origin |
| `csp-ui` of the proxy allows the realm, the backend and the type and unit services in `connect-src`, and the realm's auth endpoint in `frame-src` | otherwise the browser refuses those calls |

## Create the instance

Usually the meta repository creates every instance in one go
(`.adm_meta_01_all.sh`, step `.adm_01_create_services.sh`) with the shared
variable file `.cookiecutter_all.yaml`. By hand, from the directory that
holds the instances, with the skip list this template recommends:

```bash
cruft create --no-input --config-file .cookiecutter_all.yaml \
  --skip .env --skip envs --skip src/private --skip src/Env.js \
  https://github.com/ifdd-de/ui
```

The skip list keeps the paths that belong to the instance out of every later
`cruft update`. The meta repository passes `--skip envs --skip .env`.

## Configuration

`src/Env.js` is the single source of configuration; cookiecutter renders it
from the variables of the template, which are listed with their values and
meaning in {ref}`ifdd-instances-ui`. The application reads no build-time
environment variables. Its exports are listed in {ref}`ifdd-ui-reference`.

`.env` (written from `dotenv.dist` by the post-generation hook) carries only
what docker compose needs: `IFDD_UI_HOST` and `IFDD_UI_VERSION`.

`src/Env.js` is built into the image: after a change, rebuild. With
`src/Env.js` on the skip list, `cruft update --variables-to-update` does not
change it; edit it by hand.

The aspects of this instance are `ifddAspects` in `src/Env.js`; an aspect
must also exist in `src/ifdd/registry.jsx` to be usable.

## The private tree

Instance-specific tabs and translations live outside this repository. Mount
them at `src/private`, as a git submodule, a symlink or a container volume;
they are discovered automatically:

| Path | Purpose |
|---|---|
| `tab_<aspect>_<name>.jsx` at any depth | an extra show tab for that aspect; with `export const context = '<context name>'` it replaces the generic tab of that context |
| `i18n/<locale>.js` | translations merged over the built-in messages |

No file of the template imports them by name, so a `cruft update` never
removes them. `src/private` is excluded from version control here;
`src/private/README.md` explains how to write a tab.

## First start

```bash
docker compose -f docker-compose-production.yml build
docker compose -f docker-compose-production.yml up -d
```

Then open `{{ cookiecutter.ifdd_ui_url }}`; the dashboard shows the version
of the backend after the login.

## Local development

Without Docker:

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run build
```

With Docker, `docker-compose-development.yml` runs the Vite dev server on
port 3000 behind the proxy, with `src/` and `index.html` mounted, so changes
are picked up without a rebuild:

```bash
docker compose -f docker-compose-development.yml up --build
```

A login needs the redirect URIs of the realm to match the origin in the
browser; `http://localhost:3000` is not among them.
