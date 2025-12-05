import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json({
        success: false,
        message: 'Wrong password'
      });
    }

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    });
  }
}