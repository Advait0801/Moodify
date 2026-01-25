import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const jwtUtil = {
  sign: (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  },
  
  verify: (token: string): JWTPayload => {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  },
};