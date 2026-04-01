import { getMongoDb } from '@/lib/server/mongodb';

export async function GET() {
  try {
    const db = await getMongoDb();
    const usersCollection = db.collection('users');
    const admin = await usersCollection.findOne({ email: 'gijaayi@gmail.com' });
    
    if (!admin) {
      return Response.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    const hash = admin.passwordHash;
    console.log('=== HASH FROM MONGODB ===');
    console.log('Full hash:', hash);
    console.log('Hash length:', hash?.length);
    console.log('Hash type:', typeof hash);
    console.log('Hash is string:', typeof hash === 'string');
    console.log('First 50 chars:', hash?.substring(0, 50));
    console.log('Contains colon:', hash?.includes(':'));
    console.log('Char codes:', [...(hash || '')].map((c, i) => i < 100 ? `[${i}]=${c}(${c.charCodeAt(0)})` : '').filter(Boolean).join(' | '));
    
    return Response.json({
      hash: hash?.substring(0, 100) + '...',
      firstPart: hash?.split(':')[0],
      secondPart: hash?.split(':')[1]?.substring(0, 50),
      length: hash?.length,
      colonIndex: hash?.indexOf(':'),
      colonCount: hash?.split(':').length,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
