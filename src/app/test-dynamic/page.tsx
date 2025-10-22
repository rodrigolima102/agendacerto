'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

export default function TestDynamicPage() {
  const [time, setTime] = useState<string>('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            🧪 Teste de Páginas Dinâmicas
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Esta página testa se as páginas dinâmicas estão funcionando corretamente.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            ⏰ Hora Atual (atualiza a cada segundo):
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, fontFamily: 'monospace' }}>
            {time}
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            🔢 Contador Interativo:
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
            {count}
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={() => setCount(count + 1)}
            sx={{ mr: 1 }}
          >
            +1
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => setCount(count - 1)}
            sx={{ mr: 1 }}
          >
            -1
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setCount(0)}
          >
            Reset
          </Button>
          
          <Typography variant="body2" sx={{ mt: 3, color: 'success.main' }}>
            ✅ Se você está vendo esta página e o contador funciona, as páginas dinâmicas estão funcionando!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
