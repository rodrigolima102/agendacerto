'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';
import type { GoogleAuthTokens, GoogleUser } from 'src/types/google-auth';

// ----------------------------------------------------------------------

type Props = {
  onDisconnect?: () => void;
  onLoadEvents?: () => void;
};

export function GoogleStatus({ onDisconnect, onLoadEvents }: Props) {
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Verificar se há tokens salvos
    const savedTokens = googleAuthService.getTokens();
    if (savedTokens) {
      setTokens(savedTokens);
      loadUserInfo(savedTokens.access_token);
    }
  }, []);

  const loadUserInfo = async (accessToken: string) => {
    try {
      const userInfo = await googleAuthService.getUserInfo(accessToken);
      setUser(userInfo);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleLoadEvents = async () => {
    if (!tokens?.access_token) return;

    try {
      setLoading(true);
      setError('');

      const events = await googleAuthService.listEvents(tokens.access_token);
      console.log('Events loaded:', events);
      
      onLoadEvents?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setTokens(null);
    setUser(null);
    googleAuthService.clearTokens();
    onDisconnect?.();
  };

  if (!tokens) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
              }}
            >
              <Iconify icon="logos:google-calendar" width={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Google Calendar Conectado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user ? `Conectado como ${user.name}` : 'Sincronização ativa'}
              </Typography>
            </Box>
          </Box>
          <Chip label="Conectado" color="success" size="small" />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sua conta do Google Calendar está conectada. Você pode sincronizar eventos e usar as funcionalidades de automação.
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleLoadEvents}
          disabled={loading}
          startIcon={<Iconify icon="eva:refresh-fill" />}
        >
          {loading ? 'Sincronizando...' : 'Sincronizar Eventos'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDisconnect}
          startIcon={<Iconify icon="eva:close-fill" />}
        >
          Desconectar
        </Button>
      </CardActions>
    </Card>
  );
}
