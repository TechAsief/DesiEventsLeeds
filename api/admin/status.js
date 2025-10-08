// Vercel Function: Admin status check
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    // For now, return false (not admin)
    // TODO: Implement actual session checking
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
