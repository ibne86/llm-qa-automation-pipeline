# Login does not show error message when valid email is used with wrong password

## Summary
The login form fails to display the 'Invalid email or password.

## Description
When a user enters a valid email (test@demo.com) combined with a wrong password, the application does not render the expected failure message. This allows the login attempt to silently fail without proper user feedback, breaking the expected validation behavior for incorrect credentials.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter a valid email address: test@demo.com
3. Enter an incorrect/wrong password
4. Click the login/submit button

## Expected result
The error message 'Invalid email or password.' should be visible on the page.

## Actual result
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submitting valid email with wrong password.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775493701269-login-does-not-show-error-message-when-valid-email-is-used-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775493701269-login-does-not-show-error-message-when-valid-email-is-used-with-wrong-password.png)
