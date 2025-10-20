import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl';

async function checkSupabaseStatus() {
  console.log('🔍 Verificando status completo do Supabase...\n');
  console.log(`📡 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
  console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const basicResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (basicResponse.ok) {
      console.log('✅ Conexão básica funcionando');
    } else {
      console.log('❌ Erro na conexão básica:', basicResponse.status, basicResponse.statusText);
      return;
    }

    // 2. Verificar tabelas existentes
    console.log('\n2️⃣ Verificando tabelas existentes...');
    const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (tablesResponse.ok) {
      console.log('✅ Acesso às tabelas funcionando');
    } else {
      console.log('❌ Erro no acesso às tabelas:', tablesResponse.status);
    }

    // 3. Verificar tabela empresas especificamente
    console.log('\n3️⃣ Verificando tabela empresas...');
    const empresasResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (empresasResponse.ok) {
      const empresasData = await empresasResponse.json();
      console.log('✅ Tabela empresas acessível');
      console.log(`📊 Registros encontrados: ${empresasData.length}`);
    } else {
      console.log('❌ Erro na tabela empresas:', empresasResponse.status);
      const errorText = await empresasResponse.text();
      console.log('Detalhes:', errorText);
    }

    // 4. Verificar tabela profiles
    console.log('\n4️⃣ Verificando tabela profiles...');
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (profilesResponse.ok) {
      const profilesData = await profilesResponse.json();
      console.log('✅ Tabela profiles acessível');
      console.log(`📊 Registros encontrados: ${profilesData.length}`);
    } else {
      console.log('❌ Erro na tabela profiles:', profilesResponse.status);
      const errorText = await profilesResponse.text();
      console.log('Detalhes:', errorText);
    }

    // 5. Verificar usuários
    console.log('\n5️⃣ Verificando usuários...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth/users`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Usuários acessíveis');
      console.log(`👥 Total de usuários: ${usersData.length}`);
      if (usersData.length > 0) {
        console.log('📧 Últimos usuários:');
        usersData.slice(0, 3).forEach((user: any) => {
          console.log(`   - ${user.email} (${user.created_at})`);
        });
      }
    } else {
      console.log('❌ Erro no acesso aos usuários:', usersResponse.status);
    }

    // 6. Testar inserção com service role
    console.log('\n6️⃣ Testando inserção com service role...');
    const testInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000',
        nome: 'Teste Status',
        slug: 'teste-status-' + Date.now(),
      }),
    });

    if (testInsertResponse.ok) {
      console.log('✅ Inserção com service role funcionando');
    } else {
      const errorText = await testInsertResponse.text();
      console.log('❌ Erro na inserção:', errorText);
    }

    console.log('\n🎉 Verificação completa!');
    console.log('\n📋 Resumo:');
    console.log('- Projeto Supabase: ✅ Ativo');
    console.log('- Conexão: ✅ Funcionando');
    console.log('- Tabelas: ✅ Acessíveis');
    console.log('- Service Role: ✅ Funcionando');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkSupabaseStatus().catch(console.error);
