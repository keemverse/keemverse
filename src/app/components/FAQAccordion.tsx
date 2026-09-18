import { useState } from "react";
import SectionDivider from "./SectionDivider";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  label: string;
  heading: string;
  faqs: FAQItem[];
}

export default function FAQAccordion({ label, heading, faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-28">
      <div className="max-w-3xl mx-auto">

        <SectionDivider label={label} />

        <h2 className="font-serif text-5xl text-center mt-8 mb-12">
          {heading}
        </h2>

        <div className="divide-y divide-stone-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className="py-7 md:py-8">
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full flex items-start justify-between gap-6 text-left"
                >
                  <h3 className="font-serif text-xl md:text-2xl text-stone-900">
                    {faq.question}
                  </h3>

                  <span className="text-3xl leading-none text-stone-500">
                    {isOpen ? "−" : "⌄"}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-5 pr-8 text-stone-600 leading-8">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
