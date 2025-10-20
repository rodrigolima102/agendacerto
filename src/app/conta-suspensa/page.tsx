'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

import { supabase } from 'src/lib/supabaseClient';

// ----------------------------------------------------------------------

export default function ContaSuspensaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSair = async () => {
    try {
      setLoading(true);
      setError('');

      // Fazer logout do Supabase
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      // Redirecionar para a página de login
      router.push('/login');

    } catch (err: any) {
      setError(err.message || 'Erro ao sair da conta');
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
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Ícone de aviso */}
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
            }}
          >
            <Typography variant="h2">⚠️</Typography>
          </Box>

          {/* Título */}
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
            Conta Suspensa
          </Typography>

          {/* Mensagem principal */}
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1">
              Sua conta está temporariamente suspensa. Entre em contato com o suporte ou regularize seu pagamento para voltar a usar o sistema.
            </Typography>
          </Alert>

          {/* Mensagem de erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Saindo da conta...
              </Typography>
            </Box>
          )}

          {/* Botão Sair */}
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleSair}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Saindo...' : 'Sair'}
          </Button>

          {/* Informações adicionais */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Precisa de ajuda?</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Entre em contato com nosso suporte através do email: suporte@agendacerto.com
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
