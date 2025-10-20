'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';
import type { GoogleAuthTokens } from 'src/types/google-auth';

// ----------------------------------------------------------------------

export default function PublicAgendaPage() {
  const [tokens, setTokens] = useState<GoogleAuthTokens | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Verificar se há tokens salvos
    const savedTokens = googleAuthService.getTokens();
    if (savedTokens) {
      setTokens(savedTokens);
      generateSecurePublicUrl(savedTokens.access_token);
    }
  }, []);

  const generateSecurePublicUrl = async (accessToken: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/calendar/generate-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao gerar link público');
      }

      const data = await response.json();
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/agenda/${data.publicToken}`;
      setPublicUrl(publicUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Falha ao gerar link público');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!tokens) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Não conectado ao Google Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Faça login primeiro para gerar links públicos da sua agenda.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/auth/jwt/sign-in'}
              startIcon={<Iconify icon="logos:google" />}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🔗 Compartilhar Agenda
      </Typography>

      {/* Aviso de segurança */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          🔒 Link Seguro
        </Typography>
        <Typography variant="body2">
          Este link é seguro e não expõe suas credenciais. O token público expira em 24 horas e pode ser revogado a qualquer momento.
        </Typography>
      </Alert>

      {/* Card principal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
              }}
            >
              <Iconify icon="eva:calendar-fill" width={24} />
            </Box>
            <Box>
              <Typography variant="h6">Agenda Pública</Typography>
              <Typography variant="body2" color="text.secondary">
                Compartilhe sua agenda com outras pessoas
              </Typography>
            </Box>
            <Chip label="Conectado" color="success" size="small" />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Link Público da Agenda
          </Typography>
          
          <TextField
            fullWidth
            value={publicUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={copyToClipboard}
                    startIcon={<Iconify icon="eva:copy-fill" />}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Este link permite que outras pessoas visualizem seus eventos dos próximos 7 dias.
            <strong> Apenas visualização - sem permissão de edição.</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Gerando link seguro...
            </Alert>
          )}
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => window.open(publicUrl, '_blank')}
            startIcon={<Iconify icon="eva:external-link-fill" />}
          >
            Visualizar Agenda Pública
          </Button>
          <Button
            variant="outlined"
            onClick={() => generateSecurePublicUrl(tokens.access_token)}
            disabled={loading}
            startIcon={<Iconify icon="eva:refresh-fill" />}
          >
            {loading ? 'Gerando...' : 'Gerar Novo Link'}
          </Button>
        </CardActions>
      </Card>

      {/* Instruções */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📋 Como Usar
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Chip label="1" size="small" color="primary" />
              <Box>
                <Typography variant="subtitle2">Copie o link público</Typography>
                <Typography variant="body2" color="text.secondary">
                  Clique em "Copiar" para copiar o link para a área de transferência
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Chip label="2" size="small" color="primary" />
              <Box>
                <Typography variant="subtitle2">Compartilhe com outras pessoas</Typography>
                <Typography variant="body2" color="text.secondary">
                  Envie o link por email, WhatsApp ou qualquer outro meio
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Chip label="3" size="small" color="primary" />
              <Box>
                <Typography variant="subtitle2">Visualização pública</Typography>
                <Typography variant="body2" color="text.secondary">
                  Qualquer pessoa com o link pode ver seus eventos (somente leitura)
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
