#!/usr/bin/env bash
# Validation script for Nix setup
# Run this after setting up Nix to verify everything works

set -e

echo "🔍 Validating Nix Setup..."
echo ""

# Check if Nix is installed
if ! command -v nix &> /dev/null; then
    echo "❌ Nix is not installed"
    echo "   Install from: https://nixos.org/download.html"
    exit 1
fi
echo "✅ Nix is installed: $(nix --version)"

# Check if flakes are enabled
if nix eval --expr '1 + 1' &> /dev/null; then
    echo "✅ Nix flakes are enabled"
else
    echo "⚠️  Nix flakes are not enabled"
    echo "   Enable with: echo 'experimental-features = nix-command flakes' >> ~/.config/nix/nix.conf"
fi

# Check if direnv is installed (optional)
if command -v direnv &> /dev/null; then
    echo "✅ direnv is installed: $(direnv --version)"
else
    echo "ℹ️  direnv is not installed (optional but recommended)"
    echo "   Install with: nix-env -iA nixpkgs.direnv"
fi

echo ""
echo "🧪 Testing Nix development environment..."

# Try to enter the development environment
if nix develop --command bash -c "node --version && npm --version" &> /dev/null; then
    NODE_VERSION=$(nix develop --command node --version)
    NPM_VERSION=$(nix develop --command npm --version)
    echo "✅ Development environment works"
    echo "   Node.js: $NODE_VERSION"
    echo "   npm: $NPM_VERSION"
else
    echo "❌ Failed to enter development environment"
    echo "   Try: nix develop"
    exit 1
fi

echo ""
echo "🏗️  Testing Nix build..."

# Try to build (this might take a while on first run)
if nix build --dry-run &> /dev/null; then
    echo "✅ Build configuration is valid"
else
    echo "❌ Build configuration has errors"
    exit 1
fi

echo ""
echo "✨ All checks passed! Your Nix setup is ready."
echo ""
echo "Next steps:"
echo "  1. Run 'nix develop' to enter the development environment"
echo "  2. Run 'npm install' to install dependencies"
echo "  3. Run 'npm run dev' to start the development server"
echo ""
echo "Or use direnv for automatic environment loading:"
echo "  1. Run 'direnv allow' in this directory"
echo "  2. Environment will load automatically when you cd here"