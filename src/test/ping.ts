import 'dotenv/config';
import { processMessage } from '../services/claude.js';

console.log('Calling Claude + Nova...');
const reply = await processMessage('+15550000001', 'trending solana tokens');
console.log('Reply:\n' + reply);
