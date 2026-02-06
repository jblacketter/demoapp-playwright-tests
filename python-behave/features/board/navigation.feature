@board @navigation
Feature: Project Navigation
  As a user
  I want to switch between projects
  So that I can view different Kanban boards

  Scenario: Switching projects updates the header
    When I navigate to the "Web Application" project
    Then the project header should show "Web Application"
    When I navigate to the "Mobile Application" project
    Then the project header should show "Mobile Application"
    When I navigate to the "Marketing Campaign" project
    Then the project header should show "Marketing Campaign"

  Scenario: Navigating away and back preserves board content
    When I navigate to the "Web Application" project
    And I note the task count in "To Do" column
    When I navigate to the "Marketing Campaign" project
    Then the project header should show "Marketing Campaign"
    When I navigate to the "Web Application" project
    Then the "To Do" column task count should be the same

  Scenario: Each project shows distinct task content
    When I navigate to the "Web Application" project
    Then I should see task "Implement user authentication" in the "To Do" column
    When I navigate to the "Marketing Campaign" project
    Then I should see task "Social media calendar" in the "To Do" column
