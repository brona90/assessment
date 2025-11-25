{
  description = "React Assessment Application - NixOS Project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # Node.js version to use
        nodejs = pkgs.nodejs_20;

        # Build dependencies
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
        ];

        # Development dependencies
        nativeBuildInputs = with pkgs; [
          # Additional dev tools
          nodePackages.eslint
          nodePackages.prettier
        ];

      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = buildInputs ++ nativeBuildInputs;
          
          shellHook = ''
            echo "🚀 React Assessment Development Environment"
            echo "Node.js version: $(node --version)"
            echo "npm version: $(npm --version)"
            echo ""
            echo "Available commands:"
            echo "  npm run dev          - Start development server"
            echo "  npm run build        - Build for production"
            echo "  npm run test         - Run tests"
            echo "  npm run lint         - Run linter"
            echo ""
            
            # Set up environment variables for canvas
            export CANVAS_PREBUILT=1
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath buildInputs}:$LD_LIBRARY_PATH"
            export PKG_CONFIG_PATH="${pkgs.lib.makeSearchPathOutput "dev" "lib/pkgconfig" buildInputs}"
            
            # Playwright environment
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            
            # Ensure node_modules/.bin is in PATH
            export PATH="$PWD/node_modules/.bin:$PATH"
          '';
        };

        # Package definition for building the application
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "react-assessment-app";
          version = "0.0.0";
          
          src = ./.;
          
          buildInputs = buildInputs;
          nativeBuildInputs = [ nodejs ];
          
          buildPhase = ''
            export HOME=$TMPDIR
            export CANVAS_PREBUILT=1
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath buildInputs}:$LD_LIBRARY_PATH"
            
            # Install dependencies
            npm ci --legacy-peer-deps
            
            # Build the application
            npm run build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/
          '';
          
          meta = with pkgs.lib; {
            description = "React-based assessment application";
            license = licenses.mit;
            platforms = platforms.linux ++ platforms.darwin;
          };
        };

        # Apps for running common tasks
        apps = {
          dev = {
            type = "app";
            program = "${pkgs.writeShellScript "dev" ''
              cd ${./.}
              ${nodejs}/bin/npm run dev
            ''}";
          };
          
          build = {
            type = "app";
            program = "${pkgs.writeShellScript "build" ''
              cd ${./.}
              ${nodejs}/bin/npm run build
            ''}";
          };
          
          test = {
            type = "app";
            program = "${pkgs.writeShellScript "test" ''
              cd ${./.}
              ${nodejs}/bin/npm run test
            ''}";
          };
        };
      }
    );
}