
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { pidx } = req.body;
  if (!pidx) {
    return res.status(400).json({ success: false, error: 'Payment ID (pidx) is required.' });
  }

  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
  if (!khaltiSecretKey) {
    console.error("KHALTI_SECRET_KEY is not set in environment variables.");
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  try {
    const response = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${khaltiSecretKey}`,
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json({ success: false, status: 'ERROR', error: data.detail || `Khalti API Error: ${response.statusText}` });
    }
    
    if (data.status === 'Completed') {
        res.status(200).json({ success: true, status: data.status, data });
    } else {
        res.status(200).json({ success: false, status: data.status, error: `Payment status is ${data.status}` });
    }

  } catch (error: any) {
    console.error('Khalti verification failed:', error);
    res.status(500).json({ success: false, status: 'EXCEPTION', error: error.message || 'An unknown error occurred during verification.' });
  }
}
