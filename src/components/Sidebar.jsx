import React from 'react';

const FRAGRANCE_FAMILIES = [
  { name: '🌹 Floral', desc: 'Rose, jasmine, lily — romantic & feminine' },
  { name: '🪵 Woody', desc: 'Sandalwood, cedar, vetiver — warm & grounding' },
  { name: '🍊 Citrus', desc: 'Bergamot, lemon, orange — fresh & energizing' },
  { name: '🌶️ Oriental', desc: 'Amber, vanilla, spices — rich & mysterious' },
  { name: '🌊 Fresh', desc: 'Aquatic, green, ozonic — clean & crisp' },
  { name: '🍰 Gourmand', desc: 'Caramel, chocolate, coffee — sweet & cozy' },
];

export default function Sidebar({ preferences, collapsed, onReset }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <span className="sidebar__logo">🌸</span>
        <span className="sidebar__brand">Aura</span>
      </div>

      <div className="sidebar__section">
        <div className="sidebar__section-title">Your Preferences</div>
        {preferences.length > 0 ? (
          <ul className="sidebar__pref-list">
            {preferences.map((pref, i) => (
              <li key={i} className="sidebar__pref-item">
                <span>{pref.icon}</span>
                <span>{pref.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sidebar__empty">Chat with Aura to build your scent profile...</p>
        )}
      </div>

      <div className="sidebar__section">
        <div className="sidebar__section-title">Fragrance Families</div>
        {FRAGRANCE_FAMILIES.map((f, i) => (
          <div key={i} className="sidebar__family">
            <div className="sidebar__family-name">{f.name}</div>
            <div className="sidebar__family-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <button className="sidebar__reset" onClick={onReset} id="reset-btn">
        🔄 Start New Session
      </button>
    </aside>
  );
}
