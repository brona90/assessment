Feature: Admin Panel Management
  As an administrator
  I want to manage questions, users, and frameworks
  So that I can configure the assessment system

  Background:
    Given I am logged in as an admin user
    And I am on the technology assessment page
    And the assessment data is loaded

  Scenario: Access admin panel
    When I click on the Admin navigation button
    Then I should see the admin panel
    And I should see tabs for Questions, Users, and Assignments

  Scenario: View questions manager
    Given I am on the admin panel
    When I click on the Questions tab
    Then I should see the questions manager
    And I should see domain and category selectors
    And I should be able to select a domain
    And I should be able to select a category

  Scenario: Add a new question
    Given I am on the admin panel
    And I am on the Questions tab
    And I have selected a domain and category
    When I enter a question ID
    And I enter question text
    And I click the add question button
    Then the question should be added to the list
    And I should see the new question in the questions list

  Scenario: Edit an existing question
    Given I am on the admin panel
    And I am on the Questions tab
    And I have selected a domain with questions
    When I click edit on a question
    Then I should see the question details in the form
    When I modify the question text
    And I click the update button
    Then the question should be updated
    And I should see the updated question in the list

  Scenario: Delete a question
    Given I am on the admin panel
    And I am on the Questions tab
    And I have selected a domain with questions
    When I click delete on a question
    And I confirm the deletion
    Then the question should be removed from the list

  Scenario: View users manager
    Given I am on the admin panel
    When I click on the Users tab
    Then I should see the users manager
    And I should see a list of users
    And each user should show their name, email, and role

  Scenario: Delete a user
    Given I am on the admin panel
    And I am on the Users tab
    When I click delete on a non-admin user
    Then the user should be removed from the list
    And admin users should not have a delete button

  Scenario: View assignments manager
    Given I am on the admin panel
    When I click on the Assignments tab
    Then I should see the assignments manager
    And I should see a message about the feature