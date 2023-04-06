import React, { useEffect, useState } from 'react';

const MyCookie = () => {
  const [cookieValue, setCookieValue] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1] ?? '';

    setCookieValue(value);
  }, []);

    console.log(`http://localhost:3000/users/userInfo?code=${code}`);
    
  useEffect(() => {
    fetch(`http://localhost:3000/users/userInfo?code=${code}`,{
        method: 'POST',
        body: JSON.stringify(code),
    })
    .then((response) => {
        response.json();
    })
    .then((data) => console.log(data))
  }, [code]);

  useEffect(() => {
    setCode(cookieValue);
  }, [cookieValue]);

  return (
    <div>
      La valeur du cookie "access_token" est : {cookieValue}
    </div>
  );
};

export default MyCookie;