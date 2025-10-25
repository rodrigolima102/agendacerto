/**
 * Envia dados de conexão do Google para o webhook N8N
 * e retorna a lista de agendas do Google Calendar
 */
export async function sendGoogleConnectionToN8N(
  companyId: string,
  googleAccessToken: string,
  googleRefreshToken?: string
) {
  try {
    // Usar API route local para evitar CORS
    const apiUrl = '/api/n8n/google-connect';

    console.log('🚀 [Client] Enviando dados via API route...');
    console.log('   CompanyId:', companyId.substring(0, 8) + '...');
    console.log('   Access Token length:', googleAccessToken.length);
    console.log('   Refresh Token:', googleRefreshToken ? 'Presente ✅' : 'Ausente');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        googleAccessToken,
        googleRefreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API route retornou status ${response.status}: ${errorData.error}`);
    }

    const data = await response.json();
    
    console.log('📅 [Client] Resposta recebida com sucesso');
    
    return data;
  } catch (error) {
    console.error('❌ [Client] Erro ao chamar webhook N8N:', error);
    throw error;
  }
}


