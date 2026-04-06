# Login does not show error message when wrong password is entered

## Summary
Submitting a valid email with an incorrect password does not display the expected 'Invalid email or password.

## Description
When a user enters a valid email (test@demo.com) with a wrong password, the application fails to render the error feedback message. This means users receive no indication that their credentials are incorrect, breaking the expected authentication failure flow. The success path works correctly, confirming the issue is isolated to the failure/error state handling.

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
No error message is displayed after submitting an invalid password; the element 'Invalid email or password.' is not found in the DOM.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775470780012-login-does-not-show-error-message-when-wrong-password-is-entered.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775470780012-login-does-not-show-error-message-when-wrong-password-is-entered.png)
