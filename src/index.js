import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withGoogleAuth } from './components/withGoogleAuth';

const root = ReactDOM.createRoot(document.getElementById('root'));
const AuthApp = withGoogleAuth(App);
root.render(
  <React.StrictMode>
    <AuthApp />
  </React.StrictMode>
);
