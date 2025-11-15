# Critical Fixes TODO

## Issues to Fix Immediately:

### 1. Radio Button Text Disappearing ⚠️ CRITICAL
**Problem:** When a radio button is selected, the text disappears (white text on white background issue)
**Root Cause:** CSS selector not working properly with nested structure
**Solution:** Rewrite CSS to properly handle the label structure

### 2. Clear Answer Button Not Appearing
**Problem:** Clear button HTML not being injected properly
**Solution:** Fix the dynamic injection in full-assessment-fixes.js

### 3. Domain Breakdown Chart Not Updating
**Problem:** Chart not recalculating when answers change
**Solution:** Update charts.js to properly update breakdown chart

### 4. PDF Missing Evidence Photos
**Problem:** Enhanced PDF not including all evidence images
**Solution:** Update pdf-export-enhanced.js to include all images

### 5. Charts Not Updating Before PDF
**Problem:** Charts might be stale when PDF is generated
**Solution:** Force chart update before PDF generation

---

## Implementation Order:
1. Fix radio button CSS (CRITICAL)
2. Fix clear button injection
3. Fix domain breakdown chart
4. Enhance PDF with all evidence
5. Add chart refresh before PDF