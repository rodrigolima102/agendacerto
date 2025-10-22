# 🧪 TESTE - Passo 3: Conexão com Google + Webhook N8N

## ✅ Pré-requisitos
- [x] Servidor rodando em `http://localhost:8082`
- [ ] Console do navegador aberto (F12)
- [ ] Usuário logado no sistema

---

## 📋 Procedimento de Teste

### **1. Abrir Console do Navegador**
- Pressione `F12`
- Vá na aba **Console**
- Mantenha aberto durante todo o processo

---

### **2. Limpar dados anteriores**

Cole e execute no console:

```javascript
// Limpar tokens e agendas antigas
localStorage.removeItem('google_tokens');
localStorage.removeItem('n8n_calendars');
console.log('✅ LocalStorage limpo!');

// Verificar se limpou
console.log('Tokens:', localStorage.getItem('google_tokens'));
console.log('Calendars:', localStorage.getItem('n8n_calendars'));
```

---

### **3. Acessar página de integrações**

```
http://localhost:8082/auth/jwt/sign-in
```

**⚠️ IMPORTANTE:** Você precisa estar **logado** no sistema. Se não estiver, faça login primeiro em:
```
http://localhost:8082/login
```

---

### **4. Clicar em "Conectar com Google"**

- Localize o botão "Conectar com Google"
- Clique nele
- Será redirecionado para o Google

---

### **5. Autorizar no Google**

- Escolha sua conta Google
- Autorize o acesso ao Google Calendar
- Aguarde o redirecionamento

---

### **6. Verificar LOGS no Console**

Você **DEVE** ver os seguintes logs:

#### ✅ **Logs esperados:**

```
🚀 Enviando dados para webhook N8N...
📅 Resposta do webhook N8N: { calendars: [...] }
✅ Agendas recebidas do N8N: { calendars: [...] }
```

#### ❌ **Se houver erro:**

```
❌ Erro ao chamar webhook N8N (não crítico): [mensagem do erro]
```

---

### **7. Verificar dados salvos no localStorage**

Cole e execute no console:

```javascript
// Verificar tokens do Google
const tokens = JSON.parse(localStorage.getItem('google_tokens') || 'null');
console.log('📦 Tokens Google:', tokens);

// Verificar agendas do N8N
const calendars = JSON.parse(localStorage.getItem('n8n_calendars') || 'null');
console.log('📅 Agendas N8N:', calendars);

// Verificar se tem access_token
if (tokens?.access_token) {
  console.log('✅ Access Token presente:', tokens.access_token.substring(0, 20) + '...');
} else {
  console.log('❌ Access Token NÃO encontrado');
}

// Verificar se tem agendas
if (calendars?.calendars) {
  console.log(`✅ ${calendars.calendars.length} agendas recebidas`);
  calendars.calendars.forEach((cal, i) => {
    console.log(`   ${i+1}. ${cal.summary || cal.name}`);
  });
} else {
  console.log('❌ Agendas NÃO encontradas');
}
```

---

## ✅ Checklist de Validação

Marque cada item conforme verificar:

### **Fluxo:**
- [ ] Consegui clicar em "Conectar com Google"
- [ ] Fui redirecionado para o Google
- [ ] Autorizei o acesso ao Calendar
- [ ] Voltei para a página de integrações

### **Logs no Console:**
- [ ] Vi o log: `🚀 Enviando dados para webhook N8N...`
- [ ] Vi o log: `📅 Resposta do webhook N8N: ...`
- [ ] Vi o log: `✅ Agendas recebidas do N8N: ...`
- [ ] NÃO vi erros relacionados ao N8N

### **LocalStorage:**
- [ ] `google_tokens` existe e tem `access_token`
- [ ] `n8n_calendars` existe e tem array de `calendars`
- [ ] Consigo ver o nome das minhas agendas do Google

---

## 🐛 Possíveis Problemas

### **❌ Problema 1: "Erro ao chamar webhook N8N"**

**Causa:** Webhook N8N não está respondendo ou retornou erro.

**Solução:**
1. Verificar se o webhook está ativo: `https://rodrigolima102.app.n8n.cloud/webhook/google-connect`
2. Testar manualmente com curl (veja abaixo)

---

### **❌ Problema 2: "companyId não encontrado"**

**Causa:** Usuário logado não tem empresa cadastrada no Supabase.

**Solução:**
1. Verificar no console se há erro relacionado a `companyId`
2. Executar no console:
```javascript
// Verificar se há empresa cadastrada
const { supabase } = await import('./src/lib/supabaseClient.js');
const { data: { user } } = await supabase.auth.getUser();
const { data: empresa } = await supabase.from('empresas').select('id').eq('user_id', user.id).single();
console.log('Empresa:', empresa);
```

---

### **❌ Problema 3: Nenhum log aparece**

**Causa:** Código não está sendo executado ou erro antes de chegar no webhook.

**Solução:**
1. Verificar no terminal do servidor se há erros
2. Verificar se o arquivo `src/app/auth/callback/google/page.tsx` tem as modificações
3. Fazer hard refresh da página (Ctrl + Shift + R)

---

## 🧪 Teste Manual do Webhook N8N

Se quiser testar o webhook diretamente (fora do fluxo), execute no console:

```javascript
// Substitua pelos seus valores reais
const testPayload = {
  companyId: 'SEU-COMPANY-ID-AQUI',
  googleAccessToken: 'SEU-ACCESS-TOKEN-AQUI'
};

fetch('https://rodrigolima102.app.n8n.cloud/webhook/google-connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload)
})
  .then(res => res.json())
  .then(data => console.log('✅ Resposta N8N:', data))
  .catch(err => console.error('❌ Erro N8N:', err));
```

---

## 📊 Resultado Esperado

Ao final do teste, você deve ter:

1. ✅ Conexão com Google bem-sucedida
2. ✅ Access Token salvo no localStorage
3. ✅ Webhook N8N chamado com sucesso
4. ✅ Lista de agendas do Google Calendar salva no localStorage
5. ✅ Logs detalhados no console

---

## 🎯 Próximo Passo

Após validar tudo acima, seguir para:

**Passo 4:** Adicionar UI para exibir as agendas na página

---

**Data:** 21/10/2025  
**Status:** Pronto para teste

