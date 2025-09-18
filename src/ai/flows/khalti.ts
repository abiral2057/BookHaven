
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/khalti/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx: input.pidx }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, status: 'ERROR', error: result.error || 'Verification API call failed' };
      }

      return result;

    } catch (error: any) {
      console.error('Khalti verification flow failed:', error);
      return { success: false, status: 'EXCEPTION', error: error.message || 'An unknown error occurred during verification.' };
    }
  }
);
