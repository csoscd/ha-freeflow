# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [0.1.21] - 2026-08-08

### Fixed
- Bezier curves now mirror correctly for symmetric node layouts: control points bow based on the horizontal `dx` component only, so mirrored positions (e.g. Netz→L1 and Netz→L3) produce mirrored curves instead of both bowing in the same direction

---

## [0.1.20] - 2026-08-08

### Added
- `value_font_size` multiplier per flow: scales the font size of the value pill (`1.5` = 50% larger, `0.8` = 20% smaller)

---

## [0.1.19] - 2026-08-07

### Added
- `font_size` multiplier per node entity: scales the value text inside the circle independently per entity

---

## [0.1.18] - 2026-08-06

### Added
- `flow_style: none` — renders a static flow line without animation; value pill (`show_value`) is still displayed. Useful for accumulated daily energy values (kWh)

---

## [0.1.17] - 2026-08-06

### Fixed
- Icon sizing and centering in node circles on mobile: `ha-icon` is now wrapped in a fixed-size container (`overflow: hidden`) so it cannot expand beyond its allocated space, fixing icon overlaying values and off-center rendering on small screens

---

## [0.1.16] - 2026-08-06

### Added
- `value_position` per flow: controls where the value pill appears along the flow line (`start` = near `from` node, `middle` = center, `end` = near `to` node). Uses accurate cubic Bezier evaluation.

### Changed
- Node icon size reduced from 42% to 30% of circle diameter, matching power-flow-card-plus proportions and giving more room for entity values inside circles

---

## [0.1.15] - 2026-08-06

### Added
- Clicking a `show_value` pill now opens the `more-info` dialog for the flow's sensor entity

---

## [0.1.14] - 2026-08-06

### Added
- `label_position` per node: controls whether the label appears above or below the circle (`above` | `below`, default: `below`)

---

## [0.1.13] - 2026-08-06

### Added
- `color` per node: configurable circle border color
- Circle border thickness increased for better visibility

---

## [0.1.12] - 2026-08-06

### Changed
- Entity values inside circles and flow pill text reduced to match label size for visual consistency

---

## [0.1.11] - 2026-08-06

### Changed
- Reduced visual weight of flow pill and node label: `font-weight` reduced, secondary text color applied

---

## [0.1.10] - 2026-08-06

### Changed
- Node label moved outside the circle (below by default); icon and entity values remain inside
- Zero-size anchor technique ensures label position does not shift the circle center (which must align with SVG flow endpoints)

---

## [0.1.9] - 2026-08-05

### Fixed
- Card not rendering at all: `viewHeight` was declared after first use (Temporal Dead Zone crash in JavaScript). Declaration moved to top of render function.

---

## [0.1.8] - 2026-08-05

### Fixed
- Nodes and flows vertically misaligned when `view_height` is not 100: HTML `top` percentage is now normalized as `(node.y / viewHeight) * 100%`

---

## [0.1.7] - 2026-08-05

### Added
- `view_height` card option: controls the SVG viewBox height relative to width (`100` = square, `60` = landscape, `150` = portrait). Eliminates unwanted whitespace for non-square layouts.

### Fixed
- `rows: auto` in HA dashboard now works correctly: removed `height: 100%` from `ha-card` so the card's intrinsic height is determined by the SVG aspect ratio

---

## [0.1.6] - 2026-08-05

### Fixed
- Node circles appearing white with only a tiny dot: icon and text sizes were using `%` (relative to parent font size) instead of `cqw` (container query width). All sizes now use `cqw` with `container-type: inline-size`.

---

## [0.1.5] - 2026-08-05

### Changed
- Dot animation speed is now inversely proportional to the sensor value: 200 W → ~10 s per cycle, 1000 W → ~2 s, 5000 W → 1.5 s (minimum). Previously all dots moved at the same speed.

---

## [0.1.4] - 2026-08-05

### Fixed
- Icons rendering as black squares: `ha-icon` does not work inside SVG `<foreignObject>`. Switched to hybrid rendering — SVG for flow lines only, separate HTML layer (absolute-positioned) for nodes.

---

## [0.1.3] - 2026-08-05

### Added
- `show_value` per flow: displays the sensor value as a pill on the flow line
- `value_decimals` and `value_unit` per flow for formatting the pill value

---

## [0.1.2] - 2026-08-05

### Added
- `direction` per flow: `bidirectional` (default), `positive_only`, `negative_only` — controls when animation is shown based on sensor sign

---

## [0.1.1] - 2026-08-05

### Fixed
- HACS compliance: `hacs.json` had `"filename": "dist/ha-freeflow.js"` but the GitHub release asset is named `ha-freeflow.js` (no path prefix)

---

## [0.1.0] - 2026-08-05

### Added
- Initial release
- Freely positionable nodes via percentage coordinates (`x`, `y`)
- SVG-based animated flow lines: `dots` and `gradient` styles
- Bezier curves and straight lines per flow (`line_style`)
- Flow direction based on sensor sign (positive = `from→to`, negative = `to→from`)
- Multiple entities per node with optional sublabel, `decimals`, `unit`
- Icons (MDI) or custom images per node
- Optional circle per node (`circle: false` for icon-only)
- Global `defaults` for flow style, colors, node size
- `hide_if_unavailable` per node
- HA tap actions per node (`more-info`, `navigate`, `call-service`, `none`)
- `view_height` for non-square card layouts
- HACS-compatible (category: Dashboard)
- GitHub Actions CI/CD: tag → stable release, dev branch → pre-release

[Unreleased]: https://github.com/csoscd/ha-freeflow/compare/v0.1.21...HEAD
[0.1.21]: https://github.com/csoscd/ha-freeflow/compare/v0.1.20...v0.1.21
[0.1.20]: https://github.com/csoscd/ha-freeflow/compare/v0.1.19...v0.1.20
[0.1.19]: https://github.com/csoscd/ha-freeflow/compare/v0.1.18...v0.1.19
[0.1.18]: https://github.com/csoscd/ha-freeflow/compare/v0.1.17...v0.1.18
[0.1.17]: https://github.com/csoscd/ha-freeflow/compare/v0.1.16...v0.1.17
[0.1.16]: https://github.com/csoscd/ha-freeflow/compare/v0.1.15...v0.1.16
[0.1.15]: https://github.com/csoscd/ha-freeflow/compare/v0.1.14...v0.1.15
[0.1.14]: https://github.com/csoscd/ha-freeflow/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/csoscd/ha-freeflow/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/csoscd/ha-freeflow/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/csoscd/ha-freeflow/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/csoscd/ha-freeflow/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/csoscd/ha-freeflow/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/csoscd/ha-freeflow/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/csoscd/ha-freeflow/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/csoscd/ha-freeflow/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/csoscd/ha-freeflow/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/csoscd/ha-freeflow/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/csoscd/ha-freeflow/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/csoscd/ha-freeflow/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/csoscd/ha-freeflow/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/csoscd/ha-freeflow/releases/tag/v0.1.0
