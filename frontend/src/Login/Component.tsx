import React from 'react';
import backgroundImage from '../../public/bvb.jpg';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => {
  const headerStyle = {
    backgroundColor: 'transparent',
    padding: '1rem',
    margin: 0,
    fontFamily: 'Lobster',
    textAlign: 'center' as 'center',
    color: 'orange',
    textShadow: '2px 4px brown',
    fontSize: '50px',
  };

  return (
    <header style={headerStyle}>
      <h1>{title}</h1>
    </header>
  );
};

export default Header;