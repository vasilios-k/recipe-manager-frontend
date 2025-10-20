# Recipe Manager – Frontend

## Funktionsumfang

- **Technologie:** Vue 3 + Vite + TypeScript, Vue Router
- **Ansichten**
    - `/` – **Rezeptliste** mit Titel, Gesamtzeit, Baseline-Tag, weiteren DietTags und Kategorien
    - `/recipes/:id` – **Detailansicht** mit Zutaten & Schritten (sortiert)
    - `/recipes/new` – **Neues Rezept anlegen**
    - `/recipes/:id/edit` – **Rezept bearbeiten** (Voll-Update)
- **Formulare**
    - Baseline-Tag als **Dropdown** (VEGAN / VEGETARIAN / PESCETARIAN / OMNIVORE, **max. 1**)
    - Weitere DietTags als **Checkboxen** (z. B. GLUTEN_FREE, HALAL, LOW_CARB …)
    - Zutaten mit Menge + **Einheiten-Dropdown** (z. B. g, ml, Stück, EL, TL)
    - Schritte mit Position + Text
- **Interaktion**
    - **Erstellen** (POST), **Bearbeiten** (PUT – ersetzt Zutaten/Steps vollständig), **Löschen** (DELETE)
    - **Ladezustände** und **Fehlermeldungen** bei Validierungs-/API-Fehlern
- **Konfiguration**
    - API-Basis-URL über `VITE_API_BASE` (z. B. lokal `http://localhost:8080`)
    - Basis-Styling über `assets/main.css`
