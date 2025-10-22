'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Button disabled>Carregando...</Button>;
  }

  if (session) {
    return (
      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:logout-3-bold" />}
        onClick={() => signOut()}
      >
        Sair
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<Iconify icon="logos:google-icon" />}
      onClick={() => signIn('google')}
    >
      Login com Google
    </Button>
  );
}
