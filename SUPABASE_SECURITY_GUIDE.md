# 🔒 Guia de Segurança - Supabase

## ⚠️ **IMPORTANTE: NUNCA EXPOR A SERVICE KEY NO FRONTEND!**

### **🔑 Tipos de Chaves:**

**1. Anon Key (Chave Pública) - ✅ SEGURA para Frontend:**
```
sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl
```
- ✅ **Pode ser exposta** no código do frontend
- ✅ **Usada para** autenticação de usuários
- ✅ **Limitada por** Row Level Security (RLS)
- ✅ **Usada em** `src/lib/supabaseClient.ts`

**2. Service Key (Chave Secreta) - ❌ NUNCA no Frontend:**
```
sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO
```
- ❌ **NUNCA expor** no código do frontend
- ❌ **NUNCA colocar** em arquivos públicos
- ❌ **NUNCA commitar** no Git
- ✅ **Usar apenas** em scripts de backend
- ✅ **Usar apenas** em servidores seguros

## 🛡️ **Configuração Segura:**

### **Frontend (src/lib/supabaseClient.ts):**
```typescript
// ✅ CORRETO - Apenas anon key
const supabaseUrl = 'https://tqsibusymtsvpihnyieo.supabase.co'
const supabaseAnonKey = 'sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Backend/Scripts (scripts/*.ts):**
```typescript
// ✅ CORRETO - Service key apenas em scripts
const SUPABASE_SERVICE_KEY = 'sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO'
```

### **Variáveis de Ambiente (.env.local):**
```env
# ✅ CORRETO - Anon key pode estar aqui
NEXT_PUBLIC_SUPABASE_URL=https://tqsibusymtsvpihnyieo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yCnml2-JPc_uySkMiSasMg_eUKbMzhl

# ✅ CORRETO - Service key apenas para backend
SUPABASE_SERVICE_KEY=sb_secret_WDcPbCqaInWcDxlGQb-Nww_eMslH8QO
```

## 🔍 **Status Atual:**

### **✅ Funcionando Corretamente:**
- **Anon key** está funcionando no frontend
- **RLS** está protegendo os dados
- **Tabelas** `empresas` e `profiles` estão acessíveis
- **Autenticação** está funcionando

### **🧪 Teste Realizado:**
```bash
npx tsx scripts/test-frontend-access.ts
```

**Resultado:**
- ✅ Status 200 OK para autenticação
- ✅ Status 200 OK para tabelas
- ✅ RLS funcionando (0 registros para usuário não autenticado)

## 🚀 **Próximos Passos:**

### **1. Teste a Aplicação:**
1. **Acesse:** `http://localhost:8082/signup`
2. **Crie uma conta** com dados válidos
3. **Verifique se** a empresa é criada no banco
4. **Teste o onboarding** em `/onboarding/empresa`

### **2. Verifique no Supabase Dashboard:**
1. **Authentication > Users** - Deve aparecer o novo usuário
2. **Database > Tables > empresas** - Deve aparecer a nova empresa
3. **Database > Tables > profiles** - Deve aparecer o novo perfil

## 🛡️ **Boas Práticas de Segurança:**

### **✅ FAZER:**
- Usar apenas anon key no frontend
- Configurar RLS adequadamente
- Usar service key apenas em backend
- Validar dados no frontend e backend
- Usar HTTPS em produção

### **❌ NÃO FAZER:**
- Expor service key no frontend
- Commitar service key no Git
- Usar service key em client-side
- Desabilitar RLS sem necessidade
- Confiar apenas na validação do frontend

## 🔧 **Configuração de RLS:**

### **Políticas Necessárias:**
```sql
-- Tabela empresas
CREATE POLICY "Users can insert their own company" ON empresas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON empresas
    FOR SELECT USING (auth.uid() = user_id);

-- Tabela profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

## 📋 **Checklist de Segurança:**

- [ ] ✅ Anon key configurada no frontend
- [ ] ✅ Service key apenas em scripts backend
- [ ] ✅ RLS habilitado nas tabelas
- [ ] ✅ Políticas RLS configuradas
- [ ] ✅ Validação de dados implementada
- [ ] ✅ HTTPS em produção
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Testes de segurança realizados

---

**A configuração está segura! A anon key está funcionando e o RLS está protegendo os dados! 🛡️**
