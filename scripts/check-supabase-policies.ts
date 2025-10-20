import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function checkSupabasePolicies() {
  console.log('🔍 Verificando políticas RLS do Supabase...\n');

  try {
    // 1. Verificar se a tabela empresas existe
    console.log('1️⃣ Verificando tabela empresas...');
    const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!tableResponse.ok) {
      console.log('❌ Tabela empresas não existe!');
      console.log('📝 Execute este SQL no Supabase Dashboard:');
      console.log(`
CREATE TABLE empresas (
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
      `);
      return;
    }

    console.log('✅ Tabela empresas existe');

    // 2. Verificar se RLS está habilitado
    console.log('\n2️⃣ Verificando RLS...');
    const rlsResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'empresas\';'
      }),
    });

    if (rlsResponse.ok) {
      const rlsData = await rlsResponse.json();
      console.log('🔒 Status do RLS:', rlsData);
    } else {
      console.log('⚠️ Não foi possível verificar RLS via API');
    }

    // 3. Verificar políticas existentes
    console.log('\n3️⃣ Verificando políticas existentes...');
    const policiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
              FROM pg_policies 
              WHERE tablename = 'empresas';`
      }),
    });

    if (policiesResponse.ok) {
      const policiesData = await policiesResponse.json();
      console.log('📋 Políticas encontradas:', policiesData);
      
      if (policiesData.length === 0) {
        console.log('\n❌ Nenhuma política RLS encontrada!');
        console.log('📝 Execute este SQL no Supabase Dashboard:');
        console.log(`
-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
DROP POLICY IF EXISTS "Users can view their own company" ON empresas;
DROP POLICY IF EXISTS "Users can update their own company" ON empresas;
DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;
DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;

-- Criar políticas RLS
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

CREATE POLICY "Users can delete their own company" ON empresas
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');
        `);
      } else {
        console.log(`✅ Encontradas ${policiesData.length} políticas`);
        policiesData.forEach((policy: any) => {
          console.log(`   - ${policy.policyname} (${policy.cmd})`);
        });
      }
    } else {
      console.log('⚠️ Não foi possível verificar políticas via API');
    }

    // 4. Verificar usuários existentes
    console.log('\n4️⃣ Verificando usuários existentes...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 3;'
      }),
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('👥 Usuários encontrados:', usersData.length);
      usersData.forEach((user: any) => {
        console.log(`   - ${user.email} (ID: ***)`);
      });
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('\n📋 Resumo:');
    console.log('- Tabela empresas: ✅ Existe');
    console.log('- RLS: Verificar manualmente no Dashboard');
    console.log('- Políticas: Verificar manualmente no Dashboard');
    console.log('- Usuários: Verificar manualmente no Dashboard');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    console.log('\n🔧 Solução manual:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o script SQL fornecido acima');
  }
}

checkSupabasePolicies().catch(console.error);
