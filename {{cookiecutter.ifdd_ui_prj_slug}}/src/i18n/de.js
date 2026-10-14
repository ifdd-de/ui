import germanMessages from 'ra-language-german';

const aspectFields = {
    name: 'Name',
    created: 'Erstellt',
    modified: 'Geändert',
    type: {one: 'Typ', other: 'Typen'},
    scope: {one: 'Bereich', other: 'Bereiche'},
    fulltext: 'Volltext (langsam)',
};

const selectEmpty = {type: 'Typ auswählen', scope: 'Bereich auswählen'};

const aspect = (name, description) => ({
    name,
    description,
    fields: aspectFields,
    selectEmpty,
});

export default {
    ...germanMessages,
    navigation: {label: 'Aspekte'},
    ifdd: {
        aspect: {
            product: 'Produkt',
            function: 'Funktion',
            location: 'Ort',
            organisation: 'Organisation',
            project: 'Projekt',
        },
        field: {
            name: 'Name',
            description: 'Beschreibung',
            longDescription: 'Ausführliche Beschreibung',
            properties: 'Eigenschaften',
            tags: 'Schlagworte',
            hasPart: 'Besteht aus',
            isPartOf: 'Teil von',
            containedIn: 'Enthalten in',
            containsProduct: 'Enthält Produkt',
            providesFunction: 'Stellt Funktion bereit',
            implementedBy: 'Umgesetzt durch',
            usedBy: 'Genutzt von',
            responsibleOrganisation: 'Verantwortliche Organisation',
            roleClientOf: 'Kunde von',
            roleDeliversTo: 'Liefert an',
            functionalResponsibility: 'Funktionale Verantwortung',
            productResponsibility: 'Produktverantwortung',
            vendor: 'Lieferant',
            manufacturer: 'Hersteller',
            serialNumber: 'Seriennummer',
            uid: 'UID',
            // Terms of every context (fallback when the vocabulary is missing)
            objName: 'Name',
            objType: 'Typ',
            objScope: 'Bereich',
            origin: 'Herkunft',
            publisher: 'Herausgeber',
            c_created: 'Angelegt (Quelle)',
            c_modified: 'Geändert (Quelle)',
            c_cacheCreated: 'Erstmals gespeichert',
            c_cacheUpdated: 'Zuletzt bestätigt',
            c_validNotBefore: 'Gültig ab',
            c_validNotAfter: 'Gültig bis',
        },
        ui: {
            showAllProperties: 'Alle Eigenschaften anzeigen',
            hideAllProperties: 'Eigenschaften ausblenden',
            rawApiData: 'Rohdaten der API',
            tabNotFound: 'Tab „%{tab}“: für dieses Objekt nicht vorhanden oder nicht sichtbar.',
        },
    },
    resources: {
        base: {
            name: 'Basis',
            fields: {
                aspect: 'Aspekt',
                name: 'Name',
                description: 'Beschreibung',
                c_created: 'Erstellt (Quelle)',
                c_modified: 'Geändert (Quelle)',
                c_validNotBefore: 'Gültig ab',
                c_validNotAfter: 'Gültig bis',
                c_cacheUpdated: 'Zuletzt bestätigt',
                origin: 'Ursprung der Daten',
                scope: {one: 'Bereich', other: 'Bereiche'},
                type: {one: 'Typ', other: 'Typen'},
            },
        },
        products: aspect('Produkte', 'Alle Produkte, Komponenten, Instanzen, Geräte und Systeme.'),
        functions: aspect('Funktionen', 'Kundenanforderungen, funktionale Anforderungen und produktunabhängige Funktionen.'),
        locations: aspect('Orte', 'Standortkoordinaten, Gebäudeabhängigkeiten und räumliche Anordnungen.'),
        organisations: aspect('Organisationen', 'Organisatorische Informationen.'),
        projects: aspect('Projekte', 'Projektinformationen.'),
        types: {name: 'Typen'},
        scopes: {name: 'Bereiche'},
        aspects: {name: 'Aspekte'},
        tags: {name: 'Schlagworte'},
    },
};
