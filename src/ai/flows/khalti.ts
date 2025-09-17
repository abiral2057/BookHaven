'use server';

/**
 * @fileOverview Khalti payment verification flow.
 *
 * - verifyKhaltiPayment - Verifies a Khalti transaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const KhaltiVerificationInputSchema = z.object({
  pidx: z.string().describe('The unique payment identifier from Khalti.'),
});

const KhaltiVerificationOutputSchema = z.object({
  success: z.boolean().describe('Whether the payment was successful.'),
  status: z.string().describe('The status of the transaction.'),
  data: z.any().optional().describe('Additional data from Khalti if successful.'),
  error: z.string().optional().describe('Error message if verification fails.'),
});

export async function verifyKhaltiPayment(
  input: z.infer<typeof KhaltiVerificationInputSchema>
): Promise<z.infer<typeof KhaltiVerificationOutputSchema>> {
  return khaltiVerificationFlow(input);
}

const khaltiVerificationFlow = ai.defineFlow(
  {
    name: 'khaltiVerificationFlow',
    inputSchema: KhaltiVerificationInputSchema,
    outputSchema: KhaltiVerificationOutputSchema,
  },
  async (input) => {
    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Khalti secret key is not configured.');
    }

    try {
      const response = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${secretKey}`,
        },
        body: JSON.stringify({ pidx: input.pidx }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return { success: false, status: 'ERROR', error: `Khalti API Error: ${response.statusText} - ${errorBody}` };
      }
      
      const data = await response.json();

      if (data.status === 'Completed') {
        return { success: true, status: data.status, data };
      } else {
        return { success: false, status: data.status, error: `Payment status is ${data.status}` };
      }

    } catch (error: any) {
      console.error('Khalti verification failed:', error);
      return { success: false, status: 'EXCEPTION', error: error.message || 'An unknown error occurred during verification.' };
    }
  }
);
