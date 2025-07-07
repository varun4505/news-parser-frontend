import React from 'react';
import GoogleAuth, { isSessionValid, getLoginId } from './GoogleAuth';

export function withGoogleAuth(WrappedComponent) {
  return function AuthWrapper(props) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(isSessionValid());
    React.useEffect(() => {
      if (isSessionValid()) setIsLoggedIn(true);
    }, []);
    if (!isLoggedIn) {
      return <GoogleAuth onLogin={() => setIsLoggedIn(true)} />;
    }
    return <WrappedComponent {...props} loginId={getLoginId()} />;
  };
}
