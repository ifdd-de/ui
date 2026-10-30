# Changelog

The version scheme follows the other IFDD templates: `YY.MM.N`.

## [Unreleased]

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
