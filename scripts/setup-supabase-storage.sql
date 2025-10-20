-- Script para configurar o Supabase Storage
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar bucket para logos (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de logos pelos usuários autenticados
CREATE POLICY "Users can upload their own logos" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 3. Criar política para permitir visualização pública dos logos
CREATE POLICY "Logos are publicly accessible" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'logos');

-- 4. Criar política para permitir atualização de logos pelos proprietários
CREATE POLICY "Users can update their own logos" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 5. Criar política para permitir exclusão de logos pelos proprietários
CREATE POLICY "Users can delete their own logos" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 6. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'logos';

-- 7. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
