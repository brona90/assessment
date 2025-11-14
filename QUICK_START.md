# Quick Start Guide

Get the Technology Assessment application running in 5 minutes.

## 🚀 Fastest Way to Start

### Option 1: Open Locally (30 seconds)

1. **Download or clone the repository**
   ```bash
   git clone https://github.com/yourusername/assessment.git
   cd assessment/webapp
   ```

2. **Open in browser**
   - Double-click `index.html`
   - Or drag `index.html` into your browser

3. **Start assessing!**
   - Answer questions
   - View real-time charts
   - Export PDF report

### Option 2: Local Web Server (1 minute)

```bash
# Navigate to webapp directory
cd assessment/webapp

# Start server (choose one):
python -m http.server 8000        # Python 3
python -m SimpleHTTPServer 8000   # Python 2
npx http-server -p 8000           # Node.js
php -S localhost:8000             # PHP

# Open browser
open http://localhost:8000
```

### Option 3: GitHub Pages (5 minutes)

1. **Fork the repository** on GitHub

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - Save

3. **Access your site**
   - Wait 1-2 minutes
   - Visit: `https://yourusername.github.io/assessment/`

## 🎨 Customize in 2 Minutes

Edit `webapp/config.js`:

```javascript
const CONFIG = {
    organization: {
        name: "Your Company",
        fullName: "Your Company Technology Assessment"
    },
    colors: {
        primary: "#6B46C1",    // Your brand color
        secondary: "#2563EB"   // Secondary color
    }
};
```

Save and refresh - done!

## 📊 Using the Assessment

1. **Answer Questions**
   - Rate each capability 1-5
   - Progress tracked automatically
   - Saves to browser automatically

2. **View Dashboard**
   - Click "Dashboard" tab
   - See 6 interactive charts
   - Real-time updates

3. **Export Report**
   - Click "Export PDF"
   - 6-page professional report
   - Includes all charts

## 🔧 Troubleshooting

### Page won't load?
- Check you're in the `webapp` directory
- Try a different browser
- Clear browser cache (Ctrl+Shift+R)

### Charts not showing?
- Check internet connection (needs CDN for Chart.js)
- Open browser console (F12) for errors
- Verify config.js is loaded

### Can't save progress?
- Enable localStorage in browser settings
- Check browser privacy settings
- Try incognito/private mode

## 📚 Next Steps

- **Customize**: See [CUSTOMIZATION.md](CUSTOMIZATION.md)
- **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Full Docs**: See [README.md](README.md)

## ✅ That's It!

You're ready to conduct technology assessments. The application:
- ✅ Works offline (after first load)
- ✅ Saves automatically
- ✅ No backend needed
- ✅ Completely private
- ✅ Mobile friendly

---

**Need help?** Check the full documentation or open an issue on GitHub.