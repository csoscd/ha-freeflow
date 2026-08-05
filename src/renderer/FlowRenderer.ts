import { svg, SVGTemplateResult } from 'lit';
import { FlowConfig, CardDefaults, NodeConfig } from '../types.js';

export interface ResolvedFlow {
  fromNode: NodeConfig;
  toNode: NodeConfig;
  flow: FlowConfig;
  defaults: CardDefaults;
  sensorValue: number | null;
}

const DEFAULT_COLOR_POSITIVE = '#00c875';
const DEFAULT_COLOR_NEGATIVE = '#ff8800';

function resolveColor(rf: ResolvedFlow): string {
  const val = rf.sensorValue;
  const positiveColor =
    rf.flow.color_positive ?? rf.defaults.color_positive ?? DEFAULT_COLOR_POSITIVE;
  const negativeColor =
    rf.flow.color_negative ?? rf.defaults.color_negative ?? DEFAULT_COLOR_NEGATIVE;
  if (rf.flow.color) return rf.flow.color;
  if (val === null || val === 0) return positiveColor;
  return val > 0 ? positiveColor : negativeColor;
}

function midpoint(rf: ResolvedFlow): { x: number; y: number } {
  return {
    x: (rf.fromNode.x + rf.toNode.x) / 2,
    y: (rf.fromNode.y + rf.toNode.y) / 2,
  };
}

function formatFlowValue(rf: ResolvedFlow): string {
  const val = rf.sensorValue;
  if (val === null) return '--';
  const decimals = rf.flow.value_decimals ?? 0;
  const unit = rf.flow.value_unit ?? 'W';
  return `${Math.abs(val).toFixed(decimals)} ${unit}`;
}

function renderFlowLabel(rf: ResolvedFlow): SVGTemplateResult {
  if (!rf.flow.show_value) return svg``;
  const color = resolveColor(rf);
  const { x, y } = midpoint(rf);
  const text = formatFlowValue(rf);
  const padX = 1.8;
  const padY = 1.0;
  const fontSize = 2.8;
  const approxWidth = text.length * fontSize * 0.55 + padX * 2;

  return svg`
    <rect
      x="${x - approxWidth / 2}" y="${y - fontSize / 2 - padY}"
      width="${approxWidth}" height="${fontSize + padY * 2}"
      rx="1.5" ry="1.5"
      fill="var(--card-background-color, #fff)"
      stroke="${color}" stroke-width="0.25"
    />
    <text
      x="${x}" y="${y + fontSize * 0.35}"
      text-anchor="middle"
      font-size="${fontSize}"
      fill="${color}"
      font-weight="600"
      font-family="var(--paper-font-body1_-_font-family, sans-serif)"
    >${text}</text>
  `;
}

function buildPath(rf: ResolvedFlow, lineStyle: 'bezier' | 'straight'): string {
  const x1 = rf.fromNode.x;
  const y1 = rf.fromNode.y;
  const x2 = rf.toNode.x;
  const y2 = rf.toNode.y;

  if (lineStyle === 'straight') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.1 - dy * 0.2;
  const cy1 = y1 + dy * 0.1 + dx * 0.2;
  const cx2 = x2 - dx * 0.1 - dy * 0.2;
  const cy2 = y2 - dy * 0.1 + dx * 0.2;

  void mx; void my;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function effectiveSensorValue(rf: ResolvedFlow): number | null {
  const val = rf.sensorValue;
  if (val === null) return null;
  const direction = rf.flow.direction ?? 'bidirectional';
  if (direction === 'positive_only' && val < 0) return null;
  if (direction === 'negative_only' && val > 0) return null;
  return val;
}

export function renderDots(rf: ResolvedFlow): SVGTemplateResult {
  const lineStyle = rf.flow.line_style ?? rf.defaults.line_style ?? 'bezier';
  const path = buildPath(rf, lineStyle);
  const color = resolveColor(rf);
  const id = `flow-${rf.flow.from}-${rf.flow.to}`;
  const effective = effectiveSensorValue(rf);
  const speed = effective === null ? 0 : Math.max(0.5, Math.min(5, Math.abs(effective) / 500));
  const duration = effective === null ? 0 : (1 / speed).toFixed(2);
  const reverse = effective !== null && effective < 0;

  return svg`
    <path id="${id}" d="${path}" fill="none" stroke="${color}" stroke-width="0.4" stroke-opacity="0.3"/>
    ${renderFlowLabel(rf)}
    ${effective !== null && effective !== 0 ? svg`
      <circle r="0.8" fill="${color}">
        <animateMotion dur="${duration}s" repeatCount="indefinite" keyTimes="0;1"
          keyPoints="${reverse ? '1;0' : '0;1'}">
          <mpath href="#${id}"/>
        </animateMotion>
      </circle>
      <circle r="0.8" fill="${color}" opacity="0.6">
        <animateMotion dur="${duration}s" repeatCount="indefinite" keyTimes="0;1"
          begin="${(Number(duration) * 0.33).toFixed(2)}s"
          keyPoints="${reverse ? '1;0' : '0;1'}">
          <mpath href="#${id}"/>
        </animateMotion>
      </circle>
      <circle r="0.8" fill="${color}" opacity="0.3">
        <animateMotion dur="${duration}s" repeatCount="indefinite" keyTimes="0;1"
          begin="${(Number(duration) * 0.66).toFixed(2)}s"
          keyPoints="${reverse ? '1;0' : '0;1'}">
          <mpath href="#${id}"/>
        </animateMotion>
      </circle>
    ` : svg``}
  `;
}

export function renderGradient(rf: ResolvedFlow): SVGTemplateResult {
  const lineStyle = rf.flow.line_style ?? rf.defaults.line_style ?? 'bezier';
  const path = buildPath(rf, lineStyle);
  const color = resolveColor(rf);
  const id = `grad-${rf.flow.from}-${rf.flow.to}`;
  const effective = effectiveSensorValue(rf);
  const reverse = effective !== null && effective < 0;
  const from = reverse ? '100%' : '0%';
  const to = reverse ? '0%' : '100%';

  return svg`
    <defs>
      <linearGradient id="${id}" x1="${from}" y1="0%" x2="${to}" y2="0%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0">
          ${effective !== null && effective !== 0 ? svg`
            <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
          ` : svg``}
        </stop>
        <stop offset="50%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0">
          ${effective !== null && effective !== 0 ? svg`
            <animate attributeName="stop-opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite"/>
          ` : svg``}
        </stop>
      </linearGradient>
    </defs>
    <path d="${path}" fill="none" stroke="url(#${id})" stroke-width="0.8"/>
    ${renderFlowLabel(rf)}
  `;
}
