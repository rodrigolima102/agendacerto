# 🔧 Corrigir Confirmação de Email - Supabase

## ❌ **Problema Identificado:**
```
"Email not confirmed"
```

O Supabase está configurado para exigir confirmação de email antes de permitir login.

## ✅ **Soluções:**

### **Solução 1: Desabilitar Confirmação de Email (Recomendado para Desenvolvimento)**

**1. Acesse o Supabase Dashboard:**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione o projeto: `tqsibusymtsvpihnyieo`
- Vá para **Authentication > Settings**

**2. Desabilite a Confirmação de Email:**
- Encontre a opção **"Enable email confirmations"**
- **Desmarque** essa opção
- Clique em **"Save"**

**3. Teste novamente:**
- Acesse: `http://localhost:8082/signup`
- Crie uma conta
- Deve funcionar sem confirmação de email

### **Solução 2: Usar Admin API para Criar Usuários (Alternativa)**

Se não conseguir desabilitar a confirmação, vou modificar o código para usar a Admin API:

**1. Modificar `src/pages/signup.tsx`:**
```typescript
// Em vez de usar supabase.auth.signUp, usar Admin API
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: data.email,
  password: data.password,
  email_confirm: true, // Confirmar email automaticamente
});
```

### **Solução 3: Configurar Email de Desenvolvimento**

**1. No Supabase Dashboard:**
- Vá para **Authentication > Settings**
- Em **"SMTP Settings"**, configure:
  - **Host:** `localhost` (para desenvolvimento)
  - **Port:** `1025`
  - **Username:** `test`
  - **Password:** `test`

**2. Ou usar um serviço como MailHog:**
- Instalar MailHog para capturar emails de desenvolvimento
- Configurar SMTP para apontar para MailHog

## 🧪 **Teste Após Correção:**

### **1. Se Desabilitou a Confirmação:**
- Acesse: `http://localhost:8082/signup`
- Crie uma conta
- Deve funcionar imediatamente

### **2. Se Usou Admin API:**
- O código será modificado automaticamente
- Teste o fluxo de signup

## 📋 **Verificações:**

### **No Supabase Dashboard:**
1. **Authentication > Settings:**
   - ✅ "Enable email confirmations" desabilitado
   - ✅ Ou SMTP configurado para desenvolvimento

2. **Authentication > Users:**
   - ✅ Usuários criados sem confirmação pendente
   - ✅ Status: Confirmed

3. **Database > Tables > empresas:**
   - ✅ Empresas sendo inseridas corretamente

## 🔧 **Configuração Recomendada para Desenvolvimento:**

```sql
-- No SQL Editor do Supabase, execute:
-- (Isso pode não funcionar, mas vale tentar)
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false;
```

## 🆘 **Se Nada Funcionar:**

### **Solução Temporária:**
1. **Crie um usuário manualmente** no Supabase Dashboard
2. **Confirme o email** manualmente
3. **Teste o login** com esse usuário
4. **Verifique se a inserção da empresa funciona**

### **Solução Definitiva:**
1. **Configure SMTP** para desenvolvimento
2. **Use MailHog** ou similar
3. **Ou desabilite confirmação** de email

## 📊 **Status Atual:**

- ❌ **Confirmação de email:** Habilitada (causando erro)
- ✅ **Políticas RLS:** Configuradas corretamente
- ✅ **Tabela empresas:** Funcionando
- ✅ **Inserção com service key:** Funcionando
- 🧪 **Teste do frontend:** Pendente (aguardando correção)

## 🎯 **Próximos Passos:**

1. **Desabilite a confirmação de email** no Supabase Dashboard
2. **Teste o fluxo de signup** novamente
3. **Verifique se a empresa é inserida** corretamente
4. **Confirme o redirecionamento** para onboarding

---

**Desabilite a confirmação de email no Supabase Dashboard e teste novamente! 🎉**
