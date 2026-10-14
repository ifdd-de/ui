(ifdd-ui-index)=
# {{ cookiecutter.ifdd_ui_prj_name }} (ui)

Das Web-Frontend eines IFDD-Knotens: eine react-admin-Anwendung, die
Menschen am Realm anmeldet, die Dokumente des Backends auflistet und zeigt
und ihre Werte mit den Vokabularen der Dienste type und unit erklärt. Dieses
Kapitel beschreibt die Instanz `{{ cookiecutter.ifdd_ui_prj_slug }}`, erzeugt
aus dem Template `ifdd-de/ui`, aus Sicht derer, die sie einrichten, bauen,
betreiben und absichern.

| | |
|---|---|
| Öffentliche URL | `{{ cookiecutter.ifdd_ui_url }}` (Host `{{ cookiecutter.ifdd_ui_host }}`, vom Proxy geroutet) |
| Version | `{{ cookiecutter.ifdd_ui_version }}` |
| Backend | `{{ cookiecutter.ifdd_be_url }}` |
| Vokabulare, Einheiten | `{{ cookiecutter.ifdd_type_url }}`, `{{ cookiecutter.ifdd_unit_url }}` |
| Realm, Client | `{{ cookiecutter.ifdd_oidc_realm }}`, `{{ cookiecutter.ifdd_oidc_client_id }}` |
| Aspekte | `{{ cookiecutter.ifdd_ui_aspects }}` |
| Graph-Reiter | {{ "an" if cookiecutter.ifdd_ui_show_explorer == "y" else "aus" }} |

## Was die Instanz enthält

Die Anwendung (`src/`, gebaut mit Vite), ihre einzige Konfigurationsdatei
`src/Env.js`, ein `Dockerfile`, das die gebauten Dateien mit nginx
ausliefert, zwei Compose-Dateien und die Tests (Vitest). Es gibt kein
eigenes Kernpaket: Der Anwendungscode liegt in diesem Repository.
Instanzeigene Reiter und Übersetzungen kommen aus einem privaten Baum unter
`src/private` ({ref}`ifdd-ui-setup`).

## Wie Datensätze angezeigt werden

Ein Dokument des Backends trägt ein Präfix je JSON-LD-Kontext. Die
Detailansicht hat einen generischen Reiter je Kontext: zuerst den
Aspekt-Kontext, dann die Domain-Kontexte, die der Benutzer lesen darf (die
übrigen lässt das Backend weg), dann den Graph-Reiter (wenn an) und den
Basis-Reiter. Beschriftung, Hilfetext, Reihenfolge und bei Verweisen der zu
öffnende Reiter kommen aus dem Vokabular des Namensraums des Kontexts im
Dienst type; Einheiten kommen aus dem Dienst unit. Hat das Vokabular keine
Beschriftung, gilt die Übersetzung (`ifdd.field.<term>`, Reitertitel
`ifdd.aspect.<name>` oder `ifdd.context.<name>`), dann der bloße Name. Eine
Beschriftung ändert man im Vokabular, nicht in diesem Repository.

Ein Datensatz öffnet im Reiter seines Aspekts (`/<resource>/<id>/show/<aspect>`).
Eine URL mit einem Reiter, den der Datensatz nicht hat, oder mit einem
Domain-Kontext, den der Benutzer nicht lesen darf, öffnet den Aspekt-Reiter
mit einem Hinweis. Jedes Vokabular- und Einheitendokument wird einmal je
Sitzung geholt; der HTTP-Cache des Browsers hält es über Neuladen hinweg.

## Architektur

```{mermaid}
flowchart LR
  Browser -->|"{{ cookiecutter.ifdd_ui_host }}"| Proxy[proxy: Traefik]
  Proxy --> UI[ui: nginx mit der gebauten App]
  Browser -->|Token, Userinfo| KC[Keycloak]
  Browser -->|Dokumente, /prot_version| BE[be]
  Browser -->|Vokabulare| Type[type]
  Browser -->|Einheiten| Unit[unit]
```

Der Container liefert nur statische Dateien aus. Jeder Aufruf von Backend,
Realm und den Diensten type und unit kommt aus dem Browser,
ursprungsübergreifend und über den Proxy; die CSP des Proxys (`csp-ui`) und
die CORS-Einstellungen dieser Dienste müssen ihn erlauben.

| Der Browser ruft auf | Für |
|---|---|
| Keycloak (`{{ cookiecutter.ifdd_oidc_realm }}`) | Anmeldung, Token-Erneuerung, Userinfo, Abmeldung |
| be (`{{ cookiecutter.ifdd_be_url }}`) | Listen und Dokumente; die Version auf dem Dashboard (`/prot_version`) |
| type (`{{ cookiecutter.ifdd_type_url }}`) | Beschriftungen, Hilfetexte, Reihenfolge |
| unit (`{{ cookiecutter.ifdd_unit_url }}`) | Einheiten und ihre Symbole |

## Kapitel

```{toctree}
:maxdepth: 2

setup
build-release
operations
security
troubleshooting
reference
```

Die Werte der Variablen dieser Instanz und ihre Beziehungen zu den anderen
Diensten stehen im Kapitel über die Dienst-Instanzen
({ref}`ifdd-instances-ui`).
