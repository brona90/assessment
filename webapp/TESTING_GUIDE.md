# Quick Testing Guide - New Features

## 🎯 Quick Test: Compliance Framework Visualization

### Test 1: Enable/Disable Frameworks (2 minutes)

1. **Open Admin Panel**
   - Navigate to: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/admin.html
   - Click "Compliance" tab

2. **Enable SOX Framework**
   - Toggle "SOX Compliance" to ON
   - Map 5-10 questions using checkboxes
   - Click "Save Configuration"

3. **Check Full Assessment**
   - Navigate to: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/full-assessment.html
   - ✅ **EXPECTED**: Compliance tab should be visible
   - Click "Compliance" tab
   - ✅ **EXPECTED**: SOX Compliance card with chart should appear

4. **Disable All Frameworks**
   - Go back to Admin Panel → Compliance
   - Toggle SOX to OFF
   - Click "Save Configuration"

5. **Verify Tab Hidden**
   - Refresh Full Assessment page
   - ✅ **EXPECTED**: Compliance tab should be hidden/not visible

---

## 🎯 Quick Test: Answer Highlighting (1 minute)

### Test 2: Select and Deselect Answers

1. **Open Full Assessment**
   - Navigate to: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/full-assessment.html
   - Click "Assessment" tab

2. **Select an Answer**
   - Find any question
   - Click on "3 - Defined/Repeatable"
   - ✅ **EXPECTED**: Answer should turn BLUE with WHITE text
   - ✅ **EXPECTED**: Progress bar should increase

3. **Change Answer**
   - Click on "4 - Managed/Measured" for the same question
   - ✅ **EXPECTED**: Previous answer turns gray
   - ✅ **EXPECTED**: New answer turns blue with white text

4. **Deselect Answer**
   - Click on the currently selected answer again (the blue one)
   - ✅ **EXPECTED**: Answer should turn gray (deselected)
   - ✅ **EXPECTED**: Progress bar should decrease

5. **Test Persistence**
   - Select several answers
   - Refresh the page (F5)
   - ✅ **EXPECTED**: All selected answers should still be highlighted in blue

---

## 🎯 Quick Test: PDF Export with Compliance (2 minutes)

### Test 3: PDF Generation

1. **Enable Multiple Frameworks**
   - Admin Panel → Compliance
   - Enable "SOX Compliance" and "PII Protection"
   - Map questions to both frameworks
   - Save configuration

2. **Answer Some Questions**
   - Full Assessment → Assessment tab
   - Answer at least 10 questions across different domains

3. **Export PDF**
   - Click "Export to PDF" button
   - Wait for generation (may take 10-15 seconds)
   - ✅ **EXPECTED**: PDF downloads successfully
   - ✅ **EXPECTED**: PDF includes compliance framework charts
   - ✅ **EXPECTED**: Charts show correct scores

---

## 🐛 Common Issues & Quick Fixes

### Issue: Compliance tab not showing
**Fix**: 
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

### Issue: Answers not highlighting
**Fix**:
- Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- Check console for errors (F12)

### Issue: Charts not updating
**Fix**:
```javascript
// Open browser console and run:
if (window.complianceVisualization) {
    complianceVisualization.updateCharts();
}
```

---

## ✅ Success Criteria

All features working correctly if:
- ✅ Compliance tab shows/hides based on enabled frameworks
- ✅ Selected answers have blue background with white text
- ✅ Clicking selected answer deselects it
- ✅ Progress bar updates correctly
- ✅ Charts display and update in real-time
- ✅ PDF includes compliance sections when frameworks enabled
- ✅ Selections persist after page refresh

---

## 🔗 Quick Links

- **Full Assessment**: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/full-assessment.html
- **Admin Panel**: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/admin.html
- **User Dashboard**: https://8082-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works/

---

**Total Testing Time**: ~5 minutes
**Last Updated**: November 15, 2024