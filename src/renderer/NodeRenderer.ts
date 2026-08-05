import { svg, SVGTemplateResult } from 'lit';
import { NodeConfig, EntityConfig, HassEntity, CardDefaults } from '../types.js';

const DEFAULT_SIZE = 12;

function formatValue(state: string, config: EntityConfig, haEntity: HassEntity): string {
  if (state === 'unavailable' || state === 'unknown') return '--';
  const num = parseFloat(state);
  if (isNaN(num)) return state;
  const decimals = config.decimals ?? 0;
  const unit = config.unit ?? (haEntity.attributes['unit_of_measurement'] as string | undefined) ?? '';
  return `${num.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
}

function renderIcon(icon: string, cx: number, cy: number, size: number): SVGTemplateResult {
  // MDI icons rendered as text using ha-icon convention
  // We use a foreignObject to embed an ha-icon element
  const half = size / 2;
  return svg`
    <foreignObject x="${cx - half * 0.5}" y="${cy - half * 0.6}" width="${half}" height="${half}">
      <ha-icon
        xmlns="http://www.w3.org/1999/xhtml"
        icon="${icon}"
        style="width:100%;height:100%;color:var(--primary-text-color)">
      </ha-icon>
    </foreignObject>
  `;
}

function renderImage(imageUrl: string, cx: number, cy: number, size: number): SVGTemplateResult {
  const half = size / 2;
  return svg`
    <image
      href="${imageUrl}"
      x="${cx - half * 0.4}"
      y="${cy - half * 0.6}"
      width="${half * 0.8}"
      height="${half * 0.8}"
      preserveAspectRatio="xMidYMid meet"
    />
  `;
}

export function renderNode(
  node: NodeConfig,
  hassStates: Record<string, HassEntity>,
  defaults: CardDefaults,
  onTap: (node: NodeConfig) => void
): SVGTemplateResult {
  const size = node.size ?? defaults.size ?? DEFAULT_SIZE;
  const radius = size / 2;
  const cx = node.x;
  const cy = node.y;
  const showCircle = node.circle !== false;

  const allUnavailable = node.entities.every((e) => {
    const s = hassStates[e.entity]?.state;
    return s === 'unavailable' || s === 'unknown' || s === undefined;
  });

  const hideIfUnavailable = node.hide_if_unavailable ?? defaults.hide_if_unavailable ?? false;
  if (hideIfUnavailable && allUnavailable) {
    return svg``;
  }

  const labelFontSize = radius * 0.28;
  const valueFontSize = radius * 0.24;

  const entityLines: SVGTemplateResult[] = node.entities.map((entityConfig, i) => {
    const haEntity = hassStates[entityConfig.entity];
    const state = haEntity?.state ?? 'unavailable';
    const value = formatValue(state, entityConfig, haEntity ?? { state, attributes: {} });
    const lineLabel = entityConfig.label;
    const yOffset = cy + radius * 0.2 + i * (valueFontSize * 1.6);

    return svg`
      ${lineLabel ? svg`
        <text x="${cx}" y="${yOffset - valueFontSize * 0.8}" text-anchor="middle"
          font-size="${valueFontSize * 0.85}" fill="var(--secondary-text-color)" font-family="var(--paper-font-body1_-_font-family, sans-serif)">
          ${lineLabel}
        </text>
      ` : svg``}
      <text x="${cx}" y="${yOffset + valueFontSize * 0.5}" text-anchor="middle"
        font-size="${valueFontSize}" fill="var(--primary-text-color)" font-weight="500"
        font-family="var(--paper-font-body1_-_font-family, sans-serif)">
        ${value}
      </text>
    `;
  });

  return svg`
    <g
      class="ha-freeflow-node"
      cursor="pointer"
      @click="${() => onTap(node)}"
    >
      ${showCircle ? svg`
        <circle
          cx="${cx}" cy="${cy}" r="${radius}"
          fill="var(--card-background-color, #fff)"
          stroke="var(--divider-color, #ccc)"
          stroke-width="0.3"
        />
      ` : svg``}

      ${node.icon ? renderIcon(node.icon, cx, cy - radius * 0.15, size) : svg``}
      ${node.image ? renderImage(node.image, cx, cy - radius * 0.15, size) : svg``}

      <text x="${cx}" y="${cy - radius * 0.45}" text-anchor="middle"
        font-size="${labelFontSize}" fill="var(--primary-text-color)" font-weight="600"
        font-family="var(--paper-font-body1_-_font-family, sans-serif)">
        ${node.label}
      </text>

      ${entityLines}
    </g>
  `;
}
