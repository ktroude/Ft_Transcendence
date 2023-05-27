import { Room, Client, Delayed, matchMaker } from "colyseus";
import { Any } from "typeorm";

interface ClientStat {
  client: Client;
}

export class RankedLobbyRoom extends Room {

  roomToCreate = "Private_Room"; //name of the room to create
  numClientsToMatch = 5; //number of players on each match
  stats: ClientStat[] = [];
  reconnectTimeout: NodeJS.Timeout;

  onCreate(options: any) {
    if (options.numClientsToMatch) {
      this.numClientsToMatch = options.numClientsToMatch;
    }
    console.log("creation du lobby", this.roomId);

    // setInterval(() => {
    //     this.checkGroupsReady();
    //   }, 5000);
  }

  onJoin(client: Client, options: any) {
    const playerId = client.sessionId;
    const isClientConnected = this.stats.some(stat => stat.client.sessionId === playerId);
    if (isClientConnected) {
      // reconnexion
      console.log(`Le client ${playerId} est déjà connecté.`);
      client.send('reconnexion", "La reconnexion a reussi');
      clearTimeout(this.reconnectTimeout);
      // ...
      return;
    }
    this.stats.push({
      client: client
    });
    client.send("connect",
    {
      lobby_id : this.roomId,
      playerId : playerId
    });



    console.log("une personne a rejoins ", client.id);
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

  onLeave(client: Client, consented: boolean) {
    this.reconnectTimeout = setTimeout(() => {
      // Supprimer le joueur de la salle après le délai d'attente
      
      const index = this.stats.findIndex(stat => stat.client === client);
      this.stats.splice(index, 1);
      console.log("je retire les player de la room");
    }, 10000);
    console.log("un client est parti du lobby");
  }

  onDispose() {
    console.log("destruction du lobby");
  }

}