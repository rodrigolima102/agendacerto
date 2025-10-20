import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function getEmpresa(empresaId: string) {
  const url = `${SUPABASE_URL}/rest/v1/empresas?id=eq.${empresaId}&select=*`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Erro ao buscar empresa: ${res.status}`);
  const data = await res.json();
  return data[0] || null;
}

async function main() {
  console.log('🔍 Verificando dados da empresa no Supabase...\n');
  
  try {
    const empresa = await getEmpresa('123e4567-e89b-12d3-a456-426614174000');
    if (empresa) {
      console.log('✅ Empresa encontrada no Supabase:');
      console.log(`- ID: ${empresa.id}`);
      console.log(`- Nome: ${empresa.nome}`);
      console.log(`- Slug: ${empresa.slug}`);
      console.log(`- n8n_workflow_id: ${empresa.n8n_workflow_id}`);
      console.log(`- n8n_workflow_status: ${empresa.n8n_workflow_status}`);
      console.log(`- google_connected: ${empresa.google_connected}`);
      console.log(`- updated_at: ${empresa.updated_at}`);
      
      console.log('\n📊 Resumo da atualização:');
      console.log(`✅ n8n_workflow_id: ${empresa.n8n_workflow_id ? 'ATUALIZADO' : 'NÃO ATUALIZADO'}`);
      console.log(`✅ n8n_workflow_status: ${empresa.n8n_workflow_status === 'active' ? 'ATIVO' : 'INATIVO'}`);
      console.log(`✅ google_connected: ${empresa.google_connected ? 'CONECTADO' : 'DESCONECTADO'}`);
    } else {
      console.log('❌ Empresa não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar empresa:', error);
  }
}

main().catch(console.error);
