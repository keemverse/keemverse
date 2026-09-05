import { InfoPage } from '../components/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage eyebrow="Keemverse" title="About us">
      <p>
        Keemverse is a visual storytelling and digital craft studio operating
        across two universes — Fashion and Digital Craft.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Fashion</h2>
      <p>
        Hi, I'm Keem. I believe style is visual storytelling. I help people
        build wardrobes, campaigns, and creative worlds that feel
        unmistakably theirs — through brand modeling, brand collaborations,
        wardrobe styling, and creative direction — alongside a curated shop
        of fashion finds and Lightroom presets for photographers and
        creators who want a consistent, editorial look.
      </p>

      <h2 className="font-serif text-xl text-stone-900 mt-8 mb-2">Digital Craft</h2>
      <p>
        On the Digital Craft side, I help creators, apparel brands, and
        print businesses solve design and production problems. From custom
        graphics and production-ready artwork to print file optimization
        and repair, I help apparel brands, creators, and print businesses
        deliver creative designs, clean files, and better prints —
        including production-ready graphics and apparel design packs.
      </p>

      <p>
        Keemverse is based in Osogbo, Osun State, Nigeria.
      </p>

      <p>
        For business inquiries, collaborations, or questions about any of
        our products, visit our{' '}
        <a href="/contact" className="text-stone-900 underline underline-offset-4">
          Contact page
        </a>.
      </p>
    </InfoPage>
  );
}
