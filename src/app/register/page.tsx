"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/clientApp';

async function handleEmailSignUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
    console.log('Sign-up successful', userCredential.user);
    return userCredential;
  } catch (error) {
    console.error('Sign-up failed', error);
    throw error;
  }
}

async function handleGoogleSignUp() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-up successful', result.user);
    return result;
  } catch (error) {
    console.error('Google sign-up failed', error);
    throw error;
  }
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [customValidation, setCustomValidation] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, validity } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    
    // Clear previous validation message
    setCustomValidation({ ...customValidation, [name]: '' });
    
    // Add a custom validation message if empty
    if (validity.valueMissing) {
      let message = 'This field is required';
      if (name === 'email') message = 'Please enter your email address';
      if (name === 'password') message = 'Please enter a password';
      if (name === 'confirmPassword') message = 'Please confirm your password';
      
      setCustomValidation({ ...customValidation, [name]: message });
    }
  };

  const validateForm = () => {
    const newValidation: Record<string, string> = {};
    const newTouchedFields: Record<string, boolean> = {};
    let isValid = true;
    
    // Email validation
    newTouchedFields.email = true;
    if (!email.trim()) {
      newValidation.email = 'Please enter your email address';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newValidation.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    newTouchedFields.password = true;
    if (!password) {
      newValidation.password = 'Please enter a password';
      isValid = false;
    } else if (password.length < 6) {
      newValidation.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    newTouchedFields.confirmPassword = true;
    if (password !== confirmPassword) {
      newValidation.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setTouchedFields({ ...touchedFields, ...newTouchedFields });
    setCustomValidation({ ...customValidation, ...newValidation });
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the new handleEmailSignUp function instead
      await handleEmailSignUp(email, password);
      
      // Redirect to login page on successful registration
      router.push('/login');
    } catch (err: unknown) {
      let errorMessage = 'Failed to create account';
      if (err instanceof Error) {
        // Handle specific Firebase errors
        if (err.message.includes('email-already-in-use')) {
          errorMessage = 'This email is already registered';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (err.message.includes('weak-password')) {
          errorMessage = 'Password is too weak';
        }
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show validation styling only if field is touched
  const getInputClasses = (fieldName: string) => {
    const baseClasses = "w-full px-5 py-3.5 bg-[#f8f5ec] border border-[#e8e1d1] rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500";
    
    if (touchedFields[fieldName] && customValidation[fieldName]) {
      return `${baseClasses} border-red-300 bg-red-50`;
    }
    
    return baseClasses;
  };

  return (
    <div className="min-h-screen bg-[#f5efe0] flex">
      {/* Left content area */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto px-6 md:px-0 md:ml-20 xl:ml-32">
          {/* Logo and tagline */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-serif font-normal text-slate-900">Journalite</h1>
            <div className="mt-4 text-lg md:text-xl text-slate-800 italic">
              <p>Every thought has a doorway.</p>
              <p>This is yours.</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                className={getInputClasses('email')}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                required
              />
              {touchedFields.email && customValidation.email && (
                <p className="mt-1 text-sm text-red-500">{customValidation.email}</p>
              )}
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                className={getInputClasses('password')}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
                required
              />
              {touchedFields.password && customValidation.password && (
                <p className="mt-1 text-sm text-red-500">{customValidation.password}</p>
              )}
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={getInputClasses('confirmPassword')}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleBlur}
                required
              />
              {touchedFields.confirmPassword && customValidation.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{customValidation.confirmPassword}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3.5 bg-[#1a1a19] text-white rounded-md hover:bg-[#2a2a29] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating your account..."
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">→</span>
                    <span>Create your account</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-center pt-2 text-slate-700 text-sm">
              <span className="mr-2">Already have an account?</span>
              <Link href="/login" className="hover:text-slate-900">
                Sign in
              </Link>
            </div>
          </form>

          {/* Social login options */}
          <div className="mt-8 space-y-3">
            <button 
              className="w-full flex items-center justify-center px-4 py-3 border border-[#e8e1d1] bg-[#f8f5ec] rounded-md hover:bg-[#f0ece3] transition-colors"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  setError('');
                  await handleGoogleSignUp();
                  router.push('/');
                } catch (err) {
                  setError('Google sign-up failed. Please try again.');
                  console.error(err);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-slate-800">Sign up with Google</span>
            </button>
          </div>

          {/* Bottom tagline */}
          <div className="mt-20 mb-8 text-slate-700 italic">
            <p>Words are the threads of thought.</p>
          </div>
        </div>
      </div>

      {/* Right image area - converted to background div */}
      <div className="hidden md:block w-1/2 relative bg-[#f5efe0]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: 'url("/images/login.png")',
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
} 