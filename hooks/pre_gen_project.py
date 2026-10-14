import re
import sys

PROJECT_SLUG_REGEX = r"^[_a-zA-Z][_a-zA-Z0-9-]+$"

project_slug = "{{ cookiecutter.ifdd_ui_prj_slug }}"

if not re.match(PROJECT_SLUG_REGEX, project_slug):
    print(f"ERROR: {project_slug} is not a valid project slug!")
    sys.exit(1)
