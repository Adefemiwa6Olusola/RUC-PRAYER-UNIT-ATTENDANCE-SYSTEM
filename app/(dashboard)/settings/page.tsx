'use client';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <div className="card max-w-2xl">
        <div className="card-body">
          <div className="form-group mb-4">
            <label className="form-label">Academic Session</label>
            <input type="text" className="input" defaultValue="2023/2024" />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Semester</label>
            <select className="select">
              <option value="1">Alpha Semester</option>
              <option value="2">Omega Semester</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: '#002f63', color: 'white' }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
