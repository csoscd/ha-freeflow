# ha-freeflow

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/csoscd/ha-freeflow.svg)](https://github.com/csoscd/ha-freeflow/releases)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

A custom Home Assistant Lovelace card for freely configurable energy flow visualization. Unlike fixed-topology cards, **ha-freeflow** lets you place any number of nodes at any position and connect them with animated flow lines — no predefined layout.

---

## Support me

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O5O21U13R9)

---

## Features

- Freely positionable nodes via percentage coordinates (0–100)
- SVG-based animated flow lines: **dots** or **gradient** style
- Bezier curves or straight lines per flow
- Multiple entities per node (e.g. charge + discharge power)
- Icons (MDI) or custom images per node
- Flow direction based on sensor sign (positive/negative)
- Value display on flow lines with configurable position
- Configurable colors globally and per flow/node
- Label above or below the node circle
- HA tap actions per node and on flow value pills
- `hide_if_unavailable` per node
- HACS-compatible, category: Dashboard

---

## Installation via HACS

1. Open HACS → Three-dot menu → **Custom repositories**
2. Add `https://github.com/csoscd/ha-freeflow` with category **Dashboard**
3. Install **ha-freeflow**
4. Reload your browser
5. Add the card via the UI or YAML

---

## Card structure

```yaml
type: custom:ha-freeflow-card
title: "My Energy"        # optional
view_height: 80           # optional, default: 100

defaults:
  # ... global defaults for all nodes and flows

nodes:
  - id: solar
    # ...

flows:
  - from: solar
    to: battery
    # ...
```

---

## Top-level options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | Must be `custom:ha-freeflow-card` |
| `title` | string | — | Optional card title |
| `view_height` | number | `100` | Height of the SVG canvas relative to width. `100` = square card, `60` = landscape, `150` = portrait. Controls the Y coordinate range. |
| `defaults` | object | — | Global defaults for nodes and flows (see below) |
| `nodes` | list | — | List of node configurations |
| `flows` | list | — | List of flow configurations |

---

## Defaults

All `defaults` options can be overridden per node or per flow.

| Option | Type | Default | Description |
|---|---|---|---|
| `flow_style` | `dots` \| `gradient` | `dots` | Animation style for flow lines |
| `line_style` | `bezier` \| `straight` | `bezier` | Line shape |
| `color_positive` | string | `#00c875` | Color when sensor value is positive |
| `color_negative` | string | `#ff8800` | Color when sensor value is negative |
| `node_color` | string | `var(--divider-color)` | Default circle border color for all nodes |
| `size` | number | `12` | Default node diameter in SVG units (scales with card width) |
| `hide_if_unavailable` | boolean | `false` | Hide nodes when all entities are unavailable |

---

## Nodes

Each node represents a component in your energy system (e.g. solar, battery, grid).

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | string | — | **Required.** Unique identifier, referenced by flows |
| `label` | string | — | **Required.** Display name shown next to the circle |
| `x` | number | — | **Required.** Horizontal position (0 = left, 100 = right) |
| `y` | number | — | **Required.** Vertical position (0 = top, `view_height` = bottom) |
| `entities` | list | — | **Required.** One or more entities to display (see below) |
| `icon` | string | — | MDI icon name, e.g. `mdi:solar-power` |
| `image` | string | — | URL or local HA path to an image, e.g. `/local/solar.png` |
| `circle` | boolean | `true` | Show a circle around the node. Set to `false` for icon-only nodes |
| `color` | string | — | Circle border color (overrides `defaults.node_color`) |
| `size` | number | — | Node diameter in SVG units (overrides `defaults.size`) |
| `label_position` | `above` \| `below` | `below` | Position of the label relative to the circle |
| `hide_if_unavailable` | boolean | — | Hide this node when all its entities are unavailable (overrides default) |
| `tap_action` | object | `more-info` | Action when tapping the node (see Tap Actions) |

> **Note:** Use either `icon` or `image`, not both. If neither is set, only the entity values are shown inside the circle.

### Node entities

Each entry in `entities` adds a value display inside the node circle.

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | string | — | **Required.** HA entity ID, e.g. `sensor.pv_power` |
| `label` | string | — | Small sublabel above the value (useful for multi-entity nodes) |
| `decimals` | number | `0` | Number of decimal places |
| `unit` | string | — | Unit override. Default: taken from HA entity attributes |

