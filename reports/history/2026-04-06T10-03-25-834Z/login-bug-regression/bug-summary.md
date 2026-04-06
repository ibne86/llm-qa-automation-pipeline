# Login does not show error message when wrong password is used with valid email

## Summary
Submitting a login form with a valid email and incorrect password does not display the expected 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and show the message 'Invalid email or password.' However, the application fails to render this error message after submitting invalid credentials, allowing the failed login to go unacknowledged. This breaks the expected authentication feedback flow for users.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword1)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed to the user.

## Actual result
No error message is shown; the element 'Invalid email or password.' is not found in the DOM after submitting invalid credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469824920-login-does-not-show-error-message-when-wrong-password-is-used-with-valid-email.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469824920-login-does-not-show-error-message-when-wrong-password-is-used-with-valid-email.png)
