import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./Homepage/Homepage";
import Chat from "./Chat";
import ChatRoomSelection from "./ChatRoomSlection";
import Login from "./Login/Login";
import "./Global.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/Homepage",
    element: <HomePage />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path:"/chatRoomSelection",
    element: <ChatRoomSelection/>,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
