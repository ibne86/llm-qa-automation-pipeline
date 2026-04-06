# Login does not display error message when wrong password is entered with valid email

## Summary
Submitting a valid email with an incorrect password does not show the expected 'Invalid email or password.

## Description
When a user enters a correct email (test@demo.com) paired with a wrong password, the application fails to display the error message 'Invalid email or password.' after form submission. This means the login failure state is not communicated to the user, breaking the expected authentication feedback behavior.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPass999)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' should be visible on the page.

## Actual result
No error message is displayed after submitting invalid credentials; the element 'Invalid email or password.' is not found in the DOM.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775488166362-login-does-not-display-error-message-when-wrong-password-is-entered-with-valid-e.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775488166362-login-does-not-display-error-message-when-wrong-password-is-entered-with-valid-e.png)
