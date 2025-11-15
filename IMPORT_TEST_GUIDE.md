# Import Assessment Test Guide

## 🧪 How to Test the Import Functionality

This guide will help you verify that the admin import properly updates the full assessment.

---

## 📋 Test Scenario

### Step 1: Create Test Data (User Side)

1. **Open Dashboard** (`index.html`)
2. **Select "Data Engineer"** from dropdown
3. **Click "Load My Questions"**
4. **Answer 2-3 questions**:
   - Question 1: Select rating "3"
   - Question 2: Select rating "4"
   - Question 3: Select rating "5"
5. **Add Evidence** to one question:
   - Click "📎 Add Evidence"
   - Add text: "Test evidence description"
   - Upload a screenshot (optional)
   - Click "Save Evidence"
6. **Export Assessment**:
   - Click "📦 Export My Assessment"
   - Save the JSON file (e.g., `assessment-user1-2024-11-14.json`)

### Step 2: Clear Existing Data (Optional)

To test a clean import:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Run: `indexedDB.deleteDatabase('AssessmentEvidence')`
4. Refresh page

### Step 3: Import Data (Admin Side)

1. **Open Admin Panel** (`admin.html`)
2. **Go to Import/Export tab**
3. **Read the instructions** (yellow box)
4. **Select the exported file**:
   - Click "Choose Files"
   - Select `assessment-user1-2024-11-14.json`
5. **Click "📥 Import Assessments"**
6. **Verify success message**:
   ```
   ✅ Successfully imported 1 assessments!
   
   📊 Summary:
   - 3 answers saved
   - 1 evidence items imported
   - Consolidated backup downloaded
   
   📝 Next Steps:
   1. Open Dashboard to see all answers
   2. Open Full Assessment and click "🔄 Reload Data"
   3. Generate PDF report with all evidence
   ```

### Step 4: Verify in Dashboard

1. **Open Dashboard** (`index.html`)
2. **Select "Data Engineer"**
3. **Verify**:
   - ✅ Questions show as completed (green)
   - ✅ Progress shows "3/8 completed"
   - ✅ Radio buttons are checked
   - ✅ Evidence indicator shows "📎 Evidence Added"

### Step 5: Verify in Full Assessment

1. **Open Full Assessment** (`full-assessment.html`)
2. **Click "🔄 Reload Data"** button in header
3. **Verify**:
   - ✅ Progress bar shows "3/48 Questions"
   - ✅ Radio buttons are checked for imported questions
   - ✅ Evidence indicators show green
4. **Scroll to imported questions** (d1_q1, d1_q2, d1_q3)
5. **Verify each question**:
   - ✅ Correct rating selected
   - ✅ Evidence button shows "📎 Evidence Added"

### Step 6: Verify Evidence

1. **On Full Assessment page**
2. **Click "📎 Evidence Added"** on a question with evidence
3. **Verify modal shows**:
   - ✅ Text description appears
   - ✅ Images appear (if uploaded)
   - ✅ Can view/delete evidence

---

## 🔍 What to Check

### localStorage Check
Open browser console (F12) and run:
```javascript
// Check if data is saved
const data = localStorage.getItem('techAssessment');
console.log('Saved data:', JSON.parse(data));

// Should show: { "d1_q1": 3, "d1_q2": 4, "d1_q3": 5 }
```

### IndexedDB Check
Open browser console (F12) and run:
```javascript
// Check evidence database
const request = indexedDB.open('AssessmentEvidence');
request.onsuccess = function(e) {
    const db = e.target.result;
    const tx = db.transaction('evidence', 'readonly');
    const store = tx.objectStore('evidence');
    const getAll = store.getAll();
    getAll.onsuccess = function() {
        console.log('Evidence items:', getAll.result);
    };
};
```

---

## ✅ Success Criteria

The import is working correctly if:

1. **Admin Import**:
   - ✅ Success message appears
   - ✅ Consolidated JSON downloads
   - ✅ No errors in console

2. **Dashboard**:
   - ✅ Questions show as completed
   - ✅ Progress updates correctly
   - ✅ Radio buttons are checked
   - ✅ Evidence indicators are green

3. **Full Assessment**:
   - ✅ After clicking "Reload Data", questions are checked
   - ✅ Progress bar updates
   - ✅ Evidence is accessible
   - ✅ Can add more evidence

4. **Data Persistence**:
   - ✅ Refresh page - data remains
   - ✅ Close and reopen - data remains
   - ✅ Navigate between pages - data remains

---

## 🐛 Troubleshooting

### Issue: Import succeeds but Full Assessment shows no data

**Solution**:
1. Click "🔄 Reload Data" button on Full Assessment
2. Hard refresh browser (Ctrl+Shift+R)
3. Check console for errors

### Issue: Evidence not showing

**Solution**:
1. Check browser supports IndexedDB
2. Open console and check for errors
3. Verify evidence was in exported JSON
4. Try re-importing

### Issue: Progress bar not updating

**Solution**:
1. Click "🔄 Reload Data" button
2. Check that questions.json is loaded
3. Verify question IDs match

### Issue: Data disappears after refresh

**Solution**:
1. Check browser isn't in private/incognito mode
2. Verify localStorage is enabled
3. Check browser storage quota

---

## 📊 Multi-User Test

To test with multiple users:

1. **User 1** (Data Engineer):
   - Answer questions d1_q1 to d1_q4
   - Export assessment

2. **User 2** (FinOps Manager):
   - Answer questions d2_q1 to d2_q4
   - Export assessment

3. **Admin**:
   - Import both files at once (Ctrl+Click)
   - Verify 8 total answers imported
   - Check Dashboard shows all answers
   - Check Full Assessment shows all answers

---

## 🎯 Expected Results

After importing 2 users with 4 questions each:

**Dashboard**:
- Data Engineer: 4/8 completed (50%)
- FinOps Manager: 4/8 completed (50%)

**Full Assessment**:
- Progress: 8/48 Questions (17%)
- Domain 1: 4 questions answered
- Domain 2: 4 questions answered
- All evidence accessible

**Admin Panel**:
- Consolidated JSON downloaded
- Success message shown
- No errors in console

---

## 📝 Notes

- Import merges data (doesn't overwrite)
- Multiple imports are cumulative
- Evidence is stored per question ID
- Same question from different users: last import wins
- Consolidated backup includes all users' data

---

**Test this workflow to ensure import updates the full assessment correctly!** ✅