### Tap actions

| Option | Type | Description |
|---|---|---|
| `action` | `more-info` \| `navigate` \| `call-service` \| `none` | Action type. Default: `more-info` on the first entity |
| `navigation_path` | string | Path for `navigate` action, e.g. `/lovelace/energy` |
| `service` | string | Service for `call-service`, e.g. `switch.turn_on` |
| `service_data` | object | Additional data for `call-service` |

---

## Flows

Each flow defines an animated connection between two nodes.

| Option | Type | Default | Description |
|---|---|---|---|
| `from` | string | — | **Required.** Source node `id` |
| `to` | string | — | **Required.** Target node `id` |
| `sensor` | string | — | **Required.** HA entity whose value drives the animation |
| `flow_style` | `dots` \| `gradient` | `defaults.flow_style` | Animation style for this flow |
| `line_style` | `bezier` \| `straight` | `defaults.line_style` | Line shape for this flow |
| `color` | string | — | Fixed color regardless of sign |
| `color_positive` | string | `defaults.color_positive` | Color when sensor value > 0 |
| `color_negative` | string | `defaults.color_negative` | Color when sensor value < 0 |
| `direction` | `bidirectional` \| `positive_only` \| `negative_only` | `bidirectional` | `positive_only`: only animate when value > 0; `negative_only`: only when value < 0 |
| `show_value` | boolean | `false` | Show a value pill on the flow line. Clicking it opens more-info for the sensor. |
| `value_decimals` | number | `0` | Decimal places for the value pill |
| `value_unit` | string | `W` | Unit shown in the value pill |
| `value_position` | `start` \| `middle` \| `end` | `middle` | Position of the value pill: near `from` node (start), center (middle), or near `to` node (end) |

### Animation behavior

- **dots**: Three dots travel along the line. Speed is proportional to the sensor value (200 W → slow, 2000 W → fast).
- **gradient**: An animated color gradient flows along the line.
- **Direction**: Positive values animate `from → to`. Negative values animate `to → from`.
- **Zero / unavailable**: Animation stops; the line is shown as a faint static line.

---

## Full example

```yaml
type: custom:ha-freeflow-card
title: "Energy Overview"
view_height: 75

defaults:
  flow_style: dots
  color_positive: "#00c875"
  color_negative: "#ff8800"
  node_color: "var(--divider-color)"
  size: 12
  hide_if_unavailable: false

nodes:
  - id: solar
    label: Solar
    icon: mdi:solar-power
    x: 50
    y: 5
    color: "#f0c000"
    entities:
      - entity: sensor.pv_power
        decimals: 0
        unit: W

  - id: battery
    label: Battery
    icon: mdi:battery
    x: 25
    y: 50
    label_position: below
    entities:
      - entity: sensor.battery_charge_power
        label: "↑"
        decimals: 0
      - entity: sensor.battery_discharge_power
        label: "↓"
        decimals: 0

  - id: grid
    label: Grid
    icon: mdi:transmission-tower
    x: 75
    y: 50
    color: "#e05050"
    entities:
      - entity: sensor.grid_power
        decimals: 0
        unit: W

  - id: home
    label: Home
    icon: mdi:home
    x: 50
    y: 90
    color: "#50b050"
    entities:
      - entity: sensor.home_consumption
        decimals: 0
        unit: W

flows:
  - from: solar
    to: battery
    sensor: sensor.solar_to_battery
    color_positive: "#f0c000"
    show_value: true
    value_position: start

  - from: solar
    to: home
    sensor: sensor.solar_to_home
    color_positive: "#f0c000"

  - from: battery
    to: home
    sensor: sensor.battery_to_home
    direction: positive_only
    flow_style: gradient

  - from: grid
    to: home
    sensor: sensor.grid_to_home
    color_positive: "#e05050"
    show_value: true
    value_position: end
```

---

## Coordinate system

- `x: 0` is the left edge, `x: 100` is the right edge
- `y: 0` is the top, `y: view_height` is the bottom (default `view_height: 100`)
- Node positions are the **center** of the circle
- Flows connect exactly to the circle centers

Use `view_height` to make the card taller or shorter without changing your node coordinates:
- `view_height: 100` → square card
- `view_height: 60` → landscape (wide) card
- `view_height: 150` → portrait (tall) card
