import { onMount, onDestroy } from 'svelte';
import { io, Socket } from 'socket.io-client';
import { LOCALHOST } from "../API/env";

const SOCKET_URL = `http://${LOCALHOST}:3000`;

function useSocket(): Socket {
  let socket: Socket;

  onMount(() => {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    const access_token = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
    socket = io(SOCKET_URL, {
      extraHeaders: {
        Authorization: 'Bearer ' + access_token,
      }
    });
    socket.on("connect", () => {
    });
  });

  return socket;
}

export default useSocket;