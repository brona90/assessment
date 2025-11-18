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

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

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

# Run tests with coverage
npm run test:coverage
```

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

## Testing

This project follows BDD/TDD principles with comprehensive test coverage:

- **87 tests** covering all major functionality
- **97.26%** statement coverage
- **95.5%** branch coverage
- **98%** function coverage
- **97.01%** line coverage

All tests must pass and maintain 95%+ coverage before deployment.

## License

MIT