# Login does not show error message when valid email is submitted with wrong password

## Summary
The login form fails to display the 'Invalid email or password.

## Description
When a user submits the login form with a valid email (test@demo.com) and a wrong password, the application does not render the expected failure message. This means invalid login attempts go silently unrejected from the user's perspective, breaking the expected authentication feedback loop. The issue was confirmed by an assertion timeout waiting for the error message element to appear.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter a valid email: test@demo.com
3. Enter an incorrect password (not Password123)
4. Click the login/submit button

## Expected result
The error message 'Invalid email or password.' should be displayed to the user.

## Actual result
No error message is displayed; the 'Invalid email or password.' element is not found in the DOM after submission.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775490203307-login-does-not-show-error-message-when-valid-email-is-submitted-with-wrong-passw.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775490203307-login-does-not-show-error-message-when-valid-email-is-submitted-with-wrong-passw.png)
