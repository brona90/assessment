# Cucumber Test Fixes - Task List

## 🎯 Current Task: Fix Cucumber Tests

### ✅ COMPLETED
- [x] Verify unit tests are passing (267 tests passing)
- [x] Identify cucumber test issues
- [x] Locate dev server port (running on 5175)

### 🚧 IN PROGRESS

#### Fix Cucumber Setup
- [x] Update setup.js to use correct port (5175)
- [x] Test basic cucumber scenario execution
- [x] Verify browser automation is working
- [x] Increase timeout from 30s to 60s

#### Fix Step Definitions
- [x] Update assessment_steps.js for current UI
- [x] Update pdf_export_steps.js for current UI
- [x] Update visualization_steps.js for current UI (all canvas locators fixed)
- [ ] Update compliance_steps.js for current UI
- [ ] Update evidence_steps.js for current UI

#### Add User Management Tests
- [ ] Create user_management.feature file
- [ ] Add step definitions for user switching
- [ ] Test user-based question filtering

#### Verify All Scenarios
- [ ] Run all cucumber tests
- [ ] Fix any remaining failures
- [ ] Document test results

## 📊 Current Status
- Unit Tests: ✅ 267/267 passing
- Cucumber Tests: ⚠️ Fixing setup and step definitions
- Dev Server: ✅ Running on port 5175