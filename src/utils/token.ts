import { Request, Response, NextFunction } from 'express'
import { sign, verify } from 'jsonwebtoken';
import { IUser } from 'types';
import { openClient } from './db'

// auth middleware
export function authenticateToken(req: Request | any, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // check token
  if (!token) return res.status(401).json({ msg: "Invalid or expired token" });

  verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
    if (err) return res.status(403).json({ msg: "Expired session" });
    req.user = user;
    next();
  })
}


export async function generateTokens(user: IUser): Promise<{ accessToken: string, refreshToken: string }> {
  const accessToken = sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "3600s" });
  const refreshToken = sign(user, process.env.REFRESH_TOKEN_SECRET as string);

  const client = openClient();
  await client.connect();

  const query = `
    INSERT INTO public."refreshTokens"(token)
    VALUES ($1)
  `
  await client.query(query, [refreshToken]);
  await client.end();

  return {
    accessToken,
    refreshToken
  }
}


export async function checkIfTokenExists(token: string): Promise<boolean> {
  const client = openClient();
  await client.connect();

  const query = `
    SELECT token
    FROM public."refreshTokens"
    WHERE token=$1;
  `;
  const res = await client.query(query, [token]);
  await client.end();

  if (res.rowCount > 0) return true;
  return false;
}


export async function removeToken(token: string): Promise<void> {
  const client = openClient();
  await client.connect();

  const query = `
    DELETE FROM public."refreshTokens"
    WHERE token=$1
  `;
  await client.query(query, [token]);
  await client.end();
}