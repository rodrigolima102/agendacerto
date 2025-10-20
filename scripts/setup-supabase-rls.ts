import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function setupSupabaseRLS() {
  console.log('🔧 Configurando Row Level Security (RLS) no Supabase...\n');

  const sqlCommands = [
    // 1. Habilitar RLS
    'ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;',
    
    // 2. Política para inserção
    `CREATE POLICY "Users can insert their own company" ON empresas
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);`,
    
    // 3. Política para leitura
    `CREATE POLICY "Users can view their own company" ON empresas
        FOR SELECT 
        USING (auth.uid() = user_id);`,
    
    // 4. Política para atualização
    `CREATE POLICY "Users can update their own company" ON empresas
        FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);`,
    
    // 5. Política para exclusão
    `CREATE POLICY "Users can delete their own company" ON empresas
        FOR DELETE 
        USING (auth.uid() = user_id);`,
    
    // 6. Política para service role
    `CREATE POLICY "Service role can manage all companies" ON empresas
        FOR ALL 
        USING (auth.role() = 'service_role');`,
  ];

  try {
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️  Comando ${i + 1} falhou (pode ser normal se já existir): ${errorText}`);
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }

    console.log('\n🎉 Configuração de RLS concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o script SQL manualmente no Supabase Dashboard se necessário');
    console.log('2. Teste a criação de conta na página de signup');
    console.log('3. Verifique se a empresa foi criada corretamente');

  } catch (error) {
    console.error('❌ Erro ao configurar RLS:', error);
    console.log('\n🔧 Solução alternativa:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para Authentication > Policies');
    console.log('3. Execute o script SQL manualmente');
  }
}

// Função alternativa para verificar se a tabela existe
async function checkTableExists() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (response.ok) {
      console.log('✅ Tabela empresas existe e está acessível');
      return true;
    } else {
      console.log('❌ Tabela empresas não existe ou não está acessível');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 Verificando tabela empresas...');
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    await setupSupabaseRLS();
  } else {
    console.log('\n📝 Execute o seguinte SQL no Supabase Dashboard:');
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
  }
}

main().catch(console.error);
