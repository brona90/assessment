Feature: Technology Assessment Workflow
  As a user
  I want to complete a technology assessment
  So that I can evaluate my organization's technology maturity

  Background:
    Given I am on the technology assessment page
    And the assessment data is loaded

  Scenario: Start a new assessment
    When I navigate to the assessment section
    Then I should see the assessment form
    And I should see domain categories
    And I should see progress indicators

  Scenario: Answer assessment questions
    When I select an answer for a question
    Then the progress bar should update
    And the answer should be saved

  Scenario: Navigate between domains
    When I click on a domain tab
    Then I should see that domain's questions
    And the progress should be maintained

  Scenario: Complete assessment with all domains
    When I answer all questions across all domains
    Then I should see a completion message
    And the overall score should be calculated
    And domain scores should be displayed

  Scenario: Navigate between assessment and results
    When I complete some questions
    And I switch to the results section
    Then I should see current scores
    When I switch back to assessment
    Then my answers should be preserved

  Scenario: Reset assessment
    When I have answered questions
    And I reset the assessment
    Then all answers should be cleared
    And progress should be reset to 0