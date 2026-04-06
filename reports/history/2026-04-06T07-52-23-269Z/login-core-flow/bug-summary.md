# Login does not show error message when wrong password is entered with valid email

## Summary
Submitting a valid email with an incorrect password does not display the expected 'Invalid email or password.

## Description
When a user enters a correct email (test@demo.com) combined with a wrong password, the application fails to render the error feedback message. This leaves users with no indication that their credentials are incorrect, breaking the expected authentication failure flow.

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
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submission.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775461978473-login-does-not-show-error-message-when-wrong-password-is-entered-with-valid-emai.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775461978473-login-does-not-show-error-message-when-wrong-password-is-entered-with-valid-emai.png)
