// AOP
// interceptor로 데이터를 마지막에 한 번 더 가공할 수 있음.

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class UndefindToNullInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext, 
        next: CallHandler<any>
    ): Observable<any> | Promise<Observable<any>> {
        // 컨트롤러 가기 전에 실행되는 내용 작성(logging할 때 시간 재거나 하는 때 사용)

        // return 다음에는 컨트롤러 실행 후(response 가기 전)에 실행되는 내용 작성
        // data가 undefined로 들어가서 무시되는 경우를 막아주는 로직.(JSON은 undefined를 모르기 때문에 null로 바꿔서 에러 방지)
        // error 처리도 가능하지만 Exception filter로 보통 처리함.
        return next.handle().pipe(map((data) => data === undefined ? null : data)); 
    }
}