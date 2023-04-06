import React, { useEffect, useState } from 'react';

const MyCookie = () => {
  const [cookieValue, setCookieValue] = useState('');
  const [code, setCode] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1] ?? '';

    setCookieValue(value);
  }, []);

  console.log('http://localhost:3000/users/userInfo?code=${code}', "\n\ncode ===", cookieValue);
  

  useEffect(() => {
    fetch(`http://localhost:3000/users/userInfo?code=${cookieValue}`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        setUser(data);
    })
    .catch((error) => console.log(error));
  }, [cookieValue]);

  useEffect(() => {
    setCode(cookieValue);
  }, [cookieValue]);

  return (
    <div>
      La valeur du cookie "access_token" est : {cookieValue}
      <p> </p>
      Les informations de l'utilisateur sont : {JSON.stringify(user.pseudo)}
    </div>
  );
};

export default MyCookie;