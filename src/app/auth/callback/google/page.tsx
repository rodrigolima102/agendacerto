'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';

// ----------------------------------------------------------------------

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          router.push('/auth/jwt/sign-in?error=oauth_error');
          return;
        }

        if (!code) {
          console.error('No authorization code found');
          router.push('/auth/jwt/sign-in?error=no_code');
          return;
        }

        // Troca o código por tokens
        const tokens = await googleAuthService.exchangeCodeForTokens(code);

            // Salva tokens no localStorage (inicia auto-refresh automaticamente)
            googleAuthService.saveTokens(tokens);

        // Redireciona para a tela da empresa
        router.push('/auth/jwt/sign-in?connected=true');

      } catch (error) {
        console.error('Error processing Google callback:', error);
        router.push('/auth/jwt/sign-in?error=callback_error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

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
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
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
            <Iconify icon="logos:google-calendar" width={32} />
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Conectando com Google Calendar...
          </Typography>

          <LinearProgress sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary">
            Aguarde enquanto processamos sua autorização.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
