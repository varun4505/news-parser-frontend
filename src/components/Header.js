import React, { useState, useEffect } from 'react';
import { Container, Button, Form, InputGroup } from 'react-bootstrap';
import { FaQuestionCircle, FaSearch } from 'react-icons/fa';
import { BsGear } from 'react-icons/bs';

const Header = ({ onSearch, searchQuery, setSearchQuery, isSearching }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSearchChange = (e) => {
    if (setSearchQuery) {
      setSearchQuery(e.target.value);
    }
  };
  return (    <header className={`app-header py-2 ${scrolled ? 'header-scrolled' : ''}`} style={{ borderBottom: '1px solid #e5e5e5' }}>
      <Container>        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="me-3">
              {/* Full logo with tagline for medium and larger screens */}
              <div className="d-none d-md-block">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/logo-big.png`} 
                  alt="Konnections IMAG" 
                  height="50"
                />
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

          {/* Search Bar - centered */}
          <div className="flex-grow-1 mx-3 mx-md-4" style={{ maxWidth: '500px' }}>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery || ''}
                  onChange={handleSearchChange}
                  disabled={isSearching}
                  className="search-input"
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSearching || !searchQuery?.trim()}
                  className="search-btn"
                >
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>
          </div>
          
          <div className="d-flex align-items-center">
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
