# Deploy para GitHub Pages

Este projeto está configurado para funcionar no GitHub Pages como um site estático.

## Configuração

### 1. Configuração do Next.js
- ✅ `next.config.ts` configurado com `output: 'export'`
- ✅ `trailingSlash: true` para compatibilidade com GitHub Pages
- ✅ Build estático habilitado

### 2. Variáveis de Ambiente
As chaves do Supabase estão hardcoded no código para funcionar no GitHub Pages:

```typescript
// src/lib/supabaseClient.ts
const supabaseUrl = 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl'
```

### 3. GitHub Actions
- ✅ Workflow configurado em `.github/workflows/deploy.yml`
- ✅ Build automático no push para `main`
- ✅ Deploy automático para GitHub Pages

## Como fazer deploy

### Opção 1: Automático (Recomendado)
1. Faça push para a branch `main`
2. O GitHub Actions fará o build e deploy automaticamente
3. Acesse: `https://seu-usuario.github.io/seu-repositorio`

### Opção 2: Manual
```bash
# Build estático
npm run build

# Os arquivos estáticos estarão na pasta 'out/'
# Faça upload da pasta 'out/' para o GitHub Pages
```

## Estrutura de arquivos estáticos

Após o build, a pasta `out/` conterá:
```
out/
├── index.html
├── login/
│   └── index.html
├── auth/
│   └── jwt/
│       └── sign-in/
│           └── index.html
├── test/
│   └── agenda/
│       └── index.html
└── _next/
    └── static/
        └── [arquivos estáticos]
```

## Funcionalidades que funcionam no GitHub Pages

✅ **Funcionam:**
- Páginas estáticas
- Autenticação Supabase (client-side)
- Navegação entre páginas
- Componentes React
- Material-UI

❌ **Não funcionam:**
- API Routes do Next.js
- Server-side rendering
- Middleware
- Funções server-side

## Configuração do GitHub Pages

1. Vá em Settings > Pages
2. Source: "GitHub Actions"
3. O workflow será executado automaticamente

## Troubleshooting

### Erro 404
- Verifique se o `trailingSlash: true` está configurado
- Certifique-se de que os links usam `/` no final

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Certifique-se de que não há imports server-side

### Supabase não funciona
- Verifique se as chaves estão corretas
- Certifique-se de que está usando apenas client-side auth
