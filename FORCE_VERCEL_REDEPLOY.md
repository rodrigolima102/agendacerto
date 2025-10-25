# 🔄 Forçar Redeploy na Vercel

## O código correto está no GitHub, mas a Vercel pode estar usando cache.

### ✅ Verificar no GitHub:

Acesse: https://github.com/rodrigolima102/agendacerto/tree/feature/update-google-login

Verifique o arquivo `src/app/api/n8n/google-connect/route.ts` - deve conter `googleRefreshToken`.

### 🔄 Forçar Novo Deploy na Vercel:

#### Opção 1: Via Dashboard (Recomendado)
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **AgendaCerto**
3. Vá para **Deployments**
4. Encontre o deployment da branch `feature/update-google-login`
5. Clique nos **3 pontinhos** (...)
6. Clique em **Redeploy**
7. Marque **Use existing Build Cache**: **DESMARCAR** ✅
8. Clique em **Redeploy**

#### Opção 2: Fazer commit vazio (força novo build)
```bash
git commit --allow-empty -m "chore: force vercel redeploy"
git push origin feature/update-google-login
```

#### Opção 3: Modificar arquivo e fazer push
Fazer qualquer pequena alteração (adicionar comentário) e fazer push.

---

## ✅ Como Confirmar que Funcionou

Após o deploy, teste novamente e verifique nos logs da Vercel:

```
✅ [Auth Callback] Tokens recebidos do Google
  - access_token: Presente
  - refresh_token: Presente ✅

🚀 [API Route] Enviando dados para webhook N8N...
   Refresh Token: Presente ✅
```

---

## 🔍 Verificar Logs na Vercel

1. Acesse: https://vercel.com/dashboard
2. Projeto **AgendaCerto**
3. Deployment da branch `feature/update-google-login`
4. Clique em **View Function Logs**
5. Teste o login do Google
6. Verifique se aparece: `Refresh Token: Presente ✅`

