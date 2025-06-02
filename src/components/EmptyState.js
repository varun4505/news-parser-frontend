import React from 'react';
import { Col, Button } from 'react-bootstrap';
import { FaSearch, FaRedoAlt } from 'react-icons/fa';

const EmptyState = ({ keyword, message, onReset }) => {
  return (
    <Col className="text-center my-5">
      <div className="empty-state">
        <div className="empty-state-icon">
          <div className="empty-icon-wrapper">
            <FaSearch size={32} className="text-secondary" />
          </div>
        </div>
        <h4 className="mb-3 text-primary fw-bold">No Results Found</h4>
        {keyword ? (
          <p className="mb-4 lead">We couldn't find any news articles for "<span className="fw-bold">{keyword}</span>"</p>
        ) : (
          <p className="mb-4 lead">{message || "Try changing your search criteria or selecting different filters"}</p>
        )}
        
        <div className="suggestions text-start bg-light p-4 rounded-lg mt-3 mx-auto shadow-sm" style={{ maxWidth: '500px', animation: 'fadeIn 0.6s ease-in-out 0.2s both' }}>
          <h5 className="mb-3 text-primary d-flex align-items-center">
            <span className="me-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lightbulb-fill" viewBox="0 0 16 16">
                <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </span>
            Suggestions:
          </h5>
          <ul className="mb-3 ps-3 suggestion-list">
            <li className="mb-2">Check your spelling</li>
            <li className="mb-2">Try more general keywords</li>
            <li className="mb-2">Try different filters (language, country, time period)</li>
            <li className="mb-2">Reduce the number of search terms</li>
          </ul>
          
          {onReset && (
            <div className="mt-4 text-center">
              <Button variant="outline-primary" onClick={onReset} className="d-inline-flex align-items-center">
                <FaRedoAlt className="me-2" size={14} />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Col>
  );
};

export default EmptyState;
