import 'dotenv/config';

const SUPABASE_URL = 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl';
// Service key apenas para scripts de backend - NUNCA no frontend
const SUPABASE_SERVICE_KEY = 'sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO';

async function testEmpresasTable() {
  console.log('🔍 Testando acesso à tabela empresas...\n');

  try {
    // 1. Testar acesso básico à API
    console.log('1️⃣ Testando acesso básico à API...');
    const basicResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${basicResponse.status} ${basicResponse.statusText}`);
    
    if (basicResponse.ok) {
      console.log('   ✅ Acesso básico funcionando');
    } else {
      const errorText = await basicResponse.text();
      console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`);
      return;
    }

    // 2. Testar acesso à tabela empresas
    console.log('\n2️⃣ Testando acesso à tabela empresas...');
    const empresasResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${empresasResponse.status} ${empresasResponse.statusText}`);
    
    if (empresasResponse.ok) {
      const data = await empresasResponse.json();
      console.log('   ✅ Tabela empresas acessível');
      console.log(`   📊 Registros encontrados: ${data.length}`);
    } else {
      const errorText = await empresasResponse.text();
      console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`);
    }

    // 3. Testar inserção (simulação)
    console.log('\n3️⃣ Testando inserção (simulação)...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000',
        nome: 'Teste Conexão',
        slug: 'teste-conexao-' + Date.now(),
      }),
    });

    console.log(`   Status: ${insertResponse.status} ${insertResponse.statusText}`);
    
    if (insertResponse.ok) {
      console.log('   ✅ Inserção funcionando');
    } else {
      const errorText = await insertResponse.text();
      console.log(`   ❌ Erro na inserção: ${errorText.substring(0, 200)}...`);
    }

    // 4. Testar tabela profiles
    console.log('\n4️⃣ Testando acesso à tabela profiles...');
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

    console.log('\n🎉 Teste concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Se a tabela empresas não estiver acessível, execute o SQL de configuração');
    console.log('2. Se houver erro de RLS, configure as políticas');
    console.log('3. Teste a aplicação no navegador');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEmpresasTable().catch(console.error);
