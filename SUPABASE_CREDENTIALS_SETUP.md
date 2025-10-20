# 🔑 Configuração de Credenciais do Supabase

## ❌ Problema Identificado:
- **Erro:** `"Invalid API key"`
- **URL correta:** `https://tqsibusymtsvpihnyieo.supabase.co`
- **Problema:** API key inválida ou expirada

## ✅ Solução:

### **1. Acesse o Supabase Dashboard:**
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: `tqsibusymtsvpihnyieo`

### **2. Obtenha as Credenciais Corretas:**
1. **Vá para Settings > API**
2. **Copie as seguintes credenciais:**
   - **Project URL:** `https://tqsibusymtsvpihnyieo.supabase.co`
   - **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **3. Crie o arquivo `.env.local`:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
SUPABASE_SERVICE_KEY=SUA_SERVICE_KEY_AQUI

# N8N Configuration
N8N_API_KEY=SUA_N8N_API_KEY_AQUI
N8N_BASE_URL=https://rodrigolima102.app.n8n.cloud
N8N_TEMPLATE_ID=20GgnhGp77RrFmwa
```

### **4. Substitua os Valores:**
- **`SUA_ANON_KEY_AQUI`** → Cole a Anon Key do Supabase
- **`SUA_SERVICE_KEY_AQUI`** → Cole a Service Role Key do Supabase
- **`SUA_N8N_API_KEY_AQUI`** → Cole sua API Key do N8N

### **5. Reinicie o Servidor:**
```bash
# Pare o servidor atual (Ctrl+C)
# Inicie novamente
npm run dev
```

## 🧪 Teste a Conexão:

### **1. Teste com Script:**
```bash
npx tsx scripts/test-supabase-connection.ts
```

### **2. Teste a Aplicação:**
1. **Acesse:** `http://localhost:8082/signup`
2. **Crie uma conta** com dados válidos
3. **Verifique se não há mais erros** de conexão

## 🔍 Verificações:

### **Se o Projeto Existe:**
- ✅ URL: `https://tqsibusymtsvpihnyieo.supabase.co`
- ✅ Copie as credenciais corretas
- ✅ Atualize o `.env.local`

### **Se o Projeto Foi Deletado:**
- ✅ Crie um novo projeto
- ✅ Execute os scripts SQL de configuração
- ✅ Atualize as credenciais

## 📋 Checklist:

- [ ] Acessar Supabase Dashboard
- [ ] Verificar se projeto existe
- [ ] Copiar credenciais corretas
- [ ] Criar arquivo `.env.local`
- [ ] Substituir valores das variáveis
- [ ] Reiniciar servidor
- [ ] Testar conexão
- [ ] Testar aplicação

## 🆘 Se Ainda Houver Problemas:

### **1. Verifique as Credenciais:**
- Confirme se copiou corretamente (sem espaços extras)
- Verifique se as chaves não expiraram
- Teste com um novo projeto se necessário

### **2. Verifique a URL:**
- Confirme se `https://tqsibusymtsvpihnyieo.supabase.co` está correto
- Teste se o projeto está ativo no dashboard

### **3. Verifique o Arquivo `.env.local`:**
- Confirme se está na raiz do projeto
- Verifique se as variáveis estão corretas
- Reinicie o servidor após mudanças

---

**Após configurar as credenciais corretas, a aplicação deve funcionar perfeitamente! 🎉**
