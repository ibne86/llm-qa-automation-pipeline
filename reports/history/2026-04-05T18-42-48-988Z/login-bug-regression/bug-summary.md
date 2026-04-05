# Login with correct email and wrong password does not show error message

## Summary
When a user attempts to log in with a valid email and an incorrect password, the expected error message 'Invalid email or password.

## Description
The login form fails to show the failure message upon a wrong-password attempt, meaning the application silently accepts or does not properly handle invalid credentials.  This breaks the acceptance criteria requiring a clear failure indication for wrong passwords.  Users have no feedback that their login attempt failed.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed and login is rejected.

## Actual result
No error message is shown; the element 'Invalid email or password.' is not found in the page after submitting wrong credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775414590357-login-with-correct-email-and-wrong-password-does-not-show-er.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775414590357-login-with-correct-email-and-wrong-password-does-not-show-er.png)
