# 🧪 Teste do Fluxo de Cadastro - Debug Completo

## ✅ **Configuração Verificada:**
- ✅ Supabase client configurado corretamente
- ✅ URL correta: `https://tqsibusymtsvpihnyieo.supabase.co`
- ✅ Anon key funcionando
- ✅ Conexão com banco funcionando
- ✅ Console.logs adicionados para debug

## 🧪 **Teste do Fluxo Completo:**

### **1. Acesse a Página de Signup:**
```
http://localhost:8082/signup
```

### **2. Abra o Console do Navegador:**
- **Chrome/Edge:** F12 → Console
- **Firefox:** F12 → Console
- **Safari:** Cmd+Option+I → Console

### **3. Preencha o Formulário:**
- **Email:** `teste@exemplo.com`
- **Senha:** `12345678`
- **Nome da Empresa:** `Minha Empresa Teste`

### **4. Clique em "Criar Conta"**

### **5. Observe os Logs no Console:**

**Logs esperados:**
```
🔍 DEBUG - Antes do insert da empresa:
  - user.id: [UUID do usuário]
  - user.email: teste@exemplo.com
  - nome da empresa: Minha Empresa Teste
  - slug: minha-empresa-teste
  - Supabase URL: https://tqsibusymtsvpihnyieo.supabase.co

🔍 DEBUG - Após o insert da empresa:
  - empresaError: null (se sucesso) ou [objeto de erro]

✅ Empresa inserida com sucesso!
```

## 🔍 **Análise dos Logs:**

### **Se o user.id estiver correto:**
- ✅ O problema está nas políticas RLS
- ✅ Execute o SQL no Supabase Dashboard

### **Se o user.id estiver null/undefined:**
- ❌ Problema na autenticação
- ❌ Verificar se o signup está funcionando

### **Se houver erro específico:**
- ❌ Analisar o código de erro
- ❌ Verificar se as políticas RLS estão corretas

## 📋 **Verificações no Supabase Dashboard:**

### **1. Authentication > Users:**
- Deve aparecer o usuário `teste@exemplo.com`
- Copie o UUID do usuário

### **2. Database > Tables > empresas:**
- Deve aparecer uma nova empresa
- Verificar se o `user_id` corresponde ao UUID do usuário

### **3. Database > Tables > empresas > Policies:**
- Deve mostrar 5 políticas RLS
- Verificar se estão ativas

## 🆘 **Se o Erro Persistir:**

### **1. Verificar Políticas RLS:**
Execute este SQL no Supabase Dashboard:
```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empresas';
```

### **2. Recriar Políticas RLS:**
```sql
-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
DROP POLICY IF EXISTS "Users can view their own company" ON empresas;
DROP POLICY IF EXISTS "Users can update their own company" ON empresas;
DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;
DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;

-- Recriar políticas
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON empresas
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company" ON empresas
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');
```

## 📊 **Resultados Esperados:**

### **✅ Sucesso:**
- Console mostra logs de debug
- user.id é um UUID válido
- empresaError é null
- Empresa aparece na tabela do Supabase
- Redirecionamento para onboarding

### **❌ Falha:**
- Console mostra erro específico
- Analisar o código de erro
- Verificar políticas RLS
- Executar SQL de correção

## 🎯 **Próximos Passos:**

1. **Execute o teste** com os dados fornecidos
2. **Observe os logs** no console
3. **Verifique no Supabase Dashboard** se a empresa foi criada
4. **Reporte os resultados** para análise

---

**Execute o teste e me informe os logs que aparecem no console! 🔍**
