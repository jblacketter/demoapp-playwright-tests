@auth @negative @no_auth @regression
Feature: Negative Authentication Tests
  As a security measure
  Invalid credentials should be rejected
  And appropriate feedback should be shown

  Scenario: Invalid password is rejected
    Given I am on the login page
    When I login with username "admin" and password "wrongpassword"
    Then I should remain on the login page
    And I should see an error or stay on login

  Scenario: Invalid username is rejected
    Given I am on the login page
    When I login with username "nonexistentuser" and password "password123"
    Then I should remain on the login page
    And I should see an error or stay on login

  Scenario: Empty credentials are handled
    Given I am on the login page
    When I login with empty credentials
    Then I should remain on the login page
