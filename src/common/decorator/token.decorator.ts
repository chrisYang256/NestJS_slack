import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Token = createParamDecorator((data, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    
    return response.locals.jwt
})