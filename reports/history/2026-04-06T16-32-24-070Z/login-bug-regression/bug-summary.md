# Login does not reject valid email with wrong password

## Summary
Submitting a valid email with an incorrect password does not display the expected 'Invalid email or password.

## Description
When a user enters a valid email (test@demo.com) combined with a wrong password, the login form fails to show the error message 'Invalid email or password.' instead of rejecting the attempt. This means the application is not consistently enforcing authentication validation, potentially allowing unintended access or providing no feedback to the user on failure.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter a valid email: test@demo.com
3. Enter an incorrect/wrong password (not Password123)
4. Click the login/submit button

## Expected result
The error message 'Invalid email or password.' should be visible and the login should be rejected.

## Actual result
The error message 'Invalid email or password.' is not displayed; the element is not found within the timeout period.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775493162632-login-does-not-reject-valid-email-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775493162632-login-does-not-reject-valid-email-with-wrong-password.png)
