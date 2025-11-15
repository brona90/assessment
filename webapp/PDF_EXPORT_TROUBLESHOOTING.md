# PDF Export Troubleshooting Guide

## Issue: PDF Export Not Working

### Current Status
The PDF export feature has been updated with a simplified, more reliable version that focuses on text-based reports rather than chart captures.

---

## What Changed

### Version 1 (Original - Complex)
- **File:** `pdf-export.js`
- **Features:** 5-page report with chart captures, evidence images
- **Issues:** Complex dependencies, chart capture can fail, library loading issues

### Version 2 (Current - Simplified)
- **File:** `pdf-export-simple.js`
- **Features:** Text-based report with scores, domain breakdown, detailed questions
- **Benefits:** More reliable, faster generation, better browser compatibility

---

## How to Test PDF Export

### Method 1: Use Test Page
1. Navigate to: `http://localhost:8081/test-pdf.html`
2. Click "Test PDF Generation" button
3. Check if PDF downloads successfully
4. Review console output for library status

### Method 2: Test in Full Assessment
1. Open Full Assessment page
2. Answer a few questions
3. Click "📄 Export PDF" button
4. Check browser console (F12) for errors
5. Verify PDF downloads

---

## Common Issues & Solutions

### Issue 1: "PDF library not loaded"
**Cause:** jsPDF library failed to load from CDN

**Solutions:**
1. Check internet connection
2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache
4. Try a different browser
5. Check if CDN is accessible: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

### Issue 2: PDF generates but is empty
**Cause:** Assessment data not loaded

**Solutions:**
1. Answer at least one question before exporting
2. Check browser console for JavaScript errors
3. Verify localStorage has data: `localStorage.getItem('techAssessment')`
4. Try reloading the page

### Issue 3: Browser blocks PDF download
**Cause:** Browser popup blocker or download restrictions

**Solutions:**
1. Allow popups for this site
2. Check browser download settings
3. Look for download notification in browser
4. Try a different browser

### Issue 4: "Could not initialize PDF library"
**Cause:** jsPDF constructor not accessible

**Solutions:**
1. Open browser console (F12)
2. Type: `window.jspdf` and press Enter
3. Type: `window.jsPDF` and press Enter
4. If both are undefined, the library didn't load
5. Refresh the page and try again

---

## Browser Compatibility

### Tested Browsers:
- ✅ Chrome 90+ (Full support)
- ✅ Firefox 88+ (Full support)
- ✅ Edge 90+ (Full support)
- ✅ Safari 14+ (Full support)
- ⚠️ IE 11 (Not supported)

### Mobile Browsers:
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ⚠️ May require "Allow Downloads" permission

---

## Debugging Steps

### Step 1: Check Library Loading
Open browser console and run:
```javascript
console.log('jspdf:', typeof window.jspdf);
console.log('jsPDF:', typeof window.jsPDF);
```

**Expected output:**
- `jspdf: object` or `jsPDF: function`

**If undefined:**
- Library didn't load
- Check network tab for failed requests
- Try refreshing the page

### Step 2: Check Assessment Data
```javascript
console.log('Assessment data:', localStorage.getItem('techAssessment'));
console.log('Questions data:', questionsData);
```

**Expected output:**
- Assessment data: JSON string with answers
- Questions data: Object with domains and questions

**If null/undefined:**
- No assessment data saved
- Answer some questions first

### Step 3: Test PDF Generation Manually
```javascript
// Test if jsPDF works
const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
const pdf = new jsPDF();
pdf.text('Test', 10, 10);
pdf.save('test.pdf');
```

**Expected result:**
- PDF file downloads with "Test" text

**If error:**
- Check error message in console
- Library may not be properly loaded

---

## Alternative Solutions

### Option 1: Use Browser Print
If PDF export continues to fail:
1. Open Full Assessment page
2. Click "📊 Dashboard" tab
3. Use browser's Print function (Ctrl+P or Cmd+P)
4. Select "Save as PDF" as destination
5. Adjust print settings as needed

### Option 2: Screenshot Method
1. Open Full Assessment page
2. Navigate through different tabs
3. Take screenshots of each section
4. Combine screenshots into a document

### Option 3: Manual Export
1. Copy assessment data from localStorage
2. Paste into a text editor
3. Format as needed
4. Save as text or import into Word/Excel

---

## For Developers

### Switching Between PDF Export Versions

**To use simplified version (current):**
```html
<script src="pdf-export-simple.js"></script>
```

**To use complex version (with charts):**
```html
<script src="pdf-export.js"></script>
```

### Adding Chart Capture Back
If you want to re-enable chart capture:

1. Ensure html2canvas is loaded
2. Use this function to capture charts:
```javascript
async function captureChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    try {
        const dataUrl = canvas.toDataURL('image/png');
        return dataUrl;
    } catch (error) {
        console.error('Error capturing chart:', error);
        return null;
    }
}
```

3. Add captured images to PDF:
```javascript
const chartImage = await captureChart('overviewChart');
if (chartImage) {
    pdf.addImage(chartImage, 'PNG', margin, yPos, width, height);
}
```

### Custom PDF Styling
Modify `pdf-export-simple.js` to customize:
- Colors: Change RGB values in `pdf.setTextColor()` and `pdf.setFillColor()`
- Fonts: Use `pdf.setFont()` and `pdf.setFontSize()`
- Layout: Adjust margin, yPos, and spacing values
- Content: Add/remove sections as needed

---

## Testing Checklist

Before reporting PDF export as broken, verify:

- [ ] Internet connection is working
- [ ] Page loaded without errors (check console)
- [ ] jsPDF library is loaded (check console: `window.jspdf`)
- [ ] At least one question has been answered
- [ ] Browser allows downloads/popups
- [ ] Tried refreshing the page
- [ ] Tested in different browser
- [ ] Checked browser console for specific error messages

---

## Reporting Issues

If PDF export still doesn't work after trying all solutions:

1. **Gather Information:**
   - Browser name and version
   - Operating system
   - Error messages from console
   - Screenshot of the issue
   - Steps to reproduce

2. **Check Console Output:**
   - Open browser console (F12)
   - Look for red error messages
   - Copy full error text

3. **Test with Simple Page:**
   - Open `test-pdf.html`
   - Click test button
   - Report results

4. **Provide Details:**
   - What you were trying to do
   - What you expected to happen
   - What actually happened
   - Any error messages

---

## Quick Reference

### Working PDF Export:
1. ✅ Library loads: `window.jspdf` exists
2. ✅ Data exists: Assessment answers saved
3. ✅ Click "Export PDF" button
4. ✅ Loading indicator appears
5. ✅ PDF downloads automatically
6. ✅ Success notification shows

### Broken PDF Export:
1. ❌ Click "Export PDF" button
2. ❌ Error alert appears
3. ❌ Console shows errors
4. ❌ No PDF downloads
5. ❌ Follow troubleshooting steps above

---

## Contact & Support

For additional help:
- Check browser console for specific errors
- Review this troubleshooting guide
- Test with the simple test page
- Try alternative export methods
- Report issues with full details

---

**Last Updated:** November 15, 2024  
**Version:** 2.0 (Simplified)  
**Status:** Active troubleshooting