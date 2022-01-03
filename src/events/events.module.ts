// nest g mo events

import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
    providers: [EventsGateway],
    // 어디선가 임포트한 모듈의 프로바이더 까지 다 쓰고싶다면 여기서 export를 해줘야함.
    // 따라서 EventsModule을 임포트한 다른 모듈에서 EventsGateway를 provider로 쓰게하려고 exports 해줌.
    exports: [EventsGateway], 
})
export class EventsModule {}
