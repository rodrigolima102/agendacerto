'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from 'src/lib/supabaseClient';
import { Iconify } from 'src/components/iconify';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
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
        return;
      }

      setEmpresa(empresaData);

    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bem-vindo ao AgendaCerto
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user?.user_metadata?.avatar_url}
              sx={{ width: 40, height: 40 }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              variant="outlined"
              onClick={handleLogout}
              startIcon={<Iconify icon="eva:log-out-fill" />}
            >
              Sair
            </Button>
          </Box>
        </Box>

        {/* Empresa Info */}
        {empresa && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {empresa.logo_url ? (
                      <Avatar
                        src={empresa.logo_url}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        }}
                      >
                        <Iconify icon="eva:briefcase-fill" width={30} />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {empresa.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={getRamoLabel(empresa.ramo_atividade)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={getStatusLabel(empresa.n8n_workflow_status)}
                          size="small"
                          color={getStatusColor(empresa.n8n_workflow_status)}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  {empresa.info_gerais && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Sobre a Empresa
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {empresa.info_gerais}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="eva:edit-fill" />}
                      onClick={() => router.push('/onboarding/empresa')}
                    >
                      Editar Dados
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="eva:calendar-fill" />}
                      onClick={() => router.push('/test/agenda')}
                    >
                      Ver Agenda
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Status da Integração
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Google Calendar</Typography>
                      <Chip
                        label={empresa.google_connected ? 'Conectado' : 'Desconectado'}
                        size="small"
                        color={empresa.google_connected ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">N8N Workflow</Typography>
                      <Chip
                        label={getStatusLabel(empresa.n8n_workflow_status)}
                        size="small"
                        color={getStatusColor(empresa.n8n_workflow_status)}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {!empresa.google_connected && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Conecte sua agenda do Google para começar a usar o sistema.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Ações Rápidas
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
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
                    <Iconify icon="eva:calendar-fill" width={24} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Ver Agenda
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                    }}
                  >
                    <Iconify icon="eva:settings-fill" width={24} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Configurações
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: 'success.main',
                      color: 'success.contrastText',
                    }}
                  >
                    <Iconify icon="eva:people-fill" width={24} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Clientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                    }}
                  >
                    <Iconify icon="eva:bar-chart-fill" width={24} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Relatórios
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}