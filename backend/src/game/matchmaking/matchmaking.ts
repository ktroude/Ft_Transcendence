import { Room, Client, Delayed, matchMaker } from "colyseus";

interface ClientStat {
  client: Client;
  userid: number;
}

export class RankedLobbyRoom extends Room {

  roomToCreate = "Private_Room"; //name of the room to create
  numClientsToMatch = 2; //number of players on each match
  stats: ClientStat[] = [];

  onCreate(options: any) {
    if (options.numClientsToMatch) {
      this.numClientsToMatch = options.numClientsToMatch;
    }
  }

  async onJoin(client: Client, options: any) {
    const playerId = client.sessionId;
    const existingUser = this.stats.find(stat => stat.userid === options);
    if (existingUser)
      return;
    this.stats.push({
      client: client,
      userid: options,
    });
    client.send("connect",{playerId: playerId});
    client.send("waiting", 1);
    this.checkGroupsReady();

    this.onMessage('waiting', (client, message) => {
      const index = this.stats.findIndex(stat => stat.client === client);
      this.stats.splice(index, 1);
    });
  }

  async checkGroupsReady() {
    if (this.stats.length >= this.numClientsToMatch) {
      // Create room instance on the server
      const room = await matchMaker.createRoom(this.roomToCreate, {});
      this.stats = this.stats.filter((clientStat) => {
        const client = clientStat.client;
        client.send('seat', room.roomId);
      
        // Retourne false pour retirer le client de la liste
        return false;
      });
    }
  }

  async onLeave(client: Client, consented: boolean) {
    const index = this.stats.findIndex(stat => stat.client === client);
    this.stats.splice(index, 1);
  }

  onDispose() {
  }

}
