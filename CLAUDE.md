# ha-freeflow – Custom Home Assistant Lovelace Card

## Projektziel

Eine eigene Home Assistant Lovelace Card zur Visualisierung von Energieflüssen.
Vorbild ist `power-flow-card-plus`, aber mit vollständig freier Konfiguration
von Komponenten (Nodes) und Flüssen (Flows) – keine fest codierte Topologie.

---

## Entschiedene Architektur- und Designpunkte

### Technologie-Stack

- **Lit (LitElement)** als Web-Component-Framework (HA-Standard)
- **esbuild** als Build-Tool (Watch-Modus für Entwicklung)
- **SVG** für das gesamte Rendering (Nodes + Flow-Linien)
- **Kein PHP-Framework**, kein externes CSS-Framework – reines Web-Component

### Layout & Koordinatensystem

- Nodes werden **frei positioniert** via Prozent-Koordinaten (0–100 für X und Y)
- Basis: SVG `viewBox="0 0 100 100"` – `x: 50, y: 25` bedeutet "Mitte horizontal, ein Viertel von oben"
- **Kartengröße** wird vollständig vom **HA-Grid** gesteuert (Breite + Höhe via UI)
- Die Karte füllt den zugewiesenen Grid-Platz (`width: 100%; height: 100%`)

### Nodes (Komponenten)

- Darstellung: **Kreis mit Icon + Label + Sensorwert(en)**
- Kreis ist **optional deaktivierbar** (`circle: false`)
- **Mehrere Entities pro Node** möglich (z.B. Batterie-Lade- und Entladeleistung getrennt)
- Pro Node: entweder **`icon` (MDI)** oder **`image` (URL/lokaler HA-Pfad)**
- **Konfigurierbare Größe**: globaler Default + pro Node überschreibbar (`size`)
- **Tap-Action**: konfigurierbar pro Node, Default ist `more-info` der ersten Entity
- **Optionaler Titel** der Karte via `title`-Feld im YAML

### Unavailable-Handling

- Sensor `unavailable` / `unknown` → zeigt **`--`** an (Node bleibt sichtbar)
- Pro Node mit `hide_if_unavailable: true` überschreibbar (Node verschwindet)

### Einheiten & Formatierung

- **Default**: Einheit und Nachkommastellen kommen automatisch aus HA (`unit_of_measurement`)
- Pro Entity überschreibbar: `unit` (z.B. `kW`) und `decimals` (z.B. `0`)

### Flows (Verbindungen)

- Definition im YAML: `from: <node-id>` + `to: <node-id>` + `sensor: <entity>`
- **Animationsrichtung** ergibt sich aus dem **Vorzeichen des Sensorwerts**
- **Linienverlauf**: Bezier-Kurve als Default, pro Flow mit `line_style: straight` überschreibbar
- **Farben**:
  - Globale Defaults für positive und negative Richtung (klassisch: grün/orange)
  - Pro Flow überschreibbar: `color`, `color_positive`, `color_negative`
- **Animationsstil**: zwei Varianten, global konfigurierbar und pro Flow überschreibbar:
  - `dots` – wandernde Punkte (Geschwindigkeit proportional zum Sensorwert)
  - `gradient` – animierter Farbverlauf

### YAML-Konfigurationsstruktur (Übersicht)

```yaml
type: custom:ha-freeflow-card
title: "Energie"          # optional

defaults:
  flow_style: dots        # dots | gradient
  color_positive: "#00c875"
  color_negative: "#ff8800"
  size: 12                # Node-Durchmesser in SVG-Einheiten (0-100)
  hide_if_unavailable: false

nodes:
  - id: solar
    label: PV
    icon: mdi:solar-power  # alternativ: image: /local/images/solar.png
    x: 50
    y: 10
    circle: true           # optional, Default: true
    size: 14               # optional, überschreibt Default
    hide_if_unavailable: false
    tap_action:
      action: more-info    # more-info | navigate | call-service | none
    entities:
      - entity: sensor.pv_power
        label: Leistung
        decimals: 0
        unit: W

  - id: battery
    label: Batterie
    icon: mdi:battery
    x: 50
    y: 50
    entities:
      - entity: sensor.battery_charge_power
        label: Laden
      - entity: sensor.battery_discharge_power
        label: Entladen

flows:
  - from: solar
    to: battery
    sensor: sensor.solar_to_battery_power
    flow_style: gradient   # optional, überschreibt Default
    color_positive: "#ffdd00"
    line_style: straight   # optional, überschreibt Default (bezier)
```

---

## Verteilung & Release-Workflow

### Distribution

- Verteilung via **HACS** (Home Assistant Community Store)
- Projekt von Anfang an **HACS-kompatibel strukturiert** (`hacs.json`, korrekte Release-Tags)

### Entwicklungs-Workflow

1. Entwicklung läuft in **Feature-Branches** (z.B. `dev/node-colors`)
2. **Kein direktes Pushen auf `main`** – `main` bleibt immer stabil
3. Fertige Features werden per **Pull Request** nach `main` gemergt

### GitHub Actions (CI/CD)

- **Branch-Push** → Action baut mit esbuild + erstellt/aktualisiert ein **Pre-Release**
  (z.B. `v0.0.0-dev-node-colors`) mit der gebundeten JS-Datei als Asset
- **Manueller Tag** auf `main` (z.B. `v1.0.0`) → **Stabiler HACS-Release**
- HACS-Nutzer können Pre-Releases aktivieren ("Allow pre-releases") für Entwicklungstests

### Testen

- Neue Versionen werden als **Pre-Release** über HACS in der eigenen HA-Instanz installiert
- Kein direktes Kopieren per SCP in HA – konsequenter HACS-Workflow

---

## Geplante UI-Features (spätere Phase)

- **Visueller HA-Karten-Editor** (Drag-and-Drop-Positionierung der Nodes) – bewusst zurückgestellt

---

## Offene Implementierungsschritte

1. GitHub-Repository anlegen (HACS-Struktur)
2. Projektstruktur mit Lit + esbuild aufsetzen
3. GitHub Actions Workflows (Branch-Pre-Release + Tag-Release)
4. Basis-Card: SVG-Canvas, Node-Rendering
5. Flow-Linien: Bezier-SVG-Paths
6. Animationen: Dots-Renderer + Gradient-Renderer
7. HACS-Konfiguration (`hacs.json`, `info.md`, Releases)
8. Tap-Actions, Unavailable-Handling, Einheiten-Formatierung
9. `hacs.json` + HACS-Repository registrieren
