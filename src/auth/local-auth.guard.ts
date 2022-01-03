// passport authentication같은 것
// local auth guard -> local startegy -> (auth.service를 통해 validate) -> (local startegy에서 return done이 되는 경우) local auth guard의 logIn(request) -> local serializer

import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import e from "express";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const can = await super.canActivate(context);
        if (can) {
            const request = context.switchToHttp().getRequest();
            console.log('login for cookie');
            await super.logIn(request); // <- local startegy에서 return done이 되는 경우
        }

        console.log(':::local-auth.guard');
        return true; // CanActivate의 반환값이 true일 때 다음으로 넘어갈 수 있음.
    }
}