import { Request } from 'express';

export const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies && req.cookies['refreshToken']) {
    return req.cookies['refreshToken'];
  }
  return null;
};
