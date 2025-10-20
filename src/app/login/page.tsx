'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

import { supabase } from 'src/lib/supabaseClient';
import { getOrCreateProfile } from 'src/lib/profile';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Verificar se já existe uma sessão ativa
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Usuário já está logado, verificar perfil e redirecionar
          try {
            const profile = await getOrCreateProfile(supabase, user.id);
            
            if (profile.must_change_password) {
              router.push('/alterar-senha');
            } else if (!profile.is_active) {
              router.push('/conta-suspensa');
            } else {
              router.push('/auth/jwt/sign-in');
            }
          } catch (profileError) {
            console.error('Erro ao verificar perfil:', profileError);
            router.push('/auth/jwt/sign-in');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Login bem-sucedido, verificar se precisa trocar senha
        try {
          const profile = await getOrCreateProfile(supabase, data.user.id);
          
          if (profile.must_change_password) {
            // Precisa trocar senha, redireciona para página de alterar senha
            router.push('/alterar-senha');
          } else if (!profile.is_active) {
            // Conta inativa, redireciona para página de conta suspensa
            router.push('/conta-suspensa');
          } else {
            // Tudo OK, redireciona para o login do Google
            router.push('/auth/jwt/sign-in');
          }
        } catch (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          // Em caso de erro, redireciona para login do Google
          router.push('/auth/jwt/sign-in');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica sessão
  if (checkingSession) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              AgendaCerto
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Verificando sessão...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              AgendaCerto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faça login para acessar sua agenda
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
              required
            />

            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Fazendo login...
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Não tem uma conta?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => router.push('/signup')}
                disabled={loading}
              >
                Cadastre-se
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
