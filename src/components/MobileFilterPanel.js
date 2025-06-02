import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { BsX, BsFilter, BsCheck2 } from 'react-icons/bs';

const MobileFilterPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  options,
  onApplyFilters
}) => {
  const handleApplyFilters = () => {
    onApplyFilters();
    onClose();
  };
  
  return (
    <div className={`mobile-filter-panel ${isOpen ? 'open' : ''}`}>
      <div className="filter-panel-header">
        <div className="d-flex align-items-center">
          <BsFilter size={18} className="me-2" />
          <h5 className="mb-0">Filters</h5>
        </div>
        <Button 
          variant="link" 
          className="p-0 filter-close-btn text-dark" 
          onClick={onClose}
        >
          <BsX size={24} />
        </Button>
      </div>
      
      <div className="filter-panel-body">
        <Form>
          {/* Language Filter */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Language</Form.Label>
            {Object.entries(options.languages).map(([code, name]) => (
              <Form.Check
                key={code}
                type="checkbox"
                id={`language-${code}`}
                label={name}
                checked={filters.languages.includes(code)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({
                      ...filters,
                      languages: [...filters.languages, code]
                    });
                  } else {
                    setFilters({
                      ...filters, 
                      languages: filters.languages.filter(lang => lang !== code)
                    });
                  }
                }}
                className="custom-mobile-checkbox mb-2"
              />
            ))}
          </Form.Group>
          
          {/* Country Filter */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Country</Form.Label>
            {Object.entries(options.countries).map(([code, name]) => (
              <Form.Check
                key={code}
                type="checkbox"
                id={`country-${code}`}
                label={name}
                checked={filters.countries.includes(code)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({
                      ...filters,
                      countries: [...filters.countries, code]
                    });
                  } else {
                    setFilters({
                      ...filters, 
                      countries: filters.countries.filter(country => country !== code)
                    });
                  }
                }}
                className="custom-mobile-checkbox mb-2"
              />
            ))}
          </Form.Group>
          
          {/* Time Period Filter */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Time Period</Form.Label>
            {Object.entries(options.periods).map(([code, name]) => (
              <Form.Check
                key={code}
                type="radio"
                id={`period-${code}`}
                label={name}
                checked={filters.period === code}
                onChange={() => {
                  setFilters({
                    ...filters,
                    period: code
                  });
                }}
                className="custom-mobile-radio mb-2"
              />
            ))}
          </Form.Group>
        </Form>
      </div>
      
      <div className="filter-panel-footer">
        <Button 
          variant="outline-secondary" 
          onClick={() => {
            setFilters({
              languages: [],
              countries: [],
              period: '7d',
              categories: []
            });
          }}
          className="me-2"
        >
          Reset
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApplyFilters}
          className="apply-filters-btn"
        >
          <BsCheck2 size={16} className="me-1" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default MobileFilterPanel;
