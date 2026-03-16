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
      | Tab Name   |
      | Overview   |
      | Configure  |
      | Data       |
    And the "Overview" tab should be active by default

  Scenario: Admin navigates to Data tab
    Given I am on the admin interface
    When I click on the "Data" tab
    Then I should see the data management interface
    And I should see sections for:
      | Section                    |
      | Import                     |
      | Export                     |
      | Danger Zone                |

  Scenario: Admin navigates to Overview tab
    Given I am on the admin interface
    When I click on the "Overview" tab
    Then I should see the overview interface
    And I should see a completion table
    And I should see assessment statistics
    And the "Overview" tab should be active

  Scenario: Admin navigates to Configure tab
    Given I am on the admin interface
    When I click on the "Configure" tab
    Then I should see the configure interface
    And I should see sub-tabs for People, Content, and Frameworks
    And the "Configure" tab should be active

  Scenario: Admin exports PDF report from any tab
    Given I am on any admin tab
    When I click the "Export PDF Report" button
    Then a comprehensive PDF should be generated
    And I should receive a download

  Scenario: Admin cancels data clearing
    Given I am on the "Data" tab
    When I click the "Clear All Data" button
    And I see the confirmation dialog
    When I cancel the dialog
    Then no data should be deleted
    And I should remain on the Data tab

  Scenario: Admin sees responsive full-screen layout
    Given I am on the admin interface
    When I resize the browser window
    Then the layout should adapt responsively
    And all content should remain accessible
    And the navigation should remain functional

  Scenario: Admin logout returns to user selection
    Given I am on any admin tab
    When I click the logout button
    Then I should return to the user selection screen
    And I should not see the admin interface
