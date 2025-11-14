# Customization Guide

This guide explains how to customize the Technology Assessment application for your organization.

## 🎨 Branding Customization

### 1. Organization Information

Edit `webapp/config.js`:

```javascript
const CONFIG = {
    organization: {
        name: "Your Organization",              // Short name (e.g., "Acme Corp")
        fullName: "Your Organization Technology Assessment",  // Full title
        confidentialText: "Confidential - Technology Assessment"  // Footer text
    }
};
```

**Examples:**
```javascript
// Example 1: Bank
organization: {
    name: "First National Bank",
    fullName: "First National Bank Technology Assessment",
    confidentialText: "Confidential - First National Bank"
}

// Example 2: Tech Company
organization: {
    name: "TechCorp",
    fullName: "TechCorp Platform Maturity Assessment",
    confidentialText: "Internal Use Only - TechCorp"
}

// Example 3: Consulting Firm
organization: {
    name: "Acme Consulting",
    fullName: "Client Technology Assessment by Acme Consulting",
    confidentialText: "Confidential - Client Assessment"
}
```

### 2. Color Scheme

Customize colors in `webapp/config.js`:

```javascript
colors: {
    primary: "#6B46C1",      // Main brand color (headers, buttons)
    secondary: "#2563EB",    // Secondary color (accents)
    accent: "#10B981",       // Success/positive indicators
    warning: "#F59E0B",      // Warning indicators
    danger: "#EF4444",       // Error/critical indicators
    text: "#1F2937",         // Main text color
    background: "#F9FAFB"    // Background color
}
```

**Color Scheme Examples:**

```javascript
// Corporate Blue
colors: {
    primary: "#0066CC",
    secondary: "#004C99",
    accent: "#00CC66",
    warning: "#FF9900",
    danger: "#CC0000"
}

// Modern Purple (Default)
colors: {
    primary: "#6B46C1",
    secondary: "#2563EB",
    accent: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444"
}

// Professional Green
colors: {
    primary: "#059669",
    secondary: "#0891B2",
    accent: "#8B5CF6",
    warning: "#F59E0B",
    danger: "#DC2626"
}
```

### 3. Assessment Configuration

```javascript
assessment: {
    title: "Technology Assessment",           // Assessment name
    subtitle: "Interactive Dashboard",        // Subtitle
    storageKey: "techAssessment",            // localStorage key (change if running multiple)
    pdfFileName: "Technology-Assessment-Report"  // PDF filename prefix
}
```

### 4. Domain Weights

Adjust the importance of each domain (must sum to 100):

```javascript
domainWeights: {
    domain1: 30,  // Data Orchestration & Platform Observability
    domain2: 25,  // FinOps & Data Management
    domain3: 25,  // Autonomous Capabilities (AI/ML)
    domain4: 20   // Operations & Platform Team Alignment
}
```

**Example Adjustments:**

```javascript
// Focus on AI/ML
domainWeights: {
    domain1: 25,
    domain2: 20,
    domain3: 35,  // Increased AI/ML weight
    domain4: 20
}

// Equal weights
domainWeights: {
    domain1: 25,
    domain2: 25,
    domain3: 25,
    domain4: 25
}
```

### 5. Benchmarks

Set industry and target benchmarks:

```javascript
benchmarks: {
    industry: 3.2,  // Industry average score
    target: 4.0     // Target score for your organization
}
```

## 📝 Question Customization

### Modifying Questions

Edit `webapp/questions.js`:

```javascript
const assessmentQuestions = {
    domain1: {
        title: "Your Domain Title",
        weight: 0.30,
        categories: {
            category1: {
                title: "Category Name",
                questions: [
                    {
                        id: "d1_q1",
                        text: "Your question text?",
                        category: "Category Name"
                    }
                ]
            }
        }
    }
};
```

### Adding New Questions

1. **Add to existing category:**
```javascript
questions: [
    // Existing questions...
    {
        id: "d1_q13",  // Unique ID
        text: "How mature is your new capability?",
        category: "Your Category"
    }
]
```

2. **Add new category:**
```javascript
category3: {
    title: "New Category Name",
    questions: [
        {
            id: "d1_c3_q1",
            text: "Question about new category?",
            category: "New Category Name"
        }
    ]
}
```

### Removing Questions

Simply delete the question object from the array. Make sure to:
- Update question counts in documentation
- Test that scoring still works correctly

### Modifying Domain Structure

