// decorators/parse-number.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParseNumber = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.body[data];
    
    if (value === undefined || value === null) {
      return undefined;
    }
    
    const num = Number(value);
    return isNaN(num) ? value : num;
  },
);