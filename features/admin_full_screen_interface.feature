Feature: Full-Screen Admin Interface
  As an administrator
  I want a full-screen admin interface with unified tabs
  So that I can efficiently manage the assessment system

  Background:
    Given the application is loaded
    And I am logged in as an admin user

  Scenario: Admin sees full-screen interface with unified tabs
    When I view the admin interface
    Then I should see a full-screen admin layout
    And I should see the following tabs in the navigation bar:
      | Tab Name         |
      | Data Management  |
      | Dashboard        |
      | Compliance       |
    And the "Data Management" tab should be active by default

  Scenario: Admin navigates to Data Management tab
    Given I am on the admin interface
    When I click on the "Data Management" tab
    Then I should see the data management interface
    And I should see sections for:
      | Section                    |
      | Domain Management          |
      | User Management            |
      | Framework Management       |
      | Question Management        |
      | Assignment Management      |
      | Import/Export Data         |
      | Clear All Data             |

  Scenario: Admin imports valid data file
    Given I am on the "Data Management" tab
    When I select a valid JSON file for import
    And I click the "Import Data" button
    Then I should see a loading indicator
    And the data should be imported successfully
    And I should see a success message
    And the file input should be reset

  Scenario: Admin attempts to import invalid file type
    Given I am on the "Data Management" tab
    When I select a file with extension ".txt"
    And I click the "Import Data" button
    Then I should see an error message "Invalid file type. Please select a JSON file."
    And the import should not proceed

  Scenario: Admin attempts to import file exceeding size limit
    Given I am on the "Data Management" tab
    When I select a JSON file larger than 100MB
    And I click the "Import Data" button
    Then I should see an error message "File size exceeds 100MB limit"
    And the import should not proceed

  Scenario: Admin attempts to import file with invalid data structure
    Given I am on the "Data Management" tab
    When I select a JSON file with missing required fields
    And I click the "Import Data" button
    Then I should see an error message listing the validation errors
    And the import should not proceed
    And I should see specific field errors

  Scenario: Admin exports all data
    Given I am on the "Data Management" tab
    And the system has data including answers and evidence
    When I click the "Export All Data" button
    Then a JSON file should be downloaded
    And the file should contain all configuration data
    And the file should contain all answers
    And the file should contain all evidence

  Scenario: Admin clears all data with confirmation
    Given I am on the "Data Management" tab
    And the system has existing data
    When I click the "Clear All Data" button
    Then I should see a confirmation dialog
    And the dialog should warn about permanent deletion
    When I confirm the first dialog
    Then I should see a second confirmation dialog
    When I confirm the second dialog
    Then all data should be cleared
    And I should see a success message
    And the page should reload

  Scenario: Admin cancels data clearing
    Given I am on the "Data Management" tab
    When I click the "Clear All Data" button
    And I see the confirmation dialog
    When I cancel the dialog
    Then no data should be deleted
    And I should remain on the Data Management tab

  Scenario: Admin navigates to Dashboard tab
    Given I am on the admin interface
    When I click on the "Dashboard" tab
    Then I should see the dashboard interface
    And I should see a radar chart showing domain scores
    And I should see a bar chart showing domain scores
    And I should see assessment statistics
    And the "Dashboard" tab should be active

  Scenario: Admin navigates to Compliance tab
    Given I am on the admin interface
    When I click on the "Compliance" tab
    Then I should see the compliance interface
    And I should see a list of compliance frameworks
    And I should see compliance status for each framework
    And the "Compliance" tab should be active

  Scenario: Admin exports PDF report from any tab
    Given I am on any admin tab
    When I click the "Export PDF Report" button
    Then a comprehensive PDF should be generated
    And the PDF should include all domains
    And the PDF should include all answers
    And the PDF should include all evidence
    And the PDF should include compliance data
    And I should receive a download

  Scenario: Admin switches between tabs and state is preserved
    Given I am on the "Data Management" tab
    And I have made changes to the interface
    When I switch to the "Dashboard" tab
    And I switch back to the "Data Management" tab
    Then my previous state should be preserved
    And I should see the same view as before

  Scenario: Admin sees responsive full-screen layout
    Given I am on the admin interface
    When I resize the browser window
    Then the layout should adapt responsively
    And all content should remain accessible
    And the navigation should remain functional

  Scenario: Admin interface shows loading state during data operations
    Given I am on the "Data Management" tab
    When I initiate a data import operation
    Then I should see a loading indicator
    And the interface should be disabled during loading
    When the operation completes
    Then the loading indicator should disappear
    And the interface should be enabled again

  Scenario: Admin sees error handling for failed operations
    Given I am on the "Data Management" tab
    When a data operation fails
    Then I should see a clear error message
    And the error message should explain what went wrong
    And I should be able to retry the operation
    And the interface should remain functional

  Scenario: Admin can access all features from full-screen interface
    Given I am on the admin interface
    Then I should be able to:
      | Action                           |
      | Import data                      |
      | Export data                      |
      | Clear all data                   |
      | View dashboard charts            |
      | View compliance status           |
      | Export PDF reports               |
      | Navigate between tabs            |
      | Logout                           |

  Scenario: Admin logout returns to user selection
    Given I am on any admin tab
    When I click the logout button
    Then I should be returned to the user selection screen
    And I should not see any admin content
    And I should be able to select a different user
