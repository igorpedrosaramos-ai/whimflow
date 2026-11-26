-- =========================================================================
-- ESQUEMA DE BANCO DE DADOS: MAPA MENTAL TURBINE
-- Isolamento Completo: Projeto Dedicado e Separado de Outros Sistemas
-- =========================================================================

-- 1. Tabela de Espaços de Trabalho (Workspaces)
CREATE TABLE IF NOT EXISTS public.mm_workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Categorias / Pastas (Categories)
CREATE TABLE IF NOT EXISTS public.mm_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#8b5cf6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela Principal de Quadros e Mapas Mentais (Boards)
CREATE TABLE IF NOT EXISTS public.mm_boards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'ws-teste',
    category_id TEXT,
    title TEXT NOT NULL DEFAULT 'Sem Título',
    layout_type TEXT NOT NULL DEFAULT 'mindmap',
    mind_map_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    sticky_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    shapes JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Auditoria e Log de Sincronização (Sync Audit)
CREATE TABLE IF NOT EXISTS public.mm_sync_log (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT,
    board_id TEXT,
    action TEXT NOT NULL,
    payload_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de Alta Performance para Busca Rápida
CREATE INDEX IF NOT EXISTS idx_mm_boards_workspace ON public.mm_boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mm_boards_category ON public.mm_boards(category_id);
CREATE INDEX IF NOT EXISTS idx_mm_boards_updated_at ON public.mm_boards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mm_boards_archived ON public.mm_boards(archived);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.mm_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mm_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mm_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público Seguro (Leitura e Escrita via Anon Key)
DROP POLICY IF EXISTS "Acesso Total Workspaces" ON public.mm_workspaces;
CREATE POLICY "Acesso Total Workspaces" ON public.mm_workspaces FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Categorias" ON public.mm_categories;
CREATE POLICY "Acesso Total Categorias" ON public.mm_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Quadros" ON public.mm_boards;
CREATE POLICY "Acesso Total Quadros" ON public.mm_boards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Sync Log" ON public.mm_sync_log;
CREATE POLICY "Acesso Total Sync Log" ON public.mm_sync_log FOR ALL USING (true) WITH CHECK (true);

-- Dados Padrão Iniciais de Inicialização
INSERT INTO public.mm_workspaces (id, name)
VALUES ('ws-teste', 'teste')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mm_categories (id, name, color)
VALUES 
    ('cat-marketing', 'Marketing & Vendas', '#f97316'),
    ('cat-produto', 'Design & Produto', '#8b5cf6'),
    ('cat-operacoes', 'Estratégia & Operações', '#10b981')
ON CONFLICT (id) DO NOTHING;
