# Login form does not display error message when wrong password is entered

## Summary
Submitting a valid email with an incorrect password does not show the expected 'Invalid email or password.

## Description
When a user enters a correct email (test@demo.com) combined with a wrong password, the application fails to display the error message 'Invalid email or password.' after form submission. This means users receive no feedback indicating their credentials were rejected, which breaks the expected authentication failure flow.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' should be visible on the page.

## Actual result
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submitting incorrect credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775471418727-login-form-does-not-display-error-message-when-wrong-password-is-entered.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775471418727-login-form-does-not-display-error-message-when-wrong-password-is-entered.png)
