# 🚀 Guia de Configuração - Página de Onboarding

## ✅ Página Criada: `src/pages/onboarding/empresa.tsx`

### **🔧 Funcionalidades Implementadas:**

1. **Formulário Completo:**
   - ✅ Ramo de atividade (select com opções)
   - ✅ Informações gerais (textarea)
   - ✅ Upload de logotipo (input file)

2. **Validação:**
   - ✅ React Hook Form + Zod
   - ✅ Mensagens de erro específicas
   - ✅ Validação de tipo e tamanho de arquivo

3. **Upload de Imagem:**
   - ✅ Supabase Storage (bucket `logos`)
   - ✅ Preview da imagem
   - ✅ Validação de formato e tamanho

4. **Segurança:**
   - ✅ Verificação de usuário logado
   - ✅ Redirecionamento se não autenticado
   - ✅ Verificação se já completou onboarding

## 📋 Configuração Necessária no Supabase:

### **1. Execute o SQL para Atualizar a Tabela:**

```sql
-- Adicionar novos campos à tabela empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS ramo_atividade TEXT,
ADD COLUMN IF NOT EXISTS info_gerais TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;
```

### **2. Execute o SQL para Configurar Storage:**

```sql
-- Criar bucket para logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso
CREATE POLICY "Users can upload their own logos" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Logos are publicly accessible" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'logos');
```

## 🧪 Como Testar:

### **1. Fluxo Completo:**
1. **Acesse:** `http://localhost:8082/signup`
2. **Crie uma conta** com dados válidos
3. **Será redirecionado** para `/onboarding/empresa`
4. **Preencha o formulário:**
   - Selecione um ramo de atividade
   - Digite informações sobre a empresa
   - Faça upload de uma imagem (opcional)
5. **Clique em "Finalizar Cadastro"**
6. **Será redirecionado** para `/dashboard`

### **2. Validações Testadas:**
- ✅ Campos obrigatórios
- ✅ Tamanho mínimo/máximo de texto
- ✅ Tipo de arquivo de imagem
- ✅ Tamanho máximo de arquivo (5MB)
- ✅ Usuário não logado → redireciona para login
- ✅ Dados já completos → redireciona para dashboard

## 📁 Arquivos Criados:

1. **`src/pages/onboarding/empresa.tsx`** - Página principal
2. **`scripts/setup-supabase-storage.sql`** - Configuração do storage
3. **`scripts/update-empresas-table.sql`** - Atualização da tabela
4. **`ONBOARDING_SETUP_GUIDE.md`** - Este guia

## 🔧 Funcionalidades Técnicas:

### **Upload de Imagem:**
- **Bucket:** `logos`
- **Estrutura:** `logos/{user_id}-{timestamp}.{ext}`
- **Formatos:** JPG, PNG, GIF, WebP
- **Tamanho máximo:** 5MB
- **Preview:** Em tempo real
- **URL pública:** Gerada automaticamente

### **Validação de Formulário:**
- **Ramo:** Obrigatório
- **Informações:** 10-1000 caracteres
- **Imagem:** Opcional, mas validada se fornecida

### **Segurança:**
- **Autenticação:** Verificação obrigatória
- **RLS:** Políticas de acesso ao storage
- **Validação:** Lado cliente e servidor

## 🎯 Próximos Passos:

1. **Execute os scripts SQL** no Supabase Dashboard
2. **Teste o fluxo completo** de signup → onboarding
3. **Verifique se as imagens** são salvas corretamente
4. **Confirme o redirecionamento** para dashboard

## 🆘 Solução de Problemas:

### **Erro de Upload:**
- Verifique se o bucket `logos` foi criado
- Confirme as políticas de storage
- Verifique o tamanho da imagem (máx. 5MB)

### **Erro de Validação:**
- Verifique se os campos foram adicionados à tabela
- Confirme as políticas RLS da tabela `empresas`

### **Redirecionamento:**
- Verifique se o usuário está logado
- Confirme se a empresa foi criada no signup

---

**A página de onboarding está pronta! Execute os scripts SQL e teste o fluxo completo! 🎉**
