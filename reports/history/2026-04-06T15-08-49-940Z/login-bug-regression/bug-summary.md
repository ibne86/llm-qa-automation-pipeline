# Login does not show error message when correct email is used with wrong password

## Summary
Submitting a login form with a valid email and an incorrect password does not display the expected 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and display 'Invalid email or password.' Instead, the error message never appears, meaning the application either silently accepts the wrong credentials or shows no feedback at all. This prevents users from knowing their login attempt failed.

## Severity
Critical

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed and the user is not logged in.

## Actual result
No error message is shown; the 'Invalid email or password.' element is not found/visible after submitting incorrect credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775488147932-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775488147932-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)
