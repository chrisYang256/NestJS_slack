// 커스텀 데코레이터를 이용하여 req를 쓰지 않아도 되어 분리성을 높이며 type 추론도 가능하게 만들 수 있다.
// ExecutionContext(실행 컨텍스트)를 통해  하나의 객체로 http, rpc, websoket 모두에 접근 가능하다.
// nest에서는 request, response를 쓰는게 별로 좋은 설계가 아니기 때문에 만들어주는 것.

import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
});