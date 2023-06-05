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
    console.log("creation du lobby", this.roomId);
  }

  async onJoin(client: Client, options: any) {
    const playerId = client.sessionId;
    
    console.log("une personne a rejoint", client.id, options);

    const existingUser = this.stats.find(stat => stat.userid === options);
    if (existingUser)
    {
      console.log("deja log", existingUser);
      return;
    }
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
    console.log(this.stats.length);
    if (this.stats.length >= this.numClientsToMatch) {
      // Create room instance on the server
      console.log("creation de la room...");
      const room = await matchMaker.createRoom(this.roomToCreate, {});
      console.log("Room crée", room.roomId);
      this.stats = this.stats.filter((clientStat) => {
        const client = clientStat.client;
        client.send('seat', room.roomId);
        console.log("envoie l'id de la room");
      
        // Retourne false pour retirer le client de la liste
        return false;
      });
    }
  }

  async onLeave(client: Client, consented: boolean) {
    const index = this.stats.findIndex(stat => stat.client === client);
    this.stats.splice(index, 1);
    console.log("un client est parti du lobby", client.sessionId);
  }

  onDispose() {
    console.log("destruction du lobby");
  }

}