```javascript
const assessmentQuestions = {
    domain1: {
        title: "Custom Domain 1 Name",
        weight: 0.30,  // 30% of total score
        categories: {
            // Your categories here
        }
    },
    domain2: {
        title: "Custom Domain 2 Name",
        weight: 0.25,  // 25% of total score
        categories: {
            // Your categories here
        }
    }
    // Add more domains if needed
};
```

## 🎯 Scoring Customization

### Maturity Levels

The default 1-5 scale:
1. Not Implemented
2. Initial/Ad-hoc
3. Defined/Repeatable
4. Managed/Measured
5. Optimized/Innovating

To customize labels, edit `webapp/index.html`:

```html
<div class="rating-scale">
    <label><input type="radio" name="q1" value="1"> 1 - Your Label</label>
    <label><input type="radio" name="q1" value="2"> 2 - Your Label</label>
    <!-- etc. -->
</div>
```

### Score Interpretation

Edit `webapp/app.js` to customize score interpretation:

```javascript
function getScoreInterpretation(score) {
    if (score >= 4.5) return "Excellent - Industry Leading";
    if (score >= 4.0) return "Very Good - Above Average";
    if (score >= 3.5) return "Good - Meeting Standards";
    if (score >= 3.0) return "Fair - Room for Improvement";
    if (score >= 2.0) return "Needs Improvement";
    return "Critical - Immediate Action Required";
}
```

## 📊 Chart Customization

### Chart Colors

Charts automatically use colors from `config.js`. To customize further, edit `webapp/app.js`:

```javascript
// Find chart initialization code
backgroundColor: [
    CONFIG.colors.primary,
    CONFIG.colors.secondary,
    CONFIG.colors.accent,
    // Add more colors
]
```

### Chart Types

To change chart types, modify the chart initialization in `webapp/app.js`:

```javascript
// Change from 'bar' to 'line', 'radar', 'doughnut', etc.
new Chart(ctx, {
    type: 'bar',  // Change this
    data: chartData,
    options: chartOptions
});
```

## 🖼️ Visual Customization

### Logo Addition

Add your logo to `webapp/index.html`:

```html
<header>
    <div class="container">
        <div>
            <img src="your-logo.png" alt="Logo" style="height: 40px; margin-right: 15px;">
            <h1 id="appTitle">🎯 Technology Assessment</h1>
        </div>
    </div>
</header>
```

### Custom Styling

Edit `webapp/styles.css` for advanced styling:

```css
/* Custom header styling */
header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    /* Add your custom styles */
}

/* Custom button styling */
.btn-primary {
    border-radius: 8px;
    /* Add your custom styles */
}
```

## 📄 PDF Report Customization

### Report Content

Edit `webapp/app.js` to customize PDF content:

```javascript
// Find exportPDF function
function exportPDF() {
    // Customize page content
    pdf.text('Your Custom Header', 105, 25, { align: 'center' });
    
    // Add custom sections
    pdf.text('Custom Section', 20, 100);
    
    // Modify footer
    pdf.text('Your Custom Footer', 105, 285, { align: 'center' });
}
```

### Report Branding

The PDF automatically uses:
- Organization name from `CONFIG.organization.fullName`
- Confidential text from `CONFIG.organization.confidentialText`
- Filename from `CONFIG.assessment.pdfFileName`

## 🔧 Advanced Customization

### Adding New Features

1. **Add new chart:**
   - Create canvas element in `index.html`
   - Initialize chart in `app.js`
   - Update chart data in `updateScores()`

2. **Add new data fields:**
   - Update `assessmentData` structure
   - Modify save/load functions
   - Update PDF export

3. **Add new sections:**
   - Add HTML in `index.html`
   - Add navigation tab
   - Add show/hide logic in `app.js`

### Integration with Other Systems

```javascript
// Example: Send data to API
function submitToAPI() {
    fetch('https://your-api.com/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
    });
}
```

## ✅ Testing Your Customizations

After making changes:

1. **Test locally:**
   ```bash
   cd webapp
   python -m http.server 8000
   ```

2. **Verify:**
   - [ ] All questions display correctly
   - [ ] Scoring calculations work
   - [ ] Charts update properly
   - [ ] PDF export includes customizations
   - [ ] Save/Load functionality works
   - [ ] Mobile responsive design maintained

3. **Browser testing:**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

## 📚 Examples

See `webapp/config.js` for complete configuration examples and comments.

## 🆘 Need Help?

- Check browser console (F12) for errors
- Verify JSON syntax in config files
- Test changes incrementally
- Keep backups of working versions

---

**Pro Tip:** Make small changes and test frequently to identify issues quickly.