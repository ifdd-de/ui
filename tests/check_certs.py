#!/usr/bin/env python3
"""Check the optional CA certificates of the image build in a rendered instance.

Usage: check_certs.py INSTANCE

Static checks of the Dockerfile:

- a stage ``base`` copies ``certs/`` and sets ``NODE_EXTRA_CA_CERTS``;
- every other Node stage starts ``FROM base``; the production stage (nginx)
  does not, and neither copies ``certs/`` nor sets the variable;
- ``certs/README.md`` exists and ``.gitignore`` ignores the rest of ``certs/``.

Behaviour of the bundle script: the ``RUN`` instruction that follows
``COPY certs/`` is run with ``sh`` against temporary directories:

- without files the bundle is empty;
- PEM files (``*.crt``, ``*.pem``) end up in the bundle, other files do not;
- a file with a private key or without a PEM certificate stops the script.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

CERT = ("-----BEGIN CERTIFICATE-----\nMIIBszCCAVmgAwIBAgIUTEST\n"
        "-----END CERTIFICATE-----\n")
KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANTEST\n-----END PRIVATE KEY-----\n"
SRC = "/tmp/ifdd-certs"
BUNDLE_DIR = "/usr/local/share/ifdd"


def instructions(dockerfile: str) -> list[tuple[str, str]]:
    """(keyword, argument) per instruction, continuation lines joined."""
    joined = re.sub(r"\\\n", " ", dockerfile)
    result = []
    for line in joined.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        keyword, _, argument = line.partition(" ")
        result.append((keyword.upper(), argument.strip()))
    return result


def stages(items: list[tuple[str, str]]) -> dict[str, dict]:
    result: dict[str, dict] = {}
    current = None
    for keyword, argument in items:
        if keyword == "FROM":
            match = re.fullmatch(r"(\S+)\s+AS\s+(\S+)", argument, re.IGNORECASE)
            if not match:
                raise SystemExit(f"FROM without a stage name: {argument}")
            current = {"from": match.group(1), "items": []}
            result[match.group(2)] = current
        elif current is not None:
            current["items"].append((keyword, argument))
    return result


def bundle_script(base: dict) -> str:
    items = base["items"]
    for index, (keyword, argument) in enumerate(items):
        if keyword == "COPY" and argument.split()[0] == "certs/":
            following = items[index + 1]
            if following[0] != "RUN":
                raise SystemExit("COPY certs/ is not followed by RUN")
            return following[1]
    raise SystemExit("stage base does not copy certs/")


def run_script(script: str, files: dict[str, str]) -> tuple[int, str, str]:
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp, "certs")
        src.mkdir()
        for name, content in files.items():
            Path(src, name).write_text(content)
        bundle_dir = Path(tmp, "bundle")
        script = script.replace(SRC, str(src)).replace(BUNDLE_DIR, str(bundle_dir))
        proc = subprocess.run(["sh", "-c", script], capture_output=True, text=True)
        bundle = bundle_dir / "extra-ca.pem"
        content = bundle.read_text() if bundle.is_file() else ""
        return proc.returncode, content, proc.stderr


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    instance = Path(sys.argv[1])
    errors: list[str] = []

    found = stages(instructions((instance / "Dockerfile").read_text()))
    base = found.get("base")
    if base is None:
        raise SystemExit("FAIL: no stage base")
    if not base["from"].startswith("node:"):
        errors.append(f"stage base starts from {base['from']}, not node")
    if ("ENV", "NODE_EXTRA_CA_CERTS=/usr/local/share/ifdd/extra-ca.pem") not in base["items"]:
        errors.append("stage base does not set NODE_EXTRA_CA_CERTS to the bundle")
    for name, stage in found.items():
        if name == "base":
            continue
        uses_certs = any(k == "COPY" and a.split()[0] == "certs/" for k, a in stage["items"]) or any(
            k == "ENV" and "NODE_EXTRA_CA_CERTS" in a for k, a in stage["items"])
        if stage["from"].startswith("nginx"):
            if uses_certs:
                errors.append(f"stage {name} (nginx) handles the certificates")
        elif stage["from"] != "base":
            errors.append(f"Node stage {name} starts from {stage['from']}, not base")
    if not (instance / "certs" / "README.md").is_file():
        errors.append("certs/README.md is missing")
    gitignore = (instance / ".gitignore").read_text().splitlines()
    if "certs/*" not in gitignore or "!certs/README.md" not in gitignore:
        errors.append(".gitignore does not ignore certs/ except its README")

    script = bundle_script(base)
    cases = [
        ("no files", {"README.md": "# readme\n"}, 0, ""),
        ("PEM files", {"a.crt": CERT, "b.pem": CERT.rstrip("\n"), "c.txt": "ignored\n"}, 0,
         CERT + "\n" + CERT),
        ("private key", {"a.crt": CERT + KEY}, 1, None),
        ("DER or other content", {"a.crt": "\x30\x82binary\n"}, 1, None),
    ]
    for label, files, code, expected in cases:
        returncode, content, stderr = run_script(script, files)
        if (returncode == 0) != (code == 0):
            errors.append(f"bundle script, {label}: exit {returncode}, expected "
                          f"{'success' if code == 0 else 'failure'} ({stderr.strip()})")
        elif expected is not None and content != expected:
            errors.append(f"bundle script, {label}: unexpected bundle {content!r}")
        elif code and "certs/a.crt" not in stderr:
            errors.append(f"bundle script, {label}: message does not name the file ({stderr.strip()})")

    for error in errors:
        print(f"FAIL: {error}", file=sys.stderr)
    if not errors:
        print("certificates of the image build: ok")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
