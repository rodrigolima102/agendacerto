'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [environment, setEnvironment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const response = await fetch('/api/debug/env');
        
        if (!response.ok) {
          setError('Erro ao carregar variáveis de ambiente');
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setEnvironment(data.environment || 'unknown');
        setEnvVars(data.variables || {});
      } catch (err) {
        setError('Erro ao conectar com a API');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnvVars();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug - Variáveis de Ambiente
      </Typography>
      
      <Alert severity={environment === 'production' ? 'warning' : 'info'} sx={{ mb: 2 }}>
        <strong>Ambiente:</strong> {environment.toUpperCase()}
      </Alert>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status das Variáveis de Ambiente:
          </Typography>
          
          {Object.entries(envVars).map(([key, value]) => {
            const isNotDefined = String(value).includes('NÃO DEFINIDA');
            return (
              <Box 
                key={key} 
                sx={{ 
                  mb: 1, 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: isNotDefined ? 'error.lighter' : 'success.lighter'
                }}
              >
                <Typography variant="body2">
                  <strong>{key}:</strong>{' '}
                  <span style={{ 
                    color: isNotDefined ? '#d32f2f' : '#2e7d32',
                    fontFamily: 'monospace'
                  }}>
                    {String(value)}
                  </span>
                </Typography>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      <Alert severity="info">
        Esta página ajuda a verificar se as variáveis de ambiente estão sendo carregadas corretamente.
      </Alert>
      
      {environment === 'development' && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          ⚠️ Variáveis sensíveis (secrets) são ocultadas por segurança, mesmo em desenvolvimento.
        </Alert>
      )}
    </Box>
  );
}
