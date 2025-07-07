import React, { useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function setLoginSession(id) {
  const expiry = Date.now() + 5 * 60 * 60 * 1000; // 5 hours
  localStorage.setItem('google_login_id', id);
  localStorage.setItem('google_login_expiry', expiry);
}

function isSessionValid() {
  const expiry = localStorage.getItem('google_login_expiry');
  return expiry && Date.now() < parseInt(expiry, 10);
}

function getLoginId() {
  if (!isSessionValid()) return null;
  return localStorage.getItem('google_login_id');
}

export default function GoogleAuth({ onLogin }) {
  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large' }
      );
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large' }
        );
      };
      document.body.appendChild(script);
    }
    // eslint-disable-next-line
  }, []);

  function handleCredentialResponse(response) {
    // Parse JWT to get user info
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    setLoginSession(payload.email || payload.sub);
    if (onLogin) onLogin(payload.email || payload.sub);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h2>Sign in with Google to continue</h2>
        <div id="google-signin-btn"></div>
      </div>
    </div>
  );
}

export { setLoginSession, isSessionValid, getLoginId };
