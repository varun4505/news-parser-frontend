import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import NewsCard from './components/NewsCard';
import Header from './components/Header';

const BACKEND_URL = 'http://localhost:5000/';

function App() {
  const [query, setQuery] = useState('latest news');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');  const [options, setOptions] = useState({
    languages: {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'ml': 'Malayalam',
      'bn': 'Bengali',
      'mr': 'Marathi'
    },
    countries: {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom'
    },
    periods: {
      '1d': 'Past day',
      '7d': 'Past week',
      '1m': 'Past month'
    }
  });
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  const categories = [
    'All', 
    'Politics', 
    'Business', 
    'Technology', 
    'Entertainment', 
    'Sports', 
    'Science', 
    'Health', 
    'Education',
    'World'
  ];const fetchNews = async (searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${BACKEND_URL}/news/${encodeURIComponent(searchQuery)}`, {
          params: {
            language: selectedLanguage,
            country: selectedCountry,
            period: selectedPeriod
          }
        }
      );
      
      // Check if response contains error or articles array
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Ensure we always set an array
      const articles = Array.isArray(response.data) ? response.data : [];
      setNews(articles);
      console.log(`Fetched ${articles.length} articles`);
    } catch (err) {
      console.error('Error fetching news:', err);
      
      // Get the error message from the backend if available
      const errorMessage = err.response?.data?.error || 'Failed to fetch news. Please try again.';
      const errorDetails = err.response?.data?.details;
      
      setError(errorMessage);
      if (errorDetails) {
        console.error('Error details:', errorDetails);
      }
      
      // Clear any previous results
      setNews([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchOptions = async () => {
    try {
      console.log('Fetching options from server...');
      const response = await axios.get(`${BACKEND_URL}/options`);
      
      if (response.data && 
          Object.keys(response.data.languages).length > 0 && 
          Object.keys(response.data.countries).length > 0 && 
          Object.keys(response.data.periods).length > 0) {
        console.log('Options loaded successfully:', response.data);
        setOptions(response.data);
      } else {
        console.error('Received empty options data:', response.data);
      }
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };
  // Fetch initial news
  useEffect(() => {
    fetchNews(query);
  }, []);
  
  // Refetch news when filters change
  useEffect(() => {
    if (news.length > 0) {
      fetchNews(query);
    }
  }, [selectedLanguage, selectedCountry, selectedPeriod]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchNews(query);
    }
  };

  const handleCategoryClick = (category) => {
    if (category !== 'All') {
      setQuery(category);
      fetchNews(category);
    }
  };

  return (
    <div className="App">
      <Header />      <Container className="mt-4">
        <Form onSubmit={handleSubmit} className="mb-4">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Search for news..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button variant="primary" type="submit" className="w-100">
                Search
              </Button>
            </Col>
          </Row>
            {/* Filter options */}
          <Row className="mt-3">            <Col md={4} className="mb-2">
              <Form.Group>                <Form.Label className="small text-muted">Language</Form.Label>
                <Form.Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                  <option value="ta">Tamil</option>
                  <option value="ml">Malayalam</option>
                  <option value="bn">Bengali</option>
                  <option value="mr">Marathi</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-2">
              <Form.Group>
                <Form.Label className="small text-muted">Country</Form.Label>
                <Form.Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="CN">China</option>
                  <option value="BR">Brazil</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-2">
              <Form.Group>
                <Form.Label className="small text-muted">Time Period</Form.Label>
                <Form.Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="1h">Past hour</option>
                  <option value="12h">Past 12 hours</option>
                  <option value="1d">Past day</option>
                  <option value="3d">Past 3 days</option>
                  <option value="7d">Past week</option>
                  <option value="1m">Past month</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>        {/* Active Filters Display */}        <div className="d-flex flex-wrap align-items-center mb-3">
          <span className="me-2 small text-muted">Active filters:</span>          <div className="filter-badge">
            <span className="badge-label">Language:</span>
            {selectedLanguage === 'en' ? 'English' : 
             selectedLanguage === 'hi' ? 'Hindi' :
             selectedLanguage === 'te' ? 'Telugu' :
             selectedLanguage === 'ta' ? 'Tamil' :
             selectedLanguage === 'ml' ? 'Malayalam' :
             selectedLanguage === 'bn' ? 'Bengali' :
             selectedLanguage === 'mr' ? 'Marathi' :
             selectedLanguage}
          </div>
          <div className="filter-badge">
            <span className="badge-label">Country:</span>
            {selectedCountry === 'IN' ? 'India' :
             selectedCountry === 'US' ? 'United States' :
             selectedCountry === 'GB' ? 'United Kingdom' :
             selectedCountry === 'CA' ? 'Canada' :
             selectedCountry === 'AU' ? 'Australia' :
             selectedCountry === 'DE' ? 'Germany' :
             selectedCountry === 'FR' ? 'France' :
             selectedCountry === 'JP' ? 'Japan' :
             selectedCountry === 'CN' ? 'China' :
             selectedCountry === 'BR' ? 'Brazil' :
             selectedCountry === 'brazil' ? 'Brazil' :
             selectedCountry}
          </div>
          <div className="filter-badge">
            <span className="badge-label">Period:</span>
            {selectedPeriod === '1h' ? 'Past hour' :
             selectedPeriod === '12h' ? 'Past 12 hours' :
             selectedPeriod === '1d' ? 'Past day' :
             selectedPeriod === '3d' ? 'Past 3 days' :
             selectedPeriod === '7d' ? 'Past week' :
             selectedPeriod === '1m' ? 'Past month' :
             selectedPeriod}
          </div>
        </div>

        {/* Categories */}
        <div className="category-filters mb-4">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button 
                key={category} 
                variant={category === 'All' ? 'primary' : 'outline-primary'}
                onClick={() => handleCategoryClick(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}          </div>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            {news.length > 0 ? (
              news.map((article, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <NewsCard article={article} />
                </Col>
              ))
            ) : (
              <Col className="text-center my-5">
                <p>No news articles found. Try a different search term.</p>
              </Col>
            )}
          </Row>
        )}        {/* Display server connection error separately */}
        {!loading && news.length === 0 && !error && (
          <div className="alert alert-info">
            <h5>Connection to Server</h5>
            <p>
              If you're not seeing any articles, please make sure the backend server is running at {BACKEND_URL}.
            </p>
            <p>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  fetchOptions();
                  fetchNews(query);
                }}
              >
                Retry Connection
              </Button>
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;
