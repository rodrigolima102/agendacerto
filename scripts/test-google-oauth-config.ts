// Script para testar configuração do Google OAuth
import 'dotenv/config';

console.log('🔍 Verificando configuração do Google OAuth...\n');

// Verificar variáveis de ambiente
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8082';

console.log('📋 Variáveis de ambiente:');
console.log(`✓ NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${clientId ? '✅ Configurado' : '❌ Não encontrado'}`);
console.log(`✓ GOOGLE_CLIENT_SECRET: ${clientSecret ? '✅ Configurado' : '❌ Não encontrado'}`);
console.log(`✓ NEXT_PUBLIC_APP_URL: ${appUrl}\n`);

if (clientId) {
  console.log('🔑 Client ID (primeiros 30 caracteres):');
  console.log(`   ${clientId.substring(0, 30)}...\n`);
}

if (clientSecret) {
  console.log('🔐 Client Secret (formato):');
  console.log(`   ${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 5)}\n`);
}

// Verificar formato do redirect URI
const redirectUri = `${appUrl}/api/auth/callback/google`;
console.log('🔗 Redirect URI configurado:');
console.log(`   ${redirectUri}\n`);

// Verificar se todas as configurações estão presentes
if (clientId && clientSecret) {
  console.log('✅ Todas as configurações estão presentes!\n');
  
  console.log('📝 Próximos passos:');
  console.log('1. Verifique se o Redirect URI está configurado no Google Cloud Console');
  console.log('2. Certifique-se de que o Google Calendar API está habilitado');
  console.log('3. Adicione seu email aos "Test users" no OAuth Consent Screen');
  console.log('4. Reinicie o servidor: npm run dev');
  console.log('5. Teste a conexão com o Google Calendar no dashboard\n');
} else {
  console.log('❌ Configuração incompleta!\n');
  
  console.log('📝 O que fazer:');
  console.log('1. Crie o arquivo .env.local na raiz do projeto');
  console.log('2. Copie o conteúdo de env-template.txt');
  console.log('3. Reinicie o servidor: npm run dev\n');
}

// Teste de formato do Client ID
if (clientId && !clientId.includes('.apps.googleusercontent.com')) {
  console.log('⚠️ AVISO: O Client ID pode estar no formato incorreto.');
  console.log('   Deve terminar com .apps.googleusercontent.com\n');
}

// Teste de formato do Client Secret
if (clientSecret && !clientSecret.startsWith('GOCSPX-')) {
  console.log('⚠️ AVISO: O Client Secret pode estar no formato incorreto.');
  console.log('   Deve começar com GOCSPX-\n');
}

