import React from "react";

export function SiteFooter({ t }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">TKT</span>
        <div>
          <strong>{t.brand}</strong>
          <p>{t.footerTagline}</p>
        </div>
      </div>
      <div className="footer-simple">
        <p>{t.footerAbout}</p>
        <div>
          <strong>{t.footerSupport}</strong>
          <a href={`mailto:${t.footerContact}`}>{t.footerContact}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t.footerTerms}</span>
        <span>{t.footerPrivacy}</span>
      </div>
    </footer>
  );
}
