import "./App.css";

const readinessItems = [
  {
    title: "Structured promises",
    description: "Ready for seeded candidates, manifestos, and promise records.",
  },
  {
    title: "Anonymous input",
    description: "Reserved space for evidence and community notes without identity.",
  },
  {
    title: "Offline path",
    description: "Prepared for IndexedDB persistence and app-shell caching later.",
  },
];

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand" aria-label="Manifesto">
            <div className="brand__mark" aria-hidden="true">
              M
            </div>
            <div>
              <h1 className="brand__name">Manifesto</h1>
              <p className="brand__tagline">Civic accountability demo</p>
            </div>
          </div>
          <span className="demo-badge">Step 1 scaffold</span>
        </div>
      </header>

      <main className="main-content">
        <section className="dashboard" aria-label="Manifesto dashboard">
          <div className="panel overview">
            <p className="eyebrow">Voice & accountability</p>
            <h2>Track public promises from campaign pledge to delivery.</h2>
            <p className="overview__copy">
              This first usable shell establishes the React app that later milestones
              will fill with seeded manifesto data, anonymous evidence, context
              notes, persistence, and simulated sync.
            </p>
            <ul className="readiness-list" aria-label="Planned civic workflow">
              {readinessItems.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="panel status-panel" aria-label="Empty dashboard status">
            <div>
              <p className="eyebrow">Demo state</p>
              <h2>No manifesto data loaded yet</h2>
              <p>
                Seeded candidates and promises arrive in the next milestone. This
                screen stays intentionally empty of civic records for now.
              </p>
            </div>
            <div className="empty-meter" aria-label="Current record counts">
              <div className="metric">
                <span className="metric__value">0</span>
                <span className="metric__label">Candidates</span>
              </div>
              <div className="metric">
                <span className="metric__value">0</span>
                <span className="metric__label">Promises</span>
              </div>
            </div>
            <p className="milestone-note">
              Step 1 creates the app foundation only. Local-first storage, PWA
              caching, and sync are deliberately deferred.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
