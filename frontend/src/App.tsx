import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Cookie from "./Cookie";
import HomePage from "./Homepage";
import Chat from "./Chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/Homepage",
    element: <HomePage />,
  },
  {
    path: "/cookie",
    element: <Cookie />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
