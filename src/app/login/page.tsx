"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/clientApp';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setCustomValidation({ 
        ...customValidation, 
        [name]: name === 'email' ? 'Please enter your email address' : 'Please enter your password' 
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful', result.user);
      router.push('/');
    } catch (error) {
      console.error('Google sign-in failed', error);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    const form = e.currentTarget;
    const formElements = Array.from(form.elements) as HTMLInputElement[];
    
    const newTouchedFields: Record<string, boolean> = {};
    const newValidation: Record<string, string> = {};
    
    let isValid = true;
    
    formElements.forEach(el => {
      if (el.name && el.required) {
        newTouchedFields[el.name] = true;
        
        if (!el.value.trim()) {
          newValidation[el.name] = el.name === 'email' 
            ? 'Please enter your email address' 
            : 'Please enter your password';
          isValid = false;
        }
      }
    });
    
    setTouchedFields({ ...touchedFields, ...newTouchedFields });
    setCustomValidation({ ...customValidation, ...newValidation });
    
    if (!isValid) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Firebase Auth login
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to homepage on successful login
      router.push('/');
    } catch (err: unknown) {
      setError('Invalid email or password. Please try again.');
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

          {/* Login form */}
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
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3.5 bg-[#1a1a19] text-white rounded-md hover:bg-[#2a2a29] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">→</span>
                    <span>Enter the Thoughtspace</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-between pt-2 text-slate-700 text-sm">
              <Link href="/forgot-password" className="hover:text-slate-900">
                Forgot password?
              </Link>
              <Link href="/register" className="hover:text-slate-900">
                Create account
              </Link>
            </div>
          </form>

          {/* Social login options */}
          <div className="mt-8 space-y-3">
            <button 
              className="w-full flex items-center justify-center px-4 py-3 border border-[#e8e1d1] bg-[#f8f5ec] rounded-md hover:bg-[#f0ece3] transition-colors"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-slate-800">Continue with Google</span>
            </button>
            
            <button 
              className="w-full flex items-center justify-center px-4 py-3 border border-[#e8e1d1] bg-[#f8f5ec] rounded-md hover:bg-[#f0ece3] transition-colors"
              onClick={() => console.log('Instagram login')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" fill="url(#paint0_radial)"/>
                <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="#fff"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/>
                <defs>
                  <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -23.0951 21.4696 0 12 23.9773)">
                    <stop stopColor="#FFDD55"/>
                    <stop offset=".1" stopColor="#FFDD55"/>
                    <stop offset=".5" stopColor="#FF543E"/>
                    <stop offset="1" stopColor="#C837AB"/>
                  </radialGradient>
                </defs>
              </svg>
              <span className="text-slate-800">Continue with Instagram</span>
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