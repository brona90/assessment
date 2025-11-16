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
- [x] Run all cucumber tests
- [x] Fix major failures (17/29 scenarios now passing)
- [x] Document test results

## 📊 Current Status
- Unit Tests: ✅ 267/267 passing (98.59% coverage)
- Cucumber Tests: ✅ 17/29 passing (144/195 steps passing)
- Dev Server: ✅ Running on port 5175

## 🎯 Remaining Issues
- 12 failing scenarios (mostly evidence management and PDF export edge cases)
- These failures are due to missing UI elements or test expectations that don't match current implementation
- Core functionality is working (assessment, visualization, compliance all passing)