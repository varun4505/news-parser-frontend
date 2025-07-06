import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleAuthWrapper({ onLogin }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <h2 className="mb-4">Sign in to News Parser</h2>
        <GoogleLogin
          onSuccess={credentialResponse => {
            // Decode JWT to get email
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const { email } = JSON.parse(jsonPayload);
            if (email && email.endsWith('@konnectionsimag.com')) {
              onLogin(email);
            } else {
              alert('Only @konnectionsimag.com emails are allowed.');
            }
          }}
          onError={() => {
            alert('Login Failed');
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
