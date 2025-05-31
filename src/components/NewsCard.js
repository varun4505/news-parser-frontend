import React from 'react';
import { Card, Badge, Form } from 'react-bootstrap';

const NewsCard = ({ article, isSelected, onArticleSelect }) => {
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
      <div className="mt-2">
        {filteredKeywords.slice(0, 5).map((keyword, index) => (
          <Badge 
            key={index} 
            bg="secondary" 
            className="me-1 mb-1 keyword-badge"
            style={{ fontSize: '0.7rem' }}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    );
  };
  return (
    <Card className="news-card h-100" style={isSelected ? { borderColor: '#0d6efd', boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)' } : {}}>
      <Card.Body>        <div className="d-flex justify-content-between align-items-start mb-2">
          <Form.Check 
            type="checkbox"
            id={`select-article-${article.title?.substring(0, 10)}`}
            checked={isSelected}
            onChange={() => onArticleSelect(article)}
            label="Select for email"
          />
        </div>
        <Card.Title>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
            {article.title}
          </a>
        </Card.Title><Card.Text>
          {article.description?.length > 250 
            ? `${article.description.substring(0, 250)}...` 
            : article.description || "No description available"}
        </Card.Text>
        {article.keywords && renderKeywords(article.keywords)}
      </Card.Body>      <Card.Footer className="news-meta bg-white">
        <small>
          <div><strong>Publication:</strong> {article.publication}</div>
          <div>
            <strong>By:</strong> {
              article.journalist && article.journalist !== "Not specified" 
                ? article.journalist 
                : "Online"
            }
          </div>
          <div><strong>Date:</strong> {formatDate(article.date)}</div>
        </small>
      </Card.Footer>
    </Card>
  );
};

export default NewsCard;
