// nodejs처럼 middleware를 nestjs에서도 만들 수 있음.
// 아래 코드는 nodejs처럼 미들웨어를 사용할 수 있다는 예시.
// 실무에서는 nestjs의 logger를 사용.

import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP'); // 'HTTP'는 context로써 HTTP 관련 Log라는것을 식별하기 좋아짐.

    use(request: Request, response: Response, next: NextFunction): void {
        // 1. 라우터 시작할 때 아래 변수 두개에 대해 기록
        const { ip, method, originalUrl } = request;
        const userAgent = request.get('user-agent') || ''; // request.get()으로 header에서 가져올 수 있음.

        // 3. 라우터 끝날 때 아래 내용 출력
        response.on('finish', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length');

            this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
        });

        // 2. 라우터로 감.
        next();
    }
}