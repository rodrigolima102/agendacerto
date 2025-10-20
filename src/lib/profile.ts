import { SupabaseClient } from '@supabase/supabase-js'

// ----------------------------------------------------------------------

export type Profile = {
  id: string
  is_active: boolean
  must_change_password: boolean
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

// ----------------------------------------------------------------------

/**
 * Busca um perfil pelo ID do usuário ou cria um novo se não existir
 * 
 * @param supabase - Cliente do Supabase
 * @param userId - ID do usuário
 * @returns Promise<Profile> - Perfil do usuário
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile> {
  try {
    // 1. Tenta buscar o perfil existente
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Se encontrou o perfil, retorna
    if (existingProfile && !selectError) {
      return {
        id: existingProfile.id,
        is_active: existingProfile.is_active ?? true,
        must_change_password: existingProfile.must_change_password ?? false,
        full_name: existingProfile.full_name,
        phone: existingProfile.phone,
        avatar_url: existingProfile.avatar_url,
        created_at: existingProfile.created_at,
        updated_at: existingProfile.updated_at,
      }
    }

    // 2. Se não encontrou, cria um novo perfil
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        is_active: true,
        must_change_password: false,
        full_name: null,
        phone: null,
        avatar_url: null,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao criar perfil: ${insertError.message}`)
    }

    if (!newProfile) {
      throw new Error('Erro: Perfil não foi criado')
    }

    return {
      id: newProfile.id,
      is_active: newProfile.is_active ?? true,
      must_change_password: newProfile.must_change_password ?? false,
      full_name: newProfile.full_name,
      phone: newProfile.phone,
      avatar_url: newProfile.avatar_url,
      created_at: newProfile.created_at,
      updated_at: newProfile.updated_at,
    }

  } catch (error) {
    console.error('Erro em getOrCreateProfile:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

/**
 * Atualiza um perfil existente
 * 
 * @param supabase - Cliente do Supabase
 * @param userId - ID do usuário
 * @param updates - Campos para atualizar
 * @returns Promise<Profile> - Perfil atualizado
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`)
    }

    if (!data) {
      throw new Error('Erro: Perfil não foi atualizado')
    }

    return {
      id: data.id,
      is_active: data.is_active ?? true,
      must_change_password: data.must_change_password ?? false,
      full_name: data.full_name,
      phone: data.phone,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

  } catch (error) {
    console.error('Erro em updateProfile:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

/**
 * Busca um perfil pelo ID (sem criar se não existir)
 * 
 * @param supabase - Cliente do Supabase
 * @param userId - ID do usuário
 * @returns Promise<Profile | null> - Perfil do usuário ou null se não existir
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      is_active: data.is_active ?? true,
      must_change_password: data.must_change_password ?? false,
      full_name: data.full_name,
      phone: data.phone,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

  } catch (error) {
    console.error('Erro em getProfile:', error)
    return null
  }
}
