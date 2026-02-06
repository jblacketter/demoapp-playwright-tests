@board @structure @regression
Feature: Board Structure Verification
  As a user
  I want to see the correct board structure
  So that I can organize my tasks effectively

  Scenario: All projects are visible in sidebar
    Then I should see "Web Application" in the sidebar
    And I should see "Mobile Application" in the sidebar
    And I should see "Marketing Campaign" in the sidebar

  Scenario Outline: Each project has all 4 columns
    When I navigate to the "<project>" project
    Then I should see the "To Do" column
    And I should see the "In Progress" column
    And I should see the "Review" column
    And I should see the "Done" column

    Examples:
      | project             |
      | Web Application     |
      | Mobile Application  |
      | Marketing Campaign  |

  Scenario Outline: Column task counts are correct
    When I navigate to the "<project>" project
    Then the "To Do" column should have <todo> task(s)
    And the "In Progress" column should have <in_progress> task(s)
    And the "Review" column should have <review> task(s)
    And the "Done" column should have <done> task(s)

    Examples:
      | project             | todo | in_progress | review | done |
      | Web Application     | 2    | 1           | 1      | 1    |
      | Mobile Application  | 1    | 1           | 0      | 1    |
      | Marketing Campaign  | 1    | 1           | 1      | 0    |
