// scripts/provision-n8n.ts
import 'dotenv/config';

const BASE = process.env.N8N_BASE_URL || 'https://rodrigolima102.app.n8n.cloud';
const KEY  = process.env.N8N_API_KEY || '';
const TEMPLATE_ID = process.env.N8N_TEMPLATE_ID || '20GgnhGp77RrFmwa';

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function testConnection() {
  if (!BASE || !KEY) {
    console.error('Faltam variáveis N8N_BASE_URL ou N8N_API_KEY');
    process.exit(1);
  }
  const res = await fetch(`${BASE}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': KEY }
  });
  if (!res.ok) {
    console.error('Falha ao acessar n8n:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const count = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data) ? data.length : 0);
  console.log(`Conexão OK. Workflows encontrados: ${count}. TEMPLATE_ID: ${TEMPLATE_ID || '(não definido)'}`);
}

async function testSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Faltam variáveis SUPABASE_URL ou SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (!res.ok) {
      console.error('Falha ao acessar Supabase:', res.status, await res.text());
      process.exit(1);
    }
    
    console.log(`✅ Supabase conectado: ${SUPABASE_URL}`);
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    process.exit(1);
  }
}

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

async function listarEmpresas() {
  const url = `${SUPABASE_URL}/rest/v1/empresas?select=*&limit=5`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Erro ao listar empresas: ${res.status}`);
  const data = await res.json();
  return data;
}

async function updateEmpresaWorkflow(empresaId: string, workflowId: string, status: 'active'|'inactive'|'error'='active') {
  const url = `${SUPABASE_URL}/rest/v1/empresas?id=eq.${empresaId}`;
  const body = {
    n8n_workflow_id: workflowId,
    n8n_workflow_status: status,
    google_connected: status === 'active'
  };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Falha ao atualizar empresas: ${res.status} ${await res.text()}`);
  const json = await res.json();
  console.log('Empresa atualizada:', json);
}

async function criarEmpresaTeste(empresaId: string, nome: string, slug: string) {
  const url = `${SUPABASE_URL}/rest/v1/empresas`;
  const body = {
    id: empresaId,
    nome: nome,
    slug: slug,
    n8n_workflow_id: null,
    n8n_workflow_status: 'inactive',
    google_connected: false
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log(`Empresa já existe ou erro ao criar: ${res.status} ${errorText}`);
    return false;
  }
  const json = await res.json();
  console.log('Empresa criada:', json[0]);
  return true;
}

async function provisionarEmpresa(empresaId: string, slug: string) {
  console.log(`\n--- Provisionando empresa ${empresaId} com slug ${slug} ---`);
  
  // 1. Busca a empresa no Supabase
  const empresa = await getEmpresa(empresaId);
  if (!empresa) {
    throw new Error(`Empresa ${empresaId} não encontrada no Supabase`);
  }
  console.log(`Empresa encontrada: ${empresa.nome || empresaId}`);
  
  let workflowId: string;
  
  // 2. Verifica se já tem workflow_id
  if (empresa.n8n_workflow_id) {
    console.log(`Empresa já tem workflow_id: ${empresa.n8n_workflow_id}`);
    
    // 3. Tenta verificar se o workflow existe no N8N
    try {
      const res = await fetch(`${BASE}/rest/workflows/${empresa.n8n_workflow_id}`, {
        headers: { 'X-N8N-API-KEY': KEY }
      });
      
      if (res.ok) {
        console.log(`Workflow ${empresa.n8n_workflow_id} existe no N8N`);
        workflowId = empresa.n8n_workflow_id;
        
        // Ativa o workflow se necessário
        await activateWorkflow(workflowId);
        await updateEmpresaWorkflow(empresaId, workflowId, 'active');
        console.log(`Provisionado e ativo: ${workflowId}`);
        return workflowId;
      } else {
        console.log(`Workflow ${empresa.n8n_workflow_id} não existe no N8N (${res.status}), criando novo...`);
      }
    } catch (error) {
      console.log(`Erro ao verificar workflow ${empresa.n8n_workflow_id}: ${error}, criando novo...`);
    }
  }
  
  // 4. Se não tem workflow_id ou workflow não existe, cria novo
  console.log('Criando novo workflow...');
  workflowId = await cloneTemplate(empresaId, slug);
  await activateWorkflow(workflowId);
  await updateEmpresaWorkflow(empresaId, workflowId, 'active');
  console.log(`Provisionado e ativo: ${workflowId}`);
  
  return workflowId;
}

async function findExistingWorkflow(empresaId: string, slug: string) {
  if (!BASE || !KEY) {
    console.error('Faltam variáveis N8N_BASE_URL ou N8N_API_KEY');
    process.exit(1);
  }

  try {
    const expectedName = `Booking – ${slug} [Empresa ${empresaId}]`;
    console.log(`Buscando workflow existente: ${expectedName}`);
    
    const res = await fetch(`${BASE}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': KEY }
    });
    
    if (!res.ok) {
      console.error('Falha ao buscar workflows:', res.status, await res.text());
      process.exit(1);
    }
    
    const data = await res.json();
    const workflows = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    
    
    const existingWorkflow = workflows.find((workflow: any) => workflow.name === expectedName);
    
    if (existingWorkflow) {
      console.log(`Workflow encontrado: ${existingWorkflow.name} (ID: ${existingWorkflow.id})`);
      return existingWorkflow.id;
    } else {
      console.log('Nenhum workflow existente encontrado');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar workflow existente:', error);
    process.exit(1);
  }
}

