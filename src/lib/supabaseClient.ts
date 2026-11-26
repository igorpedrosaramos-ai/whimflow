import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isDatabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isDatabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Testa e mede a saúde da conexão com o banco de dados dedicado
 */
export async function testDatabaseConnection(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  if (!isDatabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Banco de dados na nuvem não configurado. O sistema está operando com persistência local de alta performance (IndexedDB/LocalStorage).'
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('mm_boards').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      return {
        ok: false,
        message: `Falha na consulta ao banco de dados: ${error.message} (Código: ${error.code})`,
        latencyMs
      };
    }

    return {
      ok: true,
      message: `Conexão com o banco de dados do Mapa Mental Turbine ativa e saudável (${latencyMs}ms).`,
      latencyMs
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Erro de rede ao conectar com o banco: ${err.message || 'Falha de comunicação'}`,
      latencyMs: Math.round(performance.now() - start)
    };
  }
}
