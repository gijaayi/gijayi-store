import { getMongoDb } from '@/lib/server/mongodb';
import { verifyPassword } from '@/lib/server/password';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('=== PASSWORD VERIFICATION TEST ===');
    console.log('Testing email:', email);
    console.log('Testing password:', password);
    console.log('Password length:', password.length);
    
    const db = await getMongoDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return Response.json({ error: 'User not found', verified: false }, { status: 404 });
    }
    
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.passwordHash?.substring(0, 50) + '...');
    console.log('Stored hash length:', user.passwordHash?.length);
    
    const isValid = await verifyPassword(password, user.passwordHash);
    console.log('Verification result:', isValid);
    
    return Response.json({
      email,
      password,
      passwordLength: password.length,
      hashLength: user.passwordHash?.length,
      verified: isValid,
      userDetails: {
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
