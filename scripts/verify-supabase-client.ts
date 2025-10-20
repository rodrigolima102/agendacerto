import 'dotenv/config';
import { supabase } from '../src/lib/supabaseClient';

async function verifySupabaseClient() {
  console.log('🔍 Verificando configuração do Supabase Client...\n');

  try {
    // 1. Verificar configuração do cliente
    console.log('1️⃣ Configuração do Cliente:');
    console.log('  - URL:', supabase.supabaseUrl);
    console.log('  - Anon Key:', supabase.supabaseKey?.substring(0, 20) + '...');
    
    // 2. Testar conexão básica
    console.log('\n2️⃣ Testando conexão básica...');
    const { data, error } = await supabase.from('empresas').select('id').limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalhes:', error.details);
      console.log('   Hint:', error.hint);
    } else {
      console.log('✅ Conexão funcionando');
      console.log('   Dados retornados:', data);
    }

    // 3. Verificar se está usando a URL correta
    console.log('\n3️⃣ Verificando URL:');
    const expectedUrl = 'https://tqsibusymtsvpihnyieo.supabase.co';
    const actualUrl = supabase.supabaseUrl;
    
    if (actualUrl === expectedUrl) {
      console.log('✅ URL correta:', actualUrl);
    } else {
      console.log('❌ URL incorreta!');
      console.log('   Esperada:', expectedUrl);
      console.log('   Atual:', actualUrl);
    }

    // 4. Verificar variáveis de ambiente
    console.log('\n4️⃣ Variáveis de Ambiente:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

    // 5. Testar autenticação
    console.log('\n5️⃣ Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
    } else {
      console.log('✅ Autenticação funcionando');
      console.log('   Sessão ativa:', !!authData.session);
    }

    console.log('\n🎉 Verificação concluída!');
    
    if (actualUrl !== expectedUrl) {
      console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
      console.log('   O Supabase client está usando uma URL incorreta!');
      console.log('   Isso pode causar o erro de RLS.');
      console.log('\n🔧 SOLUÇÃO:');
      console.log('   1. Verifique o arquivo .env.local');
      console.log('   2. Confirme se NEXT_PUBLIC_SUPABASE_URL está correto');
      console.log('   3. Reinicie o servidor após corrigir');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

verifySupabaseClient().catch(console.error);
