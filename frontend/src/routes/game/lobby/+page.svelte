<script>
// @ts-nocheck
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { navigate } from 'svelte-routing';

  let Colyseus;
  let client;
  let room;
  let clientsCount = 0;
  let seatData = null;
  let room_id = null;
  let room_pong;
  let first_connection = true;
  let waiting = false;

  // debug
  let mess = null;

  // const ws = new WebSocket("ws://localhost:3001"); // Remplacez l'URL par l'URL de votre serveur WebSocket

  // const client = new Colyseus.Client(ws);

async function test()
{
  console.log("mess", mess, ".seatData", seatData, ".room_id", room_id);
}

function redirectToGame() {
  return new Promise((resolve) => {
    if (room_id) {
      const url = `http://localhost:5173/game/pong_game?room_id=${room_id}`;
      window.open(url, '_blank');
      resolve();
    } else {
      // Si room_id n'est pas encore rempli, attendez 1 seconde et réessayez
      setTimeout(() => redirectToGame().then(resolve), 1000);
    }
  });
}

function redirectToOtherURL()
{
  navigate('http://localhost:5173/testserver');
}

function openNewTab() {
    const url = 'http://localhost:5173/testserver'; // Remplacez par l'URL souhaitée
    const newTab = window.open(url, '_blank');
    newTab.focus();
    console.log("dans open new newTab");
  }

async function joinRoomById(roomId) {
  try {
    const room_pong = await client.joinById(roomId);
    console.log('Rejoindre la salle réussie:', room_pong);
    // Faites quelque chose avec la salle rejoindre avec succès
  } catch (error) {
    console.error('Erreur lors de la tentative de rejoindre la salle:', error);
    // Gérez l'erreur de rejoindre la salle
  }
}

async function connect()
{
  if (first_connection == true)
  {
    first_connection = false;
    Colyseus = await import("colyseus.js");
  
    client = new Colyseus.Client('ws://localhost:3001');
    console.log("client created");
    room = await client.joinOrCreate("ranked");
    console.log("created room lobby");

    // client.onOpen(() => {
    //   console.log("Connected to Colyseus server");
    // });

    // client.onError((error) => {
    //   console.error("Colyseus error:", error);
    // });

    // client.onClose((event) => {
    //   console.log("Disconnected from Colyseus server");
    // });
    room.onMessage('test', (message) => {
      mess = message.test_i;
      console.log("dans room Onmessage");
    });
    room.onMessage('waiting', (message) => { waiting = true; });
    room.onMessage('seat', (message) => {
      room_id = message;
      console.log("dans seatttt");
      // joinRoomById(room_id);
      redirectToGame();
    });
    // onMessage('test', (message) => {
    // mess = message.test_i;
    // });
    // console.log("here");
    // client.onMessage('test', (message) => {
    // mess = message.test_i;
    // });
    // console.log(mess);
    // client.onMessage((message) => {
    //   const { type, payload } = message;

    //   if (type === "nbr_client") {
    //     clientsCount = payload;
    //   } else if (type === "seat") {
    //     seatData = payload;
    //   } else if (type === "clients") {
    //     console.log("Connected to Colyseus server by On_message clients");
    //   }
    // });
    // Actualiser le rendu
  }
}

  // ...

</script>

<main>
  <h1>Lobby</h1>
  <p>Nombre de clients en attente : {clientsCount}</p>
  <button on:click={connect}>connect</button>
  <button on:click={test}>test</button>
  <button on:click={redirectToOtherURL}>changURL</button>

  {#if waiting}
  <h2>Vous êtes en attente</h2>
  {/if}

  {#if seatData}
    <h2>Vous avez obtenu une place dans une salle</h2>
    <p>Informations sur la place : {JSON.stringify(seatData)}</p>
  {/if}

  {#if room_id}
    <h2>Vous avez rejoint une salle</h2>
    <p>Informations sur la salle : {JSON.stringify(room_id)}</p>
  {/if}
</main>
