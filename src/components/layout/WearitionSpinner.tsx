import React from 'react';

export function WearitionSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="wearition-loader-wrapper">
        <div className="wearition-loader">
          <div className="outer-ring"></div>
          <div className="inner-ring"></div>
          <div className="logo-center">
            <span>W</span>
          </div>
          <div className="glow"></div>
        </div>
        <h1 className="brand-name">WEARITION</h1>
        <p className="brand-tagline">WEAR YOUR IDENTITY</p>
      </div>
    </div>
  );
}
