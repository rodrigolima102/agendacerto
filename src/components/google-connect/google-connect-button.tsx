'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';

// ----------------------------------------------------------------------

type Props = {
  onConnected?: () => void;
  onError?: (error: string) => void;
};

export function GoogleConnectButton({ onConnected, onError }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');

      // Usar rota de OAuth com state (CSRF protection)
      window.location.href = '/api/google/auth';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao conectar com Google Calendar';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          mx: 'auto',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Iconify icon="logos:google-calendar" width={40} />
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Conectar Google Calendar
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Conecte sua conta do Google Calendar para sincronizar seus eventos e usar as funcionalidades de automação.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      {isConnecting && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Redirecionando para o Google...
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        size="large"
        disabled={isConnecting}
        onClick={handleConnect}
        startIcon={<Iconify icon="logos:google" />}
        sx={{ minWidth: 200 }}
      >
        {isConnecting ? 'Conectando...' : 'Conectar com Google'}
      </Button>
    </Box>
  );
}
