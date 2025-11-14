# Technology Assessment - Interactive Web Application

An interactive web application for conducting comprehensive technology assessments across SRE, automation, AI capabilities, and audit compliance.

## Features

- **48 Comprehensive Questions** across 4 weighted domains
- **Real-time Visualizations** with 6 interactive charts
- **Configurable Branding** - customize for any organization
- **PDF Export** with embedded charts and detailed analysis
- **Progress Tracking** with automatic save/load functionality
- **Mobile Responsive** design
- **Industry Benchmarking** and gap analysis

## Quick Start

### Option 1: Open Directly in Browser
1. Open `index.html` in any modern web browser
2. Start answering questions
3. View real-time updates in the dashboard
4. Export PDF report when complete

### Option 2: Local Web Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Configuration

### Customize Branding

Edit `config.js` to customize the application for your organization:

```javascript
const CONFIG = {
    organization: {
        name: "Your Organization",
        fullName: "Your Organization Technology Assessment",
        confidentialText: "Confidential - Technology Assessment"
    },
    colors: {
        primary: "#6B46C1",      // Main brand color
        secondary: "#2563EB",    // Secondary color
        accent: "#10B981",       // Accent color
        // ... more colors
    },
    // ... more configuration options
};
```

### Customize Questions

Edit `questions.js` to modify assessment questions, domains, and weights.

## Assessment Structure

### Domain 1: Data Orchestration & Platform Observability (30%)
- Data pipeline automation and workflow orchestration
- Platform monitoring, alerting, and distributed tracing
- Data integrity and reliability tracking

### Domain 2: FinOps & Data Management (25%)
- Cloud cost management and financial governance
- Data quality monitoring and controls
- Data architecture modernization

### Domain 3: Autonomous Capabilities (AI/ML) (25%)
- Self-healing systems and predictive maintenance
- MLOps implementation and model governance
- Intelligent alerting and automated root cause analysis

### Domain 4: Operations & Platform Team Alignment (20%)
- Cross-team collaboration and shared tooling
- Integrated workflows and operational excellence
- Strategic initiative alignment

## Usage

1. **Answer Questions**: Rate each capability on a 1-5 scale
2. **View Dashboard**: See real-time visualizations of your scores
3. **Save Progress**: Use the "Save Progress" button to store locally
4. **Export Report**: Generate a comprehensive PDF report

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Data Storage

All assessment data is stored locally in your browser using localStorage. No data is transmitted to any server.

## Files

- `index.html` - Main application interface
- `app.js` - Application logic and PDF generation
- `questions.js` - Assessment questions and structure
- `styles.css` - Styling and layout
- `config.js` - Configuration and branding

## License

Customize and use freely for your organization's technology assessments.