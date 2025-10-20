# 🔧 Guia para Corrigir Erro de RLS no Supabase

## ❌ Problema:
```
"new row violates row-level security policy for table "empresas""
```

## ✅ Solução Passo a Passo:

### 1. Acesse o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: `tqsibusymtsvpihnyieo`

### 2. Vá para o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### 3. Execute o Script SQL Completo

**Cole e execute este script completo:**

```sql
-- ========================================
-- SCRIPT COMPLETO PARA CORRIGIR RLS
-- ========================================

-- 1. Verificar se a tabela empresas existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'empresas';

-- 2. Se a tabela não existir, criar
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

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empresas';

-- 4. Habilitar RLS (se não estiver habilitado)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
DROP POLICY IF EXISTS "Users can view their own company" ON empresas;
DROP POLICY IF EXISTS "Users can update their own company" ON empresas;
DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;
DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empresas;
DROP POLICY IF EXISTS "Enable read access for all users" ON empresas;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON empresas;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON empresas;

-- 6. Criar políticas RLS corretas
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

-- 7. Política para service role (importante para scripts)
CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');

-- 8. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas'
ORDER BY policyname;

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);

-- 10. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Verificar se Funcionou

Após executar o script, você deve ver:

1. **Tabela empresas existe** ✅
2. **RLS habilitado** ✅
3. **5 políticas criadas** ✅
4. **Índices criados** ✅

### 5. Testar a Aplicação

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a página de signup:**
   ```
   http://localhost:8082/signup
   ```

3. **Preencha o formulário:**
   - Email: `teste@exemplo.com`
   - Senha: `12345678`
   - Nome da empresa: `Minha Empresa`

4. **Clique em "Criar Conta"**

5. **Verifique se não há mais erro de RLS** ✅

### 6. Verificações Adicionais

**No Supabase Dashboard, verifique:**

1. **Authentication > Users** - Deve aparecer o novo usuário
2. **Database > Tables > empresas** - Deve aparecer a nova empresa
3. **Database > Tables > empresas > Policies** - Deve mostrar 5 políticas

### 7. Se Ainda Houver Problemas

**Execute este SQL para debug:**

```sql
-- Verificar usuários
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar empresas
SELECT id, user_id, nome, slug, created_at 
FROM empresas 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar políticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas';

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empresas';
```

### 8. Solução Alternativa (Temporária)

Se você quiser desabilitar RLS temporariamente para testar:

```sql
-- ⚠️ ATENÇÃO: Isso remove a segurança da tabela
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Reabilite o RLS após os testes:

```sql
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
```

## 🎯 Resultado Esperado

Após executar o script SQL:

- ✅ Tabela `empresas` criada/verificada
- ✅ RLS habilitado
- ✅ 5 políticas RLS criadas
- ✅ Índices criados para performance
- ✅ Trigger para `updated_at` configurado
- ✅ Criação de conta funcionando
- ✅ Empresa sendo inserida no banco

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs** em Authentication > Logs
2. **Confirme que o usuário foi criado** em Authentication > Users
3. **Verifique as políticas** em Database > Tables > empresas > Policies
4. **Teste com service role** para confirmar que a inserção funciona

---

**Execute o script SQL no Supabase Dashboard e o erro de RLS será resolvido! 🎉**
