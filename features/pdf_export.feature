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

  Scenario: PDF includes executive summary
    When I generate a PDF
    Then the PDF should include an executive summary
    And it should show the overall maturity score
    And it should show the maturity level
    And it should show individual domain scores

  Scenario: PDF includes detailed results
    When I generate a PDF
    Then the PDF should include detailed assessment results
    And it should show all questions and answers
    And it should organize results by domain
    And it should handle multiple pages correctly

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