// Vercel Function: Check auth status
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

  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Decode token (in production, verify JWT)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email] = decoded.split(':');
        
        res.status(200).json({
          success: true,
          isAuthenticated: true,
          user: {
            email: email,
            firstName: 'Demo',
            lastName: 'User'
          }
        });
      } catch (e) {
        res.status(200).json({
          success: true,
          isAuthenticated: false,
          user: null
        });
      }
    } else {
      res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
