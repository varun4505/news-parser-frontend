import React from 'react';
import { Form } from 'react-bootstrap';

const ClientDropdown = ({ clients, selectedClient, onClientSelect, onKeywordSelect }) => {
  return (
    <div className="client-search mb-4">
      <Form.Group>
        <Form.Label className="small text-muted">Select Client</Form.Label>
        <Form.Select
          value={selectedClient ? selectedClient.id : ''}
          onChange={(e) => {
            const clientId = parseInt(e.target.value);
            // Find the selected client from the list
            const selected = clients.find(client => client.id === clientId) || null;
            onClientSelect(selected);
          }}
        >
          <option value="">-- Select a client --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.industry})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Removed the keyword badges since we're now using tabs in App.js */}
    </div>
  );
};

export default ClientDropdown;
