import { getAuth } from 'firebase-admin/auth';

export async function verifyIdToken(token: string) {
  return getAuth().verifyIdToken(token);
}