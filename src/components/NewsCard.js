import React, { useState } from 'react';
import { Card, Badge, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsCalendar4, BsBookmark, BsGlobe, BsShareFill, BsLink45Deg } from 'react-icons/bs';

const NewsCard = ({ article, isSelected, onArticleSelect }) => {
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  
  // Function to copy article URL to clipboard
  const copyToClipboard = () => {
    if (navigator.clipboard && (article.url || article.link)) {
      navigator.clipboard.writeText(article.url || article.link);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };
  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Unknown") return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Render keywords as badges if available
  const renderKeywords = (keywords) => {
    if (!keywords || keywords.length === 0) return null;
    
    // Filter out the 'google' keyword
    const filteredKeywords = keywords.filter(keyword => 
      keyword.toLowerCase() !== 'google'
    );
    
    if (filteredKeywords.length === 0) return null;
    
    return (
      <div className="mt-3">
        {filteredKeywords.slice(0, 5).map((keyword, index) => (
          <Badge 
            key={index} 
            bg="light" 
            className="me-2 mb-2 keyword-badge"
          >
            {keyword}
          </Badge>
        ))}
      </div>
    );
  };  return (
    <Card className="news-card h-100" style={isSelected ? { borderColor: 'var(--primary-color)', boxShadow: '0 0 0 0.2rem rgba(30, 95, 116, 0.25)' } : {}}>
      {article.publication && (
        <div className="source-tag px-3 py-1">
          <BsGlobe className="me-1" />
          <small>{article.publication}</small>
        </div>
      )}
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Form.Check 
            type="checkbox"
            id={`select-article-${article.title?.substring(0, 10)}`}
            checked={isSelected}
            onChange={() => onArticleSelect(article)}
            label={<span className="select-label">Add to digest</span>}
            className="custom-checkbox"
          />
        </div>
        <Card.Title>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none article-link">
            {article.title}
          </a>
        </Card.Title>
        <Card.Text>
          {article.description?.length > 250 
            ? `${article.description.substring(0, 250)}...` 
            : article.description || "No description available"}
        </Card.Text>
        {article.keywords && renderKeywords(article.keywords)}      </Card.Body>
      <Card.Footer className="news-meta">
        <div className="d-flex justify-content-between align-items-center">
          <div className="article-meta">
            <div className="d-flex align-items-center mb-1">
              <BsCalendar4 className="me-2 text-secondary" />
              <small className="text-secondary">{formatDate(article.date)}</small>
            </div>
            {article.journalist && article.journalist !== "Not specified" && (
              <div className="journalist-info">
                <small className="text-secondary">By {article.journalist}</small>
              </div>
            )}
          </div>
          <div className="article-actions">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{showShareTooltip ? "Copied!" : "Copy link"}</Tooltip>}
            >
              <button 
                onClick={copyToClipboard}
                className={`action-btn ${showShareTooltip ? 'action-success' : ''}`}
                aria-label="Share article"
              >
                <BsLink45Deg />
              </button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Visit original article</Tooltip>}
            >
              <a 
                href={article.url || article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn ms-2"
                aria-label="Open original article"
              >
                <BsShareFill />
              </a>
            </OverlayTrigger>
          </div>
          <BsBookmark className="text-secondary bookmark-icon" />
        </div>
      </Card.Footer>
    </Card>
  );
};

export default NewsCard;
