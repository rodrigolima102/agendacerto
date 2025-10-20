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

// ----------------------------------------------------------------------

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [router]);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSenha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 1. Atualizar a senha do usuário
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (updatePasswordError) {
        throw updatePasswordError;
      }

      // 2. Atualizar o perfil para não precisar mais trocar a senha
      if (user?.id) {
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ must_change_password: false })
          .eq('id', user.id);

        if (updateProfileError) {
          console.error('Erro ao atualizar perfil:', updateProfileError);
          // Não falha a operação se não conseguir atualizar o perfil
        }
      }

      setSuccess('Senha alterada com sucesso! Redirecionando...');
      
      // 3. Redirecionar para o login do Google após 2 segundos
      setTimeout(() => {
        router.push('/auth/jwt/sign-in');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <LinearProgress />
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
              Alterar Senha
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digite sua nova senha
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAlterarSenha}>
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
              required
              helperText="Mínimo de 6 caracteres"
            />

            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
              required
            />

            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Alterando senha...
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
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Após alterar a senha, você será redirecionado para o login do Google
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
