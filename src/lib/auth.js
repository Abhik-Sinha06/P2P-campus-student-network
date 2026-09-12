import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vit_student_micro_lending_secret_key_2026_super_secure';
const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@vitstudent.ac.in';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function validateVitEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(ALLOWED_DOMAIN.toLowerCase());
}

export function getUserFromRequest(request) {
  try {
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map((c) => {
            const [k, ...v] = c.split('=');
            return [k, decodeURIComponent(v.join('='))];
          })
        );
        token = cookies['token'];
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
