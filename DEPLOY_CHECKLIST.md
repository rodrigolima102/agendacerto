# ✅ Checklist de Deploy - GitHub Pages

## 🎯 FASE 1: PREPARAÇÃO

### 1.1 Configurar GitHub Pages
- [ ] Criar repositório no GitHub
- [ ] Configurar GitHub Pages (Source: GitHub Actions)
- [ ] Configurar secrets no GitHub (ver `GITHUB_SECRETS_SETUP.md`)

### 1.2 Testar Build Local
- [ ] Executar `npm run build`
- [ ] Verificar se gera pasta `out/`
- [ ] Verificar se não há erros de build
- [ ] Testar se o build funciona com `isStaticExport = true`

### 1.3 Configurar GitHub Actions
- [ ] Verificar se `.github/workflows/deploy.yml` existe
- [ ] Verificar se o workflow está correto
- [ ] Fazer commit do workflow

## 🎯 FASE 2: DEPLOY INICIAL

### 2.1 Criar Branch de Deploy
- [ ] `git checkout -b deploy-initial`
- [ ] Verificar se está na versão estável

### 2.2 Configurar Static Export
- [ ] Atualizar `next.config.ts` para `isStaticExport = true`
- [ ] Testar build local: `npm run build`
- [ ] Verificar se pasta `out/` é criada
- [ ] Commit: "feat: Configure static export for GitHub Pages"

### 2.3 Fazer Push e Testar
- [ ] `git push origin deploy-initial`
- [ ] Verificar GitHub Actions (aba Actions)
- [ ] Verificar se o workflow roda sem erros
- [ ] Verificar se o site é deployado no GitHub Pages
- [ ] Testar se todas as páginas carregam

### 2.4 Verificar Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Página de login carrega
- [ ] Página de signup carrega
- [ ] Navegação funciona
- [ ] CSS/estilos carregam

## 🎯 FASE 3: CONFIGURAÇÃO DE AMBIENTE

### 3.1 Configurar Secrets
- [ ] Configurar todos os secrets no GitHub
- [ ] Verificar se os secrets estão sendo carregados
- [ ] Testar se as variáveis de ambiente funcionam

### 3.2 Testar Integrações
- [ ] Verificar se Supabase funciona
- [ ] Verificar se Google OAuth funciona
- [ ] Verificar se N8N funciona
- [ ] Testar login/signup
- [ ] Testar funcionalidades principais

### 3.3 Fazer Merge
- [ ] `git checkout main`
- [ ] `git merge deploy-initial`
- [ ] `git push origin main`
- [ ] Verificar se o deploy funciona na branch main

## 🎯 FASE 4: OTIMIZAÇÃO

### 4.1 Otimizar Build
- [ ] Configurar cache no GitHub Actions
- [ ] Otimizar tamanho do build
- [ ] Configurar compressão
- [ ] Verificar se o build é mais rápido

### 4.2 Configurar Domínio (Opcional)
- [ ] Configurar domínio customizado
- [ ] Configurar HTTPS
- [ ] Configurar redirects
- [ ] Testar domínio customizado

## 🎯 FASE 5: PRODUÇÃO

### 5.1 Deploy Final
- [ ] Fazer merge de todas as branches testadas
- [ ] Testar tudo novamente
- [ ] Deploy final para produção
- [ ] Verificar se tudo funciona

### 5.2 Monitoramento
- [ ] Configurar monitoramento
- [ ] Configurar logs
- [ ] Configurar alertas
- [ ] Verificar se o site está estável

## 🔄 ROLLBACK (Se algo der errado)

### Voltar para Versão Estável
- [ ] `git checkout v1.0.0-stable`
- [ ] Verificar se está funcionando localmente
- [ ] Fazer push da versão estável
- [ ] Verificar se o deploy funciona

### Voltar para Commit Específico
- [ ] `git checkout 85c7c62`
- [ ] Verificar se está funcionando
- [ ] Fazer push
- [ ] Verificar deploy

## ⚠️ REGRAS IMPORTANTES

- [ ] **NUNCA** alterar código que funciona localmente
- [ ] **SEMPRE** testar em branch separada primeiro
- [ ] **SEMPRE** poder voltar para `v1.0.0-stable`
- [ ] **SEMPRE** fazer commits pequenos e descritivos
- [ ] **SEMPRE** testar cada fase antes de prosseguir

## 📞 Suporte

Se tiver problemas:
1. Verifique se seguiu todos os passos
2. Verifique os logs do GitHub Actions
3. Volte para a versão estável se necessário
4. Consulte a documentação específica de cada fase
