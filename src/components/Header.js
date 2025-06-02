import React, { useState, useEffect } from 'react';
import { Container, Button, Nav } from 'react-bootstrap';
import { FaRegNewspaper, FaQuestionCircle } from 'react-icons/fa';
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
    <header className={`app-header py-3 ${scrolled ? 'header-scrolled' : ''}`}>
      <Container>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="logo-wrapper me-3">
              <FaRegNewspaper size={28} className="text-white" />
            </div>
            <div>
              <h1 className="h3 fw-bold mb-0 header-title">News Hub</h1>
              <p className="small text-white opacity-75 mb-0 d-none d-sm-block">Curated news from trusted sources</p>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <Nav className="me-auto d-none d-md-flex">
              <Nav.Link href="#dashboard" className="text-white me-3">Dashboard</Nav.Link>
              <Nav.Link href="#analytics" className="text-white me-3">Analytics</Nav.Link>
              <Nav.Link href="#about" className="text-white">About</Nav.Link>
            </Nav>
            
            <div className="d-flex align-items-center ms-md-4">
              <Button variant="outline-light" size="sm" className="rounded-circle header-icon-btn d-none d-sm-flex me-2">
                <FaQuestionCircle />
              </Button>
              <Button variant="outline-light" size="sm" className="rounded-circle header-icon-btn d-none d-sm-flex me-2">
                <BsGear />
              </Button>
              <div className="d-none d-sm-block">
                <div className="version-badge">
                  <div className="badge-glow"></div>
                  <span>Professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
