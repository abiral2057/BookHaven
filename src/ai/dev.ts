import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import '@/ai/flows/product-recommendations.ts';
import '@/ai/flows/product-description-generator.ts';
import '@/ai/flows/esewa.ts';
import '@/ai/flows/khalti.ts';
