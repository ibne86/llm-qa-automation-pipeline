# Login does not show error message when wrong password is entered with valid email

## Summary
Submitting a valid email with an incorrect password does not display the expected 'Invalid email or password.

## Description
When a user enters a correct email (test@demo.com) combined with a wrong password, the application fails to render the error feedback message. This leaves the user without any indication that their credentials were rejected. The login form should reject the attempt and display 'Invalid email or password.' but the element is never found in the DOM.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed to the user.

## Actual result
No error message appears; the 'Invalid email or password.' element is not found in the page after submitting invalid credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775472994907-login-does-not-show-error-message-when-wrong-password-is-entered-with-valid-emai.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775472994907-login-does-not-show-error-message-when-wrong-password-is-entered-with-valid-emai.png)
