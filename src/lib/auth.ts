export interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  aud: string;
  iss: string;
}

export interface SessionToken {
  userId: string;
  email: string;
  expiresAt: number;
}

const JWT_ISSUER = import.meta.env.VITE_JWT_ISSUER || 'craudiovizai';
const JWT_AUDIENCE = import.meta.env.VITE_JWT_AUDIENCE || 'music-builder';

export async function exchangeDashboardToken(jwt: string): Promise<SessionToken> {
  const payload = await verifyJWT(jwt);

  if (payload.iss !== JWT_ISSUER) {
    throw new Error('Invalid token issuer');
  }

  if (payload.aud !== JWT_AUDIENCE) {
    throw new Error('Invalid token audience');
  }

  if (payload.exp * 1000 < Date.now()) {
    throw new Error('Token expired');
  }

  return {
    userId: payload.sub,
    email: payload.email,
    expiresAt: payload.exp * 1000,
  };
}

async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    if (!headerB64 || !payloadB64 || !signatureB64) {
      throw new Error('Invalid JWT format');
    }

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload: JWTPayload = JSON.parse(payloadJson);

    return payload;
  } catch (err) {
    throw new Error('JWT verification failed');
  }
}

export function createSessionCookie(session: SessionToken): string {
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000);

  return [
    `music_session=${encodeURIComponent(JSON.stringify(session))}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

export function parseSessionCookie(cookieHeader: string): SessionToken | null {
  const match = cookieHeader.match(/music_session=([^;]+)/);

  if (!match) return null;

  try {
    const session = JSON.parse(decodeURIComponent(match[1]));

    if (session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
