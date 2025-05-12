"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type AuthLayoutProps = {
  children: React.ReactNode;
  showLogo?: boolean;
};

export default function AuthLayout({ children, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-blue-100 animate-gradient">
      {/* Top navigation */}
      <nav className="px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-900">Journalite</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-sm text-blue-900 hover:text-blue-700 font-medium"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="text-sm bg-white px-4 py-1.5 rounded-lg shadow-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign Up
          </Link>
        </div>
      </nav>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showLogo && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
                <span className="text-2xl font-bold">J</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Journalite</h1>
              <p className="text-slate-600 mt-1">Your trusted source for news</p>
            </div>
          )}
          
          {children}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="p-4 text-center text-sm text-slate-600">
        <div className="mb-2">
          <Link href="/terms" className="hover:text-blue-700 mx-2">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-blue-700 mx-2">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-blue-700 mx-2">Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} Journalite. All rights reserved.</p>
      </footer>
    </div>
  );
} 