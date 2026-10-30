# syntax=docker/dockerfile:1

# Base of all Node stages. Additional CA certificates from certs/ (PEM files
# *.crt or *.pem), e.g. of a TLS-intercepting web proxy between the build and
# the npm registry, are collected into one bundle. Node, and with it npm,
# trusts the bundle in addition to its built-in CAs (NODE_EXTRA_CA_CERTS).
# Without such files the bundle stays empty and nothing changes. The build
# stops on a file that holds a private key or no PEM certificate.
FROM node:26-alpine AS base
COPY certs/ /tmp/ifdd-certs/
RUN set -eu; \
    bundle=/usr/local/share/ifdd/extra-ca.pem; \
    mkdir -p "${bundle%/*}"; \
    : > "$bundle"; \
    for f in /tmp/ifdd-certs/*.crt /tmp/ifdd-certs/*.pem; do \
        [ -f "$f" ] || continue; \
        if grep -q 'PRIVATE KEY' "$f"; then \
            echo "certs/${f##*/}: contains a private key; only CA certificates belong in certs/" >&2; \
            exit 1; \
        fi; \
        if ! grep -q -e '-----BEGIN CERTIFICATE-----' "$f"; then \
            echo "certs/${f##*/}: no PEM certificate (DER? see certs/README.md)" >&2; \
            exit 1; \
        fi; \
        cat "$f" >> "$bundle"; \
        echo >> "$bundle"; \
    done; \
    rm -rf /tmp/ifdd-certs
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ifdd/extra-ca.pem

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
# The dev server has no /healthz; nginx provides that in the production stage.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1
CMD ["npm", "run", "start"]

FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# The production stage serves static files and makes no outgoing calls; it
# gets neither the certificates nor NODE_EXTRA_CA_CERTS.
FROM nginx:1.30-alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# BusyBox wget is present in the alpine image; curl is not.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
