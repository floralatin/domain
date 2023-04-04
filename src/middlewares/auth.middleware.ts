import { NextFunction, Response, Request } from "express";
import { ApplicationError } from "../helpers/application.err";
import { UserModel } from "../models/user.model";
import { verifyToken } from '../utils/jwt';
import config from '../config'; 
import redisService from '../services/redis.service'; 
import { User } from "../interfaces/user.interface";

const getAuthorization = (req: Request) => {
  if (req.cookies) {
    const cookie = req.cookies["Authorization"] as string;
    if (cookie) return cookie;
  }

  const header = req.header("Authorization");
  if (header) {
    return header.split("Bearer ")[1];
  }

  return null;
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (config.isDevelopment()) {
      next();
      return;
    }

    const authorization = getAuthorization(req);
    if (authorization) {
      const data = (await verifyToken(authorization, config.get('secretKey')))as User;
      if (data) {

        let user = await redisService.get(`auth:${data.uid}`);
        if (user) {
          (req as any).user = JSON.parse(user);
        } else {
          user = await UserModel.findOne({ uid: data.uid });
          await redisService.setEx(`auth:${data.uid}`, JSON.stringify(user));
        }

        next();
      } else {
        next(new ApplicationError(401, "Wrong authentication token"));
      }
    } else {
      next(new ApplicationError(404, "Authentication token missing"));
    }
  } catch (error) {
    next(new ApplicationError(401, "Wrong authentication token"));
  }
};
