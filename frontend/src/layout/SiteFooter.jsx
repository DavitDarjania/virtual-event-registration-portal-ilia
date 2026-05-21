import React from "react";
const footerColumns = [
  ["Categories", ["Music / Concert", "Theatre", "Opera", "Sport", "International", "Festival", "Kids"]],
  ["More", ["Conference", "Stand Up", "Tourism", "Hobby", "Masterclass", "Museum", "Sea"]],
  ["Help", ["Online Help", "Feedback", "For Organizations", "FAQ", "+995 32 2195577", "support@tkt.ge"]],
  ["Movies", ["Amirani Cinema", "Cavea Tbilisi Mall", "Cavea East Point", "Cavea Galleria", "Cavea City Mall"]],
  ["Railway", ["Tbilisi - Batumi", "Tbilisi - Poti", "Tbilisi - Kutaisi", "Tbilisi - Ureki", "Tbilisi - Ozurgeti"]],
  ["Fly", ["Airlines", "Tbilisi - Istanbul", "Tbilisi - Berlin", "Tbilisi - Paris", "Tbilisi - Baku"]]
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">TKT</span>
        <div>
          <strong>Virtual Events</strong>
          <p>All tickets in one place</p>
        </div>
      </div>
      <div className="footer-grid">
        {footerColumns.map(([title, links]) => (
          <div className="footer-column" key={title}>
            <h3>{title}</h3>
            {links.map((link) => <a href="#" key={link}>{link}</a>)}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>Terms & Conditions</span>
        <span>Privacy Policy</span>
        <span>Cookie Policy</span>
        <span>Environmental Policy</span>
        <span>TKT Club Membership</span>
      </div>
    </footer>
  );
}
