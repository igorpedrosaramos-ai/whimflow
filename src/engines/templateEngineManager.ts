import { TemplateEngine } from './templateEngineTypes';
import { orgChartEngine } from './orgChartEngine';
import { flowchartEngine } from './flowchartEngine';
import { mindMapEngine } from './mindmapEngine';

export function getTemplateEngine(layoutType?: string): TemplateEngine {
  switch (layoutType) {
    case 'orgchart':
      return orgChartEngine;
    case 'flowchart':
      return flowchartEngine;
    case 'bidirectional':
    case 'right':
    default:
      return mindMapEngine;
  }
}
