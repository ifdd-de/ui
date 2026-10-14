(ifdd-ui-build-release)=
# Build and release

## Image

`Dockerfile` has four stages:

| Stage | Base | Does |
|---|---|---|
| `deps` | `node:24-alpine` | `npm install` |
| `development` | `node:24-alpine` | the Vite dev server on port 3000 (`docker-compose-development.yml`) |
| `builder` | `node:24-alpine` | `npm run build` into `build/` |
| `production` | `nginx:1.27-alpine` | serves `build/` with `nginx.conf` on port 80 |

```bash
docker compose -f docker-compose-production.yml build
```

The production image is tagged
`{{ cookiecutter.ifdd_registry_url }}/{{ cookiecutter.ifdd_ui_prj_slug }}:{{ cookiecutter.ifdd_ui_version }}`.
`src/Env.js` and the private tree in `src/private` are built into it, so
every change of either needs a new image.

## Dependencies

`package.json` names version ranges (`^`); the template ships no lockfile,
because the project name in `package.json` is templated. Every `npm install`
without a lockfile, and so every image build, takes the newest versions
within those ranges. Commit a `package-lock.json` in the instance if builds
must be repeatable.

## Versions

| Value | Here | Source |
|---|---|---|
| version of the instance | `{{ cookiecutter.ifdd_ui_version }}` | template variable `ifdd_ui_version`; `package.json`, image tag, `ifddVersion` in `src/Env.js` |

The scheme is `YY.MM.N`. The version comes from the template, not from
`.cookiecutter_all.yaml`, so a new template version brings it with
`cruft update`; `src/Env.js` is on the skip list and keeps its value until
edited.

## Tests

```bash
npm test           # Vitest, jsdom
npm run build
```

## CI of the instance

`.github/workflows/ci.yml` runs on every push and pull request:

- **test and build**: `npm install`, `npm test`, `npm run build` on Node 24;
- **template drift**: `cruft check` and `cruft diff`, informational.

Both check out submodules, so a private tree mounted as a submodule is
included; without it the build still succeeds and the private tabs are
absent.

## Release

`.github/workflows/release.yml` builds the production image and pushes it to
`ghcr.io/<owner>/<repository>` when a tag `v*` is pushed. It uses the
`GITHUB_TOKEN` of the run. The local image name above
(`{{ cookiecutter.ifdd_registry_url }}/...`) is independent of it.

```{note}
Not tested: the release workflow on GitHub and the image build itself; the
template tests install, test and build the application without Docker.
```
