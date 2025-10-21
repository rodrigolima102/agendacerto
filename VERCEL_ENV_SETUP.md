# 🚀 Configuração de Variáveis de Ambiente na Vercel

## 📋 Variáveis que precisam ser configuradas:

### 1. Acesse o Dashboard da Vercel

1. Vá para: https://vercel.com/dashboard
2. Selecione o projeto **AgendaCerto**
3. Clique em **Settings**
4. Vá para **Environment Variables**

### 2. Adicione as seguintes variáveis:

#### Supabase (já deve estar configurado):

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tqsibusymtsvpihnyieo.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU` | Production, Preview, Development |

#### Google OAuth (NOVO - necessário adicionar):

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `[SEU_GOOGLE_CLIENT_ID].apps.googleusercontent.com` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-[SEU_CLIENT_SECRET]` | Production, Preview, Development |

#### N8N (opcional):

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `N8N_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c` | Production, Preview, Development |
| `N8N_BASE_URL` | `https://rodrigolima102.app.n8n.cloud` | Production, Preview, Development |

### 3. Como adicionar cada variável:

1. Clique em **Add New**
2. **Key**: Cole o nome da variável (ex: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
3. **Value**: Cole o valor correspondente
4. **Environments**: Selecione todos (Production, Preview, Development)
5. Clique em **Save**

### 4. Importante - Redirect URI no Google Cloud Console

Após o deploy, você precisa atualizar os **Authorized redirect URIs** no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Vá para **APIs & Services** → **Credentials**
3. Clique no seu **OAuth 2.0 Client ID**
4. Em **Authorized redirect URIs**, adicione:
   - `https://SEU-DOMINIO.vercel.app/api/auth/callback/google`
   - Exemplo: `https://agendacerto.vercel.app/api/auth/callback/google`
5. Clique em **Save**

### 5. Fazer novo deploy

Após adicionar as variáveis:

```bash
git push origin feature/google-integration
```

Ou vá na Vercel e clique em **Redeploy**

## 🔒 Segurança:

### ✅ Variáveis seguras para o frontend (NEXT_PUBLIC_*):
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Cliente público do Google
- `NEXT_PUBLIC_SUPABASE_URL` - URL pública
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública (protegida por RLS)

### 🔐 Variáveis apenas no servidor:
- `GOOGLE_CLIENT_SECRET` - NUNCA exposta ao cliente
- Usada apenas nas API Routes do Next.js

## ✅ Verificação

Após o deploy:

1. Acesse seu domínio: `https://SEU-DOMINIO.vercel.app`
2. Faça login
3. Vá para o Dashboard/Calendar
4. Clique em "Conectar com Google"
5. Deve redirecionar para o Google OAuth
6. Autorize o acesso
7. Deve voltar para o app com sucesso!

## 🐛 Troubleshooting:

### Se aparecer "Google OAuth não configurado":
- ✓ Verifique se todas as variáveis foram adicionadas
- ✓ Verifique se não há espaços extras nos valores
- ✓ Faça um redeploy

### Se aparecer erro de redirect_uri_mismatch:
- ✓ Adicione o redirect URI correto no Google Cloud Console
- ✓ Formato: `https://seu-dominio.vercel.app/api/auth/callback/google`

### Se aparecer erro 401 do Google:
- ✓ Verifique se o Client ID e Secret estão corretos
- ✓ Verifique se o Google Calendar API está habilitado
- ✓ Adicione seu email aos "Test users" se o app estiver em modo de teste

