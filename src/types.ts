export type FlowStyle = 'dots' | 'gradient' | 'none';
export type LineStyle = 'bezier' | 'straight';
export type TapActionType = 'more-info' | 'navigate' | 'call-service' | 'none';

export interface TapAction {
  action: TapActionType;
  navigation_path?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

export interface EntityConfig {
  entity: string;
  label?: string;
  decimals?: number;
  unit?: string;
  font_size?: number; // multiplier relative to default value size, e.g. 1.5 = 50% larger
}

export interface NodeConfig {
  id: string;
  label: string;
  icon?: string;
  image?: string;
  x: number;
  y: number;
  circle?: boolean;
  color?: string;
  size?: number;
  label_position?: 'above' | 'below';
  hide_if_unavailable?: boolean;
  tap_action?: TapAction;
  entities: EntityConfig[];
}

export interface FlowConfig {
  from: string;
  to: string;
  sensor: string;
  flow_style?: FlowStyle;
  line_style?: LineStyle;
  color?: string;
  color_positive?: string;
  color_negative?: string;
  // 'positive_only': animate only when sensor > 0 (suppress reversed animation for negative values)
  // 'negative_only': animate only when sensor < 0
  // 'bidirectional' (default): animate in both directions based on sign
  direction?: 'bidirectional' | 'positive_only' | 'negative_only';
  show_value?: boolean;
  value_decimals?: number;
  value_unit?: string;
  value_position?: 'start' | 'middle' | 'end'; // position of value pill along flow line; default: middle
  value_font_size?: number; // font size multiplier for the value pill, e.g. 1.5 = 50% larger; default: 1.0
}

export interface CardDefaults {
  flow_style?: FlowStyle;
  line_style?: LineStyle;
  color_positive?: string;
  color_negative?: string;
  node_color?: string;
  size?: number;
  hide_if_unavailable?: boolean;
}

export interface CardConfig {
  type: string;
  title?: string;
  view_height?: number; // SVG viewBox height (0–100), default 100 → square card
  defaults?: CardDefaults;
  nodes: NodeConfig[];
  flows: FlowConfig[];
}

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface Hass {
  states: Record<string, HassEntity>;
  language: string;
  callService(domain: string, service: string, data: Record<string, unknown>): void;
  callApi<T>(method: string, path: string): Promise<T>;
}
