# Default build expression
# Build with: nix-build
# For flake users: nix build

{ pkgs ? import <nixpkgs> { config.allowUnfree = true; } }:

let
  nodejs = pkgs.nodejs_20;
  
  buildInputs = with pkgs; [
    nodejs
    cairo
    pango
    libjpeg
    giflib
    librsvg
    pixman
    pkg-config
    python3
  ];

in
pkgs.stdenv.mkDerivation {
  pname = "react-assessment-app";
  version = "0.0.0";
  
  src = ./.;
  
  inherit buildInputs;
  nativeBuildInputs = [ nodejs ];
  
  buildPhase = ''
    export HOME=$TMPDIR
    export CANVAS_PREBUILT=1
    export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath buildInputs}:$LD_LIBRARY_PATH"
    export PKG_CONFIG_PATH="${pkgs.lib.makeSearchPathOutput "dev" "lib/pkgconfig" buildInputs}"
    
    echo "Installing dependencies..."
    npm ci --legacy-peer-deps
    
    echo "Building application..."
    npm run build
  '';
  
  installPhase = ''
    mkdir -p $out
    cp -r dist/* $out/
    
    # Create a simple index file to list contents
    echo "Build completed successfully" > $out/BUILD_INFO
    echo "Build date: $(date)" >> $out/BUILD_INFO
  '';
  
  meta = with pkgs.lib; {
    description = "React-based assessment application";
    homepage = "https://github.com/brona90/assessment";
    license = licenses.mit;
    platforms = platforms.linux ++ platforms.darwin;
    maintainers = [ ];
  };
}