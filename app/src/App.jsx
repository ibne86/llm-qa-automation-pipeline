import React from 'react';

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter both email and password.');
      setMessageType('error');
      return;
    }

    // Intentional bug for the demo:
    // This should require BOTH email and password to be correct.
    // Instead, it incorrectly allows login when EITHER is correct.
    const isAllowed =
      email === 'test@demo.com' || password === 'Password123';

    if (isAllowed) {
      setMessage('Login successful. Welcome back.');
      setMessageType('success');
      return;
    }

    setMessage('Invalid email or password.');
    setMessageType('error');
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Login</h1>
        <p className="subtext">
          Demo credentials: <strong>test@demo.com</strong> / <strong>Password123</strong>
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Email</span>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          <button data-testid="login-button" type="submit">
            Sign in
          </button>
        </form>

        {message ? (
          <div
            data-testid="login-message"
            className={messageType === 'success' ? 'message success' : 'message error'}
          >
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
