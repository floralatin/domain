
import jwt from "jsonwebtoken";

export async function generateToken(payload: any, expiresIn: number, secretKey: string) {
  const options = { expiresIn };
  return await jwt.sign(payload, secretKey, options);
}

export async function verifyToken(token: string, secretKey:string) {
  return await jwt.verify(token, secretKey);
}