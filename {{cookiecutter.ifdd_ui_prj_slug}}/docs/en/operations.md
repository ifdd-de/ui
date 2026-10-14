(ifdd-ui-operations)=
# Operations

## Start, stop, order

```bash
docker compose -f docker-compose-production.yml up -d
docker compose -f docker-compose-production.yml ps
docker compose -f docker-compose-production.yml down
```

The container needs only the proxy network at start. The application needs
the realm and the backend as soon as someone signs in; start it after them
(`.adm_03_up_services.sh` of the meta repository does).

## Health check

| Image stage | Check | Interval |
|---|---|---|
| production | `wget` on `http://127.0.0.1/healthz` (answers 200, not logged) | 30 s, timeout 5 s, 3 retries, start period 10 s |
| development | `wget` on `http://127.0.0.1:3000/` | 30 s, timeout 10 s, 3 retries, start period 60 s |

The checks are part of the image (`HEALTHCHECK` in `Dockerfile`), not of the
compose files. From outside: `{{ cookiecutter.ifdd_ui_url }}` loads the
application; the dashboard shows the backend version after the login, or
"no backend version" if `/prot_version` fails.

## Logs

```bash
docker compose -f docker-compose-production.yml logs -f ui
```

nginx logs every request except `/healthz`. What goes wrong inside the
application (token renewal, refused calls, CSP violations) shows only in the
console of the browser.

## Caching

| What | Header |
|---|---|
| images (`jpg`, `png`, `svg`, ...) | `expires 7d`, `Cache-Control: public` |
| `css`, `js` | `Cache-Control: no-cache, public, must-revalidate, proxy-revalidate` |
| other paths | nginx defaults; unknown paths answer with `index.html` (single-page application) |

Vocabularies and units are cached in the browser per session and by its HTTP
cache, as the type and unit services allow.

## Resources

The container restarts with `restart: always` and has no memory limit.

## Updates

Every change of the code, of `src/Env.js` or of the private tree needs a new
image (`docker compose -f docker-compose-production.yml build`, then
`up -d`). Template updates arrive with `cruft update`; `.env`, `envs`,
`src/private` and `src/Env.js` are on the skip list.

## Backup

The instance holds no data. Keep `src/Env.js` and `.env` (instance-owned,
off the template) and the private tree in its own repository.
