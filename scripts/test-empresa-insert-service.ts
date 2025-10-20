import 'dotenv/config';

const SUPABASE_URL = 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO';

async function testEmpresaInsertWithServiceKey() {
  console.log('🧪 Testando inserção com service key...\n');

  try {
    // 1. Primeiro, vamos criar um usuário usando a API REST
    console.log('1️⃣ Criando usuário via API REST...');
    const userEmail = `teste-${Date.now()}@exemplo.com`;
    const userPassword = '12345678';

    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
      }),
    });

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('❌ Erro ao criar usuário:', errorText);
      return;
    }

    const userData = await createUserResponse.json();
    const userId = userData.id;
    console.log('✅ Usuário criado:', userId);
    console.log('   Email:', userEmail);

    // 2. Aguardar um pouco
    console.log('\n2️⃣ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Tentar inserir empresa usando service key
    console.log('\n3️⃣ Tentando inserir empresa...');
    const empresaData = {
      user_id: userId,
      nome: 'Empresa Teste',
      slug: `empresa-teste-${Date.now()}`,
      google_connected: false,
      n8n_workflow_id: null,
      n8n_workflow_status: 'inactive',
    };

    console.log('   Dados da empresa:', empresaData);

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(empresaData),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('❌ Erro na inserção:', errorText);
      
      // Tentar inserir sem RLS para testar
      console.log('\n4️⃣ Tentando inserir sem RLS (teste)...');
      const insertWithoutRLSResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'X-Client-Info': 'supabase-js-web',
        },
        body: JSON.stringify(empresaData),
      });

      if (!insertWithoutRLSResponse.ok) {
        const errorText2 = await insertWithoutRLSResponse.text();
        console.error('❌ Erro mesmo sem RLS:', errorText2);
      } else {
        const successData = await insertWithoutRLSResponse.json();
        console.log('✅ Inserção funcionou sem RLS:', successData);
      }
    } else {
      const insertData = await insertResponse.json();
      console.log('✅ Empresa inserida com sucesso!');
      console.log('   Dados inseridos:', insertData);
    }

    // 4. Verificar se a empresa foi inserida
    console.log('\n5️⃣ Verificando empresas...');
    const selectResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (selectResponse.ok) {
      const empresas = await selectResponse.json();
      console.log('✅ Empresas encontradas:', empresas.length);
      if (empresas.length > 0) {
        console.log('   Empresa:', empresas[0]);
      }
    } else {
      const errorText = await selectResponse.text();
      console.error('❌ Erro ao verificar empresas:', errorText);
    }

    // 5. Limpar dados de teste
    console.log('\n6️⃣ Limpando dados de teste...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/empresas?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (deleteResponse.ok) {
      console.log('✅ Empresa de teste removida');
    }

    // 6. Deletar usuário de teste
    const deleteUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (deleteUserResponse.ok) {
      console.log('✅ Usuário de teste removido');
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEmpresaInsertWithServiceKey().catch(console.error);
