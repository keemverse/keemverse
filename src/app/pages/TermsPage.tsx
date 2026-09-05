import { InfoPage } from '../components/InfoPage';

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Policy" title="Terms and Conditions">
      <p className="text-sm text-stone-400">Last updated: September 5, 2026</p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">About Keemverse</h2>
      <p>
        Keemverse LTD (RC 8793345) is a visual storytelling and digital
        craft studio based in Osogbo, Osun State, Nigeria. By using this
        site or purchasing from us, you agree to the terms below.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Products and services</h2>
      <p>
        We offer digital products (Lightroom presets, design packs) and
        creative services (styling, brand collaboration, creative
        direction). Product descriptions, pricing, and availability are as
        listed at the time of purchase and may change without notice.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Licensing</h2>
      <p>
        Digital products are licensed for the use described in their
        listing. Unless stated otherwise, you may not resell, redistribute,
        or share the raw files themselves.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Payment</h2>
      <p>
        Payments are processed through third-party providers (including
        Gumroad and Flutterwave). We do not directly handle or store your
        card details.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Liability</h2>
      <p>
        We provide our products and services as described in good faith,
        but do not guarantee specific outcomes from using them (for
        example, engagement or sales results from styling or creative
        work). We are not liable for indirect or incidental damages arising
        from use of our products or services.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Governing law</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:akeemtajudeen322@gmail.com" className="text-stone-900 underline underline-offset-4">
          akeemtajudeen322@gmail.com
        </a>.
      </p>
    </InfoPage>
  );
}
