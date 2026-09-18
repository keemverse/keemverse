import FAQAccordion from "./FAQAccordion";

const faqs = [
  {
    question: "How do you choose the products on Fashion Finds?",
    answer:
      "Every product here is something I've either personally used or featured in my creative projects. I choose pieces for their design, quality, versatility, and overall value—not simply because they're available.",
  },
  {
    question: "How does Fashion Finds make money?",
    answer:
      "Some links on Fashion Finds are affiliate links. If you purchase through them, I may earn a small commission at no extra cost to you. It helps support the project while allowing me to continue curating products I genuinely recommend.",
  },
  {
    question: "Do you actually use these products?",
    answer:
      "Most of them, yes. Many are products I personally use, while others have been purchased and featured in my fashion shoots, styling projects, and creative work.",
  },
  {
    question:
      "Why should I buy through Fashion Finds instead of browsing marketplaces myself?",
    answer:
      "I've spent a lot of time shopping across online marketplaces, so I know how overwhelming the choices can be. Rather than asking you to scroll through thousands of listings, I point you directly to products I've found to be worth considering based on my own experience and creative work.",
  },
  {
    question: "Can I suggest a product for Fashion Finds?",
    answer:
      "Absolutely. If there's something you'd like me to review, try, or feature, send me a message on TikTok or Instagram. Community recommendations will become a bigger part of Fashion Finds as it grows.",
  },
];

export default function FashionFAQ() {
  return (
    <FAQAccordion
      label="FAQ"
      heading="Things You Might Want To Know"
      faqs={faqs}
    />
  );
}
