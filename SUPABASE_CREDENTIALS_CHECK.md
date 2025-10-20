# 🔍 Verificação de Credenciais do Supabase

## ❌ Problema Identificado:
- **Erro 401 Unauthorized** ao tentar acessar o Supabase
- Isso indica que as credenciais podem estar incorretas ou expiradas

## ✅ Solução:

### 1. Verificar Credenciais no Supabase Dashboard

1. **Acesse:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Faça login** na sua conta
3. **Selecione o projeto** (se não aparecer, pode ter sido deletado)
4. **Vá para Settings > API**

### 2. Se o Projeto Existe:

**Copie as credenciais corretas:**
- **Project URL:** `https://[seu-projeto-id].supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Atualize o arquivo `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://[seu-projeto-id].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Se o Projeto Foi Deletado:

**Crie um novo projeto:**
1. **Clique em "New Project"**
2. **Escolha uma organização**
3. **Digite o nome:** `AgendaCerto`
4. **Escolha uma senha forte** para o banco
5. **Selecione uma região** próxima
6. **Clique em "Create new project"**

**Aguarde a criação** (pode levar alguns minutos)

### 4. Configurar o Novo Projeto:

**Após criar o projeto, execute este SQL:**

```sql
-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Habilitar RLS na tabela empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON empresas
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company" ON empresas
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL USING (auth.role() = 'service_role');

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Atualizar o Código:

**Atualize `src/lib/supabaseClient.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://[seu-novo-projeto-id].supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-nova-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 6. Testar:

1. **Crie o arquivo `.env.local`** com as novas credenciais
2. **Reinicie o servidor:** `npm run dev`
3. **Teste a página de signup:** `http://localhost:8082/signup`

## 🔍 Verificações:

### Se o projeto existe:
- ✅ Copie as credenciais corretas
- ✅ Atualize o `.env.local`
- ✅ Teste a conexão

### Se o projeto foi deletado:
- ✅ Crie um novo projeto
- ✅ Execute o SQL de configuração
- ✅ Atualize as credenciais
- ✅ Teste a aplicação

## 🆘 Se Ainda Houver Problemas:

1. **Verifique se você está logado** na conta correta do Supabase
2. **Confirme se o projeto existe** na lista de projetos
3. **Verifique se as credenciais estão corretas** (sem espaços extras)
4. **Teste a conexão** com as novas credenciais

---

**O projeto Supabase não foi deletado por mim - apenas as credenciais podem estar incorretas ou expiradas! 🔧**
