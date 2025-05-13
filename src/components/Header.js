import React from 'react';
import { Container } from 'react-bootstrap';
import { FaRegNewspaper } from 'react-icons/fa';

const Header = () => {
  return (    <header className="app-header py-3">
      <Container>        <div className="d-flex align-items-center">
          <FaRegNewspaper size={28} className="me-2" />
          <h1 className="h3 fw-bold mb-0 me-3">News Hub</h1>
          <p className="small text-light mb-0">Curated news from trusted sources</p>
        </div>
      </Container>
    </header>
  );
};

export default Header;
