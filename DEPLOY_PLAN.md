# 🚀 PLANO DE DEPLOY - GitHub Pages

## 📋 ESTRATÉGIA GERAL

**Objetivo:** Deploy seguro e gradual para GitHub Pages  
**Abordagem:** Pequenos pacotes, branches separadas, testes incrementais  
**Fallback:** Sempre poder voltar para `v1.0.0-stable`

## 🎯 FASE 1: PREPARAÇÃO E CONFIGURAÇÃO

### 1.1 Configurar GitHub Pages
- [ ] Criar repositório no GitHub
- [ ] Configurar GitHub Pages (Source: GitHub Actions)
- [ ] Configurar secrets no GitHub (variáveis de ambiente)

### 1.2 Configurar Next.js para Static Export
- [ ] Verificar `next.config.ts` para static export
- [ ] Testar build local: `npm run build`
- [ ] Verificar se gera pasta `out/` corretamente

### 1.3 Configurar GitHub Actions
- [ ] Criar `.github/workflows/deploy.yml`
- [ ] Configurar build e deploy automático
- [ ] Testar workflow

## 🎯 FASE 2: DEPLOY INICIAL (BRANCH: `deploy-initial`)

### 2.1 Criar Branch de Deploy
```bash
git checkout -b deploy-initial
```

### 2.2 Configurar Static Export
- [ ] Atualizar `next.config.ts` para `isStaticExport = true`
- [ ] Testar build local
- [ ] Commit: "feat: Configure static export for GitHub Pages"

### 2.3 Configurar GitHub Actions
- [ ] Criar workflow básico
- [ ] Configurar secrets
- [ ] Testar deploy

### 2.4 Deploy e Teste
- [ ] Fazer push da branch
- [ ] Verificar se GitHub Actions roda
- [ ] Testar site no GitHub Pages
- [ ] Verificar se todas as páginas carregam

## 🎯 FASE 3: CONFIGURAÇÃO DE AMBIENTE (BRANCH: `deploy-env`)

### 3.1 Configurar Variáveis de Ambiente
- [ ] Configurar secrets no GitHub
- [ ] Atualizar workflow para usar secrets
- [ ] Testar se variáveis são carregadas

### 3.2 Testar Integrações
- [ ] Verificar se Supabase funciona
- [ ] Verificar se Google OAuth funciona
- [ ] Verificar se N8N funciona

## 🎯 FASE 4: OTIMIZAÇÃO (BRANCH: `deploy-optimize`)

### 4.1 Otimizar Build
- [ ] Configurar cache no GitHub Actions
- [ ] Otimizar tamanho do build
- [ ] Configurar compressão

### 4.2 Configurar Domínio (Opcional)
- [ ] Configurar domínio customizado
- [ ] Configurar HTTPS
- [ ] Configurar redirects

## 🎯 FASE 5: MERGE PARA PRODUÇÃO (BRANCH: `main`)

### 5.1 Merge Seguro
- [ ] Fazer merge das branches testadas
- [ ] Testar tudo novamente
- [ ] Deploy final

### 5.2 Monitoramento
- [ ] Configurar monitoramento
- [ ] Configurar logs
- [ ] Configurar alertas

## 🔄 ESTRATÉGIA DE ROLLBACK

### Se algo der errado:
```bash
# Voltar para versão estável
git checkout v1.0.0-stable

# Ou voltar para commit específico
git checkout 85c7c62
```

## 📁 ESTRUTURA DE BRANCHES

```
main (produção)
├── v1.0.0-stable (ponto de restauração)
├── deploy-initial (deploy básico)
├── deploy-env (configuração de ambiente)
└── deploy-optimize (otimizações)
```

## ⚠️ REGRAS IMPORTANTES

1. **NUNCA** alterar código que funciona localmente
2. **SEMPRE** testar em branch separada primeiro
3. **SEMPRE** poder voltar para `v1.0.0-stable`
4. **SEMPRE** fazer commits pequenos e descritivos
5. **SEMPRE** testar cada fase antes de prosseguir

## 🎯 PRÓXIMOS PASSOS

1. Começar com Fase 1
2. Testar cada fase completamente
3. Só prosseguir se tudo estiver funcionando
4. Manter versão estável como fallback

---

**LEMBRE-SE:** O objetivo é fazer deploy do que já funciona localmente, não criar coisas novas!
