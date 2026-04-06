# Login does not display error message when wrong password is entered

## Summary
Submitting a valid email with an incorrect password does not show the expected 'Invalid email or password.

## Description
When a user attempts to log in with a correct email and a wrong password, the application fails to display the error message 'Invalid email or password.' instead of rejecting the credentials visibly. This means users receive no feedback on failed login attempts, which is both a usability and security concern.

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
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775467091989-login-does-not-display-error-message-when-wrong-password-is-entered.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775467091989-login-does-not-display-error-message-when-wrong-password-is-entered.png)
