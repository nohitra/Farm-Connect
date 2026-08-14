import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Store, CheckCircle, XCircle } from 'lucide-react';

const HubRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    API.get('/admin/hub-requests')
      .then((res) => {
        if (res.data.success) setRequests(res.data.requests);
      })
      .catch((err) => console.error('Error fetching hub requests:', err))
      .finally(() => setLoading(false));
  };

  const handleAction = async (requestId, status) => {
    try {
      await API.patch(`/admin/hub-requests/${requestId}`, { status });
      fetchRequests();
    } catch (err) {
      console.error('Error updating hub request:', err);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <h2>Farmer-Hub Assignment Requests</h2>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}><h3>Loading requests...</h3></div>
      ) : requests.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem', marginTop: '1rem' }}>
          <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Pending Hub Requests</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {requests.map((req) => (
            <div key={req._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem' }}>{req.farmer?.farmName || req.farmer?.user?.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Requesting Hub: <strong>{req.hub?.name}</strong></p>
                <span className="badge badge-organic" style={{ marginTop: '0.4rem' }}>{req.status}</span>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAction(req._id, 'approved')} className="btn btn-primary btn-sm"><CheckCircle size={14} /> Approve</button>
                  <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-danger btn-sm"><XCircle size={14} /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HubRequestsPage;
