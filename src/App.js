import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Tabs, Tab, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './config/email';
import './App.css';
import NewsCard from './components/NewsCard';
import Header from './components/Header';
import ClientDropdown from './components/ClientDropdown';
import clients from './data/clients';

// Use the deployed backend URL when available, fallback to localhost for development
const BACKEND_URL = 'https://news-parser-ai.vercel.app';

function App() {
  const [query, setQuery] = useState('latest news');
  const [news, setNews] = useState([]);
  const [keywordResults, setKeywordResults] = useState({}); // Store results for each keyword
  const [loading, setLoading] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState({}); // Track loading state for each keyword
  const [error, setError] = useState('');  const [selectedClient, setSelectedClient] = useState(null);  const [activeKeyword, setActiveKeyword] = useState(null); // Currently active keyword tab
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 15; // Increased number of results to show per page  // State for mail composition
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showMailModal, setShowMailModal] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState({});
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [options, setOptions] = useState({
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
  ];// Fetch news for a specific search query
const fetchNews = async (searchQuery, isKeywordQuery = false, keyword = null) => {
  try {
    // Set loading state based on whether this is a keyword query or regular search
    if (isKeywordQuery) {
      setLoadingKeywords(prev => ({ ...prev, [keyword]: true }));
    } else {
      setLoading(true);
    }
      setError('');    console.log(`Fetching news for "${searchQuery}"`);    
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Try different parameter names that the backend might be using
    const response = await axios.get(
      `${BACKEND_URL.replace(/\/+$/, '')}/news/${encodeURIComponent(searchQuery)}`, {
        params: {
          language: selectedLanguage,
          country: selectedCountry,
          period: selectedPeriod,
          maxResults: 100,
          max_results: 100,  // Try snake_case version 
          count: 100,        // Another common parameter name
          limit: 100,        // Another possible parameter name
          num: 100           // Yet another possibility
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId); // Clear timeout on success
    
    // Log the actual results count to see if the backend is respecting our maxResults parameter
    console.log(`Received ${response.data.length} results from backend for query "${searchQuery}"`);
    
    // Check if response headers contain any information about result limits
    console.log('Response headers:', response.headers);
    
    // Check if response contains error or articles array
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Ensure we always set an array
    const articles = Array.isArray(response.data) ? response.data : [];
    
    if (isKeywordQuery) {
      // For keyword queries, store results in the keywordResults object
      setKeywordResults(prev => ({
        ...prev,
        [keyword]: articles
      }));
      
      // If this is the first keyword or the active keyword, also update the main news display
      if (activeKeyword === keyword || !activeKeyword) {
        setNews(articles);
        setActiveKeyword(keyword);
      }
      
      console.log(`Fetched ${articles.length} articles for keyword: "${keyword}"`);
    } else {
      // For regular searches, just update the news state
      setNews(articles);
      console.log(`Fetched ${articles.length} articles`);
    }  } catch (err) {
    console.error('Error fetching news:', err);
    
    let errorMessage;
    if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The server might be unavailable or overloaded.';
    } else if (err.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check your connection to the internet.';
    } else {
      // Get the error message from the backend if available
      errorMessage = err.response?.data?.error || 'Failed to fetch news. Please try again.';
    }
    
    const errorDetails = err.response?.data?.details;    
    setError(errorMessage);
    
    if (errorDetails) {
      console.error('Error details:', errorDetails);
    }
    
    // Clear results appropriately
    if (isKeywordQuery) {
      setKeywordResults(prev => ({
        ...prev,
        [keyword]: []
      }));
    } else {
      setNews([]);
    }
  } finally {
    if (isKeywordQuery) {
      setLoadingKeywords(prev => ({ ...prev, [keyword]: false }));
    } else {
      setLoading(false);
    }
  }
};  // Fetch available options from the backend
  const fetchOptions = async () => {
    try {
      console.log('Fetching options from server...');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(
        `${BACKEND_URL.replace(/\/+$/, '')}/options`, 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (response.data && 
          Object.keys(response.data.languages || {}).length > 0 && 
          Object.keys(response.data.countries || {}).length > 0 && 
          Object.keys(response.data.periods || {}).length > 0) {
        console.log('Options loaded successfully:', response.data);
        // Update options state with the fetched values
        setOptions(response.data);
        
        // Update the language, country, and period if necessary
        if (!Object.keys(response.data.languages).includes(selectedLanguage)) {
          setSelectedLanguage(Object.keys(response.data.languages)[0]);
        }
        if (!Object.keys(response.data.countries).includes(selectedCountry)) {
          setSelectedCountry(Object.keys(response.data.countries)[0]);
        }
        if (!Object.keys(response.data.periods).includes(selectedPeriod)) {
          setSelectedPeriod(Object.keys(response.data.periods)[0]);
        }
      } else {
        console.error('Received empty options data:', response.data);
        // Continue with default options
      }
    } catch (err) {
      console.error('Error fetching options:', err);
      // Continue with default options, no need to display an error to the user
    }
  };// Fetch initial news
  useEffect(() => {
    fetchNews(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Refetch news when filters change
  useEffect(() => {
    if (news.length > 0 && !loading) {
      fetchNews(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // Fetch news for all keywords of a client
  const fetchAllClientKeywords = async (client) => {
    if (!client || !client.keywords || client.keywords.length === 0) return;
    
    // Reset keyword results when changing clients
    setKeywordResults({});
    setActiveKeyword(null);
    
    // Initialize loading state for all keywords
    const initialLoadingState = client.keywords.reduce((acc, keyword) => {
      acc[keyword] = true;
      return acc;
    }, {});
    setLoadingKeywords(initialLoadingState);
    
    // Fetch news for each keyword in parallel
    const promises = client.keywords.map(keyword => 
      fetchNews(keyword, true, keyword)
    );
    
    // Wait for all requests to complete
    await Promise.allSettled(promises);
  };

  // Handle client selection from dropdown
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // Clear existing news when changing clients
    setNews([]);
    
    if (client) {
      // Fetch news for all keywords of this client
      fetchAllClientKeywords(client);
    }
  };

  // Handle keyword selection for a client (switching between tabs)
  const handleClientKeywordSelect = (keyword) => {
    setActiveKeyword(keyword);
    setCurrentPage(1); // Reset to first page when switching keywords
    
    // If we already have results for this keyword, display them
    if (keywordResults[keyword]) {
      setNews(keywordResults[keyword]);
    } else {
      // Otherwise fetch them
      fetchNews(keyword, true, keyword);
    }
  };

  // Force fetch with different parameter name if we're not getting enough results
  const forceFetchMoreResults = (keyword) => {
    if (!keyword) return;
    
    setLoadingKeywords(prev => ({ ...prev, [keyword]: true }));
    setError('');
    
    console.log(`Force fetching more results for "${keyword}" using direct URL parameter`);
    
    // Try appending the count directly to the URL as a query param
    axios.get(
      `${BACKEND_URL.replace(/\/+$/, '')}/news/${encodeURIComponent(keyword)}?count=100&limit=100&max_results=100`, {
        params: {
          language: selectedLanguage,
          country: selectedCountry,
          period: selectedPeriod
        }
      }
    ).then(response => {
      console.log(`Force fetch received ${response.data.length} results from backend`);
      
      // Update the results
      const articles = Array.isArray(response.data) ? response.data : [];
      setKeywordResults(prev => ({
        ...prev,
        [keyword]: articles
      }));
      
      if (activeKeyword === keyword) {
        setNews(articles);
      }
      
    }).catch(err => {
      console.error('Error in force fetch:', err);
      setError('Failed to fetch more results. Please try again.');
    }).finally(() => {
      setLoadingKeywords(prev => ({ ...prev, [keyword]: false }));
    });
  };

  // Calculate paginated results for the current keyword
  const getPaginatedResults = (keyword) => {
    if (!keywordResults[keyword] || keywordResults[keyword].length === 0) {
      return [];
    }
    
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    return keywordResults[keyword].slice(startIndex, endIndex);
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle article selection for email
  const handleArticleToggle = (article) => {
    setSelectedArticles(prevSelected => {
      // If article is already selected, remove it
      if (prevSelected.some(a => a.link === article.link)) {
        return prevSelected.filter(a => a.link !== article.link);
      } 
      // Otherwise add it
      else {
        return [...prevSelected, article];
      }
    });
  };

  // Check if an article is selected
  const isArticleSelected = (article) => {
    return selectedArticles.some(a => a.link === article.link);
  };
    // Format current date for email subject
  const formatCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Function to scrape articles and prepare for email
  const scrapeSelectedArticles = async () => {
    if (selectedArticles.length === 0) return;
    
    setIsScrapingInProgress(true);
    const updatedScrapingStatus = {};
    
    // In a real implementation, you would make API calls to scrape each article
    // For this example, we'll simulate scraping with a timeout
    for (const article of selectedArticles) {
      updatedScrapingStatus[article.link] = 'pending';
      setScrapingStatus({...updatedScrapingStatus});
      
      try {
        console.log(`Scraping article: ${article.title}`);
        // Simulate web scraping with a timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, you'd fetch additional info here:
        // - Full article text
        // - Author information
        // - Publication details
        // - Image URLs
        
        // Mark as complete - in a real implementation, you would store the scraped data
        updatedScrapingStatus[article.link] = 'complete';
      } catch (error) {
        console.error(`Error scraping article: ${article.title}`, error);
        updatedScrapingStatus[article.link] = 'error';
      }
      
      setScrapingStatus({...updatedScrapingStatus});
    }
    
    setIsScrapingInProgress(false);
    setShowMailModal(true);
  };
    // Function to copy email template to clipboard
  const copyEmailToClipboard = () => {
    const emailBody = document.getElementById('email-body');
    if (emailBody) {
      navigator.clipboard.writeText(emailBody.innerText)
        .then(() => {
          alert('Email content copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  
  // Function to send email via EmailJS
  const sendEmail = async () => {
    if (!receiverEmail) {
      alert('Please enter a recipient email address');
      return;
    }
    
    try {
      setIsScrapingInProgress(true); // Reuse the loading state for email sending
      
      const emailSubject = `${selectedClient ? selectedClient.name + ' ' : ''}Industry News Update - ${formatCurrentDate()}`;
      
      // Format the email body for sending
      const emailContent = selectedArticles.map((article, index) => 
        `${index + 1}. ${article.title}\n${article.description || 'No description available'}\nPublication: ${article.publication || 'N/A'}      Journalist: ${article.journalist || 'Online'}\nLink: ${article.link}\n`
      ).join('\n');
      
      // Prepare the template parameters
      const templateParams = {
        to_email: receiverEmail,
        subject: emailSubject,
        client_name: selectedClient ? selectedClient.name : '',
        email_content: emailContent,
        from_name: 'Konnections IMAG News Tracking',
      };
        // Send the email using EmailJS with configuration from config file
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.userId
      );
      
      console.log('Email sent successfully:', result.text);
      alert('Email sent successfully!');
      setShowMailModal(false);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert(`Failed to send email: ${error.text}`);
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  // Initialize EmailJS once when the component mounts
  useEffect(() => {
    // Initialize EmailJS with your User ID
    emailjs.init(EMAILJS_CONFIG.userId);
  }, []);

  return (
    <div className="App">
      <Header />      
      <Container className="mt-4">
        {/* Client Selection Dropdown */}
        <div className="mb-4">
          <h5>Client Newsletter Dashboard</h5>
          <ClientDropdown 
            clients={clients} 
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
            onKeywordSelect={handleClientKeywordSelect}
          />
        </div>
        
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
            {/* Filter options */}          <Row className="mt-3">
            <Col md={4} className="mb-2">
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
            </Col>            <Col md={4} className="mb-2">
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
        </Form>        {/* Active Filters Display */}        
        <div className="d-flex flex-wrap align-items-center mb-3">
          <span className="me-2 small text-muted">Active filters:</span>
          
          {selectedClient && (
            <div className="filter-badge me-2">
              <span className="badge-label">Client:</span>
              {selectedClient.name}
            </div>
          )}
          
          <div className="filter-badge">
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
             selectedCountry}          </div>          <div className="filter-badge">
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

        {/* Client-specific keyword news results */}
        {selectedClient && (
          <div className="keyword-results-container mt-4 mb-5">
            <h4>News for {selectedClient.name}</h4>
            <Tabs
              activeKey={activeKeyword || (selectedClient.keywords[0] || '')}
              onSelect={(k) => handleClientKeywordSelect(k)}
              className="mb-4 flex-wrap"
            >
              {selectedClient.keywords.map((keyword) => (
                <Tab 
                  key={keyword} 
                  eventKey={keyword} 
                  title={
                    <div className="d-flex align-items-center">
                      {keyword}
                      {loadingKeywords[keyword] && (
                        <Spinner 
                          animation="border" 
                          size="sm" 
                          className="ms-2" 
                          style={{ width: '12px', height: '12px' }} 
                        />
                      )}
                      {keywordResults[keyword] && (
                        <Badge 
                          bg="secondary" 
                          className="ms-2"
                          pill
                        >
                          {keywordResults[keyword].length}
                        </Badge>
                      )}
                    </div>
                  }
                >                  {loadingKeywords[keyword] ? (
                    <div className="text-center my-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-3">Searching for: "{keyword}"</p>
                    </div>
                  ) : (
                    <>
                      <Row>
                        {getPaginatedResults(keyword) && getPaginatedResults(keyword).length > 0 ? (
                          getPaginatedResults(keyword).map((article, index) => (
                            <Col lg={4} md={6} className="mb-4" key={index}>
                              <NewsCard 
                                article={article} 
                                onArticleSelect={handleArticleToggle}
                                isSelected={isArticleSelected(article)}
                              />
                            </Col>
                          ))
                        ) : (
                          <Col className="text-center my-5">
                            <p>No news articles found for "{keyword}".</p>
                          </Col>
                        )}
                      </Row>
                        {/* Pagination controls */}
                      <div className="d-flex flex-column align-items-center my-4">
                        <nav>
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                &laquo; Previous
                              </button>
                            </li>
                            
                            {Array.from({ 
                              length: Math.ceil(keywordResults[keyword]?.length / RESULTS_PER_PAGE) || 1 
                            }, (_, i) => i + 1).map(page => (
                              <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${
                              currentPage === Math.ceil((keywordResults[keyword]?.length || 0) / RESULTS_PER_PAGE) 
                                ? 'disabled' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={
                                  currentPage === Math.ceil((keywordResults[keyword]?.length || 0) / RESULTS_PER_PAGE)
                                }
                              >
                                Next &raquo;
                              </button>
                            </li>
                          </ul>
                        </nav>
                        
                        <div className="mt-2 text-center">
                          <small className="text-muted">
                            Showing {(currentPage - 1) * RESULTS_PER_PAGE + 1}-
                            {Math.min(currentPage * RESULTS_PER_PAGE, keywordResults[keyword]?.length || 0)} 
                            of {keywordResults[keyword]?.length || 0} results
                          </small>
                        </div>
                      </div>                      {/* Note about API limitation and option to force fetch more */}
                      {keywordResults[keyword] && keywordResults[keyword].length === 30 && (
                        <div className="text-center my-3 api-limit-note">
                          <p className="text-muted mb-0">
                            <strong>Note:</strong> The API appears to be limited to 30 results despite requesting 100.
                          </p>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="mt-2"
                            onClick={() => forceFetchMoreResults(keyword)}
                          >
                            Try using different API parameters
                          </Button>
                        </div>
                      )}
                      
                      {keywordResults[keyword] && keywordResults[keyword].length > 0 && keywordResults[keyword].length < 30 && (
                        <div className="text-center my-3">
                          <p className="text-muted mb-0">
                            <strong>Found:</strong> {keywordResults[keyword].length} results for this keyword.
                          </p>
                        </div>
                      )}
                      
                      {keywordResults[keyword] && keywordResults[keyword].length === 100 && (
                        <div className="text-center my-3 api-limit-note">
                          <p className="text-muted mb-0">
                            <strong>Note:</strong> Showing maximum of 100 results per search query.
                            For more specific results, try refining your search keywords.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </Tab>
              ))}
            </Tabs>
          </div>
        )}

        {/* Regular search results (when no client is selected) */}
        {!selectedClient && (
          loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>          ) : (
            <Row>
              {news.length > 0 ? (
                news.map((article, index) => (
                  <Col lg={4} md={6} className="mb-4" key={index}>
                    <NewsCard 
                      article={article} 
                      onArticleSelect={handleArticleToggle}
                      isSelected={isArticleSelected(article)}
                    />
                  </Col>
                ))
              ) : (
                <Col className="text-center my-5">
                  <p>No news articles found. Try a different search term.</p>
                </Col>
              )}
            </Row>
          )
        )}{/* Display server connection error separately */}
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
        )}      </Container>
      
      {/* Floating button to compose email when articles are selected */}
      {selectedArticles.length > 0 && (
        <div className="fixed-bottom d-flex justify-content-end p-3">          <Button 
            variant="primary" 
            className="rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: '60px', height: '60px', position: 'relative' }}
            onClick={scrapeSelectedArticles}
          >
            <i className="bi bi-envelope-fill fs-4"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {selectedArticles.length}
            </span>
          </Button>
        </div>
      )}
      
      {/* Email Composition Modal */}
      <Modal
        show={showMailModal}
        onHide={() => setShowMailModal(false)}
        size="lg"
        aria-labelledby="email-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="email-modal">
            Compose Industry News Update Email
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isScrapingInProgress ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Scraping articles...</span>
              </Spinner>
              <p className="mt-3">Preparing email content...</p>
            </div>
          ) : (
            <Form>              <Form.Group className="mb-3">
                <Form.Label>To:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="recipient@example.com"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <Form.Text className="text-muted">
                  Enter a valid email address to send the email directly.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject:</Form.Label>
                <Form.Control
                  type="text"
                  value={`${selectedClient ? selectedClient.name + ' ' : ''}Industry News Update - ${formatCurrentDate()}`}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Body:</Form.Label>
                <div 
                  className="p-3 border rounded"
                  style={{ fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-line' }}
                  id="email-body"
                >                {`Dear Ma'am,

Greetings from Konnections IMAG.

Please find below the ${selectedClient ? selectedClient.name + ' ' : ''}Industry News Updates

Industry News Update:
${selectedArticles.map((article, index) => {
  // Get scraping status for this article (if available)
  const status = scrapingStatus[article.link];
  const statusText = status === 'complete' ? '✓ Scraped' : status === 'pending' ? '⏳ Scraping...' : status === 'error' ? '❌ Error' : '';
  
  return `${index + 1}. ${article.title} ${statusText}
${article.description || 'No description available'}
Publication: ${article.publication || 'N/A'}      Journalist: ${article.journalist || 'Online'}
Link: ${article.link}
`;
}).join('\n')}

Warm Regards,
Tracking Team

Integrated Marketing Communication Consultancy  
Please review our website: https://www.konnectionsimag.com`}
                </div>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMailModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={copyEmailToClipboard} disabled={isScrapingInProgress}>
            Copy to Clipboard
          </Button>          <Button 
            variant="success" 
            onClick={sendEmail}
            disabled={isScrapingInProgress}
          >
            {isScrapingInProgress ? (
              <>
                <Spinner 
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
