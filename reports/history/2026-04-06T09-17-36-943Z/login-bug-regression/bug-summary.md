# Login does not show error message when correct email is used with wrong password

## Summary
Submitting the correct email with an incorrect password does not display the expected 'Invalid email or password.

## Description
According to acceptance criteria, a login attempt with the correct email and a wrong password must fail and display 'Invalid email or password.' Instead, the error message is never rendered, suggesting the application may be silently accepting the invalid credentials or displaying no feedback at all. This prevents users from knowing their login attempt failed.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' should be visible on the page.

## Actual result
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submitting invalid credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775467073982-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775467073982-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)
