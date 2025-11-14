# Changelog

All notable changes to the Technology Assessment Framework.

## [2.0.0] - 2024-11-14

### 🎉 Major Release - Generic Framework

#### Added
- **Configuration System** (`config.js`)
  - Customizable organization branding
  - Configurable color schemes
  - Adjustable domain weights
  - Custom benchmarks
  - PDF report customization

- **Documentation**
  - Comprehensive README.md
  - DEPLOYMENT.md - Multiple deployment options
  - CUSTOMIZATION.md - Complete customization guide
  - Enhanced webapp/README.md

- **Developer Experience**
  - .gitignore for clean repository
  - Improved code organization
  - Better comments and documentation

#### Changed
- **Removed Organization-Specific References**
  - Replaced all hardcoded organization names with config variables
  - Made all branding elements configurable
  - Updated color scheme to use CSS variables
  - Changed localStorage key to be configurable

- **Code Improvements**
  - Centralized configuration in config.js
  - Applied configuration on page load
  - Dynamic title and branding updates
  - Improved maintainability

- **File Structure**
  - Cleaned up repository structure
  - Removed unnecessary files
  - Organized documentation
  - Simplified deployment

#### Removed
- Organization-specific branding and references
- Redundant documentation files
- Output and temporary files
- Conversation history files

### 🔧 Technical Changes

#### Configuration System
```javascript
// New config.js structure
const CONFIG = {
    organization: { ... },
    colors: { ... },
    assessment: { ... },
    domainWeights: { ... },
    benchmarks: { ... }
};
```

#### CSS Variables
- Converted hardcoded colors to CSS variables
- Made colors configurable via JavaScript
- Maintained backward compatibility

#### Application Initialization
- Added `applyConfiguration()` function
- Dynamic page title updates
- Runtime color scheme application

### 📊 Assessment Framework

#### Maintained Features
- 48 comprehensive questions
- 4 weighted domains (30%, 25%, 25%, 20%)
- 6 interactive visualizations
- PDF export with embedded charts
- Save/Load functionality
- Mobile responsive design
- Industry benchmarking

#### Domain Structure
1. Data Orchestration & Platform Observability (30%)
2. FinOps & Data Management (25%)
3. Autonomous Capabilities (AI/ML) (25%)
4. Operations & Platform Team Alignment (20%)

### 🚀 Deployment

#### GitHub Pages
- Maintained GitHub Actions workflow
- Automatic deployment on push
- Deploys webapp directory only

#### Local Development
- Multiple server options documented
- Easy setup and testing
- No build process required

### 📝 Documentation Updates

#### README.md
- Generic framework overview
- Quick start guide
- Customization instructions
- Deployment options

#### DEPLOYMENT.md
- GitHub Pages setup
- Local development servers
- Static hosting services
- Docker deployment
- Troubleshooting guide

#### CUSTOMIZATION.md
- Branding customization
- Color scheme examples
- Question modification
- Chart customization
- Advanced features

### 🔒 Security & Privacy

#### Maintained
- Local-only data storage
- No backend requirements
- No external data transmission
- Browser localStorage only

### 🌐 Browser Support

#### Tested On
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### 📦 Files Changed

#### New Files
- `config.js` - Configuration system
- `.gitignore` - Git ignore rules
- `DEPLOYMENT.md` - Deployment guide
- `CUSTOMIZATION.md` - Customization guide
- `CHANGELOG.md` - This file

#### Modified Files
- `webapp/index.html` - Added config.js, dynamic title
- `webapp/app.js` - Configuration integration, removed hardcoded values
- `webapp/styles.css` - CSS variables for colors
- `webapp/questions.js` - Updated comments
- `webapp/README.md` - Generic documentation
- `README.md` - Complete rewrite for generic framework

#### Removed Files
- `truist_assessment_framework/` - Organization-specific documentation
- `outputs/` - Temporary output files
- `summarized_conversations/` - Conversation history

### 🎯 Migration Guide

For existing users:

1. **Update config.js** with your organization details
2. **Test locally** to verify customizations
3. **Deploy** using preferred method
4. **Update documentation** if needed

### 🐛 Bug Fixes
- Fixed localStorage key conflicts
- Improved PDF generation reliability
- Enhanced mobile responsiveness
- Better error handling

### ⚡ Performance
- Optimized chart rendering
- Reduced initial load time
- Improved localStorage operations

---

## [1.0.0] - 2024-11-13

### Initial Release
- Interactive web application
- 48 assessment questions
- 6 visualizations
- PDF export
- Organization-specific branding

---

**Note**: Version 2.0.0 represents a major refactoring to create a generic, reusable framework suitable for any organization.