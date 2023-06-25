import { Room, Client } from 'colyseus';
import { MyRoomState } from './MyRoomState';

export class publicRoom extends Room<MyRoomState> {
  onCreate(options: any) {
    this.setState(new MyRoomState());
  }
  async onJoin(client: Client, options: any) {
  }
}
