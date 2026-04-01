import { readDatabase } from '@/lib/server/database';
import { getMongoDb } from '@/lib/server/mongodb';

export async function GET() {
  try {
    console.log('=== DATABASE CONNECTION CHECK ===');
    
    // Check MongoDB connection
    let mongoConnected = false;
    let mongoError = null;
    
    try {
      const db = await getMongoDb();
      const adminCollection = db.collection('users');
      const result = await adminCollection.findOne({});
      mongoConnected = result ? true : false;
      console.log('MongoDB connection: SUCCESS');
    } catch (error) {
      mongoConnected = false;
      mongoError = String(error);
      console.log('MongoDB connection: FAILED -', error);
    }
    
    // Get database data
    const database = await readDatabase();
    const adminUser = database.users.find(u => u.role === 'admin');
    const allUsers = database.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasPassword: !!u.passwordHash,
      passwordHashLength: u.passwordHash?.length || 0,
    }));
    
    return Response.json({
      mongodbConnected: mongoConnected,
      mongodbError: mongoError,
      totalUsers: database.users.length,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        hasPassword: !!adminUser.passwordHash,
        passwordHashLength: adminUser.passwordHash?.length,
        createdAt: adminUser.createdAt,
      } : null,
      allUsers,
      envAdminEmail: process.env.ADMIN_LOGIN_EMAIL || 'NOT SET',
      envAdminPassword: process.env.ADMIN_LOGIN_PASSWORD ? '***SET***' : 'NOT SET',
    });
  } catch (error) {
    console.error('Status check error:', error);
    return Response.json({
      error: String(error),
      mongodbConnected: false,
    }, { status: 500 });
  }
}
