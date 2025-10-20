-- Script para configurar Row Level Security (RLS) na tabela empresas
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela empresas (se não estiver habilitado)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir inserção de empresas pelo usuário autenticado
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Criar política para permitir leitura da própria empresa
CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 4. Criar política para permitir atualização da própria empresa
CREATE POLICY "Users can update their own company" ON empresas
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Criar política para permitir exclusão da própria empresa
CREATE POLICY "Users can delete their own company" ON empresas
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Política para permitir acesso via service role (para scripts)
CREATE POLICY "Service role can manage all companies" ON empresas
    FOR ALL 
    USING (auth.role() = 'service_role');

-- 7. Verificar se a tabela empresas tem a estrutura correta
-- Se a tabela não existir, criar com a estrutura necessária
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

-- 8. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);

-- 9. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empresas';
