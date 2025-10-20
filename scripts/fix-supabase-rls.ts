import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function fixSupabaseRLS() {
  console.log('🔧 Corrigindo configuração do Supabase...\n');

  try {
    // 1. Primeiro, vamos verificar se a tabela existe e sua estrutura
    console.log('1️⃣ Verificando tabela empresas...');
    const checkTableResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!checkTableResponse.ok) {
      console.log('❌ Tabela empresas não existe ou não está acessível');
      console.log('📝 Execute o seguinte SQL no Supabase Dashboard:');
      console.log(`
-- Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    google_connected BOOLEAN DEFAULT FALSE,
    n8n_workflow_id TEXT,
    n8n_workflow_status TEXT DEFAULT 'inactive',
    n8n_cred_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON empresas
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');
      `);
      return;
    }

    console.log('✅ Tabela empresas existe');

    // 2. Vamos tentar inserir um registro de teste com service role
    console.log('\n2️⃣ Testando inserção com service role...');
    const testInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        nome: 'Teste RLS',
        slug: 'teste-rls-' + Date.now(),
      }),
    });

    if (testInsertResponse.ok) {
      console.log('✅ Inserção com service role funcionou');
      
      // Limpar o registro de teste
      const testData = await testInsertResponse.json();
      if (testData && testData[0] && testData[0].id) {
        await fetch(`${SUPABASE_URL}/rest/v1/empresas?id=eq.${testData[0].id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        });
        console.log('🧹 Registro de teste removido');
      }
    } else {
      const errorText = await testInsertResponse.text();
      console.log('❌ Erro na inserção com service role:', errorText);
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    const policiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/pg_policies?tablename=eq.empresas`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (policiesResponse.ok) {
      const policies = await policiesResponse.json();
      console.log(`📋 Encontradas ${policies.length} políticas para a tabela empresas:`);
      policies.forEach((policy: any) => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });

      if (policies.length === 0) {
        console.log('\n⚠️ Nenhuma política RLS encontrada!');
        console.log('📝 Execute o seguinte SQL no Supabase Dashboard:');
        console.log(`
-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON empresas
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');
        `);
      }
    }

    // 4. Verificar se RLS está habilitado
    console.log('\n4️⃣ Verificando se RLS está habilitado...');
    const rlsResponse = await fetch(`${SUPABASE_URL}/rest/v1/pg_tables?tablename=eq.empresas&select=rowsecurity`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (rlsResponse.ok) {
      const rlsData = await rlsResponse.json();
      if (rlsData.length > 0) {
        console.log(`🔒 RLS habilitado: ${rlsData[0].rowsecurity}`);
      } else {
        console.log('❌ Tabela não encontrada na consulta de RLS');
      }
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Se houver problemas, execute o SQL fornecido no Supabase Dashboard');
    console.log('2. Teste a criação de conta na página de signup');
    console.log('3. Verifique os logs do Supabase se ainda houver erros');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    console.log('\n🔧 Solução manual:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o script SQL fornecido acima');
  }
}

fixSupabaseRLS().catch(console.error);
