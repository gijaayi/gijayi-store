import { verifyPassword, hashPassword } from '@/lib/server/password';

export async function POST(request: Request) {
  try {
    const { password, storedHash } = await request.json();
    
    console.log('=== EXTERNAL HASH VERIFICATION ===');
    console.log('Input password:', password);
    console.log('Input password length:', password.length);
    console.log('Password charCodes:', [...password].map(c => c.charCodeAt(0)).join(','));
    console.log('Stored hash:', storedHash);
    
    const isValid = await verifyPassword(password, storedHash);
    console.log('Verification result:', isValid);
    
    // Also try hashing the password fresh
    const freshHash = await hashPassword(password);
    console.log('Fresh hash created:', freshHash.substring(0, 50) + '...');
    
    return Response.json({
      password,
      passwordLength: password.length,
      storedHashLength: storedHash.length,
      verified: isValid,
      message: isValid ? 'PASSWORD VERIFIED!' : 'Verification failed'
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
