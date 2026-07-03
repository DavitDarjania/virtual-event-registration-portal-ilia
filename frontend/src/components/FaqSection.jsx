import React from "react";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export function FaqSection({ t }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="page-section faq-section">
      <div className="section-inner">
        <p className="eyebrow">{t.faqs}</p>
        <h2>{t.faqTitle}</h2>
        <div className="faq-grid">
          {t.faqItems.map(([question, answer], index) => (
            <article className={openIndex === index ? "open" : ""} key={question}>
              <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                <h3>{question}</h3>
                <ChevronRight size={20} />
              </button>
              {openIndex === index && <p>{answer}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
