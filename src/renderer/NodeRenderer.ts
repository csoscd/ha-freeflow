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
  const borderColor = node.color ?? defaults.node_color ?? 'var(--divider-color, #e0e0e0)';

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

  const iconSize = `${d * 0.30}cqw`;

  const circleStyle = styleMap({
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: `${d}cqw`,
    height: `${d}cqw`,
    'border-radius': showCircle ? '50%' : '4px',
    border: showCircle ? `${d * 0.05}cqw solid ${borderColor}` : 'none',
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

  // Wrapper div constrains the layout space to exactly iconSize×iconSize.
  // ha-icon is a Web Component that may ignore external width/height and fill
  // its flex parent — the wrapper with overflow:hidden prevents that.
  const iconWrapperStyle = styleMap({
    width: iconSize,
    height: iconSize,
    'flex-shrink': '0',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    overflow: 'hidden',
  });

  const iconStyle = styleMap({
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

  const labelAbove = (node.label_position ?? 'below') === 'above';
  const labelStyle = styleMap({
    position: 'absolute',
    ...(labelAbove
      ? { top: `-${d * 0.55}cqw`, transform: 'translateX(-50%) translateY(-100%)' }
      : { top: `${d * 0.55}cqw`, transform: 'translateX(-50%)' }),
    'font-size': `${d * 0.14}cqw`,
    'font-weight': '400',
    color: 'var(--secondary-text-color)',
    'line-height': '1.2',
    'text-align': 'center',
    'white-space': 'nowrap',
    'pointer-events': 'none',
  });

  return html`
    <div style=${anchorStyle}>
      <div style=${circleStyle} @click=${() => onTap(node)}>
        ${node.icon
          ? html`<div style=${iconWrapperStyle}><ha-icon icon=${node.icon} style=${iconStyle}></ha-icon></div>`
          : node.image
          ? html`<div style=${iconWrapperStyle}><img src=${node.image} style="width:100%;height:100%;object-fit:contain;" /></div>`
          : html``}
        ${node.entities.map((entityConfig) => {
          const haEntity = hassStates[entityConfig.entity];
          const state = haEntity?.state ?? 'unavailable';
          const value = formatValue(state, entityConfig, haEntity ?? { state, attributes: {} });
          const entityValueStyle = styleMap({
            'font-size': `${d * 0.14 * (entityConfig.font_size ?? 1)}cqw`,
            color: 'var(--secondary-text-color)',
            'line-height': '1.1',
            'text-align': 'center',
            'white-space': 'nowrap',
          });
          return html`
            ${entityConfig.label ? html`<div style=${sublabelStyle}>${entityConfig.label}</div>` : html``}
            <div style=${entityValueStyle}>${value}</div>
          `;
        })}
      </div>
      <div style=${labelStyle}>${node.label}</div>
    </div>
  `;
}
