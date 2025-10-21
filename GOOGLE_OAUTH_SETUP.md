# 🔧 Configuração do Google OAuth para AgendaCerto

## ❌ Problema Atual
O erro "Missing required parameter: client_id" ocorre porque o Google OAuth não está configurado.

## ✅ Solução

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: "AgendaCerto"

### 2. Habilitar Google Calendar API

1. No menu lateral, vá em **APIs & Services** → **Library**
2. Procure por "Google Calendar API"
3. Clique em **Enable**

### 3. Configurar OAuth Consent Screen

1. Vá em **APIs & Services** → **OAuth consent screen**
2. Escolha **External** (para usuários externos)
3. Preencha os campos obrigatórios:
   - **App name**: AgendaCerto
   - **User support email**: seu email
   - **Developer contact information**: seu email
4. Em **Scopes**, adicione:
   - `https://www.googleapis.com/auth/calendar`
5. Em **Test users**, adicione seu email para testes

### 4. Criar Credenciais OAuth

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Escolha **Web application**
4. Configure:
   - **Name**: AgendaCerto Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:8082`
     - `https://agendacerto.vercel.app` (para produção)
   - **Authorized redirect URIs**:
     - `http://localhost:8082/api/auth/callback/google`
     - `https://agendacerto.vercel.app/api/auth/callback/google` (para produção)

### 5. Obter Client ID e Secret

1. Após criar, copie:
   - **Client ID** (algo como: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (algo como: `GOCSPX-abcdefghijklmnop`)

### 6. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl

# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# N8N API Configuration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL25jLWFnZW5kYS1jZXJ0by5vbmRldi5jb20iLCJzdWIiOiJhZG1pbiIsImF1ZCI6Imh0dHBzOi8vbmMtdWFnZW5kYS1jZXJ0by5vbmRldi5jb20iLCJleHAiOjE3Mzc0OTc2MDAsImlhdCI6MTczNzQ5NDAwMCwianRpIjoiMTIzNDU2Nzg5MCJ9.example

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:8082
```

### 7. Reiniciar o Servidor

```bash
npm run dev
```

## 🎯 Resultado Esperado

Após a configuração:
- ✅ O botão "Conectar com Google" funcionará
- ✅ Você poderá autorizar o acesso ao Google Calendar
- ✅ Os eventos serão sincronizados
- ✅ O calendário funcionará completamente

## 🚨 Importante

- **NUNCA** commite o arquivo `.env.local` no Git
- O `GOOGLE_CLIENT_SECRET` deve ser mantido em segredo
- Para produção, configure as URLs corretas no Google Cloud Console

## 📞 Suporte

Se tiver problemas:
1. Verifique se o Google Calendar API está habilitado
2. Confirme se as URLs de redirect estão corretas
3. Verifique se o OAuth consent screen está configurado
4. Teste com um usuário autorizado no "Test users"
