import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function fixRLSPolicies() {
  console.log('🔧 Corrigindo políticas RLS no Supabase...\n');

  const sqlCommands = [
    // 1. Verificar se a tabela empresas existe
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'empresas';`,
    
    // 2. Habilitar RLS na tabela empresas
    `ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;`,
    
    // 3. Remover políticas existentes
    `DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;`,
    `DROP POLICY IF EXISTS "Users can view their own company" ON empresas;`,
    `DROP POLICY IF EXISTS "Users can update their own company" ON empresas;`,
    `DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;`,
    `DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;`,
    
    // 4. Criar políticas RLS
    `CREATE POLICY "Users can insert their own company" ON empresas
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);`,
    
    `CREATE POLICY "Users can view their own company" ON empresas
        FOR SELECT 
        USING (auth.uid() = user_id);`,
    
    `CREATE POLICY "Users can update their own company" ON empresas
        FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);`,
    
    `CREATE POLICY "Users can delete their own company" ON empresas
        FOR DELETE 
        USING (auth.uid() = user_id);`,
    
    `CREATE POLICY "Service role can manage all companies" ON empresas
        FOR ALL 
        USING (auth.role() = 'service_role');`,
    
    // 5. Verificar políticas criadas
    `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
     FROM pg_policies 
     WHERE tablename = 'empresas'
     ORDER BY policyname;`,
  ];

  try {
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
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
        console.log(`⚠️  Comando ${i + 1} falhou: ${errorText.substring(0, 200)}...`);
      } else {
        const result = await response.json();
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
        if (result && result.length > 0) {
          console.log(`   Resultado: ${JSON.stringify(result).substring(0, 100)}...`);
        }
      }
    }

    console.log('\n🎉 Configuração de RLS concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste a criação de conta na página de signup');
    console.log('2. Verifique se a empresa foi criada no banco');
    console.log('3. Se ainda houver erro, execute o SQL manualmente no Dashboard');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    console.log('\n🔧 Solução alternativa:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o script SQL fornecido abaixo');
  }
}

// Função para mostrar o SQL que deve ser executado manualmente
function showManualSQL() {
  console.log('\n📝 SQL para executar manualmente no Supabase Dashboard:');
  console.log(`
-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
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

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas'
ORDER BY policyname;
  `);
}

async function main() {
  await fixRLSPolicies();
  showManualSQL();
}

main().catch(console.error);
