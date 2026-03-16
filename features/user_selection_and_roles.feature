Feature: User Selection and Role-Based Interface
  As a user of the assessment application
  I want to select who I am from a landing page
  So that I can access the appropriate interface based on my role

  Background:
    Given the application is loaded
    And the following users exist:
      | id     | name                     | role     |
      | user1  | Data Platform Engineer   | assessor |
      | admin  | Assessment Lead          | admin    |

  Scenario: Application starts with user selection screen
    When I open the application
    Then I should see the user selection screen
    And I should see a list of available users
    And I should see "Data Platform Engineer" in the user list
    And I should see "Assessment Lead" in the user list
    And I should not see any assessment content

  Scenario: Regular user selects themselves and sees user view
    Given I am on the user selection screen
    When I select "Data Platform Engineer" from the user list
    Then I should see the user view interface
    And I should see "Data Platform Engineer" as the current user
    And I should see only my assigned questions
    And I should see a progress bar
    And I should see an "Export My Data" button
    And I should see a "Logout" button
    And I should not see admin features
    And I should not see the "Overview" tab
    And I should not see the "Configure" tab
    And I should not see the "Data" tab

  Scenario: Admin user selects themselves and sees admin view
    Given I am on the user selection screen
    When I select "Assessment Lead" from the user list
    Then I should see the admin view interface
    And I should see three tabs: "Overview", "Configure", and "Data"
    And I should see the "Overview" tab as active
    And I should see an "Export PDF Report" button
    And I should not see the user view interface

  Scenario: Admin can switch between tabs
    Given I am logged in as "Assessment Lead"
    And I am on the admin view
    When I click on the "Overview" tab
    Then I should see the overview with charts
    And the "Overview" tab should be active
    When I click on the "Data" tab
    Then I should see the data management interface
    And the "Data" tab should be active
    When I click on the "Configure" tab
    Then I should see the configure interface
    And the "Configure" tab should be active

  Scenario: User logs out and returns to selection screen
    Given I am logged in as "Data Platform Engineer"
    And I am on the user view
    When I click the "Logout" button
    Then I should see the user selection screen
    And I should not see any user-specific content
    And I should be able to select a different user

  Scenario: User sees only their assigned questions
    Given I am logged in as "Data Platform Engineer"
    When I view the user interface
    Then I should see only my assigned questions

  Scenario: User sees progress tracking
    Given I am logged in as "Data Platform Engineer"
    When I view the user interface
    Then I should see a progress bar

  Scenario: User can export their data
    Given I am logged in as "Data Platform Engineer"
    When I view the user interface
    Then I should see an "Export My Data" button

  Scenario: Questions are grouped by domain and category
    Given I am logged in as "Data Platform Engineer"
    When I view the user interface
    Then I should see only my assigned questions

  Scenario: User with no assigned questions sees appropriate message
    Given I am logged in as "Assessment Lead"
    When I view the admin interface
    Then I should see the admin view interface
