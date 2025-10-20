# 🔒 CONFIGURAÇÃO DE SEGURANÇA - AgendaCerto

## ⚠️ IMPORTANTE: CREDENCIAIS REMOVIDAS DO CÓDIGO

Todas as credenciais foram removidas do código fonte e agora devem ser configuradas via variáveis de ambiente.

## 📋 CONFIGURAÇÃO NECESSÁRIA

### 1. Criar arquivo `.env.local` na raiz do projeto:

```bash
# ===========================================
# CONFIGURAÇÕES DE SEGURANÇA - NÃO COMMITAR
# ===========================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1005292864367-ins3o5uel2istn3gmg37vrqv63t05lbj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# N8N Configuration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c
N8N_BASE_URL=http://localhost:5678

# Build Configuration
BUILD_STATIC_EXPORT=false
```

### 2. Verificar se `.gitignore` está configurado:

O arquivo `.gitignore` já está configurado corretamente para ignorar:
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

## 🔧 ARQUIVOS ATUALIZADOS

### ✅ Arquivos corrigidos:
- `src/lib/google-auth.ts` - Google Client ID movido para variável de ambiente
- `src/app/api/auth/callback/google/tokens/route.ts` - Google OAuth secrets movidos para variáveis de ambiente
- `src/lib/supabaseClient.ts` - Supabase URL e chaves movidas para variáveis de ambiente
- `src/lib/n8n-config.ts` - N8N API Key movida para variável de ambiente

### ⚠️ Arquivos que ainda precisam ser limpos:
- Scripts em `scripts/` ainda contêm credenciais hardcoded
- Arquivos de documentação em `.md` ainda contêm credenciais expostas

## 🚀 COMO EXECUTAR

1. Crie o arquivo `.env.local` com as credenciais acima
2. Execute: `npm run dev`
3. O projeto deve funcionar normalmente

## 🔒 PRÓXIMOS PASSOS DE SEGURANÇA

1. **REVOGAR** as credenciais expostas no GitHub:
   - Google OAuth Client Secret
   - N8N API Key
   - Supabase Service Key (se houver)

2. **GERAR** novas credenciais:
   - Novo Google OAuth Client Secret
   - Nova N8N API Key
   - Nova Supabase Service Key (se necessário)

3. **ATUALIZAR** o arquivo `.env.local` com as novas credenciais

4. **LIMPAR** scripts e documentação que ainda contêm credenciais

## 🔒 CORREÇÕES DE SEGURANÇA IMPLEMENTADAS

### ✅ **LOGS DE DEBUG REMOVIDOS:**
- **Signup pages:** Removidos logs que expunham `user.id`, `user.email` e dados de confirmação
- **API Routes:** Removidos logs que expunham tokens públicos e informações do sistema
- **Test pages:** Removidos logs de debug que expunham tokens e eventos

### ✅ **ARQUIVOS CORRIGIDOS:**
- `src/app/signup/page.tsx` - Logs de debug removidos
- `src/app/signup-admin/page.tsx` - Logs de debug removidos  
- `src/app/api/calendar/generate-public-token/route.ts` - Logs de tokens removidos
- `src/app/api/calendar/public/route.ts` - Logs de validação removidos
- `src/app/test/agenda/page.tsx` - Logs de tokens removidos
- `src/app/test/calendar/page.tsx` - Logs de eventos removidos

## ⚠️ AVISO DE SEGURANÇA

**NUNCA** commite arquivos `.env*` no Git. Eles estão no `.gitignore` por segurança.

**SEMPRE** use variáveis de ambiente para credenciais sensíveis.

**REVOGUE** imediatamente qualquer credencial que tenha sido exposta publicamente.

**REMOVA** logs de debug em produção que possam expor informações sensíveis.
