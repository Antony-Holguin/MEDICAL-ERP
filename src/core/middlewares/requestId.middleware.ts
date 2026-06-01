import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { requestId } from './constants';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = crypto.randomUUID();
    req[requestId] = id;
    res.set(requestId, id);
    next();
  }
}
