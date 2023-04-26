<script>
    import { Client } from 'colyseus.js'

const client = new Client("ws://localhost:3001");
client.joinOrCreate("my_room", {maxClients: 2}).then(room => {
  console.log("joined successfully", room);
}).catch(e => {
  console.log("join error", e);
});
</script>

<h1>
    test
</h1>