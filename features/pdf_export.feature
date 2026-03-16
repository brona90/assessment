Feature: PDF Export Functionality
  As a user
  I want to export my assessment results as PDF
  So that I can share and archive the assessment report

  Background:
    Given I have completed an assessment
    And I have answers for all questions
    And my scores are calculated

  Scenario: Export PDF from header button
    When I click the export PDF button in the header
    Then a PDF should be generated
    And the PDF should contain the assessment results
    And the PDF should be downloaded automatically

  Scenario: PDF includes compliance frameworks
    When I have compliance frameworks enabled
    And I generate a PDF
    Then the PDF should include compliance information
    And it should show framework mappings
    And it should display compliance scores

  Scenario: Handle PDF export errors gracefully
    When PDF generation fails
    Then an error message should be displayed
    And the application should remain functional
    And I should be able to retry the export

  Scenario: PDF includes all visualizations
    Given I have completed an assessment with scores
    When I generate a PDF
    Then the PDF should include the radar chart
    And the PDF should include the bar chart
    And charts should be clearly visible
    And charts should maintain their aspect ratio
