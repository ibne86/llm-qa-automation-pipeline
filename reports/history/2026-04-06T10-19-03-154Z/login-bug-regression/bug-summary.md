# Login does not show error message when correct email is used with wrong password

## Summary
Submitting a login form with a valid email and incorrect password does not display the expected 'Invalid email or password.

## Description
According to the acceptance criteria, a login attempt with the correct email and a wrong password must fail and display 'Invalid email or password.' Instead, the error message is never rendered, meaning the application either silently accepts the wrong password or shows no feedback to the user. This prevents users from knowing their credentials are incorrect.

## Severity
Critical

## Steps to reproduce
1. Navigate to the login page
2. Enter the valid email: test@demo.com
3. Enter an incorrect password (e.g., WrongPassword1)
4. Submit the login form

## Expected result
The error message 'Invalid email or password.' is displayed and login does not succeed.

## Actual result
The error message 'Invalid email or password.' is not visible; the application does not indicate login failure.

## Attachment
![Failure screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775470761375-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)

[Open screenshot](https://raw.githubusercontent.com/ibne86/llm-qa-automation-pipeline/main/artifacts/screenshots/1775470761375-login-does-not-show-error-message-when-correct-email-is-used-with-wrong-password.png)
