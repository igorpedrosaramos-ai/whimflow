import { Board, Workspace } from '../types';
import { ORION_SUSHI_BOARD } from './orionData';

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-default', name: 'Meu Espaço de Trabalho' }
];

// QUADRO 100% LIMPO DO ZERO (Sem textos prontos)
export const BLANK_BOARD: Board = {
  id: 'board-novo',
  title: 'Meu Novo Projeto',
  workspaceId: 'ws-default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mindMapNodes: [
    {
      id: 'root',
      text: 'Ideia Central',
      x: 0,
      y: 0,
      width: 220,
      height: 52,
      parentId: null,
      childrenIds: [],
      collapsed: false,
      color: '#6366f1',
      borderStyle: 'accent',
      lineStyle: 'bezier',
      side: 'root'
    }
  ],
  shapes: [],
  connectors: [],
  stickies: [],
  wireframes: [],
  texts: [],
  drawings: []
};

export { ORION_SUSHI_BOARD };

export const INITIAL_BOARDS: Board[] = [BLANK_BOARD, ORION_SUSHI_BOARD];
