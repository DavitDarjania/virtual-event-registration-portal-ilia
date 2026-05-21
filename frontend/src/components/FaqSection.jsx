import React from "react";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const faqItems = [
  ["How do I buy tickets?", "Choose an event, register with your account, and your ticket appears instantly in My tickets."],
  ["Where is my digital ticket?", "All active tickets are stored in the My tickets page with a unique TKT code."],
  ["Can I cancel registration?", "Users can cancel registrations before check-in. Admins can manage all registrations."],
  ["Can organizers check tickets?", "Yes. Organizers and admins can validate attendee tickets with the check-in tool."]
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="page-section faq-section">
      <div className="section-inner">
        <p className="eyebrow">FAQs</p>
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqItems.map(([question, answer], index) => (
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
