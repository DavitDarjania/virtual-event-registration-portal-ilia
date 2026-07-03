import React from "react";
export function AppPromo({ t }) {
  return (
    <section className="page-section app-promo">
      <div className="section-inner app-promo-inner">
        <div>
          <p className="eyebrow">{t.appEyebrow}</p>
          <h2>{t.appTitle}</h2>
          <p>{t.appCopy}</p>
        </div>
        <div className="store-buttons">
          <span>App Store</span>
          <span>Google Play</span>
        </div>
      </div>
    </section>
  );
}
