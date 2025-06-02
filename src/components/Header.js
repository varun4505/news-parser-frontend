import React, { useState, useEffect } from 'react';
import { Container, Button, Nav } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsGear } from 'react-icons/bs';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header className={`app-header py-2 ${scrolled ? 'header-scrolled' : ''}`} style={{ borderBottom: '1px solid #e5e5e5' }}>
      <Container>
        <div className="d-flex align-items-center justify-content-between"><div className="d-flex align-items-center">
            <div className="logo-wrapper me-3">              {/* Full logo with tagline for medium and larger screens */}
              <div className="d-none d-md-block">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/logo-big.png`} 
                  alt="Konnections IMAG" 
                  height="50"
                />
                <p className="small text-dark opacity-75 mb-0" style={{ fontSize: '0.7rem', color: '#019baf', fontStyle: 'italic' }}>we make the right impact</p>
              </div>
              
              {/* Small logo without tagline for mobile */}
              <div className="d-block d-md-none">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/logo-small.png`} 
                  alt="Konnections IMAG" 
                  height="40"
                />
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center">            <Nav className="me-auto d-none d-md-flex">
              <Nav.Link href="#dashboard" className="text-dark me-3">Dashboard</Nav.Link>
              <Nav.Link href="#analytics" className="text-dark me-3">Analytics</Nav.Link>
              <Nav.Link href="#about" className="text-dark">About</Nav.Link>
            </Nav>
            
            <div className="d-flex align-items-center ms-md-4">
              <Button variant="outline-secondary" size="sm" className="rounded-circle header-icon-btn d-none d-sm-flex me-2">
                <FaQuestionCircle />
              </Button>
              <Button variant="outline-secondary" size="sm" className="rounded-circle header-icon-btn d-none d-sm-flex me-2">
                <BsGear />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
