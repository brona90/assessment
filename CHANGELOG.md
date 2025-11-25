# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - NixOS Conversion

#### Nix Configuration Files
- **flake.nix**: Modern Nix flakes configuration with:
  - Node.js 20.x environment
  - All required system libraries (cairo, pango, libjpeg, etc.) for canvas package
  - Chromium for Playwright testing
  - Development tools (ESLint, Prettier)
  - Build configuration for production deployments
  - Convenient apps for common tasks (dev, build, test)
  
- **shell.nix**: Legacy Nix shell configuration for users not using flakes
  - Provides same environment as flake.nix
  - Backward compatible with older Nix installations
  
- **default.nix**: Build expression for creating production builds
  - Standalone build configuration
  - Can be used with `nix-build` command
  
- **.envrc**: direnv configuration for automatic environment loading
  - Automatically loads Nix environment when entering directory
  - Adds node_modules/.bin to PATH
  - Optional but highly recommended for developer experience

- **.gitattributes**: Git attributes for Nix files
  - Marks Nix files with proper language detection
  - Marks generated files appropriately

#### Documentation
- **NIX_SETUP.md**: Comprehensive Nix setup guide including:
  - Installation instructions for different platforms
  - Quick start guides for flakes and legacy mode
  - Development workflow documentation
  - Troubleshooting section with common issues
  - Advanced usage examples
  - Best practices and resources
  
- **README.md**: Updated with NixOS setup instructions
  - Added "Using Nix" section with quick start
  - Documented both flakes and legacy approaches
  - Added troubleshooting for Nix-specific issues
  - Included information about Nix environment features

#### Validation Tools
- **validate-nix-setup.sh**: Automated validation script
  - Checks if Nix is installed
  - Verifies flakes are enabled
  - Tests development environment
  - Validates build configuration
  - Provides helpful next steps

#### Configuration Updates
- **.gitignore**: Added Nix-specific entries
  - `result` and `result-*` (Nix build outputs)
  - `.direnv` (direnv cache)
  - `.envrc.cache` (direnv cache)

### Changed
- Development environment now fully reproducible across all platforms
- All dependencies explicitly declared in Nix configuration
- Build process now deterministic and cacheable

### Benefits
- **Reproducibility**: Everyone gets identical development environment
- **Isolation**: No conflicts with system packages
- **Cross-platform**: Works on Linux, macOS, and WSL2
- **No Docker needed**: Native performance without containers
- **Declarative**: All dependencies version-controlled
- **Cacheable**: Nix can cache builds for faster setup

### Migration Notes
For existing developers:
1. Install Nix following instructions in NIX_SETUP.md
2. Run `nix develop` to enter development environment
3. Continue using familiar npm commands
4. Optionally set up direnv for automatic environment loading

For CI/CD:
- Nix can be integrated into existing CI/CD pipelines
- See NIX_SETUP.md for GitHub Actions example
- Builds are reproducible and cacheable

### Technical Details
- Node.js version: 20.x (managed by Nix)
- All native dependencies (canvas, etc.) provided by Nix
- Playwright browsers provided by Nix (no download needed)
- Environment variables automatically configured
- Library paths properly set for native modules

### Compatibility
- Fully backward compatible with traditional npm workflow
- Existing package.json and npm scripts unchanged
- Can still use npm/yarn directly if Nix not available
- All existing tests and builds continue to work