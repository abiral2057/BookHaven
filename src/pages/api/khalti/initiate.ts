
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
  if (!khaltiSecretKey) {
    return res.status(500).json({ error: 'Khalti secret key not configured on server.' });
  }

  try {
    // Khalti's test URL
    const khaltiUrl = "https://a.khalti.com/api/v2/epayment/initiate/";
    
    const response = await fetch(khaltiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${khaltiSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (response.ok) {
        res.status(200).json(data);
    } else {
        // Log the detailed error from Khalti for debugging
        console.error('Khalti API Error:', data);
        res.status(response.status).json({ error: data.detail || 'Failed to initiate Khalti payment' });
    }

  } catch (error: any) {
    console.error('Khalti API initiation error:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
