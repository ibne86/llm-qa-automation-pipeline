# Login does not show error message when valid email is used with wrong password

## Summary
Submitting a valid email with an incorrect password does not display the expected 'Invalid email or password.

## Description
When a user enters a correct email (test@demo.com) and an incorrect password, the application fails to show the error message 'Invalid email or password.' that is required to indicate a failed login attempt. This means the application is not providing proper feedback on authentication failure, potentially leaving users confused or allowing unintended behavior. The success case with correct credentials works as expected.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' should be displayed to the user.

## Actual result
No error message is displayed after submitting valid email with wrong password; the element 'Invalid email or password.' is not found on the page.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469368233-login-does-not-show-error-message-when-valid-email-is-used-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469368233-login-does-not-show-error-message-when-valid-email-is-used-with-wrong-password.png)
