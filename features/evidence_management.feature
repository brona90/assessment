Feature: Evidence Management
  As a user
  I want to add and view evidence for assessment questions
  So that I can support my assessment answers with documentation

  Background:
    Given I am on the assessment page
    And I have answered some questions

  Scenario: Add evidence to a question
    When I click on an evidence button for a question
    Then the evidence modal should open
    And I should see input fields for evidence
    When I enter evidence and save
    Then the evidence should be stored
    And the modal should close

  Scenario: View existing evidence
    When I have evidence for a question
    And I click on the evidence button
    Then I should see the existing evidence
    And I should be able to edit it
    And I should be able to delete it

  Scenario: Update evidence
    When I have existing evidence
    And I modify it in the modal
    And I save the changes
    Then the evidence should be updated
    And the changes should be persisted

  Scenario: Delete evidence
    When I have existing evidence
    And I open the evidence modal
    And I click delete
    Then the evidence should be removed
    And the modal should close
    And the evidence indicator should update

  Scenario: Evidence persistence
    When I add evidence for multiple questions
    And I navigate between sections
    Then all evidence should be preserved
    And evidence should be available when I return
    And evidence should survive page reload

  Scenario: Evidence validation
    When I try to save empty evidence
    Then I should see validation messages
    And the evidence should not be saved
    When I try to save evidence that's too long
    Then I should see length constraints