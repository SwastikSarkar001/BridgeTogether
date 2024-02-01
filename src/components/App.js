import React, { useState } from 'react';
import { BrowserRouter as Router, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import '../styles/App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from './Navbar';
import Home from './Home';
import About from './About';
import ContactUs from './ContactUs';
import { auth } from '../firebase';
import ChatRoom from './ChatRoom';

function App() {
  const [user] = useAuthState(auth);
  const [selectedPreference, setSelectedPreference] = useState('');

  return (
    <div className="App bg-gray-900 relative">
      <Router>
        <Navbar selectedPreference = {selectedPreference} setSelectedPreference={setSelectedPreference} useLocation={useLocation} />
        <main className="main-content relative text-slate-50 text-lg">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about" element={<About />} />
            {user && <Route exact path="/chat" element={<ChatRoom selectedPreference={selectedPreference} />} />}
            <Route exact path="/contact-us" element={<ContactUs />} />
            <Route path="*" element={<Navigate to='/' />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;