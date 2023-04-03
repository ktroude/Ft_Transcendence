import React from "react";
import Login from "./Login";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Cookie from "./Cookie";
import HomePage from "./Homepage";

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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
