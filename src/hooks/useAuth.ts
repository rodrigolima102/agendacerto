'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

import { supabase } from 'src/lib/supabaseClient';
import { getOrCreateProfile, type Profile } from 'src/lib/profile';

// ----------------------------------------------------------------------

export type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
};

// ----------------------------------------------------------------------

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    mustChangePassword: false,
    isActive: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            mustChangePassword: false,
            isActive: false,
          });
          return;
        }

        // Buscar ou criar perfil
        const profile = await getOrCreateProfile(supabase, user.id);
        
        setAuthState({
          user,
          profile,
          loading: false,
          mustChangePassword: profile.must_change_password,
          isActive: profile.is_active,
        });

        // Verificar se precisa trocar senha
        if (profile.must_change_password) {
          router.push('/alterar-senha');
          return;
        }

        // Verificar se conta está ativa
        if (!profile.is_active) {
          router.push('/conta-suspensa');
          return;
        }

      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          mustChangePassword: false,
          isActive: false,
        });
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            mustChangePassword: false,
            isActive: false,
          });
        } else if (event === 'SIGNED_IN' && session.user) {
          try {
            const profile = await getOrCreateProfile(supabase, session.user.id);
            
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              mustChangePassword: profile.must_change_password,
              isActive: profile.is_active,
            });

            // Verificar redirecionamentos
            if (profile.must_change_password) {
              router.push('/alterar-senha');
            } else if (!profile.is_active) {
              router.push('/conta-suspensa');
            }
          } catch (error) {
            console.error('Erro ao verificar perfil após login:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    ...authState,
    signOut,
  };
}
