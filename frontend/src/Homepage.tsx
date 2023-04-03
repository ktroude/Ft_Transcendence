import React, { useEffect, useState } from "react";
import Login from "./Login";
import { unstable_createChainedFunction } from "@mui/utils";

const HomePage = () => {
    const [userInfo] = useState(null);
    return (
        <div>
          <h1>Page d'accueil</h1>
          <Login />
        </div>
      );
};

export default HomePage;
