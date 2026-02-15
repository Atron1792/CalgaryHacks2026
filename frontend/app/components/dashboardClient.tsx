// frontend/app/dashboard/components/dashboardClient.tsx
"use client";

import { useState } from 'react';
import Home from '../dashboard/home';

type Section = 'home'; // extend in the future for more sections

export default function DashboardClient() {
  const [section, setSection] = useState<Section>('home');

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div className="section-tabs" role="navigation" aria-label="Dashboard sections">
          <button
            className={section === 'home' ? 'active' : ''}
            onClick={() => setSection('home')}
            aria-pressed={section === 'home'}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginRight: 6, background: section === 'home' ? '#e5e7eb' : '#fff' }}
          >
            Home
          </button>
          {/* Future sections can be added here, e.g.:
              <button onClick={() => setSection('analytics')}>Analytics</button> */}
        </div>
      </div>

      <section className="dashboard-content" style={{ paddingTop: 12 }}>
        {section === 'home' && <Home />}
      </section>
    </div>
  );
}