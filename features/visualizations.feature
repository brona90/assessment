Feature: Assessment Visualizations
  As a user
  I want to see visual representations of my assessment results
  So that I can quickly understand my technology maturity

  Background:
    Given I have completed an assessment
    And I have scores calculated
    And I am on the results section

  Scenario: View radar chart
    When I navigate to the results section
    Then I should see a radar chart
    And the chart should show all domains
    And the chart should reflect current scores

  Scenario: View bar chart
    When I navigate to the results section
    Then I should see a bar chart
    And the chart should display domain scores
    And the chart should have proper labels

  Scenario: Charts update with answers
    When I change an answer
    Then the charts should update
    And the visualization should reflect new scores
    And transitions should be smooth

  Scenario: Handle empty data in charts
    When I have no answers
    Then charts should handle empty data gracefully
    And I should see appropriate placeholders
    And no errors should occur

  Scenario: Responsive charts
    When I resize the browser window
    Then charts should resize appropriately
    And labels should remain readable
    And functionality should be preserved

  Scenario: Interactive chart elements
    When I hover over chart elements
    Then I should see tooltips with details
    And I should be able to interact with data points
    And relevant information should be displayed