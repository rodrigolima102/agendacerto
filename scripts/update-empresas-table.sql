-- Script para atualizar a tabela empresas com novos campos
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Adicionar novos campos à tabela empresas (se não existirem)
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS ramo_atividade TEXT,
ADD COLUMN IF NOT EXISTS info_gerais TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Adicionar comentários para documentar os campos
COMMENT ON COLUMN empresas.ramo_atividade IS 'Ramo de atividade da empresa (beleza, saude, educacao, servicos, outros)';
COMMENT ON COLUMN empresas.info_gerais IS 'Informações gerais sobre a empresa';
COMMENT ON COLUMN empresas.logo_url IS 'URL do logotipo da empresa no Supabase Storage';

-- 3. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'empresas'
ORDER BY ordinal_position;

-- 4. Verificar se os campos foram adicionados
SELECT 
    id,
    user_id,
    nome,
    slug,
    ramo_atividade,
    info_gerais,
    logo_url,
    google_connected,
    n8n_workflow_id,
    n8n_workflow_status,
    created_at,
    updated_at
FROM empresas
LIMIT 1;
