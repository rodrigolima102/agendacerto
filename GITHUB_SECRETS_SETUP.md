# 🔐 Configuração de Secrets - GitHub

## 📋 Secrets Necessários

Para o deploy funcionar no GitHub Pages, você precisa configurar os seguintes secrets no seu repositório GitHub:

### 🔑 Lista de Secrets

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | `https://tqsibusymtsvpihnyieo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | `1005292864367-ins3o5uel2istn3gmg37vrqv63t05lbj.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | `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` |
| `N8N_API_KEY` | API Key do N8N | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `N8N_BASE_URL` | URL base do N8N | `http://localhost:5678` |

## 🚀 Como Configurar

### 1. Acesse o Repositório no GitHub
- Vá para o seu repositório no GitHub
- Clique em **Settings** (Configurações)

### 2. Acesse Secrets and Variables
- No menu lateral, clique em **Secrets and variables**
- Clique em **Actions**

### 3. Adicione cada Secret
- Clique em **New repository secret**
- Digite o nome do secret (ex: `NEXT_PUBLIC_SUPABASE_URL`)
- Digite o valor do secret
- Clique em **Add secret**

### 4. Repita para todos os secrets
- Adicione todos os 6 secrets listados acima
- Verifique se os nomes estão exatamente como na tabela

## ⚠️ Importante

### 🔒 Segurança
- **NUNCA** commite os valores dos secrets
- **SEMPRE** use variáveis de ambiente
- **SEMPRE** verifique se os secrets estão configurados

### 🧪 Teste
- Após configurar os secrets, teste o deploy
- Verifique se o GitHub Actions roda sem erros
- Verifique se o site funciona no GitHub Pages

## 🔍 Como Verificar se Funcionou

### 1. Verificar GitHub Actions
- Vá para a aba **Actions** no seu repositório
- Verifique se o workflow rodou sem erros
- Se houver erro, verifique os logs

### 2. Verificar GitHub Pages
- Vá para **Settings** > **Pages**
- Verifique se o site está sendo deployado
- Acesse a URL do GitHub Pages

### 3. Testar Funcionalidades
- Teste login/signup
- Teste integração com Google Calendar
- Teste integração com Supabase
- Teste integração com N8N

## 🆘 Troubleshooting

### Erro: "Secret not found"
- Verifique se o nome do secret está correto
- Verifique se o secret foi adicionado corretamente
- Verifique se está usando o nome exato (case-sensitive)

### Erro: "Build failed"
- Verifique se todos os secrets estão configurados
- Verifique se os valores dos secrets estão corretos
- Verifique os logs do GitHub Actions

### Erro: "Site not loading"
- Verifique se o GitHub Pages está configurado
- Verifique se o build foi bem-sucedido
- Verifique se a pasta `out/` foi criada

## 📞 Suporte

Se tiver problemas:
1. Verifique se seguiu todos os passos
2. Verifique os logs do GitHub Actions
3. Volte para a versão estável se necessário: `git checkout v1.0.0-stable`
