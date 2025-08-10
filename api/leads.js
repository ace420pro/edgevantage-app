// Simplified API endpoint for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For now, let's just test the connection works
  if (req.method === 'POST') {
    console.log('Received lead submission:', req.body);
    
    // We'll add MongoDB after testing
    return res.status(200).json({ 
      success: true,
      message: 'Test successful - API is working!',
      received: req.body
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'healthy',
      message: 'API is working'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}