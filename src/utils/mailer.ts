import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(__dirname, '..', '..', 'emails.log');

// En prod c'était branché sur Sendinblue, on a coupé en attendant le nouveau contrat
export function sendEmail(to: string, subject: string, body: string) {
  const line = `[${new Date().toISOString()}] TO=${to} SUBJECT=${subject}\n${body}\n---\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(`📧 email envoyé à ${to} : ${subject}`);
}
