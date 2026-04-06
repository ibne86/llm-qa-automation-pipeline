# Login with wrong password does not display error message 'Invalid email or password.'

## Summary
When a user submits a valid email with an incorrect password, the expected error message is not shown.

## Description
The login form fails to display the 'Invalid email or password.' message after submitting valid email (test@demo.com) with a wrong password. Instead of rejecting the credentials and showing the error, the application appears to either silently fail or behave unexpectedly. This breaks the core login security flow and could mislead users about the validity of their credentials.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Click the login/submit button

## Expected result
The error message 'Invalid email or password.' should be visible on the page.

## Actual result
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submitting incorrect credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469843742-login-with-wrong-password-does-not-display-error-message-invalid-email-or-passwo.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469843742-login-with-wrong-password-does-not-display-error-message-invalid-email-or-passwo.png)
