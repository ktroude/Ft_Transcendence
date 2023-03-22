import React from 'react';
import Header from '../components/Header/Header';
import Info from '../components/Info/Info';
import Logo from '../components/Logo/Logo';
import '../styles/Homepage.css'

const Homepage = () => {
    const Log = true;
    if (!Log)
    {
        return (
            <div>
                <Header />
                <Logo />
                <div className="LogFalse">
                    <h1>Vous devez être connecté pour avoir accès au site</h1>
                </div>
            </div>
        );
    } 
    else
    {
        return (
            <div>
                <nav>
                    <link rel="stylesheet" href="/fonts.css" />
                    <h1 className='Welcome'>
                        Welcome to Ft_Transcendence
                    </h1>
                </nav>
            </div>
        );
    } 
};

export default Homepage;