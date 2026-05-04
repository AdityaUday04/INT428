import React from 'react';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__bg-orb welcome__bg-orb--1"></div>
      <div className="welcome__bg-orb welcome__bg-orb--2"></div>
      <div className="welcome__bg-orb welcome__bg-orb--3"></div>

      <div className="welcome__bottle">🌸</div>
      <h1 className="welcome__title">Aura</h1>
      <p className="welcome__subtitle">AI Personalised Perfume Finder</p>
      <p className="welcome__desc">
        Discover fragrances that perfectly match your personality, style, and mood.
        Powered by AI, guided by expertise — your signature scent awaits.
      </p>

      <div className="welcome__features">
        <div className="welcome__feature"><span>🎯</span> Personalized Picks</div>
        <div className="welcome__feature"><span>🧪</span> Note Analysis</div>
        <div className="welcome__feature"><span>💎</span> Expert Knowledge</div>
        <div className="welcome__feature"><span>🌍</span> Climate-Aware</div>
      </div>

      <button className="welcome__cta" onClick={onStart} id="start-btn">
        ✨ Start Your Fragrance Journey
      </button>
    </div>
  );
}
