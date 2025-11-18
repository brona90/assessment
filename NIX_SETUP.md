# NixOS Setup Guide

This document provides detailed instructions for setting up and using this project with Nix/NixOS.

## Table of Contents

1. [Why Nix?](#why-nix)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Development Workflow](#development-workflow)
5. [Building](#building)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

## Why Nix?

Nix provides several benefits for this project:

- **Reproducibility**: Everyone gets the exact same development environment
- **Isolation**: Dependencies don't conflict with system packages
- **Declarative**: All dependencies are explicitly declared
- **Cross-platform**: Works on Linux, macOS, and WSL2
- **No Docker needed**: Native performance without containers

## Installation

### Installing Nix

#### Single-user installation (recommended for most users)
```bash
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

#### Multi-user installation (recommended for macOS)
```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

#### For NixOS users
Nix is already installed! Just enable flakes:
```bash
# Add to /etc/nixos/configuration.nix
nix.settings.experimental-features = [ "nix-command" "flakes" ];
```

### Enabling Flakes

Flakes are required for the modern Nix experience:

```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### Installing direnv (Optional but Recommended)

direnv automatically loads the Nix environment when you enter the project directory:

```bash
# On NixOS
nix-env -iA nixos.direnv

# On other systems with Nix
nix-env -iA nixpkgs.direnv

# Then add to your shell config (~/.bashrc, ~/.zshrc, etc.)
eval "$(direnv hook bash)"  # for bash
eval "$(direnv hook zsh)"   # for zsh
```

## Quick Start

### With Flakes (Recommended)

```bash
# Clone the repository
git clone https://github.com/brona90/assessment.git
cd assessment

# Enter the development environment
nix develop

# Install npm dependencies
npm install

# Start development server
npm run dev
```

### With direnv (Automatic)

```bash
# Clone the repository
git clone https://github.com/brona90/assessment.git
cd assessment

# Allow direnv (first time only)
direnv allow

# Environment loads automatically!
# Now just install and run:
npm install
npm run dev
```

### Legacy Mode (without flakes)

```bash
# Enter development shell
nix-shell

# Install and run
npm install
npm run dev
```

## Development Workflow

### Entering the Development Environment

```bash
# With flakes
nix develop

# With direnv (automatic)
cd /path/to/assessment  # Environment loads automatically

# Legacy
nix-shell
```

### Available Commands

Once in the Nix environment, all standard npm commands work:

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run with coverage
npm run cucumber         # Run BDD tests

# Linting
npm run lint             # Run ESLint
```

### Using Nix Apps

The flake provides convenient apps for common tasks:

```bash
# Start development server
nix run .#dev

# Build the application
nix run .#build

# Run tests
nix run .#test
```

## Building

### Development Build

```bash
# In Nix environment
npm run build

# Output will be in dist/
```

### Production Build with Nix

```bash
# Build using Nix (creates ./result/ symlink)
nix build

# The built application is in ./result/
ls -la ./result/

# You can serve it directly:
python -m http.server -d ./result 8000
```

### Building for Deployment

```bash
# Build and deploy to GitHub Pages
npm run deploy

# Or build with Nix and deploy manually
nix build
# Copy ./result/* to your hosting service
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Canvas Package Build Failures

**Problem**: Native canvas package fails to build

**Solution**: The Nix environment automatically provides all required libraries. Ensure you're in the Nix shell:
```bash
nix develop
npm rebuild canvas
```

#### 2. Playwright Browser Not Found

**Problem**: Playwright can't find browsers

**Solution**: Browsers are provided by Nix. Make sure you're in the Nix environment:
```bash
nix develop
# Browsers are automatically available
```

#### 3. Flakes Not Working

**Problem**: `nix develop` command not recognized

**Solution**: Enable flakes in your Nix configuration:
```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

#### 4. Permission Denied Errors

**Problem**: Permission errors when running npm commands

**Solution**: Don't use sudo with npm in the Nix environment:
```bash
# Wrong
sudo npm install

# Correct
npm install
```

#### 5. Old Node Version

**Problem**: System Node.js version conflicts

**Solution**: The Nix environment provides Node.js 20. Verify you're using it:
```bash
nix develop
node --version  # Should show v20.x.x
```

#### 6. direnv Not Loading

**Problem**: Environment doesn't load automatically

**Solution**: 
```bash
# Allow direnv for this directory
direnv allow

# Check direnv is hooked in your shell
echo $DIRENV_DIR  # Should show a path

# If empty, add to your shell config:
eval "$(direnv hook bash)"  # or zsh
```

### Getting Help

If you encounter issues not covered here:

1. Check you're in the Nix environment: `echo $IN_NIX_SHELL`
2. Verify Node version: `node --version` (should be 20.x)
3. Check environment variables:
   ```bash
   echo $CANVAS_PREBUILT
   echo $PLAYWRIGHT_BROWSERS_PATH
   ```
4. Try rebuilding: `npm ci --legacy-peer-deps`

## Advanced Usage

### Customizing the Environment

You can modify `flake.nix` to add additional tools or change versions:

```nix
# Add a new tool to buildInputs
buildInputs = with pkgs; [
  nodejs
  # ... existing packages ...
  your-new-package
];
```

### Using Different Node Versions

To use a different Node.js version, modify `flake.nix`:

```nix
# Change from nodejs_20 to nodejs_18
nodejs = pkgs.nodejs_18;
```

### Building for Different Platforms

```bash
# Build for Linux
nix build .#packages.x86_64-linux.default

# Build for macOS
nix build .#packages.x86_64-darwin.default

# Build for current system
nix build
```

### Updating Dependencies

```bash
# Update flake inputs
nix flake update

# Update npm packages
npm update
```

### Garbage Collection

Nix stores builds in `/nix/store`. Clean up old builds:

```bash
# Remove old generations
nix-collect-garbage

# Remove old generations and optimize
nix-collect-garbage -d
nix-store --optimize
```

### Using Nix on CI/CD

Example GitHub Actions workflow:

```yaml
name: Build with Nix
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cachix/install-nix-action@v20
        with:
          extra_nix_config: |
            experimental-features = nix-command flakes
      - run: nix build
      - run: nix flake check
```

## Best Practices

1. **Always use the Nix environment** for development to ensure consistency
2. **Commit flake.lock** to version control for reproducibility
3. **Use direnv** for automatic environment loading
4. **Don't mix system and Nix packages** - let Nix manage everything
5. **Update regularly** with `nix flake update`
6. **Clean up** periodically with `nix-collect-garbage`

## Resources

- [Nix Manual](https://nixos.org/manual/nix/stable/)
- [Nix Pills](https://nixos.org/guides/nix-pills/) - Learn Nix in depth
- [NixOS Wiki](https://nixos.wiki/)
- [Nix Package Search](https://search.nixos.org/)
- [direnv Documentation](https://direnv.net/)

## Contributing

When contributing to this project:

1. Always develop in the Nix environment
2. Test that `nix build` works before submitting PRs
3. Update this documentation if you change Nix configurations
4. Keep `flake.lock` up to date