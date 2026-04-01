export async function GET() {
  try {
    const envEmail = process.env.ADMIN_LOGIN_EMAIL || 'NOT SET';
    const envPassword = process.env.ADMIN_LOGIN_PASSWORD || 'NOT SET';
    
    console.log('=== ENV VARIABLES ===');
    console.log('Email from env:', envEmail);
    console.log('Password from env:', envPassword);
    console.log('Password length:', envPassword.length);
    console.log('Password char codes:', [...envPassword].map(c => c.charCodeAt(0)).join(','));
    
    return Response.json({
      email: envEmail,
      password: envPassword,
      passwordLength: envPassword.length,
      passwordChars: [...envPassword].map((c, i) => ({ position: i, char: c, code: c.charCodeAt(0) })),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
