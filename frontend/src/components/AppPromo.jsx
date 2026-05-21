import React from "react";
export function AppPromo() {
  return (
    <section className="page-section app-promo">
      <div className="section-inner app-promo-inner">
        <div>
          <p className="eyebrow">Get the new app</p>
          <h2>Everything you need, in one account.</h2>
          <p>Store tickets, check event details, and keep your registration history close.</p>
        </div>
        <div className="store-buttons">
          <span>App Store</span>
          <span>Google Play</span>
        </div>
      </div>
    </section>
  );
}
