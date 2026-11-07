import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_TOKEN = 'authenticated_admin_session_token_2026';

/**
 * Verifies if the request contains a valid Super Admin session cookie.
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get('admin_session')?.value;
  return cookie === ADMIN_SESSION_TOKEN;
}

/**
 * Returns a 401 Unauthorized JSON response if the user is not a verified Super Admin.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Accès non autorisé : Session Super Admin requise.' },
      { status: 401 }
    );
  }
  return null;
}
