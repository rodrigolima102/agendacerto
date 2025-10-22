'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    setIsProduction(isProd);
    
    if (!isProd) {
      setEnvVars({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NÃO DEFINIDA',
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'DEFINIDA' : 'NÃO DEFINIDA',
      });
    }
  }, []);

  if (isProduction) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Esta página só está disponível em ambiente de desenvolvimento.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug - Variáveis de Ambiente
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status das Variáveis de Ambiente:
          </Typography>
          
          {Object.entries(envVars).map(([key, value]) => (
            <Typography key={key} variant="body2" sx={{ mb: 1 }}>
              <strong>{key}:</strong> {String(value)}
            </Typography>
          ))}
        </CardContent>
      </Card>

      <Alert severity="info">
        Esta página ajuda a verificar se as variáveis de ambiente estão sendo carregadas corretamente.
      </Alert>
      
      <Alert severity="warning" sx={{ mt: 2 }}>
        ⚠️ Esta página está disponível apenas em desenvolvimento por questões de segurança.
      </Alert>
    </Box>
  );
}
