'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from 'src/lib/supabaseClient';
import { Iconify } from 'src/components/iconify';

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';

// Schema de validação com Zod (campos opcionais)
const onboardingSchema = z.object({
  ramoAtividade: z
    .string()
    .optional(),
  infoGerais: z
    .string()
    .max(1000, 'Informações gerais devem ter no máximo 1000 caracteres')
    .optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const RAMOS_ATIVIDADE = [
  { value: 'beleza', label: 'Beleza' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outros', label: 'Outros' },
];

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

export default function OnboardingEmpresaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const ramoAtividade = watch('ramoAtividade');

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
        router.push('/login');
        return;
      }

      setEmpresa(empresaData);

      // Se já tem dados completos, redirecionar para dashboard
      if (empresaData.ramo_atividade && empresaData.ramo_atividade !== 'outros' && empresaData.info_gerais) {
        router.push('/dashboard');
        return;
      }

    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      router.push('/login');
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB.');
        return;
      }

      setLogoFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Preparar dados para atualização (apenas campos preenchidos)
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Adicionar ramo de atividade se foi selecionado
      if (data.ramoAtividade && data.ramoAtividade !== 'outros') {
        updateData.ramo_atividade = data.ramoAtividade;
      }

      // Adicionar informações gerais se foram preenchidas
      if (data.infoGerais && data.infoGerais.trim().length > 0) {
        updateData.info_gerais = data.infoGerais.trim();
      }

      // Fazer upload da imagem se foi selecionada
      if (logoFile) {
        updateData.logo_url = await uploadLogo(logoFile);
      }

      // Só atualizar se há dados para atualizar
      if (Object.keys(updateData).length > 1) { // Mais que apenas updated_at
        const { error: updateError } = await supabase
          .from('empresas')
          .update(updateData)
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess('Dados atualizados com sucesso! Redirecionando...');
      } else {
        setSuccess('Redirecionando para o dashboard...');
      }

      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Erro no onboarding:', err);
      setError(err.message || 'Erro ao salvar dados');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica usuário
  if (!user || !empresa) {
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Iconify icon="eva:briefcase-fill" width={40} />
            </Box>

            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              Complementar Dados (Opcional)
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Você pode pular esta etapa e completar depois, ou preencher agora para personalizar sua experiência
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

          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Salvando dados...
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Upload de Logo */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Upload de Logotipo
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={logoPreview || empresa.logo_url || undefined}
                  sx={{ width: 100, height: 100 }}
                >
                  <Iconify icon="eva:image-fill" width={40} />
                </Avatar>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                  disabled={loading}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                    disabled={loading}
                  >
                    Selecionar Logo
                  </Button>
                </label>
                
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG ou GIF até 5MB
                </Typography>
              </Box>
            </Box>

            {/* Ramo de Atividade */}
            <FormControl fullWidth>
              <InputLabel>Ramo de Atividade</InputLabel>
              <Select
                value={ramoAtividade || empresa.ramo_atividade || ''}
                label="Ramo de Atividade"
                onChange={(e) => setValue('ramoAtividade', e.target.value)}
                disabled={loading}
              >
                {RAMOS_ATIVIDADE.map((ramo) => (
                  <MenuItem key={ramo.value} value={ramo.value}>
                    {ramo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Informações Gerais */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Informações Gerais"
              {...register('infoGerais')}
              error={!!errors.infoGerais}
              helperText={errors.infoGerais?.message || 'Descreva brevemente sua empresa, serviços oferecidos, etc.'}
              disabled={loading}
              placeholder="Ex: Empresa especializada em consultoria empresarial, oferecendo serviços de gestão, marketing digital e desenvolvimento de estratégias para pequenas e médias empresas..."
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<Iconify icon="eva:checkmark-fill" />}
                sx={{
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                {loading ? 'Salvando...' : 'Salvar e Continuar'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                disabled={loading}
                onClick={() => router.push('/dashboard')}
                startIcon={<Iconify icon="eva:arrow-forward-fill" />}
                sx={{
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                Pular e Continuar
              </Button>
            </Box>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
