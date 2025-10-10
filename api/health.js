// Vercel Serverless Function - Health Check
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Backend API is running on Vercel',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
