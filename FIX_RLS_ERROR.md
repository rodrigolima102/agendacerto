# 🔧 Corrigir Erro de RLS - "Erro de configuração do banco de dados"

## ❌ Problema:
```
"Erro de configuração do banco de dados. Entre em contato com o suporte."
```

Este erro indica que as políticas RLS (Row Level Security) não estão configuradas corretamente na tabela `empresas`.

## ✅ Solução:

### **1. Acesse o Supabase Dashboard:**
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: `tqsibusymtsvpihnyieo`
4. Clique em **"SQL Editor"** no menu lateral

### **2. Execute este SQL completo:**

```sql
-- ========================================
-- SCRIPT COMPLETO PARA CORRIGIR RLS
-- ========================================

-- 1. Verificar se a tabela empresas existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'empresas';

-- 2. Habilitar RLS na tabela empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
DROP POLICY IF EXISTS "Users can view their own company" ON empresas;
DROP POLICY IF EXISTS "Users can update their own company" ON empresas;
DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;
DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;

-- 4. Criar políticas RLS corretas
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

-- 5. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas'
ORDER BY policyname;
```

### **3. Verificar se Funcionou:**

Após executar o SQL, você deve ver:
- ✅ **Tabela empresas existe**
- ✅ **RLS habilitado**
- ✅ **5 políticas criadas**

### **4. Testar a Aplicação:**

1. **Acesse:** `http://localhost:8082/signup`
2. **Preencha o formulário:**
   - Email: `teste@exemplo.com`
   - Senha: `12345678`
   - Nome da empresa: `Minha Empresa`
3. **Clique em "Criar Conta"**
4. **Verifique se não há mais erro de RLS** ✅

## 🔍 Verificações Adicionais:

### **Se a Tabela Não Existir:**
Execute este SQL primeiro:
```sql
-- Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    google_connected BOOLEAN DEFAULT FALSE,
    n8n_workflow_id TEXT,
    n8n_workflow_status TEXT DEFAULT 'inactive',
    n8n_cred_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Verificar no Dashboard:**
1. **Database > Tables > empresas** - Deve mostrar a tabela
2. **Database > Tables > empresas > Policies** - Deve mostrar 5 políticas
3. **Authentication > Users** - Deve mostrar usuários criados

## 🆘 Se Ainda Houver Problemas:

### **1. Verificar RLS:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empresas';
```

### **2. Verificar Políticas:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas';
```

### **3. Testar Inserção Manual:**
```sql
-- Testar inserção (substitua o user_id por um real)
INSERT INTO empresas (user_id, nome, slug) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 'teste');
```

## 📋 Checklist de Verificação:

- [ ] ✅ SQL executado no Supabase Dashboard
- [ ] ✅ RLS habilitado na tabela empresas
- [ ] ✅ 5 políticas RLS criadas
- [ ] ✅ Tabela empresas existe e está acessível
- [ ] ✅ Página de signup testada
- [ ] ✅ Empresa criada no banco de dados
- [ ] ✅ Redirecionamento para onboarding funcionando

## 🎯 Resultado Esperado:

Após executar o script SQL:
- ✅ Erro de RLS resolvido
- ✅ Criação de conta funcionando
- ✅ Empresa sendo inserida no banco
- ✅ Redirecionamento para onboarding

---

**Execute o script SQL no Supabase Dashboard e o erro será resolvido! 🎉**
