# Configuração de Variáveis de Ambiente

## Para Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl

# N8N Configuration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c
N8N_BASE_URL=https://rodrigolima102.app.n8n.cloud
```

## Para GitHub Pages

As variáveis estão hardcoded no código para funcionar no GitHub Pages:

- **Supabase:** `src/lib/supabaseClient.ts`
- **N8N:** `src/lib/n8n-config.ts`

## Como usar

### Supabase
```typescript
import { supabase } from 'src/lib/supabaseClient'
```

### N8N
```typescript
import { n8nClient, N8N_CONFIG } from 'src/lib/n8n-config'

// Usar cliente
const workflows = await n8nClient.getWorkflows()

// Usar configuração diretamente
const webhookUrl = N8N_CONFIG.getWebhookUrl('meu-webhook-id')
```

## Variáveis Configuradas

### N8N_API_KEY
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c`
- **Uso:** Autenticação nas requisições para o N8N

### N8N_BASE_URL
- **Valor:** `https://rodrigolima102.app.n8n.cloud`
- **Uso:** URL base para todas as requisições do N8N

## Segurança

- **Desenvolvimento:** Use variáveis de ambiente
- **Produção (GitHub Pages):** Valores hardcoded (públicos)
- **API Key:** É uma chave pública do N8N, segura para uso no frontend
