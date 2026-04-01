import { hashPassword, verifyPassword } from '@/lib/server/password';

export async function GET() {
  try {
    const testPassword = 'Gijayi@#$0500';
    
    console.log('=== DIRECT HASH TEST ===');
    console.log('Password:', testPassword);
    console.log('Password length:', testPassword.length);
    console.log('Char codes:', [...testPassword].map(c => c.charCodeAt(0)).join(','));
    
    // Create a hash
    const hash1 = await hashPassword(testPassword);
    console.log('\nHash 1:', hash1);
    
    // Verify immediately
    const verify1 = await verifyPassword(testPassword, hash1);
    console.log('Verify hash 1 immediately:', verify1);
    
    // Create another hash (should be different due to random salt)
    const hash2 = await hashPassword(testPassword);
    console.log('\nHash 2:', hash2);
    
    // Verify hash2 with same password
    const verify2 = await verifyPassword(testPassword, hash2);
    console.log('Verify hash 2 with same password:', verify2);
    
    return Response.json({
      password: testPassword,
      hash1: hash1.substring(0, 80) + '...',
      hash2: hash2.substring(0, 80) + '...',
      verify1: verify1,
      verify2: verify2,
      hashesEqual: hash1 === hash2,
      message: verify1 && verify2 ? 'Password hashing WORKS correctly' : 'Password hashing FAILED'
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
