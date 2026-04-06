# Login with correct email and wrong password does not show error message

## Summary
When a user submits the login form with a valid email and an incorrect password, the expected error message 'Invalid email or password.

## Description
The application fails to show any failure feedback when a wrong password is entered with a valid email, violating the acceptance criteria that requires a visible error message on failed login attempts. This means users receive no indication that their credentials are wrong, which is both a security and usability concern. The success scenario (correct credentials) passes correctly, confirming the issue is isolated to the failure handling path.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed on the page.

## Actual result
No error message is shown; the element 'Invalid email or password.' is not found in the DOM after submitting with wrong credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775461960969-login-with-correct-email-and-wrong-password-does-not-show-error-message.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775461960969-login-with-correct-email-and-wrong-password-does-not-show-error-message.png)
