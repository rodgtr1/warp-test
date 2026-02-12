import logger from './logger';

/**
 * Authentication module for BookIt
 * Valid credentials: demo@bookit.com / password123
 */

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

const VALID_EMAIL = 'demo@bookit.com';
const VALID_PASSWORD = 'password123';

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  logger.auth('Authentication attempt started', { email, password });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  logger.auth('Validating credentials against stored values', { 
    providedEmail: email, 
    expectedEmail: VALID_EMAIL,
  });

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    logger.auth('Credential check passed');
    
    const user: User = {
      id: 'user-demo',
      email: VALID_EMAIL,
      name: 'Demo User'
    };

    logger.auth('Authentication successful', { userId: user.id });
    return { success: true, user };
  }

  logger.error('Authentication failed: Invalid credentials', { email });
  return {
    success: false,
    error: 'Invalid email or password'
  };
}
