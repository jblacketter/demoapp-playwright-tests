@auth @smoke @regression
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access the Kanban boards

  @no_auth
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I login with valid credentials
    Then I should see the project sidebar
    And I should be logged in
