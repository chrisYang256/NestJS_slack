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
  @WebSocketServer() public server: Server;

  @SubscribeMessage('test')
  handleMessage(@MessageBody() data: string) {
    console.log('test::', data);
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: number; channels: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    console.log('login:::', newNamespace);
    onlineMap[socket.nsp.name][socket.id] = data.id;
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
    data.channels.forEach((channel) => {
      console.log('join:::', socket.nsp.name, channel);
      socket.join(`${socket.nsp.name}-${channel}`);
    });
  }

  afterInit(server: any): any {
    console.log(':::websocketserver init')
  }

  handleConnection(@ConnectedSocket() socket: Socket): any {
    console.log('connected:::', socket.nsp.name);
    if (!onlineMap[socket.nsp.name]) { // onlineMap : 워크스페이스 참가자 목록을 실시간으로 담고있는 객체
      onlineMap[socket.nsp.name] = {};
    }
    socket.emit('hello:::', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    console.log('disconnected:::', socket.nsp.name);
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList:::', Object.values(onlineMap[socket.nsp.name]));
  }
}


// namespace -> room 
// workspace -> channel/dm
// 워크스페이스 이름은 socket.nsp.name으로 접근 가능