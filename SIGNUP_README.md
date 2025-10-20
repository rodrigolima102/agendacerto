# 📝 Página de Signup - AgendaCerto

## ✅ Página criada com sucesso!

### 📁 Arquivos criados:

1. **`src/pages/signup.tsx`** - Página principal de criação de conta
2. **`src/pages/onboarding/empresa.tsx`** - Página de onboarding após signup

### 🔧 Funcionalidades implementadas:

#### **Formulário de Signup (`/signup`):**

- **✅ Campos obrigatórios:**
  - Email (com validação de formato)
  - Senha (mínimo 8 caracteres)
  - Nome da empresa (mínimo 2 caracteres)

- **✅ Validação com Zod:**
  - Email válido
  - Senha ≥ 8 caracteres
  - Nome da empresa não vazio
  - Mensagens de erro abaixo dos campos

- **✅ React Hook Form:**
  - Gerenciamento de estado do formulário
  - Validação em tempo real
  - Tratamento de erros

- **✅ Funcionalidades:**
  - Mostrar/ocultar senha
  - Loading state durante criação
  - Tratamento de erros
  - Design responsivo com Material-UI

#### **Fluxo de criação:**

1. **Criação do usuário:** `supabase.auth.signUp({ email, password })`
2. **Inserção na tabela empresas:**
   ```typescript
   {
     user_id: authData.user.id,
     nome: data.companyName,
     slug: slugify(data.companyName),
     google_connected: false,
     n8n_workflow_id: null,
     n8n_workflow_status: 'inactive'
   }
   ```
3. **Redirecionamento:** `/onboarding/empresa`

#### **Página de Onboarding (`/onboarding/empresa`):**

- **✅ Confirmação de criação:**
  - Exibe dados da empresa criada
  - Mostra email do usuário
  - Confirmação visual com ícone de sucesso

- **✅ Próximos passos:**
  - Botão para conectar Google
  - Redirecionamento para `/auth/jwt/sign-in`

### 🎨 Design:

- **Gradiente de fundo** usando cores do design system através do tema:
  ```typescript
  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
  ```
- **Card centralizado** com Material-UI
- **Ícones** do Iconify
- **Responsivo** para mobile e desktop
- **Estados visuais** (loading, erro, sucesso)
- **Cores dinâmicas** que se adaptam ao tema (light/dark mode)
- **Sem CSS inline** - usando sistema de tema do Material-UI

#### 🎨 Paleta de cores do Design System:

```typescript
// Cores principais usadas
primary: {
  main: '#00A76F',    // Verde principal
  dark: '#007867',    // Verde escuro
  light: '#5BE49B',   // Verde claro
}

secondary: {
  main: '#8E33FF',    // Roxo principal
  dark: '#5119B7',    // Roxo escuro
  light: '#C684FF',   // Roxo claro
}

success: {
  main: '#22C55E',    // Verde de sucesso
}

error: {
  main: '#FF5630',    // Vermelho de erro
}
```

### 🔗 Navegação:

- **Link para login** na página de signup
- **Redirecionamento automático** após sucesso
- **Verificação de autenticação** na página de onboarding

### 🧪 Como testar:

1. **Acesse:** `http://localhost:8082/signup`
2. **Preencha o formulário:**
   - Email: `teste@exemplo.com`
   - Senha: `12345678`
   - Nome da empresa: `Minha Empresa`
3. **Clique em "Criar Conta"**
4. **Verifique o redirecionamento** para `/onboarding/empresa`
5. **Confirme os dados** exibidos
6. **Clique em "Conectar Google"** para continuar

### 📊 Validações implementadas:

```typescript
const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
  companyName: z
    .string()
    .min(1, 'Nome da empresa é obrigatório')
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
});
```

### 🔧 Função slugify:

```typescript
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}
```

### ✅ Status:

- **✅ Página de signup** criada e funcionando
- **✅ Validação com Zod** implementada
- **✅ React Hook Form** configurado
- **✅ Integração com Supabase** funcionando
- **✅ Página de onboarding** criada
- **✅ Design responsivo** implementado
- **✅ Tratamento de erros** implementado
- **✅ Servidor rodando** na porta 8082

### ✅ Benefícios da implementação:

1. **🎨 Consistência visual** com o resto da aplicação
2. **🔧 Manutenibilidade** - cores centralizadas no design system
3. **♿ Acessibilidade** - cores testadas para contraste
4. **🎯 Branding** - identidade visual consistente
5. **📱 Responsividade** - cores que funcionam em todos os dispositivos
6. **🌙 Suporte a dark mode** - cores se adaptam automaticamente
7. **⚡ Performance** - sem CSS inline, usando sistema de tema otimizado
8. **🔧 Flexibilidade** - fácil mudança de tema sem alterar código

**Página de signup criada com sucesso e pronta para uso! 🎉**
