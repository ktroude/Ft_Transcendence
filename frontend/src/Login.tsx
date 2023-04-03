import React from 'react';

const Login: React.FC = () => {

  const handleLoginButtonClick = () => {
    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ad63634a67eaff34218824a7796fa6e5c5337b11f88c026df3956ba7a8f38dc6&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ftoken&response_type=code';
  };

  return (
    <button onClick={handleLoginButtonClick}>
      Se connecter
    </button>
  );
};

export default Login;