import React, { useRef, useState } from 'react';
import '../styles/App.css';
import Login from './Login';


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Login />
    </div>
  );
}

export default App;

