import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    logger.api('POST /api/auth/login - Login attempt', { email });
    
    if (!email || !password) {
      logger.error('Login failed: Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await authenticateUser(email, password);
    
    if (result.success) {
      logger.api('Login successful, creating session');
      
      const sessionToken = Buffer.from(`${result.user!.id}:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({
        success: true,
        user: result.user,
      });
      
      response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });
      
      return response;
    }
    
    logger.api('Login failed', { error: result.error });
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    );
  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
