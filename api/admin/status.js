// Vercel Function: Admin status check
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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Decode token (in production, verify JWT)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        
        // Check if token starts with 'admin:'
        if (parts[0] === 'admin') {
          res.status(200).json({
            isAdmin: true
          });
          return;
        }
      } catch (e) {
        // Invalid token
      }
    }
    
    res.status(200).json({
      isAdmin: false
    });
  } catch (error) {
    console.error('Admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
