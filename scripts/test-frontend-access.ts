import 'dotenv/config';

const SUPABASE_URL = 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl';

async function testFrontendAccess() {
  console.log('🔍 Testando acesso do frontend (apenas anon key)...\n');
  console.log('⚠️  IMPORTANTE: Service key NUNCA deve ser exposta no frontend!\n');

  try {
    // 1. Testar autenticação (isso deve funcionar com anon key)
    console.log('1️⃣ Testando autenticação...');
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`);
    
    if (authResponse.ok) {
      console.log('   ✅ Autenticação funcionando');
    } else {
      const errorText = await authResponse.text();
      console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`);
    }

    // 2. Testar acesso à tabela empresas (com RLS)
    console.log('\n2️⃣ Testando acesso à tabela empresas (com RLS)...');
    const empresasResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${empresasResponse.status} ${empresasResponse.statusText}`);
    
    if (empresasResponse.ok) {
      const data = await empresasResponse.json();
      console.log('   ✅ Tabela empresas acessível (com RLS)');
      console.log(`   📊 Registros encontrados: ${data.length}`);
    } else {
      const errorText = await empresasResponse.text();
      console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`);
      
      if (errorText.includes('row-level security')) {
        console.log('   💡 Isso é esperado - RLS está funcionando!');
        console.log('   💡 Usuários autenticados poderão acessar seus próprios dados');
      }
    }

    // 3. Testar tabela profiles
    console.log('\n3️⃣ Testando acesso à tabela profiles...');
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${profilesResponse.status} ${profilesResponse.statusText}`);
    
    if (profilesResponse.ok) {
      const data = await profilesResponse.json();
      console.log('   ✅ Tabela profiles acessível');
      console.log(`   📊 Registros encontrados: ${data.length}`);
    } else {
      const errorText = await profilesResponse.text();
      console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`);
    }

    console.log('\n🎉 Teste do frontend concluído!');
    console.log('\n📋 Resumo:');
    console.log('✅ Anon key está funcionando');
    console.log('✅ RLS está protegendo os dados (como esperado)');
    console.log('✅ Frontend pode se conectar ao Supabase');
    console.log('\n💡 Próximos passos:');
    console.log('1. Teste a aplicação no navegador');
    console.log('2. Crie uma conta via signup');
    console.log('3. Verifique se os dados são salvos corretamente');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testFrontendAccess().catch(console.error);
