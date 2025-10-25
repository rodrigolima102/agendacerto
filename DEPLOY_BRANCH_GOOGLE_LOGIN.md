# 🚀 Deploy da Branch: feature/update-google-login

## ✅ O que foi implementado

### 1. **Rota de Inicialização OAuth** (`/api/google/auth`)
- Gera `state` aleatório para proteção CSRF
- Salva state em cookie httpOnly
- Redireciona para Google com parâmetros corretos:
  - `response_type=code` ✅
  - `access_type=offline` ✅
  - `prompt=consent` ✅
  - `scope=calendar` ✅
  - `state=xxx` ✅

### 2. **Callback OAuth Modificado** (`/api/auth/callback/google`)
- **Valida state** (proteção CSRF)
- **Troca code por tokens NO SERVIDOR** usando `grant_type=authorization_code`
- Recebe `access_token` + `refresh_token` do Google
- Salva tokens em cookie temporário
- Redireciona para `/auth/callback/google` (frontend)

### 3. **Frontend Callback Atualizado** (`/auth/callback/google/page.tsx`)
- Lê tokens do cookie (em vez de trocar code)
- Salva tokens no localStorage
- **Chama webhook N8N** com `access_token` + `refresh_token` ✅
- Logs detalhados

### 4. **Webhook N8N** (`/api/n8n/google-connect`)
- Recebe `companyId`, `googleAccessToken` e `googleRefreshToken`
- Envia todos os dados para o N8N
- Logs mostram presença do refresh_token

### 5. **Botões Atualizados**
- `src/components/google-connect/google-connect-button.tsx`
- `src/auth/view/jwt/jwt-sign-in-view.tsx`
- Ambos usam `/api/google/auth`

---

## 📊 Fluxo Completo

```
1. Usuário clica "Conectar com Google"
   ↓
2. GET /api/google/auth
   - Gera state
   - Salva em cookie
   - Redireciona para Google
   ↓
3. Google OAuth (response_type=code, access_type=offline, prompt=consent)
   ↓
4. Google redireciona: /api/auth/callback/google?code=xxx&state=xxx
   ↓
5. Servidor valida state ✅
   ↓
6. Servidor troca code por tokens ✅
   - Recebe access_token
   - Recebe refresh_token ✅
   ↓
7. Salva tokens em cookie
   ↓
8. Redireciona para /auth/callback/google (frontend)
   ↓
9. Frontend lê tokens do cookie
   ↓
10. Frontend chama N8N com:
    - companyId
    - googleAccessToken
    - googleRefreshToken ✅
   ↓
11. Sucesso!
```

---

## 🎯 Vercel Deploy

### Status:
✅ Branch enviada para GitHub: `feature/update-google-login`
✅ Vercel detectará automaticamente e fará deploy

### Acessar Deploy:
1. Vá para: https://vercel.com/dashboard
2. Procure pelo projeto **AgendaCerto**
3. Veja a lista de deployments
4. A branch `feature/update-google-login` estará lá

### URL do Preview:
Após o deploy, a Vercel criará uma URL como:
```
https://agendacerto-[hash]-[usuario].vercel.app
```

---

## ⚙️ Configuração Necessária na Vercel

### Variáveis de Ambiente (já devem estar configuradas):

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu_client_secret
```

### Google Cloud Console - Adicionar URI:

Adicione a URI de produção nas configurações OAuth:
```
https://seu-dominio.vercel.app/api/auth/callback/google
```

---

## 📋 Commits da Branch

```
1d971c2 - feat: enviar refresh_token para webhook N8N
e5cedf3 - fix: ler tokens do cookie no frontend e chamar N8N
92dc3e5 - feat: adicionar geração de state e troca de tokens no servidor
d1d0606 - fix: voltar redirect_uri para /api/auth/callback/google
33d86a9 - feat: adicionar rota /api/google/auth com proteção CSRF (state)
```

---

## ✅ Verificações

- ✅ `response_type=code` (Authorization Code Flow)
- ✅ `access_type=offline` (para refresh_token)
- ✅ `prompt=consent` (garante consentimento)
- ✅ State validado (proteção CSRF)
- ✅ Tokens trocados no servidor
- ✅ `refresh_token` enviado ao N8N
- ✅ Integração N8N mantida funcionando
- ✅ Logs detalhados

---

## 🎉 Resultado

**Agora o webhook N8N recebe:**
```json
{
  "companyId": "ff051aae-...",
  "googleAccessToken": "ya29.a0...",
  "googleRefreshToken": "1//0xxx..."
}
```

**E pode:**
- Usar `googleAccessToken` para fazer chamadas imediatas
- Salvar `googleRefreshToken` no banco para renovar tokens expirados
- Ter acesso permanente ao Google Calendar do usuário

---

## 🔍 Monitorar Deploy

Verifique em: https://vercel.com/dashboard

O deploy deve aparecer em alguns segundos após o push.

