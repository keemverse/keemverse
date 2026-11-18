import { InfoPage } from '../components/InfoPage';
import portrait from '../../imports/trend-territory-modeling-portrait.webp';

export default function AboutPage() {
  return (
    <InfoPage eyebrow="Keemverse" title="About Keem" portrait={{ src: portrait, alt: "Keem, seated in a pink and cream striped outfit", position: "50% 38%" }}>
      <p>
        Hi, I'm Keem. I make fashion content: outfits, shoots and the little
        stories clothes can tell. You might know me as Soft Keem on TikTok,
        Instagram and Pinterest.
      </p>

      <h2 className="font-serif text-xl text-foreground mt-8 mb-2">What you will find here</h2>
      <p>
        <a href="/gallery" className="text-foreground underline underline-offset-4">The gallery</a>{' '}
        has frames from my shoots.{' '}
        <a href="/fashion/finds" className="text-foreground underline underline-offset-4">Fashion Finds</a>{' '}
        are the pieces I use in my content, with a link to where you can get them.
      </p>

      <h2 className="font-serif text-xl text-foreground mt-8 mb-2">Working with brands</h2>
      <p>
        I work with fashion brands that have something to sell. If that is you,
        have a look at the{' '}
        <a href="/brands" className="text-foreground underline underline-offset-4">For brands</a>{' '}
        page, or send me a short note on the{' '}
        <a href="/contact" className="text-foreground underline underline-offset-4">contact page</a>.
      </p>

      <p>I work online, with people anywhere in the world.</p>
    </InfoPage>
  );
}
