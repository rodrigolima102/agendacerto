# 🚀 Configuração Local do Google OAuth - AgendaCerto

## ⚠️ IMPORTANTE: Arquivo .env.local Necessário

O arquivo `.env.local` está bloqueado pelo Git (por segurança) e deve ser criado manualmente.

## 📝 Passo a Passo:

### 1. Crie o arquivo `.env.local` na raiz do projeto:

**Caminho**: `C:\Users\rodri\OneDrive\Documentos\AgendaCerto\agendaCerto\AgendaCerto\agenda_next-ts\.env.local`

### 2. Copie e cole este conteúdo no arquivo:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2lidXN5bXRzdnBpaG55aWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM5MDUsImV4cCI6MjA3NjQ2OTkwNX0.So7QymisJXxTqb-w2lx1_8NSvKrxFcnSEdxIL8SrfdU

# Google OAuth Configuration (OBRIGATÓRIO para o calendário funcionar)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1005292864367-ins3o5uel2istn3gmg37vrqv63t05lbj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# N8N API Configuration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c
N8N_BASE_URL=https://rodrigolima102.app.n8n.cloud

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:8082
```

### 3. Salve o arquivo

### 4. Reinicie o servidor:

```bash
# Se o servidor estiver rodando, pare com Ctrl+C
npm run dev
```

### 5. Teste a configuração:

```bash
npx tsx scripts/test-google-oauth-config.ts
```

Você deve ver: ✅ Todas as configurações estão presentes!

## 🔒 Segurança:

### ✅ O que é seguro expor no frontend:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Cliente público do Google (necessário no navegador)
- `NEXT_PUBLIC_SUPABASE_URL` - URL pública do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública do Supabase (protegida por RLS)

### ❌ O que NUNCA é exposto no frontend:
- `GOOGLE_CLIENT_SECRET` - Usada APENAS nas API Routes (servidor)
- Processada no Next.js backend, nunca enviada ao navegador

## 🎯 Como funciona:

1. **Frontend (navegador)**: Usa `NEXT_PUBLIC_GOOGLE_CLIENT_ID` para iniciar o OAuth
2. **Backend (servidor)**: Usa `GOOGLE_CLIENT_SECRET` para trocar o código por tokens
3. **Result**: Client Secret nunca é exposta ao usuário

## ✅ Verificação de Segurança:

- ✅ `.env.local` está no `.gitignore` (não será commitado)
- ✅ Client Secret só é usada em API Routes (servidor)
- ✅ Variáveis `NEXT_PUBLIC_*` são as únicas expostas no frontend
- ✅ RLS (Row Level Security) protege os dados do Supabase

## 🚀 Após configurar:

1. Acesse: http://localhost:8082/dashboard/calendar
2. Clique em "Conectar com Google"
3. Autorize o acesso ao Google Calendar
4. Comece a usar o calendário!

## 🔍 Troubleshooting:

Se aparecer erro "Google OAuth não configurado":
1. Verifique se o arquivo `.env.local` existe
2. Verifique se não há espaços extras nas variáveis
3. Reinicie o servidor
4. Execute o script de teste novamente

