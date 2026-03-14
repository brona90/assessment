Feature: Admin Panel Management
  As an administrator
  I want to manage questions, users, and frameworks
  So that I can configure the assessment system

  Background:
    Given the application is loaded
    And I am logged in as an admin user
    And I am on the admin interface

  Scenario: Access configure tab
    When I click on the "Configure" tab
    Then I should see the configure interface
    And I should see sub-tabs for People, Content, and Frameworks

  Scenario: View users in People sub-tab
    Given I am on the "Configure" tab
    When I click on the "People" sub-tab
    Then I should see the users section
    And I should see a list of configured users

  Scenario: View questions in Content sub-tab
    Given I am on the "Configure" tab
    When I click on the "Content" sub-tab
    Then I should see the domains section
    And I should see the questions section

  Scenario: View frameworks in Frameworks sub-tab
    Given I am on the "Configure" tab
    When I click on the "Frameworks" sub-tab
    Then I should see the frameworks section

  Scenario: Edit a user
    Given I am on the "Configure" tab
    And I am on the "People" sub-tab
    When I click edit on a user
    Then I should see the user details in the form

  Scenario: Delete a user
    Given I am on the "Configure" tab
    And I am on the "People" sub-tab
    When I click delete on a non-admin user
    Then the user should be removed from the list
    And admin users should not have a delete button

  Scenario: Edit a domain
    Given I am on the "Configure" tab
    And I am on the "Content" sub-tab
    When I click edit on a domain
    Then I should see the domain details in the form

  Scenario: View assignments
    Given I am on the "Configure" tab
    And I am on the "People" sub-tab
    Then I should see the assignments section