async function activateWorkflow(id: string) {
  if (!BASE || !KEY) {
    console.error('Faltam variáveis N8N_BASE_URL ou N8N_API_KEY');
    process.exit(1);
  }

  try {
    console.log(`Ativando workflow: ${id}`);
    
    const res = await fetch(`${BASE}/api/v1/workflows/${id}/activate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': KEY }
    });
    
    if (!res.ok) {
      console.error('Falha ao ativar workflow:', res.status, await res.text());
      process.exit(1);
    }
    
    console.log(`Ativado: ${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao ativar workflow:', error);
    process.exit(1);
  }
}

async function deactivateWorkflow(id: string) {
  if (!BASE || !KEY) {
    console.error('Faltam variáveis N8N_BASE_URL ou N8N_API_KEY');
    process.exit(1);
  }

  try {
    console.log(`Desativando workflow: ${id}`);
    
    const res = await fetch(`${BASE}/api/v1/workflows/${id}/deactivate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': KEY }
    });
    
    if (!res.ok) {
      console.error('Falha ao desativar workflow:', res.status, await res.text());
      process.exit(1);
    }
    
    console.log(`Desativado: ${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao desativar workflow:', error);
    process.exit(1);
  }
}

async function deleteWorkflow(id: string) {
  if (!BASE || !KEY) {
    console.error('Faltam variáveis N8N_BASE_URL ou N8N_API_KEY');
    process.exit(1);
  }

  try {
    console.log(`Deletando workflow: ${id}`);
    
    const res = await fetch(`${BASE}/api/v1/workflows/${id}`, {
      method: 'DELETE',
      headers: { 'X-N8N-API-KEY': KEY }
    });
    
    if (!res.ok) {
      console.error('Falha ao deletar workflow:', res.status, await res.text());
      process.exit(1);
    }
    
    console.log(`Deletado: ${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar workflow:', error);
    process.exit(1);
  }
}

async function cloneTemplate(empresaId: string, slug: string) {
  if (!BASE || !KEY || !TEMPLATE_ID) {
    console.error('Faltam variáveis N8N_BASE_URL, N8N_API_KEY ou N8N_TEMPLATE_ID');
    process.exit(1);
  }

  try {
    // 1. Verificar se o workflow já existe
    const existingWorkflowId = await findExistingWorkflow(empresaId, slug);
    if (existingWorkflowId) {
      console.log(`Workflow já existe: ${existingWorkflowId}`);
      return existingWorkflowId;
    }
    // 2. Buscar o template
    console.log(`Buscando template ${TEMPLATE_ID}...`);
    const templateRes = await fetch(`${BASE}/api/v1/workflows/${TEMPLATE_ID}`, {
      headers: { 'X-N8N-API-KEY': KEY }
    });
    
    if (!templateRes.ok) {
      console.error('Falha ao buscar template:', templateRes.status, await templateRes.text());
      process.exit(1);
    }
    
    const template = await templateRes.json();
    console.log(`Template encontrado: ${template.name}`);

    // 3. Processar nós e conexões
    let processedNodes = template.nodes || [];
    let processedConnections = template.connections || {};
    
    // 4. Substituir __SLUG__ por slug nos nós
    if (processedNodes) {
      processedNodes = processedNodes.map((node: any) => {
        const modifiedNode = { ...node };
        
        // Substituir em parameters
        if (modifiedNode.parameters) {
          modifiedNode.parameters = JSON.parse(
            JSON.stringify(modifiedNode.parameters).replace(/__SLUG__/g, slug)
          );
        }
        
        // Substituir em name
        if (modifiedNode.name) {
          modifiedNode.name = modifiedNode.name.replace(/__SLUG__/g, slug);
        }
        
        return modifiedNode;
      });
    }

    // 5. Substituir __SLUG__ por slug nas conexões
    if (processedConnections) {
      processedConnections = JSON.parse(
        JSON.stringify(processedConnections).replace(/__SLUG__/g, slug)
      );
    }

    // 6. Criar objeto do workflow com apenas propriedades essenciais
    const clonedWorkflow = {
      name: `Booking – ${slug} [Empresa ${empresaId}]`,
      nodes: processedNodes,
      connections: processedConnections,
      settings: {
        executionOrder: "v1"
      }
    };

    // 7. Criar novo workflow
    console.log(`Criando workflow: ${clonedWorkflow.name}`);
    const createRes = await fetch(`${BASE}/api/v1/workflows`, {
      method: 'POST',
      headers: { 
        'X-N8N-API-KEY': KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clonedWorkflow)
    });

    if (!createRes.ok) {
      console.error('Falha ao criar workflow:', createRes.status, await createRes.text());
      process.exit(1);
    }

    const newWorkflow = await createRes.json();
    console.log(`Workflow criado com sucesso! ID: ${newWorkflow.id}`);
    
    return newWorkflow.id;
  } catch (error) {
    console.error('Erro ao clonar template:', error);
    process.exit(1);
  }
}

Promise.all([
  testConnection(),
  testSupabaseConnection()
]).then(async () => {
  console.log('\n--- Testando findExistingWorkflow ---');
  try {
    const existingWorkflowId = await findExistingWorkflow('1', 'barbearia-do-joao');
    if (existingWorkflowId) {
      console.log(`✅ Workflow existente encontrado! ID: ${existingWorkflowId}`);
    } else {
      console.log('ℹ️ Nenhum workflow existente encontrado');
    }
  } catch (error) {
    console.error('❌ Erro no teste findExistingWorkflow:', error);
  }
  
  console.log('\n--- Listando empresas existentes ---');
  try {
    const empresas = await listarEmpresas();
    console.log('Empresas encontradas:', empresas.length);
    empresas.forEach(empresa => {
      console.log(`- ID: ${empresa.id}, Nome: ${empresa.nome}, Slug: ${empresa.slug}, Workflow: ${empresa.n8n_workflow_id || 'null'}`);
    });
    
    if (empresas.length > 0) {
      const empresaId = empresas[0].id;
      const slug = empresas[0].slug || 'barbearia-do-joao';
      
      console.log(`\n--- Testando provisionarEmpresa (empresa ${empresaId}) ---`);
      const workflowId = await provisionarEmpresa(empresaId, slug);
    } else {
      console.log('Nenhuma empresa encontrada para testar');
    }
  } catch (error) {
    console.error('❌ Erro ao listar empresas ou provisionar:', error);
  }
  
  console.log('\n--- Testando provisionarEmpresa (nova empresa) ---');
  try {
    const empresaId = '987fcdeb-51a2-43d1-b789-123456789abc';
    const slug = 'salao-da-maria';
    
    // Cria empresa de teste se não existir
    await criarEmpresaTeste(empresaId, 'Salão da Maria', slug);
    
    const workflowId = await provisionarEmpresa(empresaId, slug);
  } catch (error) {
    console.error('❌ Erro no provisionarEmpresa (nova empresa):', error);
  }
  
  console.log('\n--- Testando deactivateWorkflow ---');
  try {
    await deactivateWorkflow('91XVPZkDzHyVE39g');
  } catch (error) {
    console.error('❌ Erro no teste deactivateWorkflow:', error);
  }
  
  console.log('\n--- Testando deleteWorkflow ---');
  try {
    await deleteWorkflow('n9I1spGbKV9FYD7y');
  } catch (error) {
    console.error('❌ Erro no teste deleteWorkflow:', error);
  }
  
  console.log('\n--- Verificando dados atualizados no Supabase ---');
  try {
    const empresa = await getEmpresa('123e4567-e89b-12d3-a456-426614174000');
    if (empresa) {
      console.log('✅ Empresa atualizada no Supabase:');
      console.log(`- ID: ${empresa.id}`);
      console.log(`- Nome: ${empresa.nome}`);
      console.log(`- Slug: ${empresa.slug}`);
      console.log(`- n8n_workflow_id: ${empresa.n8n_workflow_id}`);
      console.log(`- n8n_workflow_status: ${empresa.n8n_workflow_status}`);
      console.log(`- google_connected: ${empresa.google_connected}`);
      console.log(`- updated_at: ${empresa.updated_at}`);
    } else {
      console.log('❌ Empresa não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar empresa:', error);
  }
}).catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
