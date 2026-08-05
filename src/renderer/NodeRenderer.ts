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
  onTap: (node: NodeConfig) => void
): TemplateResult {
  const size = node.size ?? defaults.size ?? DEFAULT_SIZE;
  const showCircle = node.circle !== false;

  const allUnavailable = node.entities.every((e) => {
    const s = hassStates[e.entity]?.state;
    return s === 'unavailable' || s === 'unknown' || s === undefined;
  });

  const hideIfUnavailable = node.hide_if_unavailable ?? defaults.hide_if_unavailable ?? false;
  if (hideIfUnavailable && allUnavailable) {
    return html``;
  }

  // Size in % units – treat size as diameter in the 0-100 SVG coordinate space,
  // converted to percentage of container
  const diameterPct = size;
  const radiusPct = diameterPct / 2;

  const containerStyle = styleMap({
    position: 'absolute',
    left: `${node.x}%`,
    top: `${node.y}%`,
    transform: 'translate(-50%, -50%)',
    width: `${diameterPct}%`,
    height: `${diameterPct}%`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: showCircle ? '50%' : '0',
    border: showCircle ? '1px solid var(--divider-color, #ccc)' : 'none',
    background: showCircle ? 'var(--card-background-color, #fff)' : 'transparent',
    boxSizing: 'border-box',
    padding: `${radiusPct * 0.1}%`,
    userSelect: 'none',
  });

  const iconStyle = styleMap({
    width: `${diameterPct * 0.35}%`,
    height: `${diameterPct * 0.35}%`,
    '--mdc-icon-size': '100%',
    color: 'var(--primary-text-color)',
    flexShrink: '0',
  });

  const labelStyle = styleMap({
    fontSize: `${diameterPct * 0.22}%`,
    fontWeight: '600',
    color: 'var(--primary-text-color)',
    lineHeight: '1.1',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  });

  const valueStyle = styleMap({
    fontSize: `${diameterPct * 0.18}%`,
    color: 'var(--secondary-text-color)',
    lineHeight: '1.2',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  });

  return html`
    <div style=${containerStyle} @click=${() => onTap(node)}>
      ${node.icon
        ? html`<ha-icon icon=${node.icon} style=${iconStyle}></ha-icon>`
        : node.image
        ? html`<img src=${node.image} style=${styleMap({ width: '50%', height: '50%', objectFit: 'contain' })} />`
        : html``}
      <div style=${labelStyle}>${node.label}</div>
      ${node.entities.map((entityConfig) => {
        const haEntity = hassStates[entityConfig.entity];
        const state = haEntity?.state ?? 'unavailable';
        const value = formatValue(state, entityConfig, haEntity ?? { state, attributes: {} });
        return html`
          ${entityConfig.label
            ? html`<div style=${styleMap({ ...valueStyle, fontSize: `${diameterPct * 0.15}%`, color: 'var(--disabled-text-color)' })}>${entityConfig.label}</div>`
            : html``}
          <div style=${valueStyle}>${value}</div>
        `;
      })}
    </div>
  `;
}
