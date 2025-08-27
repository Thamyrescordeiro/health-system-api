import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
  count: number;
  lastRequest: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, RateLimitRecord>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const ip: string =
      request.ip ?? request.connection?.remoteAddress ?? 'unknown';

    const now = Date.now();
    const limit = 1;
    const windowMs = 60 * 2000;

    const record = this.requests.get(ip);

    if (record) {
      if (now - record.lastRequest < windowMs) {
        if (record.count >= limit) {
          throw new ForbiddenException('Too many requests, slow down!');
        }
        record.count++;
      } else {
        this.requests.set(ip, { count: 1, lastRequest: now });
      }
    } else {
      this.requests.set(ip, { count: 1, lastRequest: now });
    }

    return true;
  }
}
