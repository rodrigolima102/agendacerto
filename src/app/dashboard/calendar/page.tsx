'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { CalendarView } from 'src/sections/calendar/view';
import { GoogleConnectButton } from 'src/components/google-connect/google-connect-button';
import { GoogleStatus } from 'src/components/google-connect/google-status';
import { googleAuthService } from 'src/lib/google-auth';
import type { GoogleAuthTokens } from 'src/types/google-auth';

// ----------------------------------------------------------------------

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // Verificar se há tokens salvos
    const savedTokens = googleAuthService.getTokens();
    if (savedTokens) {
      setTokens(savedTokens);
      setShowConnect(false);
    } else {
      setShowConnect(true);
    }

    // Verificar parâmetros da URL
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected === 'true') {
      setSnackbar({
        open: true,
        message: 'Google Calendar conectado com sucesso!',
        severity: 'success',
      });
    } else if (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao conectar com Google Calendar. Tente novamente.',
        severity: 'error',
      });
    }
  }, [searchParams]);

  const handleConnected = () => {
    setShowConnect(false);
    setSnackbar({
      open: true,
      message: 'Conectando com Google Calendar...',
      severity: 'success',
    });
  };

  const handleError = (error: string) => {
    setSnackbar({
      open: true,
      message: error,
      severity: 'error',
    });
  };

  const handleDisconnect = () => {
    setTokens(null);
    setShowConnect(true);
    setSnackbar({
      open: true,
      message: 'Google Calendar desconectado',
      severity: 'success',
    });
  };

  const handleLoadEvents = () => {
    setSnackbar({
      open: true,
      message: 'Eventos sincronizados com sucesso!',
      severity: 'success',
    });
  };

  return (
    <Box>
      {/* Status do Google Calendar */}
      {tokens && <GoogleStatus onDisconnect={handleDisconnect} onLoadEvents={handleLoadEvents} />}

      {/* Botão de conexão */}
      {showConnect && (
        <Box sx={{ mb: 3 }}>
          <GoogleConnectButton onConnected={handleConnected} onError={handleError} />
        </Box>
      )}

      {/* Calendário */}
      <CalendarView />

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
