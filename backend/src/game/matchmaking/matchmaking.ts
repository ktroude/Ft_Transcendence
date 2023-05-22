import { Room, Client, Delayed, matchMaker } from "colyseus";
import { Any } from "typeorm";

interface ClientStat {
  client: Client;
}

export class RankedLobbyRoom extends Room {

  roomToCreate = "Private_Room"; //name of the room to create
  numClientsToMatch = 2; //number of players on each match
  stats: ClientStat[] = [];

  onCreate(options: any) {
    if (options.numClientsToMatch) {
      this.numClientsToMatch = options.numClientsToMatch;
    }
    console.log("creation du lobby");

    // setInterval(() => {
    //     this.checkGroupsReady();
    //   }, 5000);
  }

  onJoin(client: Client, options: any) {
    this.stats.push({
      client: client
    });

    console.log("une personne a rejoins ", client.id);
    // this.broadcast('test', { test_i: "message de test" });
    client.send('test', { test_i: "message test client" });
    client.send("waiting", 1);
    this.checkGroupsReady();
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
  
      // Reserve seats for the clients in the room
      // console.log("Reservation des sieges...");
      // const matchDataPromises = this.stats.slice(0, this.numClientsToMatch).map(async (clientStat) => {
      //   console.log("+1 reservations de siege");
      //   const matchData = await matchMaker.reserveSeatFor(room, Any);
      //   return { clientStat, matchData };
      // });

      // const matchDataResults = [];
      // for (let i = 0; i < this.numClientsToMatch; i++) {
      //   console.log("+1 réservation de place");
      //   const clientStat = this.stats[i];
      //   const matchData = await matchMaker.reserveSeatFor(room, Any);
      //   matchDataResults.push({ clientStat, matchData });
      // }

      // console.log("Sieges reservés");
      // // const matchDataResults = await Promise.all(matchDataPromises);
      // console.log("Fin des promesses");
  
      // // Send room data to the clients
      // console.log("Envoie des data rooms...");
      // matchDataResults.forEach(({ clientStat, matchData }) => {
      //   clientStat.client.send("seat", matchData);
      //   console.log("send seat");
      // });
  
      // Remove the matched clients from the lobbyroom
      // console.log("Enlevement des clients du lobby...");
      // matchDataResults.forEach(({ clientStat }) => {
      //   const index = this.stats.indexOf(clientStat);
      //   if (index !== -1) {
      //     this.stats.splice(index, 1);
      //   }
      // });
    } else {
      // Notify all clients in the lobbyroom about the number of players in the queue
      this.stats.forEach((clientStat) => {
        clientStat.client.send("nbr_client", this.stats.length);
      });
    }
  }

  onLeave(client: Client, consented: boolean) {
    const index = this.stats.findIndex(stat => stat.client === client);
    this.stats.splice(index, 1);
    console.log("un client est parti du lobby");
  }

  onDispose() {
  }

}