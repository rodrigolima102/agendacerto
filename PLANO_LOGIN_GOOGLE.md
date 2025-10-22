# 📋 PLANO: Integração do botão "Conectar com Google" com webhook N8N

## 🎯 Objetivo
Quando o usuário clicar em "Conectar com Google", enviar o access token para o webhook N8N e exibir a lista de agendas do Google Calendar.

---

## ✅ Progresso Atual

### ✔️ CONCLUÍDO:

#### **Passo 1: Criar função helper para chamar webhook N8N**
- ✅ Arquivo criado: `src/lib/n8n-webhook.ts`
- ✅ Função: `sendGoogleConnectionToN8N(companyId, googleAccessToken)`
- ✅ Faz POST para: `https://rodrigolima102.app.n8n.cloud/webhook/google-connect`
- ✅ Retorna lista de agendas
- ✅ Logs no console
- ✅ Tratamento de erros

#### **Passo 2: Modificar callback do Google**
- ✅ Arquivo modificado: `src/app/auth/callback/google/page.tsx`
- ✅ Importa `sendGoogleConnectionToN8N` e `supabase`
- ✅ Busca `companyId` do Supabase após OAuth
- ✅ Chama webhook N8N com `companyId` e `access_token`
- ✅ Salva resposta em `localStorage` (`n8n_calendars`)
- ✅ Logs detalhados no console
- ✅ Não bloqueia fluxo principal em caso de erro

---

## 📝 Próximos Passos

### ⏭️ Passo 3: Testar localmente
**Status:** Pendente

**Como testar:**
1. Abrir Console do navegador (F12)
2. Acessar `http://localhost:8082/auth/jwt/sign-in`
3. Desconectar do Google (se já conectado)
4. Limpar localStorage: `localStorage.clear()`
5. Clicar em "Conectar com Google"
6. Autorizar no Google
7. Observar logs no console:
   - `🚀 Enviando dados para webhook N8N...`
   - `📅 Resposta do webhook N8N: { ... }`
   - `✅ Agendas recebidas do N8N: { ... }`

**O que verificar:**
- ✅ `companyId` foi encontrado?
- ✅ `access_token` foi enviado?
- ✅ Webhook N8N respondeu?
- ✅ Resposta contém as agendas?

---

### ⏭️ Passo 4: Adicionar UI para exibir agendas
**Status:** Não iniciado

**Arquivo a modificar:** `src/auth/view/jwt/jwt-sign-in-view.tsx`

**Implementação:**
1. Adicionar estado para armazenar lista de agendas
2. Ler `localStorage.getItem('n8n_calendars')` ao carregar página
3. Renderizar lista de agendas abaixo do botão "Conectar com Google"
4. Exibir `summary` de cada agenda
5. Adicionar loading state
6. Adicionar tratamento de erro

**UI sugerida:**
```jsx
{calendars && calendars.length > 0 && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="h6">Suas Agendas Google:</Typography>
    <List>
      {calendars.map((calendar) => (
        <ListItem key={calendar.id}>
          <Chip label={calendar.summary} />
        </ListItem>
      ))}
    </List>
  </Box>
)}
```

---

## 🔄 Fluxo Completo Implementado

```
1. Usuário clica "Conectar com Google"
   ↓
2. Redirect para Google OAuth
   ↓
3. Google retorna com código
   ↓
4. Callback troca código por tokens (access_token)
   ↓
5. Salva tokens no localStorage
   ↓
6. Busca companyId no Supabase
   ↓
7. ✅ POST para webhook N8N com { companyId, googleAccessToken }
   ↓
8. ✅ N8N retorna lista de agendas
   ↓
9. ✅ Salva lista no localStorage
   ↓
10. Redireciona para página de integrações
   ↓
11. ⏭️ [PRÓXIMO] Renderiza lista de agendas abaixo do botão
```

---

## 📂 Arquivos Modificados/Criados

### ✅ Criados:
- `src/lib/n8n-webhook.ts`

### ✅ Modificados:
- `src/app/auth/callback/google/page.tsx`

### ⏭️ A modificar:
- `src/auth/view/jwt/jwt-sign-in-view.tsx` (Passo 4)

---

## 💡 Detalhes Técnicos

### Payload enviado ao webhook N8N:
```json
{
  "companyId": "uuid-da-empresa-do-supabase",
  "googleAccessToken": "ya29.a0..."
}
```

### Resposta esperada do N8N:
```json
{
  "calendars": [
    { "id": "...", "summary": "Agenda Principal" },
    { "id": "...", "summary": "Trabalho" }
  ]
}
```

### Armazenamento:
- **Tokens Google:** `localStorage.getItem('google_tokens')`
- **Agendas N8N:** `localStorage.getItem('n8n_calendars')`

---

## 🐛 Tratamento de Erros

- ✅ Erro no webhook N8N não bloqueia conexão do Google
- ✅ Logs detalhados no console para debug
- ✅ Try-catch em todos os pontos críticos
- ⏭️ [Passo 4] Exibir mensagem de erro na UI

---

## 📌 Notas Importantes

1. **Branch atual:** `login-google`
2. **Webhook N8N:** `https://rodrigolima102.app.n8n.cloud/webhook/google-connect`
3. **Ambiente:** Local (`http://localhost:8082`)
4. **Não bloqueia:** Se N8N falhar, Google ainda conecta

---

## ✅ Checklist de Validação

### Funcionalidades:
- [x] Função helper criada
- [x] Callback modificado
- [x] Busca companyId do Supabase
- [x] Envia POST para webhook N8N
- [ ] Testa conexão localmente
- [ ] Resposta salva no localStorage
- [ ] Lista de agendas renderizada na UI
- [ ] Loading state funciona
- [ ] Tratamento de erros na UI

### Qualidade:
- [x] Sem erros de linting
- [x] Console.logs informativos
- [x] Try-catch implementado
- [ ] UI responsiva
- [ ] Testes realizados

---

## 🚀 Como Retomar o Trabalho

1. Abrir branch `login-google`:
   ```bash
   git checkout login-google
   ```

2. Verificar arquivos modificados:
   ```bash
   git status
   ```

3. Continuar no **Passo 3: Testar localmente**

4. Após testes, implementar **Passo 4: UI para exibir agendas**

---

**Última atualização:** 21/10/2025
**Status:** Em desenvolvimento - Passo 2 concluído, aguardando testes


