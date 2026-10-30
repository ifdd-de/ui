# Additional CA certificates for the image build

Place the PEM files of CAs that Node and npm must trust while the image is
built here (`*.crt` or `*.pem`; one or more certificates per file), typically
the CA of a TLS-intercepting web proxy between the build and the npm
registry. Without them `npm install` stops with an error such as
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, `SELF_SIGNED_CERT_IN_CHAIN` or
`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`.

The Node stages of `Dockerfile` (`deps`, `development`, `builder`) collect the
files into one bundle and set `NODE_EXTRA_CA_CERTS` to it, so the
certificates are trusted in addition to the CAs built into Node. Without
files the bundle stays empty and nothing changes. The production image
(nginx) gets neither the certificates nor the variable.

- Only PEM is accepted. Convert a DER file (`.cer`, `.der`) first:
  `openssl x509 -inform der -in proxy-ca.cer -out proxy-ca.crt`.
- The build stops on a file that holds a private key or no PEM certificate.
  Never put private keys here: the directory is part of the build context,
  and the certificates end up in the layers of the Node stages.
- The files are git-ignored and this directory is on the cruft skip list.
  Rebuild the image after a change.
