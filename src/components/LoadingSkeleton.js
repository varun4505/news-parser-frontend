import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const LoadingSkeleton = ({ count = 6 }) => {
  const skeletonItems = Array(count).fill(null);
  
  // Generate random widths for skeleton elements to create more natural appearance
  const getRandomWidth = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min) + '%';
  };
  
  return (
    <Row className="skeleton-container">
      {skeletonItems.map((_, index) => (
        <Col lg={4} md={6} className="mb-4" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
          <Card className="news-card h-100 skeleton-card">
            <div className="source-tag-skeleton px-3 py-1 skeleton" />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-title mb-2">
                <div className="skeleton" style={{ width: getRandomWidth(80, 100), height: '28px' }} />
                <div className="skeleton mt-2" style={{ width: getRandomWidth(60, 90), height: '28px' }} />
              </div>
              <div className="skeleton-text">
                <div className="skeleton mb-2" style={{ width: getRandomWidth(90, 100), height: '16px' }} />
                <div className="skeleton mb-2" style={{ width: getRandomWidth(85, 95), height: '16px' }} />
                <div className="skeleton mb-2" style={{ width: getRandomWidth(90, 100), height: '16px' }} />
                <div className="skeleton mb-2" style={{ width: getRandomWidth(75, 85), height: '16px' }} />
              </div>
              <div className="d-flex flex-wrap mt-4">
                <div className="skeleton me-2 mb-2 skeleton-badge" />
                <div className="skeleton me-2 mb-2 skeleton-badge" />
                <div className="skeleton me-2 mb-2 skeleton-badge" />
              </div>
            </Card.Body>
            <Card.Footer className="news-meta">
              <div className="d-flex justify-content-between">
                <div className="skeleton" style={{ width: '120px', height: '16px' }} />
                <div className="d-flex">
                  <div className="skeleton me-2" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default LoadingSkeleton;
