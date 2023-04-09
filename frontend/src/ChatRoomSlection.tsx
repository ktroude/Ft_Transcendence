import io from "socket.io-client"
import { useEffect, useState } from "react";
import axios from "axios";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  extraHeaders: { Authorization: `Bearer ${getAccessToken()}`},
});

function getAccessToken() {
    const name = "access_token";
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  
    return cookieValue || "";
  }

function ChatRoomList() {
    const [chatRoom, setChatRoom] = useState([]);

    useEffect(() => {
        const fetchChatRoom = async() => {
            try {
                const response = await axios.get("http://localhost:3000/chat/getAll");
                setChatRoom(response.data);
            }
            catch (error) {
                console.log(error);
            }
        };
        fetchChatRoom();
    }, [] );

    return (
        <div>
            <ul>
                {chatRoom.map((chatRoom) => (
                    <li key={chatRoom.id}>
                      <p> {chatRoom.name} - {chatRoom.owner.pseudo} </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const handleCreateRoom = (roomName) => {
    console.log("RoomName == ", roomName);
    
    socket.emit('createRoom', { name: roomName }, (response) => {
      console.log(response); // traiter la réponse du serveur si besoin
    });
  };


function ChatRoomSelection() {
    const [roomName, setRoomName] = useState("");
    return (
<div>
    <div className="ChatRoomSelection">
        <h3> Join a chatRoom </h3>
        {ChatRoomList()}
    </div>
    <div className = "CreateChatRoom">
        <h3> Create a ChatRoom </h3>
        <input type="text" placeholder="Room name" onChange={(event) => setRoomName(event.target.value)} />
        <button onClick={() => handleCreateRoom(roomName)}> Create </button>
    </div>
</div>
    )
}

export default ChatRoomSelection;