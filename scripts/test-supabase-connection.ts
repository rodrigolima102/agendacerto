import 'dotenv/config';

// Testar diferentes URLs do Supabase
const SUPABASE_URLS = [
  'https://tqsibusymtsvpihnyieo.supabase.co',
];

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  for (const url of SUPABASE_URLS) {
    console.log(`📡 Testando URL: ${url}`);
    
    try {
      // Teste básico de conectividade
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('   ✅ Conexão funcionando!');
        
        // Testar acesso a uma tabela específica
        try {
          const tableResponse = await fetch(`${url}/rest/v1/empresas?select=id&limit=1`, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
            },
          });
          
          if (tableResponse.ok) {
            console.log('   ✅ Tabela empresas acessível');
          } else {
            console.log(`   ⚠️ Tabela empresas: ${tableResponse.status}`);
          }
        } catch (tableError) {
          console.log('   ❌ Erro ao acessar tabela empresas');
        }
        
      } else {
        console.log('   ❌ Erro na conexão');
        const errorText = await response.text();
        console.log(`   Detalhes: ${errorText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro de rede: ${error.message}`);
    }
    
    console.log('');
  }

  // Testar com fetch simples
  console.log('🌐 Testando conectividade básica...');
  try {
    const basicResponse = await fetch('https://httpbin.org/get');
    if (basicResponse.ok) {
      console.log('✅ Conectividade de rede funcionando');
    } else {
      console.log('❌ Problema de conectividade de rede');
    }
  } catch (error) {
    console.log('❌ Erro de conectividade:', error.message);
  }

  console.log('\n📋 Próximos passos:');
  console.log('1. Se todas as URLs falharam, o projeto pode ter sido deletado');
  console.log('2. Crie um novo projeto no Supabase Dashboard');
  console.log('3. Atualize as credenciais no código');
  console.log('4. Teste novamente');
}

testSupabaseConnection().catch(console.error);
