# Legacy shell.nix for users not using flakes
# For flake users, use: nix develop

{ pkgs ? import <nixpkgs> { config.allowUnfree = true; } }:

let
  nodejs = pkgs.nodejs_20;
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    nodePackages.npm
    nodePackages.pnpm
    git
    
    # Required for canvas package
    cairo
    pango
    libjpeg
    giflib
    librsvg
    pixman
    
    # Required for Playwright
    chromium
    
    # Build tools
    pkg-config
    python3
    
    # Development tools
    nodePackages.eslint
    nodePackages.prettier
  ];

  shellHook = ''
    echo "🚀 React Assessment Development Environment (Legacy)"
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo ""
    echo "💡 Consider using 'nix develop' with flakes for better experience"
    echo ""
    echo "Available commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run test         - Run tests"
    echo "  npm run lint         - Run linter"
    echo ""
    
    # Set up environment variables for canvas
    export CANVAS_PREBUILT=1
    export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.cairo pkgs.pango pkgs.libjpeg pkgs.giflib pkgs.librsvg pkgs.pixman ]}:$LD_LIBRARY_PATH"
    export PKG_CONFIG_PATH="${pkgs.lib.makeSearchPathOutput "dev" "lib/pkgconfig" [ pkgs.cairo pkgs.pango pkgs.libjpeg pkgs.giflib pkgs.librsvg pkgs.pixman ]}"
    
    # Playwright environment
    export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
    
    # Ensure node_modules/.bin is in PATH
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}