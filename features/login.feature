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
    Then the login success message should be displayed
    And the Let's get started button should be displayed
    When I tap Let's get started
    Then the dashboard should be displayed

  Scenario: Require a mobile number before requesting an OTP
    Given the AMDS application is launched
    When I request OTP without entering a mobile number
    Then the required mobile number message should be displayed

  Scenario: Reject a malformed mobile number
    Given the AMDS application is launched
    When I enter a malformed mobile number and request OTP
    Then the invalid mobile number message should be displayed

  Scenario: Keep the OTP screen open when the OTP is incomplete
    Given the AMDS application is launched
    When I enter my registered mobile number and request OTP
    Then the OTP verification screen should be displayed
    When I submit an incomplete OTP
    Then the OTP verification screen should be displayed

  Scenario: Reject an incorrect OTP
    Given the AMDS application is launched
    When I enter my registered mobile number and request OTP
    Then the OTP verification screen should be displayed
    When I submit an incorrect OTP
    Then the invalid OTP message should be displayed

  Scenario: Resend OTP after the one-minute cooldown and complete login
    Given the AMDS application is launched
    When I enter my registered mobile number and request OTP
    Then the OTP verification screen should be displayed
    And the Resend OTP option should be displayed
    And resending OTP should be unavailable before one minute
    When I wait for the one-minute resend cooldown
    Then resending OTP should be available
    When I request a new OTP
    Then resending OTP should be unavailable again
    When I fetch the OTP from SMS and submit it
    Then the login success message should be displayed
    And the Let's get started button should be displayed
    When I tap Let's get started
    Then the dashboard should be displayed
