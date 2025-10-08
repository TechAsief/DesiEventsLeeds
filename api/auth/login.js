// Vercel Function: User login
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // For now, return a simple success response
    // TODO: Connect to database for real authentication
    if (email && password) {
      // Create a simple token (in production, use JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: 'user-' + Date.now(),
          email: email,
          firstName: 'Demo',
          lastName: 'User'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during communication'
    });
  }
}
