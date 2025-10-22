# 🔧 Configuração do Google OAuth para AgendaCerto

## ❌ Problema Atual
O erro "Google OAuth não configurado" ocorre porque as variáveis de ambiente do Google não estão configuradas.

## ✅ Solução Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **Select a project** → **NEW PROJECT**
3. Nome do projeto: **AgendaCerto**
4. Clique em **CREATE**

### 2. Habilitar Google Calendar API

1. No menu lateral (☰), vá em **APIs & Services** → **Library**
2. Procure por **"Google Calendar API"**
3. Clique nela e depois em **ENABLE**
4. Aguarde a ativação

### 3. Configurar OAuth Consent Screen

1. Vá em **APIs & Services** → **OAuth consent screen**
2. Escolha **External** e clique em **CREATE**
3. Preencha os campos:
   - **App name**: `AgendaCerto`
   - **User support email**: Seu email
   - **Developer contact information**: Seu email
4. Clique em **SAVE AND CONTINUE**

5. Em **Scopes**, clique em **ADD OR REMOVE SCOPES**
   - Procure por `calendar` e marque:
     - `https://www.googleapis.com/auth/calendar` ✓
   - Clique em **UPDATE** e depois **SAVE AND CONTINUE**

6. Em **Test users**, clique em **ADD USERS**
   - Adicione seu email para testes
   - Clique em **SAVE AND CONTINUE**

7. Revise e clique em **BACK TO DASHBOARD**

### 4. Criar Credenciais OAuth

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Escolha **Web application**
4. Configure:
   
   **Name**: `AgendaCerto Web Client`
   
   **Authorized JavaScript origins**:
   - `http://localhost:8082`
   - `https://seu-dominio.vercel.app` (adicione quando tiver o domínio de produção)
   
   **Authorized redirect URIs**:
   - `http://localhost:8082/api/auth/callback/google`
   - `https://seu-dominio.vercel.app/api/auth/callback/google` (adicione quando tiver o domínio)

5. Clique em **CREATE**

### 5. Copiar Client ID e Secret

Após criar, você verá uma janela com:
- **Client ID**: `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456ghi789`

**⚠️ IMPORTANTE**: Copie ambos e guarde em local seguro!

### 6. Configurar Variáveis de Ambiente

**Para Desenvolvimento Local:**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU

# Google OAuth Configuration (COPIE DO GOOGLE CLOUD CONSOLE)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI

# N8N API Configuration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL25jLWFnZW5kYS1jZXJ0by5vbmRldi5jb20iLCJzdWIiOiJhZG1pbiIsImF1ZCI6Imh0dHBzOi8vbmMtdWFnZW5kYS1jZXJ0by5vbmRldi5jb20iLCJleHAiOjE3Mzc0OTc2MDAsImlhdCI6MTczNzQ5NDAwMCwianRpIjoiMTIzNDU2Nzg5MCJ9.example
```

**Para Produção (Vercel):**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Seu Client ID
   - `GOOGLE_CLIENT_SECRET` = Seu Client Secret
5. Clique em **Save**
6. Faça um novo deploy

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
