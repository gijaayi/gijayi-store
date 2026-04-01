import { getMongoDb } from '@/lib/server/mongodb';
import { hashPassword } from '@/lib/server/password';
import { randomUUID } from 'crypto';

export async function POST() {
  try {
    const ADMIN_EMAIL = 'gijaayi@gmail.com';
    const ADMIN_PASSWORD = 'Gijayi@#$0500';
    const ADMIN_NAME = 'Platform Admin';

    console.log('=== CREATING FRESH ADMIN ===');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);

    // Hash the password
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    console.log('Password hash created:', passwordHash.substring(0, 50) + '...');

    // Connect to MongoDB and delete existing admin
    const db = await getMongoDb();
    const usersCollection = db.collection('users');
    
    console.log('Deleting existing admin...');
    await usersCollection.deleteMany({ email: ADMIN_EMAIL });
    console.log('Existing admin deleted');

    // Create new admin
    console.log('Creating new admin user...');
    const newAdmin = {
      id: randomUUID(),
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: passwordHash,
      role: 'admin',
      phone: '',
      hasPlacedOrder: false,
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newAdmin as any);
    console.log('Admin created with ID:', result.insertedId);

    // Verify it was created
    const verifyAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL });
    console.log('Verification - Admin found in DB:', !!verifyAdmin);
    console.log('Verification - Password hash matches:', verifyAdmin?.passwordHash === passwordHash);

    return Response.json({
      success: true,
      message: 'Fresh admin user created successfully',
      admin: {
        id: newAdmin.id,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
        createdAt: newAdmin.createdAt,
      },
      toLogin: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      instructions: 'Now try logging in with the credentials above',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return Response.json(
      { error: String(error), success: false },
      { status: 500 }
    );
  }
}
