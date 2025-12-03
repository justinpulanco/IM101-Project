import React, { useState, useEffect } from 'react';

function ActivityLog({ apiBase, token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'delete', 'add', 'update'

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/activity-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      // Load from localStorage as fallback
      const localLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      setLogs(localLogs);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('delete')) return '🗑️';
    if (action.includes('add') || action.includes('create')) return '➕';
    if (action.includes('update') || action.includes('edit')) return '✏️';
    if (action.includes('login')) return '🔐';
    if (action.includes('logout')) return '🚪';
    return '📝';
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return 'red';
    if (action.includes('add') || action.includes('create')) return 'green';
    if (action.includes('update') || action.includes('edit')) return 'blue';
    return 'gray';
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.action.toLowerCase().includes(filter);
  });

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h2>📋 Activity Log</h2>
        <div className="activity-log-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'delete' ? 'active' : ''}`}
            onClick={() => setFilter('delete')}
          >
            Deletes
          </button>
          <button 
            className={`filter-btn ${filter === 'add' ? 'active' : ''}`}
            onClick={() => setFilter('add')}
          >
            Additions
          </button>
          <button 
            className={`filter-btn ${filter === 'update' ? 'active' : ''}`}
            onClick={() => setFilter('update')}
          >
            Updates
          </button>
        </div>
      </div>

      {loading ? (
        <div className="activity-log-loading">Loading logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="activity-log-empty">No activity logs found</div>
      ) : (
        <div className="activity-log-list">
          {filteredLogs.map((log, index) => (
            <div key={index} className="activity-log-item">
              <div className={`activity-icon ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="activity-content">
                <div className="activity-action">{log.action}</div>
                <div className="activity-details">
                  {log.details && <span className="activity-detail">{log.details}</span>}
                  <span className="activity-user">by {log.user || 'Admin'}</span>
                  <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
