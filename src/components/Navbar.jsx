// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const navbarStyle = {
    backgroundColor: '#ffffff',
    padding: '15px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const logoStyle = {
    margin: 0,
    color: '#08bd80',
    fontWeight: '800',
    fontSize: '24px',
    textDecoration: 'none'
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>Unacademy</Link>
        <div>
          <Link to="/" style={{
            color: '#555',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'color 0.2s'
          }}>Book Slot</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;