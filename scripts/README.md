# Scripts de Provisionamento

Esta pasta contém scripts utilitários para provisionamento e teste de integrações.

## 📁 Arquivos

### `provision-n8n.ts`

Script simples para testar a conexão com a API do N8N e contar workflows disponíveis.

**Uso:**
```bash
npm run provision:test
```

**Funcionalidades:**
- ✅ Lê variáveis de ambiente (N8N_BASE_URL, N8N_API_KEY, N8N_TEMPLATE_ID)
- ✅ Testa conexão com API do N8N
- ✅ Conta workflows disponíveis
- ✅ Exibe resultado simples e direto
- ✅ Função `cloneTemplate()` para clonar workflows com personalização

**Exemplo de saída:**
```
Conexão OK. Workflows encontrados: 10. TEMPLATE_ID: 20GgnhGp77RrFmwa
```

**Variáveis de ambiente:**
- `N8N_BASE_URL`: URL base do N8N (padrão: https://rodrigolima102.app.n8n.cloud)
- `N8N_API_KEY`: Chave de API do N8N
- `N8N_TEMPLATE_ID`: ID do template (padrão: 20GgnhGp77RrFmwa - "Booking Template")

## 🔧 Função `cloneTemplate()`

Função para clonar workflows do N8N com personalização automática:

```typescript
async function cloneTemplate(empresaId: string, slug: string)
```

**Funcionalidades:**
- ✅ Busca template por ID via GET `/rest/workflows/${TEMPLATE_ID}`
- ✅ Substitui todas as ocorrências de `__SLUG__` por `slug` nos nós e conexões
- ✅ Adiciona `empresa_id` em `settings.env` como variável de ambiente
- ✅ Cria workflow com nome `"Booking – ${slug}"` e `active: false`
- ✅ Retorna o ID do novo workflow criado

**Exemplo de uso:**
```typescript
const newWorkflowId = await cloneTemplate('empresa123', 'meu-slug');
console.log(`Novo workflow criado: ${newWorkflowId}`);
```

## 🔧 Configuração

O script utiliza as configurações definidas em `src/lib/n8n-config.ts`:

- **Base URL:** `https://rodrigolima102.app.n8n.cloud`
- **API Key:** Configurada via variável de ambiente `N8N_API_KEY`
- **Endpoint:** `/api/v1/workflows`

## 🚨 Tratamento de Erros

O script inclui tratamento de erros para:

- **401 Unauthorized:** Problemas de autenticação
- **404 Not Found:** Endpoint não encontrado
- **500 Internal Server Error:** Erros do servidor N8N
- **Network errors:** Problemas de conectividade

## 📋 Dependências

- **tsx:** Para execução de scripts TypeScript
- **src/lib/n8n-config.ts:** Cliente N8N configurado

## 🎯 Próximos Passos

1. **Executar workflow:** Integrar execução de workflows ativos
2. **Monitoramento:** Adicionar logs de execução
3. **Configuração:** Permitir configuração via arquivo
4. **Testes:** Adicionar testes automatizados
