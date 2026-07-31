import { JwtPayload } from '../decorators/current-user.decorator';

export function getSedeFilter(user: JwtPayload | undefined, querySedeId?: string | number): number | undefined {
  if (!user) return undefined;

  const explicitId = typeof querySedeId === 'string' ? parseInt(querySedeId, 10) : querySedeId;

  if (user.rol === 'admin_central') {
    return explicitId || undefined;
  }

  return user.sedeId ?? explicitId ?? undefined;
}
