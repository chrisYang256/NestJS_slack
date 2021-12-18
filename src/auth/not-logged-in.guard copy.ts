import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class NotLoggedInGuard implements CanActivate { // CanActivate의 반환값이 true일 때 다음으로 넘어갈 수 있음.
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        
        return !request.isAuthenticated();
    }
}