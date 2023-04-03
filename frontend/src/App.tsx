import React from 'react';
import Login from './Login';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  const HomePage: React.FC = () => {
    return (
      <div>
        <h1>Page d'accueil</h1>
        <Login />
      </div>
    );
  };
  return (
    <Router>
      <HomePage />
    </Router>
  );
}

export default App;