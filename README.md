# ha-freeflow

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A custom Home Assistant Lovelace card for freely configurable energy flow visualization.

## Features

- Freely positionable nodes (percentage coordinates)
- SVG-based rendering with animated flow lines
- Two animation styles: **dots** and **gradient** (configurable globally and per flow)
- Bezier curves or straight lines per flow
- Multiple entities per node
- Icons (MDI) or custom images per node
- Configurable colors (positive/negative direction)
- HA tap actions (`more-info`, `navigate`, `call-service`, `none`)
- `hide_if_unavailable` per node
- HACS-compatible

## Installation via HACS

1. Add this repository as a custom repository in HACS (category: **Lovelace**)
2. Install **ha-freeflow**
3. Add the resource and use the card

## Configuration

```yaml
type: custom:ha-freeflow-card
title: "Energie"  # optional

defaults:
  flow_style: dots          # dots | gradient
  color_positive: "#00c875"
  color_negative: "#ff8800"
  size: 12

nodes:
  - id: solar
    label: PV
    icon: mdi:solar-power
    x: 50
    y: 10
    entities:
      - entity: sensor.pv_power
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

  - id: home
    label: Verbraucher
    icon: mdi:home
    x: 50
    y: 85
    entities:
      - entity: sensor.home_consumption
        decimals: 0

flows:
  - from: solar
    to: battery
    sensor: sensor.solar_to_battery
  - from: battery
    to: home
    sensor: sensor.battery_to_home
    flow_style: gradient
```
