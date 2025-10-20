#!/bin/bash

# 🚀 Script de Setup para Deploy - GitHub Pages
# Este script ajuda a configurar o deploy de forma segura

set -e  # Para se houver erro

echo "🚀 Configurando Deploy para GitHub Pages..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos na versão estável
echo "🔍 Verificando versão atual..."
CURRENT_COMMIT=$(git rev-parse HEAD)
STABLE_COMMIT="85c7c62"

if [ "$CURRENT_COMMIT" != "$STABLE_COMMIT" ]; then
    print_warning "Você não está na versão estável!"
    echo "Versão atual: $CURRENT_COMMIT"
    echo "Versão estável: $STABLE_COMMIT"
    echo ""
    read -p "Deseja voltar para a versão estável? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout v1.0.0-stable
        print_status "Voltou para a versão estável"
    else
        print_warning "Continuando com a versão atual..."
    fi
fi

# Verificar se o build funciona localmente
echo ""
echo "🔨 Testando build local..."
if npm run build; then
    print_status "Build local funcionando!"
else
    print_error "Build local falhou! Corrija os erros antes de continuar."
    exit 1
fi

# Verificar se a pasta out foi criada
if [ -d "out" ]; then
    print_status "Pasta 'out' criada com sucesso!"
    echo "📁 Conteúdo da pasta out:"
    ls -la out/ | head -10
else
    print_error "Pasta 'out' não foi criada!"
    exit 1
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Configure os secrets no GitHub:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - N8N_API_KEY"
echo "   - N8N_BASE_URL"
echo ""
echo "2. Crie uma branch para deploy:"
echo "   git checkout -b deploy-initial"
echo ""
echo "3. Faça push da branch:"
echo "   git push origin deploy-initial"
echo ""
echo "4. Verifique o GitHub Actions para ver se o deploy funciona"
echo ""
print_status "Setup concluído! Siga os próximos passos acima."
