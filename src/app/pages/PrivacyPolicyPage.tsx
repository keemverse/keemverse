import { InfoPage } from '../components/InfoPage';

export default function PrivacyPolicyPage() {
  return (
    <InfoPage eyebrow="Policy" title="Privacy Policy">
      <p className="text-sm text-stone-400">Last updated: September 5, 2026</p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">What we collect</h2>
      <p>
        We collect the information you give us directly — for example, your
        name and email address when you contact us, book a service, or
        reach out through the site. When you purchase a product, order and
        payment details are handled by our payment and checkout providers
        (see below); we do not collect or store your card details ourselves.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">How we use it</h2>
      <p>
        We use the information we collect to respond to your messages,
        fulfill orders and bookings, and improve our products and services.
        We do not sell your information to third parties.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Third-party services</h2>
      <p>
        Purchases and payments are processed by third-party providers
        (including Gumroad and Flutterwave), each governed by their own
        privacy policy. We may also use standard analytics tools to
        understand how the site is used.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Your rights</h2>
      <p>
        You can ask us what information we hold about you, or ask us to
        delete it, at any time — just email us and we'll take care of it.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The most current
        version will always be posted on this page.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Contact</h2>
      <p>
        Questions about this policy? Email{' '}
        <a href="mailto:akeemtajudeen322@gmail.com" className="text-stone-900 underline underline-offset-4">
          akeemtajudeen322@gmail.com
        </a>.
      </p>
    </InfoPage>
  );
}
