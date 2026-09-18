import FAQAccordion from "./FAQAccordion";

const faqs = [
  {
    question: "What format are the presets in, and what do I need to use them?",
    answer:
      "Each pack is a set of Adobe Lightroom presets (.xmp), compatible with Lightroom Classic on desktop and Lightroom Mobile. You'll need the free or paid Adobe Lightroom app installed — the presets themselves don't include Lightroom.",
  },
  {
    question: "How do I get my presets after paying?",
    answer:
      "Delivery is instant. As soon as your payment is confirmed, your download starts automatically and a copy of the link is emailed to the address you paid with — normally within a few minutes.",
  },
  {
    question: "I lost my download link. Can I get it back?",
    answer:
      "Yes — use the \"Already Purchased?\" form above with the email you paid with, and we'll send your download link again. No need to contact support for this.",
  },
  {
    question: "Can I share or resell the presets I bought?",
    answer:
      "No. Each download is for personal use only and is watermarked to your order, so it isn't meant to be shared, resold, or redistributed.",
  },
  {
    question: "Can I get a refund if I change my mind?",
    answer:
      "Digital downloads are final sale once delivered, since the file can't really be \"returned.\" If a file is corrupted, missing, or not what was described, contact us within 7 days and we'll fix it or refund you — see our Refund & Delivery Policy for the full terms.",
  },
];

export default function PresetFAQ() {
  return (
    <FAQAccordion
      label="FAQ"
      heading="Things You Might Want To Know"
      faqs={faqs}
    />
  );
}
