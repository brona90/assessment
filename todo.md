# TODO: Refactor Admin Interface to Remove Nested Panel

## Goal
Remove the nested EnhancedAdminPanel and have each top-level tab show its content directly.

## Tasks

### 1. Extract Admin Section Components
- [x] Create DomainsManager.jsx - Domain CRUD operations (created but not used yet)
- [ ] Alternative approach: Modified EnhancedAdminPanel to hide tabs when used from FullScreenAdminView

### 2. Update FullScreenAdminView
- [x] Modified EnhancedAdminPanel to accept showTabs prop
- [x] Pass showTabs={false} to hide nested tabs
- [x] All tabs now work at top level without nesting

### 3. Update Tests
- [x] All 596 unit tests passing
- [ ] Need to verify coverage is still at target
- [ ] May need to add tests for showTabs prop

### 4. Update BDD Tests
- [x] Update step definitions to work with new structure
- [x] Added all missing step definitions (undefined: 18 → 7 → 0)
- [x] Removed all duplicate step definitions (ambiguous: 11 → 2 → 0)
- [x] Improved pass rate: 23 → 25 passing scenarios
- [ ] Continue fixing remaining 40 failed scenarios

### 5. Linting and Cleanup
- [x] Run linting - 0 errors
- [ ] Remove unused DomainsManager.jsx (created but not needed with current approach)
- [ ] Update CSS as needed

### 6. Verification
- [x] All 596 unit tests passing
- [x] Zero linting errors
- [x] Zero ambiguous BDD steps
- [x] Zero undefined BDD steps (after adding all missing definitions)
- [ ] Continue improving BDD pass rate (currently 25/72 passing)
- [ ] Manual testing of all admin tabs

## Current Status

### BDD Test Progress
- **Passing**: 25 scenarios (34.7%)
- **Failing**: 38 scenarios (52.8%)
- **Undefined**: 0 (was 18)
- **Ambiguous**: 0 (was 11)

### Key Achievements
1. ✅ Removed nested panel structure - all tabs at top level
2. ✅ Fixed admin user selection in tests
3. ✅ Added all missing step definitions
4. ✅ Removed all duplicate/ambiguous steps
5. ✅ Maintained 100% unit test pass rate
6. ✅ Zero linting errors throughout

### Remaining Work
- 38 failing scenarios need investigation
- Most failures are in:
  * Admin full-screen interface (18 scenarios)
  * Assessment workflow (6 scenarios)
  * PDF export (9 scenarios)
  * Visualizations (2 scenarios)
  * User selection (3 scenarios)