import { LitElement, html, svg, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CardConfig,
  Hass,
  NodeConfig,
  FlowConfig,
  CardDefaults,
  HassEntity,
} from './types.js';
import { renderNode } from './renderer/NodeRenderer.js';
import {
  renderDots,
  renderGradient,
  ResolvedFlow,
} from './renderer/FlowRenderer.js';

@customElement('ha-freeflow-card')
export class HaFreeflowCard extends LitElement {
  @property({ attribute: false }) hass!: Hass;
  @state() private _config!: CardConfig;

  static getConfigElement() {
    return document.createElement('ha-freeflow-card-editor');
  }

  static getStubConfig(): CardConfig {
    return {
      type: 'custom:ha-freeflow-card',
      nodes: [],
      flows: [],
    };
  }

  setConfig(config: CardConfig) {
    if (!config.nodes || !Array.isArray(config.nodes)) {
      throw new Error('ha-freeflow: "nodes" muss ein Array sein.');
    }
    if (!config.flows || !Array.isArray(config.flows)) {
      throw new Error('ha-freeflow: "flows" muss ein Array sein.');
    }
    this._config = config;
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
  }

  private get _defaults(): CardDefaults {
    return this._config.defaults ?? {};
  }

  private _nodeMap(): Map<string, NodeConfig> {
    const map = new Map<string, NodeConfig>();
    for (const node of this._config.nodes) {
      map.set(node.id, node);
    }
    return map;
  }

  private _resolveFlows(): ResolvedFlow[] {
    const nodeMap = this._nodeMap();
    const resolved: ResolvedFlow[] = [];

    for (const flow of this._config.flows) {
      const fromNode = nodeMap.get(flow.from);
      const toNode = nodeMap.get(flow.to);
      if (!fromNode || !toNode) continue;

      const haEntity: HassEntity | undefined = this.hass?.states[flow.sensor];
      const raw = haEntity?.state;
      const sensorValue =
        raw === undefined || raw === 'unavailable' || raw === 'unknown'
          ? null
          : parseFloat(raw);

      resolved.push({
        fromNode,
        toNode,
        flow,
        defaults: this._defaults,
        sensorValue: isNaN(sensorValue as number) ? null : sensorValue,
      });
    }

    return resolved;
  }

  private _handleTap(node: NodeConfig) {
    const action = node.tap_action?.action ?? 'more-info';
    if (action === 'none') return;

    if (action === 'more-info') {
      const firstEntity = node.entities[0]?.entity;
      if (!firstEntity) return;
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: firstEntity },
      });
      this.dispatchEvent(event);
      return;
    }

    if (action === 'navigate' && node.tap_action?.navigation_path) {
      window.history.pushState(null, '', node.tap_action.navigation_path);
      return;
    }

    if (action === 'call-service' && node.tap_action?.service) {
      const [domain, service] = node.tap_action.service.split('.');
      this.hass.callService(domain, service, node.tap_action.service_data ?? {});
    }
  }

  protected render() {
    if (!this._config) return html``;

    const states = this.hass?.states ?? {};
    const resolvedFlows = this._resolveFlows();

    const flowSvg = resolvedFlows.map((rf) => {
      const style = rf.flow.flow_style ?? this._defaults.flow_style ?? 'dots';
      return style === 'gradient' ? renderGradient(rf) : renderDots(rf);
    });

    const nodeSvg = this._config.nodes.map((node) =>
      renderNode(node, states, this._defaults, (n) => this._handleTap(n))
    );

    return html`
      <ha-card>
        ${this._config.title
          ? html`<div class="card-header">${this._config.title}</div>`
          : ''}
        <div class="card-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            ${flowSvg}
            ${nodeSvg}
          </svg>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      padding: 12px 16px 0;
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .card-content {
      flex: 1;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      display: block;
      overflow: visible;
    }
    .ha-freeflow-node {
      transition: opacity 0.2s;
    }
    .ha-freeflow-node:hover {
      opacity: 0.85;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ha-freeflow-card': HaFreeflowCard;
  }
}
