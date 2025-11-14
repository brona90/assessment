# Deployment Guide

This guide covers different deployment options for the Technology Assessment application.

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

GitHub Pages provides free hosting with automatic deployment via GitHub Actions.

#### Setup Steps:

1. **Fork or Clone Repository**
   ```bash
   git clone https://github.com/yourusername/assessment.git
   cd assessment
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Under "Build and deployment"
   - Source: Select "GitHub Actions"
   - Save changes

3. **Push Changes**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

4. **Access Your Site**
   - Wait 1-2 minutes for deployment
   - Visit: `https://yourusername.github.io/assessment/`

#### Automatic Deployment

The `.github/workflows/deploy.yml` file automatically deploys on:
- Push to `main` or `master` branch
- Manual workflow dispatch

### Option 2: Local Development Server

Perfect for testing and development.

#### Python (Recommended)
```bash
cd webapp
python -m http.server 8000
# Open http://localhost:8000
```

#### Node.js
```bash
cd webapp
npx http-server -p 8000
# Open http://localhost:8000
```

#### PHP
```bash
cd webapp
php -S localhost:8000
# Open http://localhost:8000
```

### Option 3: Static Hosting Services

Deploy to any static hosting service:

#### Netlify
1. Connect your GitHub repository
2. Build command: (leave empty)
3. Publish directory: `webapp`
4. Deploy

#### Vercel
1. Import your GitHub repository
2. Framework Preset: Other
3. Root Directory: `webapp`
4. Deploy

#### AWS S3 + CloudFront
```bash
# Install AWS CLI
aws s3 sync webapp/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Azure Static Web Apps
1. Create Static Web App in Azure Portal
2. Connect to GitHub repository
3. App location: `/webapp`
4. Deploy

### Option 4: Docker Container

Create a `Dockerfile` in the root:

```dockerfile
FROM nginx:alpine
COPY webapp/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t tech-assessment .
docker run -p 8080:80 tech-assessment
# Open http://localhost:8080
```

## 🎨 Customization Before Deployment

### 1. Update Configuration

Edit `webapp/config.js`:
```javascript
const CONFIG = {
    organization: {
        name: "Your Organization",
        fullName: "Your Organization Technology Assessment",
        confidentialText: "Confidential - Technology Assessment"
    },
    colors: {
        primary: "#6B46C1",
        secondary: "#2563EB",
        // ... customize colors
    }
};
```

### 2. Customize Questions (Optional)

Edit `webapp/questions.js` to modify assessment questions.

### 3. Update Branding

- Replace colors in `config.js`
- Modify styles in `webapp/styles.css` if needed
- Update page title in `webapp/index.html`

## 🔧 Troubleshooting

### GitHub Pages Not Working

1. **Check Actions Tab**
   - Go to repository → Actions
   - Verify workflow completed successfully
   - Check for error messages

2. **Verify Pages Settings**
   - Settings → Pages
   - Source should be "GitHub Actions"
   - Check the displayed URL

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Local Server Issues

1. **Port Already in Use**
   ```bash
   # Use a different port
   python -m http.server 8001
   ```

2. **Permission Denied**
   ```bash
   # Use a port above 1024
   python -m http.server 8080
   ```

### Configuration Not Loading

1. **Check config.js is loaded**
   - Open browser console (F12)
   - Look for CONFIG object
   - Verify no JavaScript errors

2. **Clear localStorage**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

## 📊 Monitoring Deployment

### GitHub Actions Status

Check deployment status:
1. Go to repository → Actions
2. Click on latest workflow run
3. View deployment logs

### Testing Deployment

After deployment, verify:
- [ ] Page loads correctly
- [ ] All questions display
- [ ] Charts render properly
- [ ] Save/Load functionality works
- [ ] PDF export generates correctly
- [ ] Mobile responsive design works
- [ ] Custom branding appears

## 🔒 Security Considerations

### For Public Deployments

- All data is stored locally in browser
- No backend or database required
- No data transmission to servers
- Safe for public hosting

### For Internal Deployments

- Can be hosted on internal networks
- No external dependencies (except CDN libraries)
- Can be deployed behind authentication
- Consider using internal CDN mirrors for libraries

## 📝 Post-Deployment Checklist

- [ ] Verify site is accessible
- [ ] Test all functionality
- [ ] Check mobile responsiveness
- [ ] Verify PDF export works
- [ ] Test save/load functionality
- [ ] Confirm branding is correct
- [ ] Share URL with team

## 🆘 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review browser console for errors
3. Verify all files are present in `webapp/` directory
4. Test locally before deploying

---

**Need Help?** Open an issue on GitHub with:
- Deployment method used
- Error messages (if any)
- Browser and version
- Steps to reproduce