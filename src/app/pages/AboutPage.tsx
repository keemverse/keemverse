import { InfoPage } from '../components/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage eyebrow="Keemverse" title="About Keem">
      <p>
        Hi, I'm Keem. KEEMVERSE is my fashion world: the outfits I wear, the
        photos I shoot, the looks I edit and the pieces I pick. I believe
        style is visual storytelling, and this is where mine lives.
      </p>

      <h2 className="font-serif text-xl text-foreground mt-8 mb-2">What you will find here</h2>
      <p>
        <a href="/gallery" className="text-foreground underline underline-offset-4">The gallery</a>{' '}
        holds frames from my shoots and the looks they became.{' '}
        <a href="/fashion/finds" className="text-foreground underline underline-offset-4">Fashion Finds</a>{' '}
        are pieces I picked for their design, quality or value.{' '}
        <a href="/fashion/presets" className="text-foreground underline underline-offset-4">Lightroom presets</a>{' '}
        are the looks I edit with, packaged so you can use them on your own photos.
      </p>

      <h2 className="font-serif text-xl text-foreground mt-8 mb-2">Working with brands</h2>
      <p>
        I take on a small number of brand collaborations and modeling projects
        that suit the look. A short note through the contact page is the best
        way to start.
      </p>

      <p>
        KEEMVERSE is online-first and works with people around the world.
        For collaborations or questions about any of our products, visit our{' '}
        <a href="/contact" className="text-foreground underline underline-offset-4">
          Contact page
        </a>.
      </p>
    </InfoPage>
  );
}
