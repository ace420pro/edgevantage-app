export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API is working - pages/api structure',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  } else if (req.method === 'POST') {
    try {
      return res.status(200).json({
        message: 'POST request received - pages/api structure',
        timestamp: new Date().toISOString(),
        receivedData: req.body
      });
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid JSON',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}