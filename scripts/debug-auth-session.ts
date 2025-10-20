import 'dotenv/config';
import { supabase } from '../src/lib/supabaseClient';

async function debugAuthSession() {
  console.log('🔍 Debugando sessão de autenticação...\n');

  try {
    // 1. Verificar configuração do cliente
    console.log('1️⃣ Configuração do Cliente:');
    console.log('   URL:', supabase.supabaseUrl);
    console.log('   Anon Key:', supabase.supabaseKey?.substring(0, 20) + '...');

    // 2. Verificar sessão atual
    console.log('\n2️⃣ Verificando sessão atual:');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError);
    } else {
      console.log('✅ Sessão verificada');
      console.log('   Sessão ativa:', !!sessionData.session);
      if (sessionData.session) {
        console.log('   User ID:', sessionData.session.user.id);
        console.log('   Email:', sessionData.session.user.email);
      }
    }

    // 3. Verificar usuário atual
    console.log('\n3️⃣ Verificando usuário atual:');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError);
      console.error('   Código:', userError.message);
    } else {
      console.log('✅ Usuário verificado');
      console.log('   User ID:', userData.user?.id);
      console.log('   Email:', userData.user?.email);
    }

    // 4. Testar signup
    console.log('\n4️⃣ Testando signup...');
    const testEmail = `teste-auth-${Date.now()}@exemplo.com`;
    const testPassword = '12345678';

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError) {
      console.error('❌ Erro no signup:', signupError);
    } else {
      console.log('✅ Signup realizado');
      console.log('   User ID:', signupData.user?.id);
      console.log('   Email:', signupData.user?.email);
      console.log('   Session:', !!signupData.session);

      // 5. Verificar se o usuário está disponível imediatamente
      console.log('\n5️⃣ Verificando usuário após signup:');
      const { data: userData2, error: userError2 } = await supabase.auth.getUser();
      
      if (userError2) {
        console.error('❌ Erro ao obter usuário após signup:', userError2);
      } else {
        console.log('✅ Usuário disponível após signup');
        console.log('   User ID:', userData2.user?.id);
        console.log('   Email:', userData2.user?.email);
      }

      // 6. Testar inserção de empresa
      if (signupData.user) {
        console.log('\n6️⃣ Testando inserção de empresa...');
        const empresaData = {
          user_id: signupData.user.id,
          nome: 'Empresa Teste Auth',
          slug: `empresa-teste-auth-${Date.now()}`,
          google_connected: false,
          n8n_workflow_id: null,
          n8n_workflow_status: 'inactive',
        };

        const { data: insertData, error: insertError } = await supabase
          .from('empresas')
          .insert(empresaData)
          .select();

        if (insertError) {
          console.error('❌ Erro na inserção:', insertError);
          console.error('   Código:', insertError.code);
          console.error('   Mensagem:', insertError.message);
          console.error('   Detalhes:', insertError.details);
          console.error('   Hint:', insertError.hint);
        } else {
          console.log('✅ Empresa inserida com sucesso!');
          console.log('   Dados:', insertData);
        }
      }

      // 7. Limpar dados de teste
      console.log('\n7️⃣ Limpando dados de teste...');
      if (signupData.user) {
        // Tentar deletar empresa
        const { error: deleteError } = await supabase
          .from('empresas')
          .delete()
          .eq('user_id', signupData.user.id);

        if (deleteError) {
          console.error('❌ Erro ao deletar empresa:', deleteError);
        } else {
          console.log('✅ Empresa de teste removida');
        }
      }
    }

    console.log('\n🎉 Debug concluído!');

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
}

debugAuthSession().catch(console.error);
