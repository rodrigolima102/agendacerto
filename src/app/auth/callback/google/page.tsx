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
import { supabase } from 'src/lib/supabaseClient';
import { sendGoogleConnectionToN8N } from 'src/lib/n8n-webhook';

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

        // 🔍 DEBUG: Verificar resposta do Google OAuth
        console.log('🔍 Google OAuth Response:', tokens);
        console.log('🔍 Access Token:', tokens.access_token);
        console.log('🔍 Credential:', tokens.credential);
        console.log('🔍 Token Type:', tokens.token_type);
        console.log('🔍 Expires In:', tokens.expires_in);

        // Salva tokens no localStorage (inicia auto-refresh automaticamente)
        googleAuthService.saveTokens(tokens);

        // 🆕 Chamar webhook N8N com access token
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Buscar ID da empresa
            const { data: empresa } = await supabase
              .from('empresas')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (empresa?.id) {
              // 🔍 DEBUG: Verificar se access_token existe
              if (!tokens.access_token) {
                console.log('⚠️ Access Token está vazio!');
                console.log('🔍 Credential disponível:', tokens.credential);
                console.log('🔍 Todos os campos do token:', Object.keys(tokens));
              } else {
                console.log('✅ Access Token encontrado:', tokens.access_token.substring(0, 20) + '...');
              }

              console.log('🚀 Enviando dados para webhook N8N...');
              
              // Enviar para webhook N8N
              const calendarsData = await sendGoogleConnectionToN8N(
                empresa.id,
                tokens.access_token || tokens.credential
              );

              // Salvar resposta no localStorage para exibir na página
              localStorage.setItem('n8n_calendars', JSON.stringify(calendarsData));
              
              console.log('✅ Agendas recebidas do N8N:', calendarsData);
            }
          }
        } catch (n8nError) {
          console.error('❌ Erro ao chamar webhook N8N (não crítico):', n8nError);
          // Não bloqueia o fluxo principal
        }

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
