
'use server';

/**
 * @fileOverview eSewa payment signature generator.
 *
 * - generateEsewaSignature - Generates a secure signature for an eSewa transaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as crypto from 'crypto';

const EsewaSignatureInputSchema = z.object({
  amount: z.string().describe("The total amount of the transaction."),
  transaction_uuid: z.string().describe("The unique ID for the transaction."),
});

const EsewaSignatureOutputSchema = z.object({
  signature: z.string().describe("The Base64 encoded HMAC-SHA256 signature."),
});

export async function generateEsewaSignature(
  input: z.infer<typeof EsewaSignatureInputSchema>
): Promise<z.infer<typeof EsewaSignatureOutputSchema>> {
  return esewaSignatureFlow(input);
}

const esewaSignatureFlow = ai.defineFlow(
  {
    name: 'esewaSignatureFlow',
    inputSchema: EsewaSignatureInputSchema,
    outputSchema: EsewaSignatureOutputSchema,
  },
  async (input) => {
    const secretKey = process.env.ESEWA_SECRET_KEY;
    if (!secretKey) {
      throw new Error("eSewa secret key is not configured in environment variables.");
    }

    const message = `total_amount=${input.amount},transaction_uuid=${input.transaction_uuid},product_code=EPAYTEST`;

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    const signature = hmac.digest('base64');

    return { signature };
  }
);

    