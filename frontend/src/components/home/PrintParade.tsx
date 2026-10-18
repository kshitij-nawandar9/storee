import { Link } from 'react-router-dom';
import Img from '@/components/common/Img';

interface ParadeItem {
  src: string;
  alt: string;
  slug: string;
}

const item = (folder: string, file: string, name: string, slug: string): ParadeItem => ({
  src: `/images/products/${folder}/${file}`,
  alt: `${name} in the ${file.replace(/(_set)?\.(png|jpg)$/i, '')} print`,
  slug,
});

const ROW_ONE: ParadeItem[] = [
  item('kids_bag', 'Unicorn.png', 'Kids bag', 'kids-bag'),
  item('pencil_pouch', 'Space.png', 'Pencil pouch', 'pencil-pouch'),
  item('duffle_bag', 'Marine.png', 'Duffle bag', 'duffle-bag'),
  item('sunglasses_pouch', 'Rainbow.png', 'Sunglasses pouch', 'sunglasses-pouch'),
  item('activity_bag', 'Jungle Safari.png', 'Activity bag', 'activity-bag'),
  item('toddlers_bag', 'Lion.png', 'Toddlers bag', 'toddlers-bag'),
  item('packing_cubes', 'Sports.png', 'Packing cubes', 'packing-cubes'),
  item('dental_kit', 'Bunny.png', 'Dental kit', 'dental-kit'),
];

const ROW_TWO: ParadeItem[] = [
  item('crossbody_bag', 'Unicorn.png', 'Crossbody bag', 'crossbody-bag'),
  item('shoe_pouch', 'Aqua.jpg', 'Shoe pouch', 'shoe-pouch'),
  item('on_the_go_foldable_pouch', 'Beach.png', 'On-the-go pouch', 'on-the-go-foldable-pouch'),
  item('medicine_kit', 'Space.jpg', 'Medicine kit', 'medicine-kit'),
  item('foldable_travel_kit', 'Rainbow.jpg', 'Foldable travel kit', 'foldable-travel-kit'),
  item('multipurpose_pouch', 'Space_set.png', 'Multipurpose pouch set', 'multipurpose-pouch'),
  item('toiletry_kit', 'Lion.jpg', 'Toiletry kit', 'toiletry-kit'),
  item('kids_bag', 'Sports.png', 'Kids bag', 'kids-bag'),
];

function Row({ items, reverse = false }: { items: ParadeItem[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden py-3">
      <div className={reverse ? 'marquee-track-reverse' : 'marquee-track'} style={{ animationDuration: reverse ? '46s' : '40s' }}>
        {[0, 1].map((pass) =>
          items.map((it, i) => (
            <Link
              key={`${pass}-${it.src}`}
              to={`/products/${it.slug}`}
              tabIndex={pass === 1 ? -1 : undefined}
              aria-hidden={pass === 1 ? true : undefined}
              className="parade-card relative mx-2 block w-[132px] shrink-0 overflow-hidden rounded-2xl sm:mx-3 sm:w-[180px]"
              style={{
                aspectRatio: '4 / 5',
                background: '#F8EDDA',
                transform: `rotate(${i % 2 === 0 ? -2.5 : 2.5}deg)`,
                boxShadow: '0 12px 28px -18px rgba(59,42,38,0.4)',
              }}
            >
              <Img src={it.src} alt={pass === 1 ? '' : it.alt} sizes="180px" className="h-full w-full object-cover" loading="lazy" decoding="async" draggable={false} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/** Two rows of products gliding past in opposite directions. Hover pauses a row. */
export default function PrintParade() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14" style={{ background: '#FDF6EC' }} aria-label="Product print parade">
      <div className="mx-auto mb-4 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif font-medium" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', letterSpacing: '-0.02em', color: '#2a2220' }}>
          The print parade <span className="font-hand text-[0.8em]" style={{ color: '#C4756E' }}>(it never stops)</span>
        </h2>
        <Link to="/products" className="arrow-nudge hidden shrink-0 text-sm font-semibold sm:inline-flex items-center gap-1" style={{ color: '#C4756E' }}>
          See everything <span className="arrow-icon">&rarr;</span>
        </Link>
      </div>
      <Row items={ROW_ONE} />
      <Row items={ROW_TWO} reverse />
    </section>
  );
}
