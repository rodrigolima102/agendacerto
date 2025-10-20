import 'dotenv/config';
import { supabase } from '../src/lib/supabaseClient';

async function testEmpresaInsert() {
  console.log('🧪 Testando inserção direta na tabela empresas...\n');

  try {
    // 1. Primeiro, vamos criar um usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `teste-${Date.now()}@exemplo.com`,
      password: '12345678',
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Usuário não foi criado');
      return;
    }

    console.log('✅ Usuário criado:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // 2. Aguardar um pouco para o usuário ser processado
    console.log('\n2️⃣ Aguardando processamento do usuário...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se o usuário está disponível
    console.log('\n3️⃣ Verificando usuário...');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError) {
      console.error('❌ Erro ao obter usuário:', getUserError);
      return;
    }

    if (!user) {
      console.error('❌ Usuário não encontrado após criação');
      return;
    }

    console.log('✅ Usuário verificado:', user.id);

    // 4. Tentar inserir empresa
    console.log('\n4️⃣ Tentando inserir empresa...');
    const empresaData = {
      user_id: user.id,
      nome: 'Empresa Teste',
      slug: `empresa-teste-${Date.now()}`,
      google_connected: false,
      n8n_workflow_id: null,
      n8n_workflow_status: 'inactive',
    };

    console.log('   Dados da empresa:', empresaData);

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
      console.log('   Dados inseridos:', insertData);
    }

    // 5. Verificar se a empresa foi realmente inserida
    console.log('\n5️⃣ Verificando se a empresa foi inserida...');
    const { data: empresas, error: selectError } = await supabase
      .from('empresas')
      .select('*')
      .eq('user_id', user.id);

    if (selectError) {
      console.error('❌ Erro ao verificar empresas:', selectError);
    } else {
      console.log('✅ Empresas encontradas:', empresas?.length || 0);
      if (empresas && empresas.length > 0) {
        console.log('   Empresa:', empresas[0]);
      }
    }

    // 6. Limpar dados de teste
    console.log('\n6️⃣ Limpando dados de teste...');
    if (empresas && empresas.length > 0) {
      const { error: deleteError } = await supabase
        .from('empresas')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar empresa de teste:', deleteError);
      } else {
        console.log('✅ Empresa de teste removida');
      }
    }

    // 7. Deletar usuário de teste
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error('❌ Erro ao deletar usuário de teste:', deleteUserError);
    } else {
      console.log('✅ Usuário de teste removido');
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEmpresaInsert().catch(console.error);
