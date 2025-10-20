# 🔧 Configuração de Row Level Security (RLS) - Supabase

## ❌ Problema identificado:

O erro `"new row violates row-level security policy for table "empresas"` indica que a tabela `empresas` tem Row Level Security (RLS) habilitado, mas não há políticas que permitam a inserção de dados.

## ✅ Solução:

### 1. Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Navegue para **SQL Editor** no menu lateral

### 2. Execute o seguinte SQL:

```sql
-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empresas';

-- 2. Habilitar RLS (se não estiver habilitado)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can insert their own company" ON empresas;
DROP POLICY IF EXISTS "Users can view their own company" ON empresas;
DROP POLICY IF EXISTS "Users can update their own company" ON empresas;
DROP POLICY IF EXISTS "Users can delete their own company" ON empresas;
DROP POLICY IF EXISTS "Service role can manage all companies" ON empresas;

-- 4. Criar políticas RLS
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

-- 5. Política para service role (importante para scripts)
CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');

-- 6. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas';
```

### 3. Verificar a estrutura da tabela:

```sql
-- Verificar estrutura da tabela empresas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'empresas'
ORDER BY ordinal_position;
```

### 4. Se a tabela não existir, criar:

```sql
-- Criar tabela empresas (se não existir)
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 🧪 Teste após configuração:

1. **Acesse a página de signup:** `http://localhost:8082/signup`
2. **Preencha o formulário:**
   - Email: `teste@exemplo.com`
   - Senha: `12345678`
   - Nome da empresa: `Minha Empresa`
3. **Clique em "Criar Conta"**
4. **Verifique se não há mais erro de RLS**

## 🔍 Verificações adicionais:

### Verificar se o usuário está autenticado:

```sql
-- Verificar usuários autenticados
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Verificar empresas criadas:

```sql
-- Verificar empresas
SELECT id, user_id, nome, slug, google_connected, created_at 
FROM empresas 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🚨 Solução alternativa (temporária):

Se você quiser desabilitar RLS temporariamente para testar:

```sql
-- ⚠️ ATENÇÃO: Isso remove a segurança da tabela
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Reabilite o RLS após os testes:

```sql
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
```

## 📋 Checklist de verificação:

- [ ] RLS habilitado na tabela empresas
- [ ] Política de INSERT criada
- [ ] Política de SELECT criada
- [ ] Política de UPDATE criada
- [ ] Política de DELETE criada
- [ ] Política para service_role criada
- [ ] Teste de criação de conta funcionando
- [ ] Empresa sendo criada no banco de dados

## 🆘 Se ainda houver problemas:

1. **Verifique os logs do Supabase** em Authentication > Logs
2. **Confirme que o usuário está sendo criado** em Authentication > Users
3. **Verifique as políticas** em Database > Tables > empresas > Policies
4. **Teste com service role** para confirmar que a inserção funciona

---

**Após executar essas configurações, o erro de RLS deve ser resolvido e a criação de conta deve funcionar normalmente! 🎉**
