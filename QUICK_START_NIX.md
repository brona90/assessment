# Quick Start with Nix - Cheat Sheet

## 🚀 First Time Setup

### 1. Install Nix
```bash
# Single-user (Linux/WSL)
sh <(curl -L https://nixos.org/nix/install) --no-daemon

# Multi-user (macOS/Linux)
sh <(curl -L https://nixos.org/nix/install) --daemon
```

### 2. Enable Flakes
```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### 3. Clone and Start
```bash
git clone https://github.com/brona90/assessment.git
cd assessment
git checkout nixos-conversion
nix develop
npm install
npm run dev
```

## 📋 Common Commands

### Enter Development Environment
```bash
nix develop              # Enter Nix shell with all dependencies
```

### Run Development Server
```bash
nix develop              # First, enter the environment
npm run dev              # Then run dev server
```

### Build Application
```bash
# With npm (in Nix environment)
nix develop
npm run build

# With Nix directly
nix build                # Creates ./result/ directory
```

### Run Tests
```bash
nix develop
npm test                 # Unit tests
npm run test:ui          # Tests with UI
npm run cucumber         # BDD tests
```

### Using Nix Apps
```bash
nix run .#dev            # Start dev server
nix run .#build          # Build application
nix run .#test           # Run tests
```

## 🔧 With direnv (Automatic Environment)

### Setup direnv
```bash
# Install direnv
nix-env -iA nixpkgs.direnv

# Add to shell config (~/.bashrc or ~/.zshrc)
eval "$(direnv hook bash)"   # for bash
eval "$(direnv hook zsh)"    # for zsh

# Allow in project directory
cd assessment
direnv allow
```

### Usage
```bash
cd assessment            # Environment loads automatically!
npm install              # Just use npm commands
npm run dev
```

## ✅ Validate Setup

```bash
./validate-nix-setup.sh  # Run validation script
```

## 🆘 Troubleshooting

### Canvas Package Issues
```bash
nix develop
npm rebuild canvas
```

### Playwright Browser Issues
```bash
# Browsers are provided by Nix automatically
nix develop              # Just enter the environment
```

### Flakes Not Working
```bash
# Check if flakes are enabled
cat ~/.config/nix/nix.conf

# Should contain:
# experimental-features = nix-command flakes
```

### Old Node Version
```bash
nix develop
node --version           # Should show v20.x.x
```

## 📚 More Information

- **Comprehensive Guide**: See [NIX_SETUP.md](./NIX_SETUP.md)
- **Changes**: See [CHANGELOG.md](./CHANGELOG.md)
- **Main README**: See [README.md](./README.md)

## 🔄 Traditional npm Still Works!

Don't want to use Nix? No problem!
```bash
npm install
npm run dev
```

Everything works exactly as before. Nix is optional but recommended for reproducibility.

## 💡 Tips

1. **Use direnv** for automatic environment loading
2. **Run validation script** to verify setup
3. **Read NIX_SETUP.md** for detailed troubleshooting
4. **Keep using npm commands** - they work the same in Nix environment
5. **Nix is optional** - traditional npm workflow still works

## 🎯 Quick Decision Guide

**Use Nix if you want:**
- ✅ Reproducible environment
- ✅ Cross-platform consistency
- ✅ No dependency conflicts
- ✅ Deterministic builds

**Use npm directly if:**
- ✅ You don't want to install Nix
- ✅ Your current setup works fine
- ✅ You prefer traditional workflow

Both approaches are fully supported!

---

**Need Help?** See [NIX_SETUP.md](./NIX_SETUP.md) for comprehensive documentation.