'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    logger.action('Login form submitted', { email });

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      logger.api('Sending login request');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        logger.auth('Login successful', { user: data.user });
        setSuccess(true);
      } else {
        logger.error('Login failed', { error: data.error });
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      logger.error('Login request failed', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login to BookIt</h1>
        
        {success ? (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md mb-4">
            Login successful! Welcome back.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@bookit.com"
                className="w-full border rounded-md px-3 py-2"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full border rounded-md px-3 py-2"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t text-sm text-gray-500">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>Email: demo@bookit.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}
