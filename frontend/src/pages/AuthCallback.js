import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthCallback.css';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        // Store token
        localStorage.setItem('token', token);
        
        // Update auth context
        if (login) {
          await login(token);
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // No token, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  const token = searchParams.get('token');

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <div className="spinner-large"></div>
        {token ? (
          <>
            <h2>Login Successful!</h2>
            <p>Redirecting to your dashboard...</p>
          </>
        ) : (
          <>
            <h2>Authentication Failed</h2>
            <p>Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
