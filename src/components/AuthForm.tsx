import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase/clientApp';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Reset form
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle error appropriately
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Reset form
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle error appropriately
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Handle error appropriately
    }
  };

  return (
    <div className="auth-form-container">
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <form className="auth-form">
          <h2>{authMode === 'signup' ? 'Sign Up' : 'Sign In'}</h2>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          
          <div className="auth-buttons">
            {authMode === 'signup' ? (
              <>
                <button onClick={handleSignUp}>Sign Up</button>
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('signin')}
                    className="auth-toggle"
                  >
                    Sign In
                  </button>
                </p>
              </>
            ) : (
              <>
                <button onClick={handleSignIn}>Sign In</button>
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('signup')}
                    className="auth-toggle"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthForm; 