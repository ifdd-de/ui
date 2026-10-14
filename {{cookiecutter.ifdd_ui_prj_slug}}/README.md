# {{cookiecutter.ifdd_ui_prj_name}}

The web frontend of an IFDD node (react-admin), generated from the
`ifdd-de/ui` template. It signs people in at the realm, shows the documents
of the backend and explains their values with the vocabularies of the type
and unit services. Its configuration is `src/Env.js`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm test
docker compose -f docker-compose-production.yml up -d --build
```

Instance-specific tabs and translations are mounted at `src/private` (see
`src/private/README.md`).

## Documentation

Setup, build and release, operations, security, troubleshooting and
reference of this instance:

- English: [docs/en/index.md](docs/en/index.md)
- Deutsch: [docs/de/index.md](docs/de/index.md)

The pages are Sphinx sources in MyST Markdown, meant to be copied into a
documentation project that covers all services; GitHub shows them as plain
Markdown.

## Honesty notes

The template tests install, test (Vitest) and build this application for
three configurations; the README of the template `ifdd-de/ui` lists what was
checked in a browser and what was not. Not checked: the image build, the
release workflow, and the UI against a running backend, type and unit
service behind the proxy (CSP, CORS, login).

## License

BSD-3-Clause, see `LICENSE`.
