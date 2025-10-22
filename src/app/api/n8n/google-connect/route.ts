import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { companyId, googleAccessToken } = await request.json();

    if (!companyId || !googleAccessToken) {
      return NextResponse.json(
        { error: 'companyId e googleAccessToken são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🚀 [API Route] Enviando dados para webhook N8N...');
    console.log('   CompanyId:', companyId.substring(0, 8) + '...');
    console.log('   Token length:', googleAccessToken.length);

    const response = await fetch('https://rodrigolima102.app.n8n.cloud/webhook/3c817931-bb7c-482c-af62-bf407db639c3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        googleAccessToken,
      }),
    });

    // Tentar ler a resposta como texto primeiro
    const responseText = await response.text();
    console.log('📅 [API Route] Status:', response.status);
    console.log('📅 [API Route] Response length:', responseText.length);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [API Route] Erro ao fazer parse do JSON:', parseError);
      console.log('📅 [API Route] Resposta não é JSON válido, retornando como texto');
      
      // Se não conseguir fazer parse, retornar a resposta como texto
      return NextResponse.json({
        success: true,
        rawResponse: responseText,
        status: response.status
      });
    }

    if (!response.ok) {
      console.error('❌ [API Route] Erro na resposta do N8N:', response.status, data);
      return NextResponse.json(
        { error: `N8N retornou status ${response.status}`, details: data },
        { status: response.status }
      );
    }

    console.log('📅 [API Route] Resposta parseada com sucesso');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API Route] Erro ao chamar webhook N8N:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
