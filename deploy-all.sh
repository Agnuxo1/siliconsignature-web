#!/bin/bash
# deploy-all.sh — One-command deploy to all platforms
# Run this script after setting up credentials

set -e

echo "🔥 SiliconSignature Multi-Platform Deploy Script"
echo "================================================"

# === VERCEL ===
echo ""
echo "📦 Deploying to Vercel..."
if ! command -v vercel &> /dev/null; then
    npm install -g vercel
fi
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN not set. Login with: vercel login"
    vercel --yes
else
    vercel --token "$VERCEL_TOKEN" --yes
fi

# === HUGGINGFACE ===
echo ""
echo "🤗 Deploying to HuggingFace Spaces..."
if ! command -v huggingface-cli &> /dev/null; then
    pip install huggingface-hub
fi
if [ -z "$HF_TOKEN" ]; then
    echo "⚠️  HF_TOKEN not set. Login with: huggingface-cli login"
    huggingface-cli login
fi

# Create/update Space
HF_SPACE="Agnuxo/siliconsignature-web"
echo "Pushing to $HF_SPACE..."
git remote add hf "https://huggingface.co/spaces/$HF_SPACE" 2>/dev/null || true
git push hf master --force

echo ""
echo "✅ All deployments triggered!"
echo "URLs:"
echo "  GitHub:     https://github.com/Agnuxo1/siliconsignature-web"
echo "  Cloudflare: https://silicon.p2pclaw.com"
echo "  GitHub Pages: https://agnuxo1.github.io/siliconsignature-web/"
echo "  Vercel:     (check dashboard)"
echo "  HuggingFace: https://huggingface.co/spaces/$HF_SPACE"
