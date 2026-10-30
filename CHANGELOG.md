# Changelog

The version scheme follows the other IFDD templates: `YY.MM.N`.

## [26.10.3] - 2026-10-30

- Images: `node:26-alpine` (Node 26, the current LTS; was `node:25-alpine`)
  for the Node stages and `nginx:1.30-alpine` (stable; was `nginx:1.29-alpine`)
  for the production stage. CI of the template and of the instance on Node 26
  (was 24); the documentation named Node 24 and nginx 1.27.
- npm ranges raised to the current releases: `@mui/material` and
  `@mui/icons-material` ^9.5.0, `@tanstack/react-query` ^5.105.0, `cytoscape`
  ^3.34.4, `react-admin`, `ra-i18n-polyglot`, `ra-language-english` ^5.15.5,
  `react`, `react-dom` ^19.3.1, `react-router-dom` ^7.18.5; development:
  `@testing-library/dom` ^10.4.2, `@testing-library/user-event` ^14.6.8,
  `@vitejs/plugin-react` ^6.1.2, `jsdom` ^30.1.3, `vite` ^8.3.5, `vitest` ^5.0.5.
- Additional CA certificates for the image build: PEM files in the new
  directory `certs/` (git-ignored except its README, on the recommended skip
  list) are collected by a new stage `base`, on which `deps`, `development`
  and `builder` build, into one bundle, and `NODE_EXTRA_CA_CERTS` points to
  it. Node and npm then trust these CAs in addition to their built-in ones,
  e.g. behind a TLS-intercepting web proxy. Without files nothing changes. The
  build stops on a file with a private key or without a PEM certificate. The
  production image gets neither. Documentation: `setup`, `build-release`,
  `troubleshooting`, `reference`; template check `tests/check_certs.py`.
- `ifdd_ui_version` 26.10.3.
- Documentation check: Sphinx 9.2.0 (`tests/docs/requirements.txt`).
- Upgrade to 26.10.3: `cruft update` brings the `Dockerfile` and
  `certs/README.md`; the build needs the directory `certs/`. Only afterwards add
  `certs` to the skip list in `.cruft.json` by hand; with `certs` on the skip
  list beforehand the directory does not arrive and the build stops with
  `"/certs": not found` (then `mkdir certs`). Rebuild the image.

- Traefik: the router and the service of the UI are named after the project
  slug (`ifdd_ui_prj_slug`) instead of the fixed name `ifdd_ui`, in both
  compose files, so that two UIs behind one proxy do not declare the same
  router. The external proxy network comes from the new shared variable
  `ifdd_proxy_network` (default `proxy-net`) instead of being fixed, in the
  compose network and in `traefik.docker.network`; the pre-generation hook
  checks the name. `tests/check_traefik.py` checks both for every fixture.
- Upgrade: `cruft update`, then recreate the container
  (`docker compose -f docker-compose-production.yml up -d`). Own Traefik
  configuration that refers to `ifdd_ui@docker` must use `<slug>@docker`.
  Instances with another proxy network set it with
  `cruft update --variables-to-update '{"ifdd_proxy_network": "<name>"}'`.

## [26.10.2] - 2026-10-14

- Documentation of the instance in `docs/en` and `docs/de` (Sphinx sources,
  MyST Markdown): index, setup, build and release, operations, security,
  troubleshooting, reference. The instance README is now an entry point with
  a quick start, the links, honesty notes and the license; its former
  sections moved into the documentation.
- `docs` in `.dockerignore`, `docs/_build/` in `.gitignore` of the instance.
- Template CI: `tests/check_docs.py` checks that both languages match and
  build without warnings (`tests/docs/conf.py`, `tests/docs/requirements.txt`).
- This changelog.
