import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqsibusymtsvpihnyieo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function checkAuthSettings() {
  console.log('🔍 Verificando configurações de autenticação...\n');

  try {
    // 1. Verificar configurações de autenticação
    console.log('1️⃣ Verificando configurações de auth...');
    const authSettingsResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (authSettingsResponse.ok) {
      const authSettings = await authSettingsResponse.json();
      console.log('✅ Configurações de auth obtidas:');
      console.log('   - Email confirmation required:', authSettings.MAILER_AUTOCONFIRM);
      console.log('   - Email confirmation disabled:', authSettings.DISABLE_SIGNUP);
      console.log('   - Email confirmation URL:', authSettings.SITE_URL);
    } else {
      console.log('❌ Erro ao obter configurações de auth');
    }

    // 2. Tentar criar usuário com confirmação automática
    console.log('\n2️⃣ Testando criação de usuário...');
    const testEmail = `teste-confirm-${Date.now()}@exemplo.com`;
    const testPassword = '12345678';

    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        data: {
          email_confirm: true, // Tentar confirmar automaticamente
        },
      }),
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Usuário criado com confirmação automática');
      console.log('   - User ID:', signupData.user?.id);
      console.log('   - Email confirmed:', signupData.user?.email_confirmed_at);
      console.log('   - Session created:', !!signupData.session);

      // 3. Testar login imediatamente
      console.log('\n3️⃣ Testando login imediato...');
      const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login funcionou imediatamente');
        console.log('   - Access token:', !!loginData.access_token);
        console.log('   - User ID:', loginData.user?.id);
      } else {
        const loginError = await loginResponse.text();
        console.log('❌ Login falhou:', loginError);
      }

      // 4. Limpar usuário de teste
      console.log('\n4️⃣ Limpando usuário de teste...');
      if (signupData.user?.id) {
        const deleteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${signupData.user.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        });

        if (deleteResponse.ok) {
          console.log('✅ Usuário de teste removido');
        }
      }
    } else {
      const signupError = await signupResponse.text();
      console.log('❌ Erro no signup:', signupError);
    }

    console.log('\n🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkAuthSettings().catch(console.error);
