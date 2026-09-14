'use client';

import { useState } from 'react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-3 gap-4 items-end">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="input" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="input" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <button className="btn btn-primary" style={{ backgroundColor: '#002f63', color: 'white', height: '42px' }}>Generate Report</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-bold">Generated Report</h2>
          <button className="btn btn-success" style={{ backgroundColor: '#16a34a', color: 'white' }}>Download CSV</button>
        </div>
        <div className="card-body">
          <div className="empty-state p-12 text-center text-muted">
            <p>Select a date range and click Generate Report</p>
          </div>
        </div>
      </div>
    </div>
  );
}
