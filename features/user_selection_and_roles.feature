Feature: User Selection and Role-Based Interface
  As a user of the assessment application
  I want to select who I am from a landing page
  So that I can access the appropriate interface based on my role

  Background:
    Given the application is loaded
    And the following users exist:
      | id     | name        | role  |
      | user1  | John Doe    | user  |
      | admin1 | Admin User  | admin |

  Scenario: Application starts with user selection screen
    When I open the application
    Then I should see the user selection screen
    And I should see a list of available users
    And I should see "John Doe" in the user list
    And I should see "Admin User" in the user list
    And I should not see any assessment content

  Scenario: Regular user selects themselves and sees user view
    Given I am on the user selection screen
    When I select "John Doe" from the user list
    Then I should see the user view interface
    And I should see "John Doe" as the current user
    And I should see only my assigned questions
    And I should see a progress bar
    And I should see an "Export My Data" button
    And I should see a "Logout" button
    And I should not see admin features
    And I should not see the "Admin Panel" tab
    And I should not see the "Dashboard" tab
    And I should not see the "Compliance" tab

  Scenario: Admin user selects themselves and sees admin view
    Given I am on the user selection screen
    When I select "Admin User" from the user list
    Then I should see the admin view interface
    And I should see three tabs: "Admin Panel", "Dashboard", and "Compliance"
    And I should see the "Admin Panel" tab as active
    And I should see an "Export PDF Report" button
    And I should not see the user view interface

  Scenario: Admin can switch between tabs
    Given I am logged in as "Admin User"
    And I am on the admin view
    When I click on the "Dashboard" tab
    Then I should see the dashboard with charts
    And the "Dashboard" tab should be active
    When I click on the "Compliance" tab
    Then I should see the compliance dashboard
    And the "Compliance" tab should be active
    When I click on the "Admin Panel" tab
    Then I should see the admin panel
    And the "Admin Panel" tab should be active

  Scenario: User logs out and returns to selection screen
    Given I am logged in as "John Doe"
    And I am on the user view
    When I click the "Logout" button
    Then I should see the user selection screen
    And I should not see any user-specific content
    And I should be able to select a different user

  Scenario: User sees only their assigned questions
    Given I am logged in as "John Doe"
    And "John Doe" is assigned questions: "Q1", "Q2", "Q3"
    And there are other questions: "Q4", "Q5", "Q6"
    When I view the user interface
    Then I should see questions "Q1", "Q2", "Q3"
    And I should not see questions "Q4", "Q5", "Q6"

  Scenario: User sees progress tracking
    Given I am logged in as "John Doe"
    And I have 3 assigned questions
    And I have answered 1 question
    When I view the user interface
    Then I should see "Progress: 1/3 (33%)"
    When I answer another question
    Then I should see "Progress: 2/3 (67%)"

  Scenario: User can export their data
    Given I am logged in as "John Doe"
    And I have answered all my questions
    And I have added evidence to all answered questions
    When I click the "Export My Data" button
    Then my data should be exported successfully
    And I should receive a download file

  Scenario: User cannot export without evidence
    Given I am logged in as "John Doe"
    And I have answered 2 questions
    And I have added evidence to only 1 question
    When I click the "Export My Data" button
    Then I should see an error message about missing evidence
    And the export should not proceed
    And I should see "You have answered 2 question(s), but 1 of them are missing evidence"

  Scenario: Questions are grouped by domain and category
    Given I am logged in as "John Doe"
    And I have questions from domain "Security" category "Authentication"
    And I have questions from domain "Security" category "Authorization"
    And I have questions from domain "Performance" category "Optimization"
    When I view the user interface
    Then I should see questions grouped under "Security"
    And I should see "Authentication" as a subcategory under "Security"
    And I should see "Authorization" as a subcategory under "Security"
    And I should see questions grouped under "Performance"
    And I should see "Optimization" as a subcategory under "Performance"

  Scenario: User with no assigned questions sees appropriate message
    Given I am logged in as "John Doe"
    And "John Doe" has no assigned questions
    When I view the user interface
    Then I should see "No Questions Assigned"
    And I should see "You don't have any questions assigned yet"
    And I should see a message to contact the administrator

  Scenario: Data hydration updates when user changes
    Given I am logged in as "John Doe"
    And I see my assigned questions
    When I logout
    And I select "Admin User" from the user list
    Then I should see the admin view
    And I should not see "John Doe"'s questions
    When I logout
    And I select "John Doe" from the user list
    Then I should see the user view
    And I should see my assigned questions again

  Scenario: Admin exports comprehensive PDF report
    Given I am logged in as "Admin User"
    And I am on the admin view
    When I click the "Export PDF Report" button
    Then a comprehensive PDF report should be generated
    And the PDF should include all domains
    And the PDF should include all answers
    And the PDF should include all evidence
    And the PDF should include compliance data
    And I should receive a download file