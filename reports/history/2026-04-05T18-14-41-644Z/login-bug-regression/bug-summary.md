# Login with wrong password does not display error message

## Summary
Submitting a login attempt with a valid email and incorrect password fails to show the expected 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and display 'Invalid email or password. ' Instead, the error message never appears, meaning the application either accepts the wrong password silently or shows no feedback to the user.  This breaks the expected authentication failure flow and could mislead users into thinking their login succeeded.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword1)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed and the success message is not visible.

## Actual result
The error message 'Invalid email or password.' does not appear after submitting the form with a wrong password.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/feature/github-actions-ci/artifacts/screenshots/1775412899851-login-with-wrong-password-does-not-display-error-message.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/feature/github-actions-ci/artifacts/screenshots/1775412899851-login-with-wrong-password-does-not-display-error-message.png)
