Feature: Compliance Framework Management
  As an administrator
  I want to work with compliance frameworks
  So that I can map my assessment to industry standards

  Background:
    Given the application is loaded
    And I am logged in as an admin user
    And I am on the compliance frameworks section
    And compliance data is loaded

  Scenario: View available compliance frameworks
    When I navigate to the compliance frameworks
    Then I should see available frameworks
    And I should see framework descriptions
    And I should see enable/disable toggles

  Scenario: Enable compliance framework
    When I enable a compliance framework
    Then the framework should be activated
    And mappings should be displayed
    And compliance scores should be calculated

  Scenario: Disable compliance framework
    When I disable an active framework
    Then the framework should be deactivated
    And mappings should be hidden
    And compliance scores should be updated

  Scenario: View framework mappings
    When a framework is enabled
    Then I should see domain mappings
    And I should see compliance scores
    And I should see visual indicators

  Scenario: Hide compliance when no frameworks enabled
    When all frameworks are disabled
    Then the compliance section should be hidden
    And the overview should reflect no active frameworks
    And the layout should adjust accordingly

  Scenario: Multiple frameworks simultaneously
    When I enable multiple frameworks
    Then all frameworks should be displayed
    And each should have its own scores
    And the view should handle multiple mappings
