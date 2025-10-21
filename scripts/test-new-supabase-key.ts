// Teste com a nova API key do Supabase
const SUPABASE_URL = 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU';

async function testNewSupabaseKey() {
  console.log('🔍 Testando nova API key do Supabase...\n');
  console.log(`📡 URL: ${SUPABASE_URL}`);
  console.log(`🔑 API Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);
  
  try {
    // Teste básico de conectividade
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Conexão funcionando!');
      
      // Testar acesso a uma tabela específica
      try {
        const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
          },
        });
        
        console.log(`📋 Tabela empresas: ${tableResponse.status} ${tableResponse.statusText}`);
        
        if (tableResponse.ok) {
          console.log('✅ Tabela empresas acessível');
        } else {
          const errorText = await tableResponse.text();
          console.log(`⚠️ Erro na tabela: ${errorText.substring(0, 100)}...`);
        }
      } catch (tableError) {
        console.log('❌ Erro ao acessar tabela empresas:', tableError.message);
      }
      
    } else {
      console.log('❌ Erro na conexão');
      const errorText = await response.text();
      console.log(`📝 Detalhes: ${errorText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log(`❌ Erro de rede: ${error.message}`);
  }
  
  console.log('\n🎯 Próximos passos:');
  console.log('1. Se a conexão funcionou, reinicie o servidor (npm run dev)');
  console.log('2. Tente fazer login novamente');
  console.log('3. Se ainda houver problemas, verifique as políticas RLS');
}

testNewSupabaseKey().catch(console.error);
