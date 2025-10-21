'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NÃO DEFINIDA',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'DEFINIDA' : 'NÃO DEFINIDA',
    });
  }, []);

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
        Esta página ajuda a verificar se as variáveis de ambiente estão sendo carregadas corretamente na Vercel.
      </Alert>
    </Box>
  );
}
