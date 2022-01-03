// nest g ga events
// gateway는 provider

// namespace 안에 room 들이 들어가있는 구조
// 위와 같은 개념으로 이 앱에서는 workspace(namespace) -> channel/dm(room)으로 사용
// 워크스페이스 이름은 socket.nsp.name으로 접근 가능

import { 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayInit, 
  OnGatewayDisconnect, 
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { onlineMap } from './onlineMap';

@WebSocketGateway({ namespace: /\/ws-.+/ }) // 사람들이 방 이름을 무엇으로 만들지 모르기 때문에 정규표현식 사용
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() public server: Server; // public ~~라는 것은 eventsGateway.server로 다른 모듈 등에서 사용할 수 있다는 의미

  @SubscribeMessage('test')
  handleMessage(@MessageBody() data: string) { // exporess에서 on.
    console.log('test::', data);
  }

  @SubscribeMessage('login') // express에서 login
  handleLogin(
    @MessageBody() data: { id: number; channels: number[] }, // data는 @MessageBody()로 의존성 주입(DI) 됨
    @ConnectedSocket() socket: Socket, // socket 쓰고 싶으면 @@ConnectedSocket()로 가져오면 됨
  ) {
    const newNamespace = socket.nsp;  
    console.log('login:::', newNamespace);

    onlineMap[socket.nsp.name][socket.id] = data.id;

    newNamespace.emit('onlineList:::', Object.values(onlineMap[socket.nsp.name]));

    data.channels.forEach((channel) => {
      console.log('join:::', 'socket.nsp.name:',socket.nsp.name, 'channel:',channel);
      socket.join(`${socket.nsp.name}-${channel}`);
    });
  }

  afterInit(_server: Server): any {
    console.log(':::websocketserver init')
  }

  handleConnection(@ConnectedSocket() socket: Socket): any {
    console.log('connected:::', socket.nsp.name);
    if (!onlineMap[socket.nsp.name]) { 
      onlineMap[socket.nsp.name] = {};
    }
    // 프론트와 연결 테스트할 때 사용
    // 프론트에서 on('hello', 콜백) 으로 테스트
    socket.emit('hello', socket.nsp.name); 
  }

  // Disconnect는 예약된 이벤트(처음부터 존재하는 이벤트)
  handleDisconnect(@ConnectedSocket() socket: Socket): any { // express에서 disconnet
    console.log('disconnected:::', socket.nsp.name);
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList:::', Object.values(onlineMap[socket.nsp.name]));
  }
}