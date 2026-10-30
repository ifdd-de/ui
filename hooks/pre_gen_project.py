import re
import sys

PROJECT_SLUG_REGEX = r"^[_a-zA-Z][_a-zA-Z0-9-]+$"

project_slug = "{{ cookiecutter.ifdd_ui_prj_slug }}"

if not re.match(PROJECT_SLUG_REGEX, project_slug):
    print(f"ERROR: {project_slug} is not a valid project slug!")
    sys.exit(1)

# The external network shared with the proxy; it names the network in the
# compose files and in the Traefik label traefik.docker.network.
NETWORK_REGEX = r"^[A-Za-z0-9][A-Za-z0-9_.-]*$"
proxy_network = "{{ cookiecutter.ifdd_proxy_network }}"

if not re.match(NETWORK_REGEX, proxy_network):
    print(f"ERROR: ifdd_proxy_network {proxy_network!r} is not a Docker network name!")
    sys.exit(1)
