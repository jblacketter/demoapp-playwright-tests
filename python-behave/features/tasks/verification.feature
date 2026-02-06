@tasks @verification @data-driven
Feature: Task Verification
  As a QA engineer
  I want to verify tasks are in the correct columns with correct tags
  So that I can ensure the Kanban board displays data accurately

  Scenario Outline: Verify task in correct column with expected tags
    When I navigate to the "<project>" project
    Then I should see task "<task_name>" in the "<column>" column
    And the task "<task_name>" should have tags "<tags>"

    @web-application
    Examples: Web Application Tasks
      | id    | project         | task_name                    | column      | tags                   |
      | TC001 | Web Application | Implement user authentication | To Do       | Feature, High Priority |
      | TC002 | Web Application | Fix navigation bug           | To Do       | Bug                    |
      | TC003 | Web Application | Design system updates        | In Progress | Design                 |
      | TC007 | Web Application | API integration              | Review      | Feature, High Priority |
      | TC008 | Web Application | Update documentation         | Done        | Feature                |

    @mobile-application
    Examples: Mobile Application Tasks
      | id    | project            | task_name               | column      | tags                   |
      | TC004 | Mobile Application | Push notification system | To Do       | Feature                |
      | TC005 | Mobile Application | Offline mode            | In Progress | Feature, High Priority |
      | TC006 | Mobile Application | App icon design         | Done        | Design                 |

    @marketing-campaign
    Examples: Marketing Campaign Tasks
      | id    | project            | task_name            | column      | tags                   |
      | TC009 | Marketing Campaign | Social media calendar | To Do       | Feature                |
      | TC010 | Marketing Campaign | Email campaign       | In Progress | Design, High Priority  |
      | TC011 | Marketing Campaign | Landing page copy    | Review      | Design                 |
