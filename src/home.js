import React from 'react';
import './App.css';

function HomePage() {
  return (
    <div className="container">
      <div className="header">
        <h1>Welcome to GhoomO!</h1>
      </div>
      <div className="card-container" style={{ opacity: 1 }}>
        <div className="card">
          <h2>Darjeeling</h2>
          <p>This is the first card.</p>
        </div>
        <div className="card">
          <h2>Tajmahal</h2>
          <p>This is the second card.</p>
        </div>
        <div className="card">
          <h2>Kashmir</h2>
          <p>This is the third card.</p>
        </div>
      </div>
      <div className="button-container">
        <button>Learn More</button>
        <button>GitHub</button>
      </div>
    </div>
  );
}

export default HomePage;
