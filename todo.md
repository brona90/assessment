# TODO - React Migration with In-Memory Data Management

## 1. Fix PDF Image Evidence Rendering ✅
- [x] Debug why images show "(Image could not be loaded)" in PDF
- [x] Check image URL format and accessibility
- [x] Verify image loading in pdfService
- [x] Added loadImageAsBase64 helper function
- [x] Convert images to base64 before adding to PDF
- [x] Fixed async/await in for loops
- [x] Fixed linting errors (0 errors)
- [x] Added unit tests for PDF generation with evidence
- [x] All 286 tests passing
- Note: Image loading tests skipped due to test environment limitations

## 2. Create In-Memory Data Store ✅
- [x] Create src/services/dataStore.js for in-memory storage
- [x] Implement domains CRUD operations
- [x] Implement compliance frameworks CRUD operations
- [x] Implement users CRUD operations
- [x] Implement questions CRUD operations
- [x] Implement question assignment operations
- [x] Add export/import functionality for persistence
- [x] Load initial data from JSON files
- [x] Write unit tests for dataStore (43 tests, 100% passing)
- [x] Framework visibility control (admin-only selection)

## 3. Implement Domain Management 🔄
- [ ] Add domain CRUD to AdminPanel component
- [ ] Create domain management UI section
- [ ] Connect to dataStore domain operations
- [ ] Add domain validation
- [ ] Write unit tests for domain management
- [ ] Create Cucumber tests for domain CRUD

## 4. Implement Compliance Framework Management 🔄
- [ ] Add framework CRUD to AdminPanel component
- [ ] Create framework management UI section
- [ ] Connect to dataStore framework operations
- [ ] Implement framework visibility toggle (admin-only selection)
- [ ] Filter frameworks for non-admin users
- [ ] Write unit tests for framework management
- [ ] Create Cucumber tests for framework CRUD

## 5. Implement Question Assignment 🔄
- [ ] Add question assignment UI to AdminPanel
- [ ] Create user-question assignment interface
- [ ] Connect to dataStore assignment operations
- [ ] Update useUser hook to check assignments
- [ ] Filter questions based on user assignments
- [ ] Write unit tests for question assignment
- [ ] Create Cucumber tests for assignment workflow

## 6. Implement User Question Export 🔄
- [ ] Add export button for users to export their questions
- [ ] Create export format (JSON with answers and evidence)
- [ ] Include all proof (text, images, files)
- [ ] Generate downloadable file
- [ ] Write unit tests for user export
- [ ] Create Cucumber tests for export functionality

## 7. Implement Admin Multi-User Report 🔄
- [ ] Add import functionality for admin to load user exports
- [ ] Create combined report view
- [ ] Merge data from multiple users
- [ ] Display aggregated results
- [ ] Generate combined PDF report
- [ ] Write unit tests for multi-user reporting
- [ ] Create Cucumber tests for combined reporting

## 8. Update Data Services 🔄
- [ ] Modify dataService to use dataStore
- [ ] Update useAssessment to use dataStore
- [ ] Update useUser to use dataStore
- [ ] Update useCompliance to use dataStore
- [ ] Ensure backward compatibility
- [ ] Write unit tests for updated services

## 9. Testing & Quality Assurance 🔄
- [ ] Run all unit tests (target: 100% passing)
- [ ] Run all Cucumber tests
- [ ] Check code coverage (target: 100%)
- [ ] Run linting (target: 0 errors)
- [ ] Test all CRUD operations
- [ ] Test data persistence (export/import)
- [ ] Test multi-user workflows

## 10. Documentation & Cleanup 🔄
- [ ] Update README with new features
- [ ] Document data persistence workflow
- [ ] Document admin features
- [ ] Remove unnecessary MD files from git
- [ ] Update .gitignore for documentation files
- [ ] Commit and push all changes

## Current Status
- ⚠️ Dev server running at: https://5173-8e4b7700-f8e5-4acd-a036-3a179e4c7398.proxy.daytona.works
- ❌ PDF images not rendering (shows error message)
- ⏳ In-memory data management not implemented
- ⏳ Domain CRUD not implemented
- ⏳ Framework CRUD not implemented
- ⏳ Question assignment not implemented
- ⏳ User export not implemented
- ⏳ Multi-user reporting not implemented

## Priority Order
1. Fix PDF image rendering (critical bug)
2. Create in-memory data store (foundation)
3. Implement domain management
4. Implement framework management with visibility
5. Implement question assignment
6. Implement user export
7. Implement admin multi-user reporting
8. Testing and quality assurance