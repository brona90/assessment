# Fixes TODO - Full Assessment Issues

## Issues to Fix:

### 1. ✅ Question answers disappear when selected
**Problem:** Radio button styling doesn't work because CSS expects `input + label` but HTML has `input` inside `label`
**Solution:** Update CSS to handle nested structure with `label:has(input:checked)` or restructure HTML

### 2. ✅ Progress bar text doesn't display correctly until 5 questions answered
**Problem:** Text might be overlapping or hidden
**Solution:** Check CSS for progress text display

### 3. ✅ Can't unselect an answer once selected
**Problem:** Radio buttons don't allow deselection by design
**Solution:** Add a "Clear Answer" button or allow clicking the same radio to deselect

### 4. ✅ Navigation button says "Dashboard" - confusing
**Problem:** Top navigation has "Dashboard" link which conflicts with Dashboard tab
**Solution:** Rename to "User Portal" or "Home" or "My Assessments"

### 5. ✅ PDF needs diagrams and evidence with proper aspect ratios
**Problem:** Simplified PDF doesn't include charts or evidence images
**Solution:** Re-enable chart capture and evidence images with aspect ratio preservation

---

## Implementation Plan:

1. Fix radio button CSS for proper selection display
2. Add clear/reset button for each question
3. Fix progress bar text display
4. Rename navigation button
5. Enhance PDF export with charts and evidence