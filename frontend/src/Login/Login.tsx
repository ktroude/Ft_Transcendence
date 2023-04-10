import React from 'react';
import { Button } from '@mui/material';
import Header from './Component';
import backgroundImage from '../../public/bvb.jpg';

const Login: React.FC = () => {
  const handleLoginButtonClick = () => {
    window.location.href =
      'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ad63634a67eaff34218824a7796fa6e5c5337b11f88c026df3956ba7a8f38dc6&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ftoken&response_type=code';
  };
  const background ={
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
  }
  const buttonStyle={
    display: 'block',
    margin: 'auto',
  }

  return (
    <div style={background}>
      <Header title="Ft_transcendence" />
        <Button
          variant="contained"
          color="success"
          onClick={handleLoginButtonClick}
          style={buttonStyle}
        >
          Se connecter
        </Button>
    </div>
  );
};

export default Login;