import React, { useEffect } from 'react';
import Cookies from 'js-cookie';

const HomePage = () => {
  useEffect(() => {
    const accessToken = Cookies.get('access_token');
  }, []);

  return (
    <div>
      <h1>Page d'accueil</h1>
    </div>
  );
};

export default HomePage;