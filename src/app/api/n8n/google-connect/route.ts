import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const googleAccessToken = body.googleAccessToken;
    const googleRefreshToken = body.googleRefreshToken;
    let companyId = body.companyId;

    if (!googleAccessToken) {
      return NextResponse.json(
        { error: 'googleAccessToken é obrigatório' },
        { status: 400 }
      );
    }

    // Se companyId não foi fornecido, buscar do usuário autenticado
    if (!companyId) {
      // TODO: Buscar companyId do cookie de autenticação
      console.log('⚠️ [N8N API] companyId não fornecido, pulando chamada ao N8N');
      return NextResponse.json({
        success: false,
        message: 'companyId não fornecido'
      });
    }

    console.log('🚀 [API Route] Enviando dados para webhook N8N...');
    console.log('   CompanyId:', companyId.substring(0, 8) + '...');
    console.log('   Access Token length:', googleAccessToken.length);
    console.log('   Refresh Token:', googleRefreshToken ? 'Presente ✅' : 'Ausente');

    const response = await fetch('https://rodrigolima102.app.n8n.cloud/webhook/3c817931-bb7c-482c-af62-bf407db639c3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        googleAccessToken,
        googleRefreshToken, // ✅ Incluir refresh_token
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
