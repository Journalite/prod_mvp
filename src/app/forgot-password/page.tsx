"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/clientApp';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [customValidation, setCustomValidation] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, validity } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    
    // Clear previous validation message
    setCustomValidation({ ...customValidation, [name]: '' });
    
    // Add a custom validation message if empty
    if (validity.valueMissing) {
      setCustomValidation({ 
        ...customValidation, 
        [name]: 'Please enter your email address'
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
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
          newValidation[el.name] = 'Please enter your email address';
          isValid = false;
        }
      }
    });
    
    setTouchedFields({ ...touchedFields, ...newTouchedFields });
    setCustomValidation({ ...customValidation, ...newValidation });
    
    if (!isValid) return;
    
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email);
      
      // Show success message
      setSuccess(true);
    } catch (err: any) {
      // Extract and display error message
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (err.message) {
        if (err.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email address.';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        }
      }
      setError(errorMessage);
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
              <p>Reset your password to</p>
              <p>return to your Thoughtspace.</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          {success ? (
            <div className="w-full">
              <div className="mb-8 text-slate-800">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
                Please check your inbox and follow the instructions.
              </div>
              <Link 
                href="/login" 
                className="inline-flex items-center px-5 py-3.5 bg-[#1a1a19] text-white rounded-md hover:bg-[#2a2a29] focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <span className="mr-2">→</span>
                <span>Return to login</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Reset form */}
              <form onSubmit={handlePasswordReset} className="space-y-4 w-full" noValidate>
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
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-3.5 bg-[#1a1a19] text-white rounded-md hover:bg-[#2a2a29] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Sending reset link..."
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-2">→</span>
                        <span>Send password reset link</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex justify-center pt-2 text-sm text-slate-700">
                  <Link href="/login" className="hover:text-slate-900">
                    Return to login
                  </Link>
                </div>
              </form>
            </>
          )}

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