Feature: AMDS Technician Login

  Scenario: Verify mobile login screen
    Given the AMDS application is launched
    Then the mobile number field should be displayed
    And the Get OTP button should be displayed

   Scenario: Verify OTP verification screen
    Given the AMDS application is launched
    When I enter my registered mobile number and request OTP
    Then the OTP verification screen should be displayed
    And six OTP input fields should be displayed
    And the Verify OTP button should be displayed