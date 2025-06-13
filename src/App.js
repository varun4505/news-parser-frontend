import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Container, Row, Col, Form, Button, Spinner, Tabs, Tab, Badge, Modal, Card } from 'react-bootstrap';
import axios from 'axios';
import { EMAIL_API_CONFIG } from './config/email';
import './App.css';
import NewsCard from './components/NewsCard';
import Header from './components/Header';
import ClientDropdown from './components/ClientDropdown';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import ToastNotification from './components/ToastNotification';
import clients, { publicationList } from './data/clients';

// Use the deployed backend URL when available, fallback to localhost for development
const BACKEND_URL = 'https://news-parser-ai.vercel.app';

function App() {
  const [query, setQuery] = useState('latest news');
  const [news, setNews] = useState([]);
  const [keywordResults, setKeywordResults] = useState({}); // Store results for each keyword
  const [loading, setLoading] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState({}); // Track loading state for each keyword
  const [error, setError] = useState('');  const [selectedClient, setSelectedClient] = useState(null);
  const [activeKeyword, setActiveKeyword] = useState(null); // Currently active keyword tab
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const RESULTS_PER_PAGE = 15; // Increased number of results to show per page// State for mail composition
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showMailModal, setShowMailModal] = useState(false);  const [receiverEmail, setReceiverEmail] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState({});
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordsConfirmed, setKeywordsConfirmed] = useState(false);
  const [generalSearchQuery, setGeneralSearchQuery] = useState('');
  const [isGeneralSearching, setIsGeneralSearching] = useState(false);

  // Fetch news for a specific search query
  const fetchNews = async (searchQuery, isKeywordQuery = false, keyword = null) => {
    // If searching for All Publications Coverage, fetch for each publication with client name
    if (keyword === 'All Publications Coverage' && selectedClient) {
      setLoadingKeywords(prev => ({ ...prev, [keyword]: true }));
      setError('');
      let allArticles = [];
      try {
        // Fetch news for each publication with client name in parallel
        const results = await Promise.all(
          publicationList.map(pub =>
            axios.get(
              `${BACKEND_URL.replace(/\/+$/, '')}/news/${encodeURIComponent(selectedClient.name + ' ' + pub)}`,
              {
                params: {
                  maxResults: 100,
                  max_results: 100,
                  count: 100,
                  limit: 100,
                  num: 100
                }
              }
            ).then(res => Array.isArray(res.data) ? res.data : [])
              .catch(() => [])
          )
        );
        // Flatten and deduplicate articles by link
        allArticles = results.flat();
        const seen = new Set();
        allArticles = allArticles.filter(article => {
          if (!article.link || seen.has(article.link)) return false;
          seen.add(article.link);
          return true;
        });
        setKeywordResults(prev => ({ ...prev, [keyword]: allArticles }));
        if (activeKeyword === keyword || !activeKeyword) {
          setNews(allArticles);
          setActiveKeyword(keyword);
        }
      } catch (err) {
        setError('Failed to fetch news for all publications.');
        setKeywordResults(prev => ({ ...prev, [keyword]: [] }));
      } finally {
        setLoadingKeywords(prev => ({ ...prev, [keyword]: false }));
      }
      return;
    }
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
    
      // Remove all filter parameters, only keep the maxResults
      const response = await axios.get(
        `${BACKEND_URL.replace(/\/+$/, '')}/news/${encodeURIComponent(searchQuery)}`, {
          params: {
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
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED') {
        errorMessage = 'Request was canceled (possibly due to timeout or navigation).';
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
  };  // fetchOptions function has been removed// Fetch initial news
  useEffect(() => {
    fetchNews(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Filter-related useEffect hooks have been removed

  // Removed unused handleSubmit and fetchAllClientKeywords

  // Handle client selection from dropdown
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setNews([]);
    setSelectedKeywords([]);
    setKeywordsConfirmed(false);
    setActiveKeyword(null);
    if (client) {
      // Do not fetch news yet, wait for keyword selection
    }
  };

  // New: handle keyword checkbox change
  const handleKeywordCheckbox = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  // New: confirm keyword selection and fetch news
  const handleConfirmKeywords = () => {
    setKeywordsConfirmed(true);
    if (selectedClient && selectedKeywords.length > 0) {
      // Fetch news for selected keywords only
      setKeywordResults({});
      setActiveKeyword(selectedKeywords[0]);
      setLoadingKeywords(
        selectedKeywords.reduce((acc, k) => {
          acc[k] = true;
          return acc;
        }, {})
      );
      Promise.allSettled(selectedKeywords.map((keyword) => fetchNews(keyword, true, keyword)));
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
      `${BACKEND_URL.replace(/\/+$/, '')}/news/${encodeURIComponent(keyword)}?count=100&limit=100&max_results=100`
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
    // Function to send email via backend API using nodemailer
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
      
      // Prepare the request payload
      const emailData = {
        to_email: receiverEmail,
        subject: emailSubject,
        client_name: selectedClient ? selectedClient.name : '',
        email_content: emailContent,
        from_name: 'Konnections IMAG News Tracking',
      };

      // Send the email using the backend API
      const response = await axios.post(
        `${EMAIL_API_CONFIG.baseUrl}${EMAIL_API_CONFIG.endpoints.sendEmail}`,
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.success) {
        console.log('Email sent successfully:', response.data.messageId);
        alert('Email sent successfully!');
        setShowMailModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
      alert(`Failed to send email: ${errorMessage}`);
    } finally {
      setIsScrapingInProgress(false);
    }
  };  // Initialize app and fetch initial news
  useEffect(() => {
    // Only fetch initial news if no client is selected
    if (!selectedClient) {
      fetchNews('latest news');
      setGeneralSearchQuery('latest news');
    }
  }, [selectedClient]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };
  
  // Hide toast notification
  const hideToast = () => {
    setToast({
      ...toast,
      show: false
    });
  };
    // Handle general news search from header
  const handleGeneralSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // Clear client selection and reset to general search mode
    setSelectedClient(null);
    setActiveKeyword(null);
    setKeywordsConfirmed(false);
    setSelectedKeywords([]);
    setCurrentPage(1);
    
    setIsGeneralSearching(true);
    setQuery(searchQuery);
    
    try {
      await fetchNews(searchQuery, false, null);
      showToast(`Found articles for "${searchQuery}"`, 'success');
    } catch (error) {
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setIsGeneralSearching(false);
    }  };

  // Reset function simplified without filter options
  const handleResetFilters = () => {
    // Reset selectedClient if one is selected
    if (selectedClient) {
      setSelectedClient(null);
      setActiveKeyword(null);
      setKeywordsConfirmed(false);
      setSelectedKeywords([]);
    }
    
    // Reset search and fetch latest news
    setGeneralSearchQuery('latest news');
    setQuery('latest news');
    setCurrentPage(1);
    
    showToast('Search has been reset', 'info');
    fetchNews('latest news');
  };

  // Handle keyword selection for a client (switching between tabs)
  const handleClientKeywordSelect = (keyword) => {
    setActiveKeyword(keyword);
    setCurrentPage(1); // Reset to first page when switching keywords
    if (keywordResults[keyword]) {
      setNews(keywordResults[keyword]);
    } else {
      fetchNews(keyword, true, keyword);
    }
  };
  return (
    <div className="App">
      <Header 
        onSearch={handleGeneralSearch}
        searchQuery={generalSearchQuery}
        setSearchQuery={setGeneralSearchQuery}
        isSearching={isGeneralSearching}
      />
      
      {/* Mobile filter panel */}
      {mobileFilterOpen && <div className="filter-panel-overlay open" onClick={() => setMobileFilterOpen(false)}></div>}
      
      {/* Toast notifications */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <Container className="mt-4">
        {/* Client Selection Dropdown */}
        <div className="mb-4">
          <h5>Client Newsletter Dashboard</h5>
          <ClientDropdown 
            clients={clients} 
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
          />
        </div>
        {/* Keyword selection step for clients */}
        {selectedClient && !keywordsConfirmed && (
          <Card className="mb-4">
            <Card.Body>
              <h6 className="mb-3">Select keywords to search for <span className="text-primary">{selectedClient.name}</span>:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {selectedClient.keywords.map((keyword) => (
                  <Form.Check
                    key={keyword}
                    type="checkbox"
                    id={`keyword-${keyword}`}
                    label={keyword}
                    checked={selectedKeywords.includes(keyword)}
                    onChange={() => handleKeywordCheckbox(keyword)}
                    className="me-3 mb-2"
                  />
                ))}
              </div>
              <Button
                variant="primary"
                disabled={selectedKeywords.length === 0}
                onClick={handleConfirmKeywords}
              >
                Search News Insights
              </Button>
            </Card.Body>
          </Card>
        )}
        {/* Only show news insights if keywords are confirmed */}
        {selectedClient && keywordsConfirmed && (
          <div className="keyword-results-container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 me-2">News Insights for</h4>
                <div className="client-badge px-3 py-1 bg-light border rounded-pill">
                  <strong className="text-primary">{selectedClient.name}</strong>
                </div>
              </div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="d-flex align-items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sliders me-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3h9.05zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8h2.05zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1h9.05z"/>
                </svg>
                Advanced Options
              </Button>
            </div>
            <Tabs
              activeKey={activeKeyword || (selectedClient.keywords[0] || '')}
              onSelect={(k) => handleClientKeywordSelect(k)}
              className="mb-4 flex-wrap custom-tabs"
            >
              {selectedClient.keywords.map((keyword) => (
                <Tab 
                  key={keyword} 
                  eventKey={keyword} 
                  title={
                    <div className="d-flex align-items-center px-1">
                      <span className="keyword-tab-text">{keyword}</span>
                      {loadingKeywords[keyword] && (
                        <Spinner 
                          animation="border" 
                          size="sm" 
                          className="ms-2" 
                          variant="primary"
                          style={{ width: '14px', height: '14px' }} 
                        />
                      )}
                      {keywordResults[keyword] && (
                        <Badge 
                          bg="light" 
                          text="primary"
                          className="ms-2 border"
                          pill
                        >
                          {keywordResults[keyword].length}
                        </Badge>
                      )}
                    </div>
                  }                >{loadingKeywords[keyword] ? (
                    <div className="my-4">
                      <div className="d-flex align-items-center mb-4">
                        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                        <h5 className="mb-0 text-primary">Searching for: "{keyword}"</h5>
                      </div>
                      <LoadingSkeleton count={6} />
                    </div>
                  ) : (
                    <>
                      <Row>
                        {getPaginatedResults(keyword) && getPaginatedResults(keyword).length > 0 ?
  getPaginatedResults(keyword).map((article, index) => (
    <Col lg={4} md={6} className="mb-4" key={index}>
      <NewsCard 
        article={article} 
        onArticleSelect={handleArticleToggle}
        isSelected={isArticleSelected(article)}
      />
    </Col>
  ))
  : (
    <EmptyState message={`No news articles found for "${keyword}".`} onReset={handleResetFilters} />
  )}
                      </Row>                      {/* Pagination controls */}
                      <div className="d-flex flex-column align-items-center my-4">
                        <nav>
                          <ul className="pagination pagination-md">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link rounded-start-pill"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                </svg>
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
                                className="page-link rounded-end-pill"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={
                                  currentPage === Math.ceil((keywordResults[keyword]?.length || 0) / RESULTS_PER_PAGE)
                                }
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
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
        )}        {/* Regular search results (when no client is selected) */}
        {!selectedClient && (
          <>
            {/* Display current search query */}
            {generalSearchQuery && generalSearchQuery !== 'latest news' && (
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 text-muted">
                    Search results for: <span className="text-primary">"{generalSearchQuery}"</span>
                  </h5>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleResetFilters}
                    className="d-flex align-items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-x-circle me-1" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                    Clear
                  </Button>
                </div>
                <hr className="mt-2 mb-4" />
              </div>
            )}
            
            {(loading || isGeneralSearching) ? (
              <div className="my-4">
                <h5 className="text-primary mb-4">
                  {isGeneralSearching ? `Searching for "${generalSearchQuery}"...` : 'Searching for news...'}
                </h5>
                <LoadingSkeleton count={6} />
              </div>
            ) : (
              <Row>
                {news.length > 0
      ? news.map((article, index) => (
          <Col lg={4} md={6} className="mb-4" key={index}>
            <NewsCard 
              article={article} 
              onArticleSelect={handleArticleToggle}
              isSelected={isArticleSelected(article)}
            />
          </Col>
        ))
      : (
          <EmptyState message="No news articles found. Try a different search term or adjust your filters." onReset={handleResetFilters} />
        )}              </Row>
            )}
          </>
        )}
        
        {/* Display server connection error separately */}
        {!loading && news.length === 0 && !error && (
          <div className="connection-error-card p-4 rounded shadow-sm bg-white">
            <div className="d-flex align-items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-hdd-network text-warning me-3" viewBox="0 0 16 16">
                <path d="M4.5 5a.5.5 0 0 0 0-1 .5.5 0 0 0 0 1M3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.5v3a1.5 1.5 0 0 1 1.5 1.5h5.5a.5.5 0 0 1 0 1H10A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5H.5a.5.5 0 0 1 0-1H6A1.5 1.5 0 0 1 7.5 10V7H2a2 2 0 0 1-2-2zm1 0v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1m6 7.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5"/>
              </svg>
              <h5 className="mb-0 text-dark">Server Connection</h5>
            </div>
            <p className="text-secondary mb-3">
              If you're not seeing any articles, please make sure the backend server is running at <code className="bg-light px-2 py-1 rounded">{BACKEND_URL}</code>
            </p>
            <Button 
              variant="primary" 
              size="sm"
              className="d-flex align-items-center"              onClick={() => {
                fetchNews(query);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat me-2" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
              </svg>
              Retry Connection            </Button>
          </div>
        )}
      </Container>
      
      {/* Floating button to compose email when articles are selected */}
      {selectedArticles.length > 0 && (
        <div className="fixed-bottom d-flex justify-content-end p-4">
          <Button 
            variant="primary" 
            className="rounded-circle fab-button d-flex align-items-center justify-content-center shadow-lg"
            style={{ width: '60px', height: '60px', position: 'relative' }}
            onClick={scrapeSelectedArticles}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-envelope-paper" viewBox="0 0 16 16">
              <path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
            </svg>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {selectedArticles.length}
              <span className="visually-hidden">selected articles</span>
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
        className="email-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title id="email-modal" className="text-primary">
            <div className="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-envelope-paper me-2" viewBox="0 0 16 16">
                <path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
              </svg>
              <span>Compose Industry News Digest</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {isScrapingInProgress ? (
            <div className="text-center my-5 py-5">
              <div className="mb-3">
                <Spinner animation="border" variant="primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Scraping articles...</span>
                </Spinner>
              </div>
              <h5 className="text-primary mb-2">Preparing Email Content</h5>
              <p className="text-secondary">Gathering and formatting your selected articles...</p>
            </div>
          ) : (
            <Form className="email-form">
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Recipient Email</Form.Label>
                <div className="position-relative">
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                    </svg>
                  </div>
                  <Form.Control
                    type="email"
                    placeholder="recipient@example.com"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    className="ps-5 py-3"
                  />
                </div>
                <Form.Text className="text-muted">
                  Enter a valid email address to send the digest directly to the recipient.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={`${selectedClient ? selectedClient.name + ' ' : ''}Industry News Update - ${formatCurrentDate()}`}
                  readOnly
                  className="py-3 bg-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Email Content</Form.Label>
                <div 
                  className="p-4 border rounded bg-light"
                  style={{ fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6' }}
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
          )}        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button variant="outline-secondary" onClick={() => setShowMailModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={copyEmailToClipboard} 
            disabled={isScrapingInProgress}
            className="d-flex align-items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard me-2" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
            </svg>
            Copy to Clipboard
          </Button>
          <Button 
            variant="primary" 
            onClick={sendEmail}
            disabled={isScrapingInProgress}
            className="d-flex align-items-center"
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
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send me-2" viewBox="0 0 16 16">
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
              </svg>
                Send Email
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
        {/* Mobile filter panel and trigger button have been removed */}
      
      {/* Toast notifications */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default App;
