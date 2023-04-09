import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  extraHeaders: { Authorization: `Bearer ${getAccessToken()}`},
});

function Chat() {
  useEffect(() => {
    // Écouter l'événement "connect" lorsque la connexion est établie avec succès
    socket.on("connect", () => {
      console.log("Connected to socket.io server");
    });

    // Écouter l'événement "disconnect" lorsque la connexion est perdue
    socket.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
    });

    });

  return <div>App Component</div>;
}

export default Chat;


function getAccessToken() {
  const name = "access_token";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookieValue || "";
}


