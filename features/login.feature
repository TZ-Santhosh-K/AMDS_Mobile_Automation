Feature: AMDS Technician Login

  Scenario: Verify mobile login screen
    Given the AMDS application is launched
    Then the mobile number field should be displayed
    And the Get OTP button should be displayed

   Scenario: Verify OTP and navigate to dashboard
    Given the AMDS application is launched
    When I enter my registered mobile number and request OTP
    Then the OTP verification screen should be displayed
    And six OTP input fields should be displayed
    And the Verify OTP button should be displayed
    When I fetch the OTP from SMS and submit it
    Then the dashboard should be displayed

  Scenario: Verify email login screen
    Given the AMDS application is launched
    Then the email address field should be displayed
    And the Continue button should be displayed

  Scenario: Login with registered email and OTP
    Given the AMDS application is launched
    When I enter my registered email address and request OTP
    Then the OTP verification screen should be displayed
    And six OTP input fields should be displayed
    And the Verify OTP button should be displayed
    When I fetch the OTP from email and submit it
    Then the dashboard should be displayed

  Scenario: Login with email, password, OTP, and defer setup
    Given the AMDS application is launched
    When I enter my registered email address and password
    And I submit my login credentials
    Then the OTP verification screen should be displayed
    When I fetch the OTP from email and submit it
    Then the setup screen should be displayed
    When I choose to set up later
    Then the dashboard should be displayed

  Scenario Outline: Reject invalid email addresses
    Given the AMDS application is launched
    When I enter the email address "<email>" and request OTP
    Then the email validation message should be displayed
    And the OTP verification screen should not be displayed

    Examples:
      | email                   |
      |                         |
      | not-an-email            |
      | user@                   |
      | @example.com            |
      | user name@example.com   |

  Scenario: Reject an unregistered email address
    Given the AMDS application is launched
    When I enter an unregistered email address and request OTP
    Then an account not found message should be displayed
    And the OTP verification screen should not be displayed

  Scenario: Require email and password before continuing
    Given the AMDS application is launched
    When I submit the email and password login form with required fields empty
    Then the required field validation should be displayed
    And the OTP verification screen should not be displayed

  Scenario: Reject an incorrect password
    Given the AMDS application is launched
    When I enter my registered email address and an incorrect password
    And I submit my login credentials
    Then an invalid credentials message should be displayed
    And the OTP verification screen should not be displayed

  Scenario: Do not verify an incomplete OTP
    Given the OTP verification screen is displayed
    When I submit fewer than six OTP digits
    Then an OTP length validation message should be displayed
    And the dashboard should not be displayed

  Scenario: Reject an incorrect email OTP
    Given the OTP verification screen is displayed for email login
    When I submit an incorrect email OTP
    Then an invalid OTP message should be displayed
    And the dashboard should not be displayed

  Scenario: Reject an expired email OTP
    Given the OTP verification screen is displayed for email login
    When I submit an expired email OTP
    Then an expired OTP message should be displayed
    And the dashboard should not be displayed

  Scenario: Allow requesting another email OTP
    Given the OTP verification screen is displayed for email login
    When I request a new email OTP after the resend interval
    Then a new OTP should be sent to my registered email address
    And the previous OTP should no longer be accepted

  Scenario: Defer setup and complete it later
    Given I have logged in and the setup screen is displayed
    When I choose to set up later
    Then the dashboard should be displayed
    And setup should remain available from the dashboard
