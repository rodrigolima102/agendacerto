# 🧪 Teste do Signup Corrigido - Sessão de Autenticação

## ✅ **Problema Identificado e Corrigido:**

**Problema:** `"new row violates row-level security policy for table "empresas"`

**Causa:** O `signup` estava criando o usuário mas **não criava uma sessão ativa**, então o RLS não conseguia verificar `auth.uid()`.

**Solução:** Adicionado login automático após signup para garantir que a sessão seja criada.

## 🔧 **Correções Implementadas:**

### **1. Debug Melhorado:**
- ✅ Logs antes e depois do signup
- ✅ Verificação de sessão ativa
- ✅ Logs detalhados do processo

### **2. Correção da Sessão:**
- ✅ Verifica se há sessão após signup
- ✅ Se não há sessão, faz login automaticamente
- ✅ Garante que `auth.uid()` funcione no RLS

### **3. Fluxo Corrigido:**
```typescript
// 1. Criar usuário
const { data: authData } = await supabase.auth.signUp({...});

// 2. Verificar sessão
if (!authData.session) {
  // 3. Fazer login para criar sessão
  const { data: loginData } = await supabase.auth.signInWithPassword({...});
  user = loginData.user;
}

// 4. Inserir empresa (agora com sessão ativa)
await supabase.from('empresas').insert({...});
```

## 🧪 **Teste do Fluxo Corrigido:**

### **1. Acesse a Página:**
```
http://localhost:8082/signup
```

### **2. Abra o Console do Navegador** (F12 → Console)

### **3. Preencha o Formulário:**
- **Email:** `teste@exemplo.com`
- **Senha:** `12345678`
- **Nome da Empresa:** `Minha Empresa Teste`

### **4. Clique em "Criar Conta"**

### **5. Observe os Logs Esperados:**

```
🔍 DEBUG - Após signup:
  - user.id: [UUID do usuário]
  - session: false

⚠️  Sem sessão após signup, fazendo login...

✅ Sessão criada após login
  - user.id: [UUID do usuário]
  - session: true

🔍 DEBUG - Antes do insert da empresa:
  - user.id: [UUID do usuário]
  - user.email: teste@exemplo.com
  - nome da empresa: Minha Empresa Teste
  - slug: minha-empresa-teste
  - Supabase URL: https://tqsibusymtsvpihnyieo.supabase.co

🔍 DEBUG - Após o insert da empresa:
  - empresaError: null

✅ Empresa inserida com sucesso!
```

## 📋 **Verificações no Supabase Dashboard:**

### **1. Authentication > Users:**
- ✅ Deve aparecer o usuário `teste@exemplo.com`
- ✅ Status: Confirmed

### **2. Database > Tables > empresas:**
- ✅ Deve aparecer uma nova empresa
- ✅ `user_id` deve corresponder ao UUID do usuário
- ✅ `nome` deve ser "Minha Empresa Teste"

### **3. Database > Tables > empresas > Policies:**
- ✅ Deve mostrar 5 políticas RLS ativas
- ✅ Política de INSERT deve permitir inserção

## 🎯 **Resultados Esperados:**

### **✅ Sucesso:**
- Console mostra logs de debug completos
- Sessão é criada após login
- user.id é um UUID válido
- empresaError é null
- Empresa aparece na tabela do Supabase
- Redirecionamento para onboarding funciona

### **❌ Se Ainda Houver Erro:**
- Verificar se as políticas RLS estão corretas
- Executar o SQL de configuração no Dashboard
- Verificar se a tabela empresas existe

## 🔧 **Se o Erro Persistir:**

Execute este SQL no Supabase Dashboard:
```sql
-- Verificar políticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas';

-- Recriar política de INSERT se necessário
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
```

## 📊 **Status dos Testes:**

- ✅ **Configuração do Supabase:** Funcionando
- ✅ **Políticas RLS:** Configuradas corretamente
- ✅ **Inserção com service key:** Funcionando
- ✅ **Correção da sessão:** Implementada
- 🧪 **Teste do frontend:** Pendente

---

**Execute o teste e me informe se o erro foi resolvido! 🎉**
