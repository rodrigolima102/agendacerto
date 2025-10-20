'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from 'src/lib/supabaseClient';
import { Iconify } from 'src/components/iconify';

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';

// Schema de validação com Zod
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

type SignupFormData = z.infer<typeof signupSchema>;

// Função para criar slug a partir do nome
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

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError('');

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Debug logs removidos por segurança

      // 2. Verificar se o email precisa ser confirmado
      let user = authData.user;
      if (!authData.session) {
        // Email pode precisar ser confirmado
        
        // Tentar fazer login para verificar se o email foi confirmado
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (loginError) {
          // Se o erro for "Email not confirmed", informar ao usuário
          if (loginError.message.includes('Email not confirmed')) {
            throw new Error('Por favor, verifique seu email e clique no link de confirmação antes de continuar.');
          }
          throw loginError;
        }

        if (!loginData.user || !loginData.session) {
          throw new Error('Erro ao criar sessão após signup');
        }

        user = loginData.user;
        // Sessão criada após login
      }

      // 3. Inserir empresa na tabela empresas (criação básica)
      const slug = slugify(data.companyName);
      
      // Criando empresa básica
      
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert({
          user_id: user.id,
          nome: data.companyName,
          slug: slug,
          google_connected: false,
          n8n_workflow_id: null,
          n8n_workflow_status: 'inactive',
          ramo_atividade: 'outros', // Valor padrão
          info_gerais: null,
          logo_url: null,
        });

      // Verificando criação da empresa
      
      if (empresaError) {
        console.error('❌ Erro detalhado na inserção:', empresaError);
        throw empresaError;
      }
      
      // Empresa criada com sucesso

      // 4. Redirecionar para onboarding (opcional)
      router.push('/onboarding/empresa');
    } catch (err: any) {
      console.error('Erro no signup:', err);
      
      // Tratamento específico para erro de RLS
      if (err.message?.includes('row-level security policy')) {
        setError('Erro de configuração do banco de dados. Entre em contato com o suporte.');
      } else if (err.message?.includes('duplicate key')) {
        setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Email inválido. Verifique o formato do email.');
      } else if (err.message?.includes('Password should be at least')) {
        setError('Senha muito fraca. Use pelo menos 8 caracteres.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, verifique seu email e clique no link de confirmação antes de continuar.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Iconify icon="eva:person-add-fill" width={40} />
            </Box>

            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              Criar Conta
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Comece sua jornada no AgendaCerto
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Criando sua conta...
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:email-fill" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-fill" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      <Iconify icon={showPassword ? 'eva:eye-off-fill' : 'eva:eye-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Nome da Empresa"
              {...register('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:briefcase-fill" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<Iconify icon="eva:person-add-fill" />}
              sx={{
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
                mt: 2,
              }}
            >
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <Button
                variant="text"
                onClick={() => router.push('/login')}
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Fazer Login
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
