import React, { useState } from 'react';
import { Form, Card, Badge } from 'react-bootstrap';
import { BsBuilding, BsBriefcase, BsGrid } from 'react-icons/bs';

const ClientDropdown = ({ clients, selectedClient, onClientSelect }) => {
  const [showIndustryFilter, setShowIndustryFilter] = useState(false);
  
  const industries = [...new Set(clients.map(client => client.industry))];
  
  return (
    <Card className="client-search-card mb-4 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="icon-wrapper">
              <BsBuilding className="text-primary" size={16} />
            </div>
            <h5 className="mb-0 fw-bold">Client Selection</h5>
          </div>
          <button 
            className="btn btn-sm btn-light rounded-circle filter-button" 
            onClick={() => setShowIndustryFilter(!showIndustryFilter)}
            title="Filter by industry"
          >
            <BsGrid size={14} />
          </button>
        </div>
        
        {showIndustryFilter && (
          <div className="industry-filter mb-3 py-2 px-3 bg-light rounded border">
            <p className="small fw-medium mb-2">Filter by industry:</p>
            <div className="d-flex flex-wrap gap-2">
              {industries.map((industry, index) => (
                <Badge 
                  key={index} 
                  className="industry-badge"
                  onClick={() => {}}
                  bg="light"
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Form.Group>
          <Form.Label className="small text-secondary fw-medium d-flex align-items-center">
            <span className="me-1">Select client</span>
            <span className="client-count">{clients.length}</span>
          </Form.Label>
          <div className="client-select-wrapper">
            <Form.Select
              value={selectedClient ? selectedClient.id : ''}
              onChange={(e) => {
                const clientId = parseInt(e.target.value);
                // Find the selected client from the list
                const selected = clients.find(client => client.id === clientId) || null;
                onClientSelect(selected);
              }}
              className="form-select-lg custom-select"
            >
              <option value="">-- Select a client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.industry})
                </option>
              ))}
            </Form.Select>
          </div>
        </Form.Group>

        {selectedClient && (
          <div className="selected-client-info mt-3 p-2 bg-light rounded">
            <div className="d-flex align-items-center">
              <BsBriefcase className="text-secondary me-2" />
              <small className="text-secondary">
                Industry: <span className="fw-medium">{selectedClient.industry}</span>
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ClientDropdown;
