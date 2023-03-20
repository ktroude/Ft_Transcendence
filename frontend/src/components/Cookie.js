import React from "react";

function MonComposant() {
    // Récupérer le cookie "monCookie"
    const cookie = document.cookie
      .split(";")
      .find((cookie) => cookie.startsWith("monCookie="));
  
    // Extraire les données du cookie
    const monCookieData = cookie ? cookie.split("=")[1] : null;
  
    return <div>Les données du cookie "monCookie" sont : {monCookieData}</div>;
  }
  
  export default MonComposant;