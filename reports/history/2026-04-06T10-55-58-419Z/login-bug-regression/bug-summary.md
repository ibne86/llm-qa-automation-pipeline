# Login with correct email and wrong password does not show error message

## Summary
When a user submits a login form with a valid email and an incorrect password, the expected failure message 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and display the message 'Invalid email or password.'. Instead, the error message element is never rendered, meaning the application silently accepts or mishandles the invalid credentials without providing user feedback. This breaks the expected authentication failure flow and could mislead users about their login status.

## Severity
High

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword1)
4. Submit the login form

## Expected result
The message 'Invalid email or password.' is displayed to the user, indicating the login attempt failed.

## Actual result
No error message is displayed; the element 'Invalid email or password.' is not found in the DOM after submitting invalid credentials.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775472976299-login-with-correct-email-and-wrong-password-does-not-show-error-message.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775472976299-login-with-correct-email-and-wrong-password-does-not-show-error-message.png)
