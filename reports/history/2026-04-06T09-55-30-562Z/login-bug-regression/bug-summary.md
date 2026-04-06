# Login with correct email and wrong password does not show failure message

## Summary
When a user submits the login form with a valid email and an incorrect password, the expected error message 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and display the message 'Invalid email or password.' Instead, the application does not render this error message at all, meaning the failed login attempt is silently accepted or produces no feedback to the user. This breaks the security expectation that invalid credentials are clearly rejected.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed and the user is not logged in.

## Actual result
The error message 'Invalid email or password.' is not visible; no failure feedback is shown to the user.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469348413-login-with-correct-email-and-wrong-password-does-not-show-failure-message.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775469348413-login-with-correct-email-and-wrong-password-does-not-show-failure-message.png)
