# Technology Assessment Framework

A comprehensive, interactive web application for conducting technology assessments across SRE, automation, AI capabilities, and audit compliance.

## 🎯 Overview

This framework provides a structured approach to assess organizational technology maturity across four key domains:

1. **Data Orchestration & Platform Observability** (30%)
2. **FinOps & Data Management** (25%)
3. **Autonomous Capabilities (AI/ML)** (25%)
4. **Operations & Platform Team Alignment** (20%)

## ✨ Features

- **48 Comprehensive Questions** with technology-specific assessments
- **Real-time Interactive Visualizations** (6 dynamic charts)
- **Configurable Branding** - customize for any organization
- **Professional PDF Reports** with embedded charts and analysis
- **Progress Tracking** with automatic save/load
- **Mobile Responsive** design
- **Industry Benchmarking** and gap analysis
- **No Backend Required** - runs entirely in browser

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Enable GitHub Pages in Settings → Pages
3. Select "GitHub Actions" as the source
4. Push changes to trigger deployment
5. Access at `https://yourusername.github.io/assessment/`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/assessment.git
cd assessment

# Start a local web server
cd webapp
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

## 🎨 Customization

### Branding Configuration

Edit `webapp/config.js` to customize for your organization:

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
        accent: "#10B981",       // Success/accent color
        warning: "#F59E0B",      // Warning color
        danger: "#EF4444"        // Error/danger color
    }
};
```

### Question Customization

Edit `webapp/questions.js` to modify:
- Assessment questions
- Domain structure
- Scoring weights
- Technology-specific questions

## 📁 Project Structure

```
assessment/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── webapp/                      # Main application (deployed)
│   ├── index.html              # Main interface
│   ├── app.js                  # Application logic
│   ├── questions.js            # Assessment questions
│   ├── styles.css              # Styling
│   ├── config.js               # Configuration
│   └── README.md               # Webapp documentation
├── README.md                    # This file
└── todo.md                      # Development tasks
```

## 📊 Assessment Domains

### Domain 1: Data Orchestration & Platform Observability (30%)
- Data pipeline automation and workflow orchestration
- Platform monitoring, alerting, and distributed tracing
- Data integrity and reliability tracking
- Technology-specific: Snowflake, Talend

### Domain 2: FinOps & Data Management (25%)
- Cloud cost management and financial governance
- Data quality monitoring and controls (DQ/DG)
- Data architecture modernization
- SOX compliance integration

### Domain 3: Autonomous Capabilities (AI/ML) (25%)
- Self-healing systems and predictive maintenance
- MLOps implementation and model governance
- Intelligent alerting and automated root cause analysis
- Future AI/ML capability planning

### Domain 4: Operations & Platform Team Alignment (20%)
- Cross-team collaboration and shared tooling
- Integrated workflows and operational excellence
- MAPS initiative alignment
- Platform operations maturity

## 🔒 Data Privacy

- All assessment data is stored locally in browser localStorage
- No data is transmitted to any external server
- No tracking or analytics
- Completely private and secure

## 🌐 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Modern browsers with ES6+ support required.

## 📄 PDF Reports

Generate comprehensive 6-page PDF reports including:
- Executive summary with overall scores
- Visual analysis with embedded charts
- Compliance dashboards (SOX, PII)
- Detailed domain analysis
- Gap analysis and recommendations
- Industry benchmarking

## 🛠️ Development

### Local Setup

```bash
# Install dependencies (optional - for development tools)
npm install -g http-server

# Run local server
cd webapp
http-server -p 8000

# Or use Python
python -m http.server 8000
```

### Making Changes

1. Edit files in `webapp/` directory
2. Test locally in browser
3. Commit and push to trigger GitHub Pages deployment
4. Changes will be live in 1-2 minutes

## 📝 License

This project is open source and available for customization and use in your organization's technology assessments.

## 🤝 Contributing

Feel free to fork, customize, and adapt this framework for your organization's needs.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Note**: This is a generic framework. Customize `config.js` and `questions.js` to match your organization's specific needs and branding.