import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  /** Small coloured label above the heading, e.g. "FAQ". */
  label: string;
  heading: string;
  faqs: FAQItem[];
  /** Accent for the label, the open toggle and the focus ring. Pass a universe colour from lib/theme. */
  accent?: string;
}

// Layout and behaviour after the Arena v2 prototype's FAQ: centred label and
// heading, hairline-divided rows, a round + toggle that turns into × when
// open, and an answer that slides open. Shared by every FAQ on the site.
import { FASHION as STATE } from "../lib/theme";

export default function FAQAccordion({ label, heading, faqs, accent = "#D98E2B" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-28 px-1">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {label}
          </p>
          <h2
            className="mt-4 text-foreground leading-[1.05] tracking-tight"
            style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.25rem)", textWrap: "balance" }}
          >
            {heading}
          </h2>
        </div>

        <div className="mt-12 md:mt-14 divide-y divide-border border-y border-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${label}-${index}`;
            const buttonId = `faq-button-${label}-${index}`;

            return (
              <div key={faq.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group flex w-full items-center justify-between gap-6 py-5 md:py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm"
                    style={{ ["--faq-accent" as string]: STATE, ["--tw-ring-color" as string]: STATE }}
                  >
                    <span className="text-base md:text-xl font-semibold tracking-tight text-foreground">
                      {faq.question}
                    </span>
                    <span
                      className="grid h-9 w-9 flex-none place-items-center rounded-full text-background transition-colors duration-300 group-hover:!bg-[var(--faq-accent)]"
                      style={{ backgroundColor: isOpen ? STATE : "var(--foreground)", color: isOpen ? "#14120F" : undefined }}
                      aria-hidden="true"
                    >
                      <span className={`block text-2xl leading-none transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  style={{
                    transition: `grid-template-rows 400ms cubic-bezier(.22,1,.36,1), visibility 0s linear ${isOpen ? "0s" : "400ms"}`,
                    visibility: isOpen ? "visible" : "hidden",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl pb-6 md:pb-7 pr-12 text-sm md:text-base leading-7 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
