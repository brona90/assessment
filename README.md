# Technology Assessment Framework

A modern React-based technology assessment application with comprehensive BDD/TDD testing coverage.

## Features

- **Interactive Assessment**: Answer questions across multiple domains with real-time progress tracking
- **Evidence Management**: Attach images and text evidence to support answers
- **Local Storage**: All data stored locally in browser (no backend required)
- **Responsive Design**: Works on desktop and mobile devices
- **High Test Coverage**: 97%+ code coverage with 87 comprehensive tests

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **Chart.js** - Data visualization
- **LocalForage** - IndexedDB wrapper for evidence storage
- **GitHub Pages** - Hosting
- **Nix/NixOS** - Reproducible development environment

## Getting Started

### Option 1: Using Nix (Recommended)

#### Prerequisites
- [Nix](https://nixos.org/download.html) installed on your system
- (Optional) [direnv](https://direnv.net/) for automatic environment loading

#### Quick Start with Nix Flakes

```bash
# Enter development environment
nix develop

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

#### Using direnv (Automatic Environment)

If you have direnv installed:

```bash
# Allow direnv for this directory
direnv allow

# Environment will automatically load when you cd into the directory
# Dependencies and tools will be available automatically
```

#### Building with Nix

```bash
# Build the application using Nix
nix build

# The built application will be in ./result/
```

#### Legacy Nix (without flakes)

```bash
# Enter development shell
nix-shell

# Or build directly
nix-build
```

### Option 2: Traditional Setup

#### Prerequisites

- Node.js 20.x or higher
- npm or yarn

#### Installation

```bash
npm install
```

#### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run BDD/Cucumber tests
npm run cucumber

# Run tests with coverage
npm run test:coverage
```

#### BDD Testing with Cucumber
This application includes comprehensive Behavior-Driven Development tests using Cucumber.js and Playwright. The BDD tests cover:

- **Assessment Workflow**: Complete assessment scenarios including navigation and answer validation
- **PDF Export**: PDF generation and download functionality testing
- **Compliance Frameworks**: Framework enable/disable and mapping validation
- **Evidence Management**: Evidence addition, editing, and persistence testing
- **Visualizations**: Chart rendering, responsiveness, and interaction testing

To run specific BDD features:
```bash
npx cucumber-js features/assessment_workflow.feature
npx cucumber-js features/pdf_export.feature
npx cucumber-js features/compliance_frameworks.feature
```

The BDD tests serve as both tests and living documentation, ensuring the application behaves correctly from a user's perspective.

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/       # React components
│   ├── QuestionCard.jsx
│   ├── ProgressBar.jsx
│   └── *.test.jsx   # Component tests
├── hooks/           # Custom React hooks
│   ├── useAssessment.js
│   └── *.test.jsx
├── services/        # Data and storage services
│   ├── dataService.js
│   ├── storageService.js
│   └── *.test.jsx
├── utils/           # Utility functions
│   ├── scoreCalculator.js
│   └── *.test.jsx
├── test/            # Test setup
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Nix Configuration Files

This project includes several Nix configuration files for reproducible builds:

- **flake.nix** - Modern Nix flakes configuration (recommended)
- **shell.nix** - Legacy Nix shell for development environment
- **default.nix** - Build expression for the application
- **.envrc** - direnv configuration for automatic environment loading

### Nix Environment Features

The Nix environment provides:
- Node.js 20.x with npm
- All required system libraries (cairo, pango, etc.) for canvas package
- Chromium for Playwright tests
- Development tools (ESLint, Prettier)
- Proper environment variables for building native dependencies

### Troubleshooting Nix Setup

#### Canvas Package Issues
If you encounter issues with the canvas package:
```bash
# The Nix environment automatically sets CANVAS_PREBUILT=1
# and configures library paths. If issues persist:
npm rebuild canvas
```

#### Playwright Browser Issues
```bash
# Browsers are provided by Nix, no download needed
# If you see browser-related errors, ensure you're in the Nix shell:
nix develop
```

#### Flakes Not Enabled
If `nix develop` doesn't work:
```bash
# Enable flakes in your Nix configuration
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf

# Or use legacy mode:
nix-shell
```

## Testing

This project follows BDD/TDD principles with comprehensive test coverage:

- **87 tests** covering all major functionality
- **97.26%** statement coverage
- **95.5%** branch coverage
- **98%** function coverage
- **97.01%** line coverage

All tests must pass and maintain 95%+ coverage before deployment.

## Contributing

When contributing to this project:

1. Use the Nix development environment for consistency
2. Ensure all tests pass: `npm test`
3. Maintain test coverage above 95%
4. Run BDD tests: `npm run cucumber`
5. Follow the existing code style

## License

MIT