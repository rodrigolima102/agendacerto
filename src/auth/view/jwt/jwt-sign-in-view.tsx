'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { googleAuthService } from 'src/lib/google-auth';
import { supabase } from 'src/lib/supabaseClient';

// ----------------------------------------------------------------------

interface Empresa {
  id: string;
  nome: string;
  slug: string;
  ramo_atividade: string;
  info_gerais: string | null;
  logo_url: string | null;
  google_connected: boolean;
  n8n_workflow_status: string;
  created_at: string;
}

export function JwtSignInView() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Verificar se veio de uma conexão bem-sucedida
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      setConnectionSuccess(true);
      // Limpar o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Buscar dados da empresa
      const { data: empresaData, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar empresa:', error);
        router.push('/login');
        return;
      }

          setEmpresa(empresaData);

          // Verificar se o Google está conectado
          const tokens = googleAuthService.getTokens();
          if (tokens && tokens.access_token) {
            // Se tem tokens mas a empresa não está marcada como conectada, atualizar
            if (!empresaData.google_connected) {
              await supabase
                .from('empresas')
                .update({ google_connected: true })
                .eq('user_id', user.id);
              
              setEmpresa(prev => prev ? { ...prev, google_connected: true } : null);
            }
          }

        } catch (err) {
          console.error('Erro ao verificar usuário:', err);
          router.push('/login');
        } finally {
          setLoading(false);
        }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsConnecting(true);
      setError('');

      const authUrl = await googleAuthService.initiateOAuth();
      window.location.href = authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao conectar com Google';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      // Limpar tokens do Google
      googleAuthService.clearTokens();
      
      // Atualizar status no banco de dados
      if (user && empresa) {
        await supabase
          .from('empresas')
          .update({ google_connected: false })
          .eq('user_id', user.id);
        
        // Atualizar estado local
        setEmpresa(prev => prev ? { ...prev, google_connected: false } : null);
      }
      
      setError('');
    } catch (error) {
      console.error('Erro ao deslogar do Google:', error);
      setError('Erro ao desconectar do Google');
    }
  };

  const getRamoLabel = (ramo: string) => {
    const ramos: { [key: string]: string } = {
      'beleza': 'Beleza',
      'saude': 'Saúde',
      'educacao': 'Educação',
      'servicos': 'Serviços',
      'outros': 'Outros',
    };
    return ramos[ramo] || 'Outros';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  // Mostrar loading enquanto verifica usuário
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => `
            radial-gradient(circle at 20% 80%, ${theme.palette.primary.lighter}20 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${theme.palette.secondary.lighter}20 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${theme.palette.info.lighter}15 0%, transparent 50%)
          `,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          p: { xs: 3, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(20px)',
          background: (theme) => `rgba(255,255,255,0.1)`,
          borderBottom: (theme) => `1px solid ${theme.palette.primary.lighter}40`,
        }}
      >
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              color: 'white',
              mb: 1,
              textShadow: (theme) => `0 4px 8px ${theme.palette.common.black}20`,
            }}
          >
            AgendaCerto
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
            }}
          >
            Bem-vindo de volta, {user?.email?.split('@')[0]}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleLogout}
          startIcon={<Iconify icon="eva:log-out-fill" />}
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
              transform: 'translateY(-2px)',
            },
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          Sair
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 5,
          p: { xs: 3, md: 4 },
          width: '100%',
        }}
      >
        {empresa && (
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Company Info Card */}
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: (theme) => theme.customShadows.card,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.grey[200]}`,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.customShadows.z20,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    {empresa.logo_url ? (
                      <Avatar
                        src={empresa.logo_url}
                        sx={{ 
                          width: { xs: 80, md: 120 }, 
                          height: { xs: 80, md: 120 }, 
                          mr: { xs: 0, md: 4 },
                          mb: { xs: 3, md: 0 },
                          boxShadow: (theme) => theme.customShadows.z8,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: { xs: 80, md: 120 },
                          height: { xs: 80, md: 120 },
                          mr: { xs: 0, md: 4 },
                          mb: { xs: 3, md: 0 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 3,
                          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          color: 'white',
                          boxShadow: (theme) => theme.customShadows.primary,
                        }}
                      >
                        <Iconify icon="eva:briefcase-fill" width={60} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          mb: 2,
                          color: 'text.primary',
                        }}
                      >
                        {empresa.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        <Chip
                          label={getRamoLabel(empresa.ramo_atividade)}
                          color="primary"
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            height: 32,
                          }}
                        />
                        <Chip
                          label={getStatusLabel(empresa.n8n_workflow_status)}
                          color={getStatusColor(empresa.n8n_workflow_status)}
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            height: 32,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {empresa.info_gerais && (
                    <Box 
                      sx={{ 
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.primary.lighter + '20',
                        border: (theme) => `1px solid ${theme.palette.primary.lighter}40`,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                        Sobre a Empresa
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {empresa.info_gerais}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="eva:edit-fill" />}
                      onClick={() => router.push('/onboarding/empresa')}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: (theme) => theme.customShadows.primary,
                        '&:hover': {
                          boxShadow: (theme) => theme.customShadows.z12,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Editar Dados
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Iconify icon="eva:calendar-fill" />}
                      onClick={() => router.push('/dashboard/calendar')}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Ver Agenda
                    </Button>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="eva:grid-fill" />}
                      onClick={() => router.push('/dashboard/calendar')}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        bgcolor: 'secondary.main',
                        boxShadow: (theme) => theme.customShadows.secondary,
                        '&:hover': {
                          boxShadow: (theme) => theme.customShadows.z12,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Agenda Completa
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Integration Status Card */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: (theme) => theme.customShadows.card,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.grey[200]}`,
                  height: 'fit-content',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.customShadows.z20,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      color: 'text.primary',
                      textAlign: 'center',
                    }}
                  >
                    Integrações
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: empresa.google_connected ? (theme) => theme.palette.success.lighter + '20' : (theme) => theme.palette.grey[100],
                        border: (theme) => `1px solid ${empresa.google_connected ? theme.palette.success.light : theme.palette.grey[300]}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: empresa.google_connected ? 'success.main' : 'grey.400',
                            color: 'white',
                            boxShadow: (theme) => theme.customShadows.z4,
                          }}
                        >
                          <Iconify icon="logos:google-calendar" width={24} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Google Calendar
                        </Typography>
                      </Box>
                      <Chip
                        label={empresa.google_connected ? 'Conectado' : 'Desconectado'}
                        size="small"
                        color={empresa.google_connected ? 'success' : 'default'}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: empresa.n8n_workflow_status === 'active' ? (theme) => theme.palette.success.lighter + '20' : (theme) => theme.palette.grey[100],
                        border: (theme) => `1px solid ${empresa.n8n_workflow_status === 'active' ? theme.palette.success.light : theme.palette.grey[300]}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: empresa.n8n_workflow_status === 'active' ? 'success.main' : 'grey.400',
                            color: 'white',
                            boxShadow: (theme) => theme.customShadows.z4,
                          }}
                        >
                          <Iconify icon="eva:settings-fill" width={24} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          N8N Workflow
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(empresa.n8n_workflow_status)}
                        size="small"
                        color={getStatusColor(empresa.n8n_workflow_status)}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  {connectionSuccess && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          fontWeight: 500,
                        },
                      }}
                    >
                      ✅ Google Calendar conectado com sucesso!
                    </Alert>
                  )}

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          fontWeight: 500,
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {isConnecting && (
                    <Box sx={{ mb: 3 }}>
                      <LinearProgress 
                        sx={{ 
                          borderRadius: 1,
                          height: 6,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                          },
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontWeight: 500 }}>
                        Conectando com Google...
                      </Typography>
                    </Box>
                  )}

                  {empresa.google_connected ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        disabled={isConnecting}
                        startIcon={<Iconify icon="logos:google" />}
                        fullWidth
                        sx={{ 
                          height: 56,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          bgcolor: 'success.main',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: 'none',
                            transform: 'none',
                          },
                        }}
                      >
                        ✓ Google Conectado
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleGoogleLogout}
                        startIcon={<Iconify icon="eva:log-out-fill" />}
                        fullWidth
                        sx={{ 
                          height: 48,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          borderColor: 'error.main',
                          color: 'error.main',
                          '&:hover': {
                            borderColor: 'error.dark',
                            bgcolor: 'error.lighter',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Desconectar Google
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      disabled={isConnecting}
                      onClick={handleGoogleLogin}
                      startIcon={<Iconify icon="logos:google" />}
                      fullWidth
                      sx={{ 
                        height: 56,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: (theme) => theme.customShadows.primary,
                        '&:hover': {
                          boxShadow: (theme) => theme.customShadows.z12,
                          transform: 'translateY(-2px)',
                        },
                        bgcolor: 'primary.main',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isConnecting ? 'Conectando...' : 'Conectar com Google'}
                    </Button>
                  )}

                  {!empresa.google_connected && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          fontWeight: 500,
                        },
                      }}
                    >
                      Conecte sua agenda do Google para começar a usar o sistema.
                    </Alert>
                  )}

                  {empresa.google_connected && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          fontWeight: 500,
                        },
                      }}
                    >
                      Google Calendar conectado com sucesso! Você pode acessar suas agendas.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
