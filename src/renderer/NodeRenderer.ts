import { html, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
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

export function renderNode(
  node: NodeConfig,
  hassStates: Record<string, HassEntity>,
  defaults: CardDefaults,
  onTap: (node: NodeConfig) => void,
  viewHeight: number = 100
): TemplateResult {
  const d = node.size ?? defaults.size ?? DEFAULT_SIZE;
  const showCircle = node.circle !== false;

  const allUnavailable = node.entities.every((e) => {
    const s = hassStates[e.entity]?.state;
    return s === 'unavailable' || s === 'unknown' || s === undefined;
  });

  if ((node.hide_if_unavailable ?? defaults.hide_if_unavailable ?? false) && allUnavailable) {
    return html``;
  }

  const topPct = (node.y / viewHeight) * 100;

  // Zero-size anchor at node coordinates — circle is centered on this point,
  // label floats below without shifting the circle center (= SVG flow endpoint).
  const anchorStyle = styleMap({
    position: 'absolute',
    left: `${node.x}%`,
    top: `${topPct}%`,
    width: '0',
    height: '0',
  });

  const iconSize = `${d * 0.42}cqw`;

  const circleStyle = styleMap({
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: `${d}cqw`,
    height: `${d}cqw`,
    'border-radius': showCircle ? '50%' : '4px',
    border: showCircle ? '1px solid var(--divider-color, #e0e0e0)' : 'none',
    background: showCircle ? 'var(--card-background-color, #fff)' : 'transparent',
    'box-sizing': 'border-box',
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    cursor: 'pointer',
    'user-select': 'none',
    overflow: 'hidden',
    padding: `${d * 0.05}cqw`,
    gap: `${d * 0.02}cqw`,
  });

  const iconStyle = styleMap({
    width: iconSize,
    height: iconSize,
    'flex-shrink': '0',
    '--mdc-icon-size': iconSize,
    color: 'var(--primary-text-color)',
  });

  const sublabelStyle = styleMap({
    'font-size': `${d * 0.12}cqw`,
    color: 'var(--disabled-text-color)',
    'line-height': '1',
    'text-align': 'center',
    'white-space': 'nowrap',
  });

  const valueStyle = styleMap({
    'font-size': `${d * 0.16}cqw`,
    color: 'var(--secondary-text-color)',
    'line-height': '1.1',
    'text-align': 'center',
    'white-space': 'nowrap',
  });

  // Label sits below the circle, centered on the same X axis
  const labelStyle = styleMap({
    position: 'absolute',
    top: `${d * 0.55}cqw`,
    transform: 'translateX(-50%)',
    'font-size': `${d * 0.16}cqw`,
    'font-weight': '600',
    color: 'var(--primary-text-color)',
    'line-height': '1.2',
    'text-align': 'center',
    'white-space': 'nowrap',
    'pointer-events': 'none',
  });

  return html`
    <div style=${anchorStyle}>
      <div style=${circleStyle} @click=${() => onTap(node)}>
        ${node.icon
          ? html`<ha-icon icon=${node.icon} style=${iconStyle}></ha-icon>`
          : node.image
          ? html`<img src=${node.image} style=${styleMap({ width: iconSize, height: iconSize, 'object-fit': 'contain', 'flex-shrink': '0' })} />`
          : html``}
        ${node.entities.map((entityConfig) => {
          const haEntity = hassStates[entityConfig.entity];
          const state = haEntity?.state ?? 'unavailable';
          const value = formatValue(state, entityConfig, haEntity ?? { state, attributes: {} });
          return html`
            ${entityConfig.label ? html`<div style=${sublabelStyle}>${entityConfig.label}</div>` : html``}
            <div style=${valueStyle}>${value}</div>
          `;
        })}
      </div>
      <div style=${labelStyle}>${node.label}</div>
    </div>
  `;
}
