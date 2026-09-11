import { InfoPage } from '../components/InfoPage';

export default function RefundPolicyPage() {
  return (
    <InfoPage eyebrow="Policy" title="Refund & Delivery Policy">
      <p className="text-sm text-stone-400">Last updated: September 10, 2026</p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Digital products</h2>
      <p>
        Lightroom presets, design packs, and other digital downloads are
        delivered instantly upon purchase. Because of the nature of digital
        goods, all sales are final and non-refundable once a file has been
        delivered or downloaded.
      </p>
      <p>
        If a file is corrupted, missing, or genuinely not what was
        described in the listing, contact us within 7 days of purchase and
        we'll fix it or issue a refund.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Delivery</h2>
      <p>
        Digital products are delivered electronically — there is no
        physical shipment. As soon as your payment is confirmed, a
        download link is shown on the confirmation screen and sent to the
        email address used at checkout, normally within a few minutes.
      </p>
      <p>
        If your download hasn't arrived within 1 hour, check your spam
        folder, then email us at{' '}
        <a href="mailto:akeemtajudeen322@gmail.com" className="text-stone-900 underline underline-offset-4">
          akeemtajudeen322@gmail.com
        </a>{' '}
        with your order details and we'll re-send it within 1 business day.
      </p>
      <p>
        For styling, brand collaboration, and creative direction work,
        delivery timelines are agreed in writing at the time of booking.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Purchases via third-party platforms</h2>
      <p>
        Some products are sold through third-party platforms (for example
        Gumroad). Purchases made there are also subject to that platform's
        own refund policy in addition to this one.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Services</h2>
      <p>
        Styling, brand collaboration, and creative direction services are
        booked directly with us. Cancellation and refund terms for a
        booking are agreed upon at the time of booking and handled
        case-by-case.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">How to request a refund</h2>
      <p>
        Email us at{' '}
        <a href="mailto:akeemtajudeen322@gmail.com" className="text-stone-900 underline underline-offset-4">
          akeemtajudeen322@gmail.com
        </a>{' '}
        with your order details. We respond to all customer enquiries
        within 1 business day.
      </p>
    </InfoPage>
  );
}
