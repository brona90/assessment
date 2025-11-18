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
- [ ] All unit tests passing (100% coverage)
- [ ] All BDD tests passing
- [ ] Zero linting errors
- [ ] Manual testing of all admin tabs