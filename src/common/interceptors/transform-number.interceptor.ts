// interceptors/transform-number.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformNumbers(data))
    );
  }

  private transformNumbers(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.transformNumbers(item));
    }
    
    if (data !== null && typeof data === 'object') {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          data[key] = this.transformNumbers(data[key]);
        }
      }
      return data;
    }
    
    // Chuyển đổi string số thành number
    if (typeof data === 'string' && !isNaN(Number(data)) && data.trim() !== '') {
      return Number(data);
    }
    
    return data;
  }
}