import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { MindMapNode } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: MindMapNode | null;
  onAddGeneratedBranches: (parentId: string, branchTexts: string[]) => void;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  selectedNode,
  onAddGeneratedBranches
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setLoading(true);

    setTimeout(() => {
      const topic = prompt.trim() || (selectedNode ? selectedNode.text : 'Estratégia Geral');
      let results: string[] = [];

      const lower = topic.toLowerCase();
      if (lower.includes('delivery') || lower.includes('ifood') || lower.includes('comida') || lower.includes('restaurante')) {
        results = [
          'Auditoria de Tempo Médio de Preparo (Kitchen KDS)',
          'Redução de Desperdício e Gestão de Ficha Técnica',
          'Estratégia de Combos Promocionais de Alto Ticket',
          'Padronização de Rotas e SLAs de Motoboys Parceiros',
          'Monitoramento Diário de Feedbacks e Avaliações de 1 Estrela'
        ];
      } else if (lower.includes('custo') || lower.includes('investimento') || lower.includes('financeiro') || lower.includes('preço')) {
        results = [
          'Análise de Ponto de Equilíbrio (Break-Even Operacional)',
          'Simulação de Margem de Contribuição por Canal de Venda',
          'Negociação de Taxas de Adquirência de Cartões',
          'Previsão de Fluxo de Caixa para os Próximos 90 Dias',
          'Controle Rígido de Custos Variáveis por Entrega'
        ];
      } else if (lower.includes('mercado') || lower.includes('concorrência') || lower.includes('venda')) {
        results = [
          'Mapeamento dos 5 Principais Concorrentes do Raio de 5km',
          'Campanha de Reativação de Clientes Inativos via WhatsApp',
          'Programa de Fidelidade Exclusivo do Canal Direto',
          'Otimização de Fotos e Descrições no Cardápio Digital'
        ];
      } else {
        results = [
          `Diagnóstico Preliminar: ${topic}`,
          `Plano de Ação Imediato para ${topic}`,
          `Métricas Chave de Acompanhamento (KPIs)`,
          `Mitigação de Riscos e Contingência Operacional`
        ];
      }

      setSuggestions(results);
      setLoading(false);
    }, 400);
  };

  const handleApply = () => {
    if (selectedNode && suggestions.length > 0) {
      onAddGeneratedBranches(selectedNode.id, suggestions);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-purple-light)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Assistente Inteligente (Geração de Ramos)</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '16px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          {selectedNode ? (
            <div>
              Nó selecionado para expansão: <strong style={{ color: 'var(--accent-purple-light)' }}>{selectedNode.text}</strong>
            </div>
          ) : (
            <div>Selecione um nó no mapa mental para desdobrar ramos automaticamente.</div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Orientação do prompt ou foco da expansão (Opcional):
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Estratégias para diminuir tempo de entrega, cálculo de ROI, etc."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <Sparkles size={16} />
          <span>{loading ? 'Processando ideias corporativas...' : 'Gerar 4-5 Ramos Estratégicos'}</span>
        </button>

        {suggestions.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-canvas)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Ramos Sugeridos:
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <ArrowRight size={13} color="var(--accent-purple-light)" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Cancelar
          </button>
          {suggestions.length > 0 && (
            <button
              onClick={handleApply}
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-teal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} />
              <span>Inserir Ramos no Mapa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
