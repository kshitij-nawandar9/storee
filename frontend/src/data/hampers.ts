import type { Product, ProductVariant } from '@/types';

export type HamperBudget = 'under-500' | 'under-800' | 'under-1100';

export interface RakhiHamper extends Product {
  budget: HamperBudget;
  budgetLabel: string;
  includes: string[];
  giftNote: string;
  ribbon: string;
  accent: string;
}

const image = (path: string) => `/images/hampers/${path}`;

const printNames = ['Aqua', 'Beach', 'Bunny', 'Rainbow', 'Lion', 'Jungle Safari', 'Marine', 'Space', 'Sports', 'Unicorn'] as const;
type HamperPrint = typeof printNames[number];

interface HamperPrintImage {
  name: HamperPrint;
  file: string;
}

const printColors: Record<HamperPrint, string> = {
  Aqua: '#1E7FD8',
  Beach: '#FADADD',
  Bunny: '#1A2744',
  Rainbow: '#F8C8D0',
  Lion: '#5BA3A0',
  'Jungle Safari': '#4A7C59',
  Marine: '#1B4D8E',
  Space: '#2C2C54',
  Sports: '#E85D3A',
  Unicorn: '#D4A0D4',
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const printFile = (name: HamperPrint) => `${name}.png`;

const withPrintFiles = (names: readonly HamperPrint[]): HamperPrintImage[] =>
  names.map((name) => ({ name, file: printFile(name) }));

const images = (base: string, entries: HamperPrintImage[]) =>
  entries.map((entry, index) => ({
    id: `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    url: image(`${base}/${entry.file}`),
    altText: `${base.replace(/\s+/g, ' ')} hamper - ${entry.name}`,
    order: index + 1,
    isPrimary: index === 0,
  }));

const variants = (
  productId: string,
  base: string,
  price: number,
  entries: HamperPrintImage[],
  defaultPrint?: HamperPrint
): ProductVariant[] => {
  const activeDefault = defaultPrint || entries[0]?.name;

  return entries.map((entry) => ({
    id: `${productId}-${slugify(entry.name)}`,
    productId,
    colorName: entry.name,
    colorCode: printColors[entry.name],
    image: image(`${base}/${entry.file}`),
    price,
    stock: 20,
    sku: `${productId.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-${slugify(entry.name).toUpperCase()}`,
    isDefault: entry.name === activeDefault,
    isActive: true,
  }));
};

const crossbodyPrints = withPrintFiles(printNames);

const toiletryPrints = withPrintFiles(printNames);

const dufflePrints = withPrintFiles(printNames);

const multipurposePrints = withPrintFiles([
  'Jungle Safari',
  'Marine',
  'Space',
  'Sports',
  'Unicorn',
  'Beach',
  'Lion',
  'Bunny',
  'Rainbow',
  'Aqua',
]);

const activityPrints = withPrintFiles(printNames);

const foldablePrints = withPrintFiles([
  'Jungle Safari',
  'Space',
  'Bunny',
  'Marine',
  'Unicorn',
  'Beach',
  'Aqua',
  'Lion',
  'Rainbow',
]);

const backpackPrints = withPrintFiles(printNames);

export const RAKHI_HAMPERS: RakhiHamper[] = [
  {
    id: 'rakhi-crossbody-keychain',
    name: 'Crossbody + Keychain Hamper',
    slug: 'rakhi-crossbody-keychain',
    description: 'A bright crossbody bag paired with a personalised name keychain. A sweet, useful Rakhi gift for little explorers.',
    basePrice: 49900,
    category: 'Rakhi Hampers',
    stock: 24,
    isActive: true,
    budget: 'under-500',
    budgetLabel: 'Under ₹500',
    giftNote: 'Best for tiny outings and everyday treasures.',
    ribbon: 'Name keychain included',
    accent: '#1E7FD8',
    size: 'Gift-ready combo',
    includes: ['Crossbody bag', 'Personalised keychain', 'Gift-ready styling'],
    features: ['Personalised name keychain included', 'Lightweight crossbody bag', 'Fun prints for kids', 'Limited Rakhi drop'],
    images: images('UNDER 500/CROSSBODY + KEYCHAIN ', crossbodyPrints),
    variants: variants('rakhi-crossbody-keychain', 'UNDER 500/CROSSBODY + KEYCHAIN ', 49900, crossbodyPrints),
  },
  {
    id: 'rakhi-toiletry-sunglasses-keychain',
    name: 'Toiletry + Sunglasses + Keychain Hamper',
    slug: 'rakhi-toiletry-sunglasses-keychain',
    description: 'A cheerful toiletry pouch bundled with sunglasses and a personalised keychain for a playful Rakhi surprise.',
    basePrice: 49900,
    category: 'Rakhi Hampers',
    stock: 20,
    isActive: true,
    budget: 'under-500',
    budgetLabel: 'Under ₹500',
    giftNote: 'A compact gift with a holiday-ready mood.',
    ribbon: '3-piece gift combo',
    accent: '#E85D3A',
    size: 'Gift-ready combo',
    includes: ['Toiletry pouch', 'Sunglasses', 'Personalised keychain'],
    features: ['Three useful pieces in one gift', 'Personalised name keychain included', 'Travel-friendly pouch', 'Limited Rakhi drop'],
    images: images('UNDER 500/TOILETRY + SUNGLASSES + KEYCHAIN ', toiletryPrints),
    variants: variants('rakhi-toiletry-sunglasses-keychain', 'UNDER 500/TOILETRY + SUNGLASSES + KEYCHAIN ', 49900, toiletryPrints),
  },
  {
    id: 'rakhi-duffle-keychain',
    name: 'Duffle Bag + Keychain Hamper',
    slug: 'rakhi-duffle-keychain',
    description: 'A roomy duffle bag with a personalised keychain, made for sleepovers, sports days, and weekend plans.',
    basePrice: 79900,
    category: 'Rakhi Hampers',
    stock: 18,
    isActive: true,
    budget: 'under-800',
    budgetLabel: 'Under ₹800',
    giftNote: 'The most useful pick for kids always on the move.',
    ribbon: 'Weekend-ready gift',
    accent: '#C4756E',
    size: 'Gift-ready combo',
    includes: ['Duffle bag', 'Personalised keychain', 'Free custom name'],
    features: ['Spacious duffle bag', 'Personalised name keychain included', 'Great for travel and activities', 'Limited Rakhi drop'],
    images: images('UNDER 800/DUFFLE BAG + KEYCHAIN ', dufflePrints),
    variants: variants('rakhi-duffle-keychain', 'UNDER 800/DUFFLE BAG + KEYCHAIN ', 79900, dufflePrints),
  },
  {
    id: 'rakhi-multipurpose-keychain',
    name: 'Multipurpose Pouch + Keychain Hamper',
    slug: 'rakhi-multipurpose-keychain',
    description: 'A set of multipurpose pouches paired with a personalised keychain for stationery, toys, travel bits, and daily chaos.',
    basePrice: 79900,
    category: 'Rakhi Hampers',
    stock: 22,
    isActive: true,
    budget: 'under-800',
    budgetLabel: 'Under ₹800',
    giftNote: 'Perfect when you want one gift that solves many little messes.',
    ribbon: 'Organiser favourite',
    accent: '#C9A96E',
    size: 'Gift-ready combo',
    includes: ['Multipurpose pouch set', 'Personalised keychain', 'Free custom name'],
    features: ['Multiple pouch sizes', 'Personalised name keychain included', 'Great for school and travel', 'Limited Rakhi drop'],
    images: images('UNDER 800/MULTIPURPOSE POUCH + KEYCHAIN', multipurposePrints),
    variants: variants('rakhi-multipurpose-keychain', 'UNDER 800/MULTIPURPOSE POUCH + KEYCHAIN', 79900, multipurposePrints),
  },
  {
    id: 'rakhi-activity-keychain',
    name: 'Activity Bag + Keychain Hamper',
    slug: 'rakhi-activity-keychain',
    description: 'A playful activity bag bundled with a personalised keychain for art supplies, outings, classes, and gifting.',
    basePrice: 109900,
    category: 'Rakhi Hampers',
    stock: 16,
    isActive: true,
    budget: 'under-1100',
    budgetLabel: 'Under ₹1100',
    giftNote: 'For the sibling who carries creativity everywhere.',
    ribbon: 'Creative kid pick',
    accent: '#8BA88A',
    size: 'Gift-ready combo',
    includes: ['Activity bag', 'Personalised keychain', 'Free custom name'],
    features: ['Roomy activity bag', 'Personalised name keychain included', 'Useful for classes and outings', 'Limited Rakhi drop'],
    images: images('UNDER 1100/acctivity bag + keychain', activityPrints),
    variants: variants('rakhi-activity-keychain', 'UNDER 1100/acctivity bag + keychain', 109900, activityPrints),
  },
  {
    id: 'rakhi-foldable-toiletry',
    name: 'Foldable Travel Kit + Toiletry Kit Hamper',
    slug: 'rakhi-foldable-toiletry',
    description: 'A travel-ready organiser duo for kids who love sleepovers, vacations, and having every little thing in place.',
    basePrice: 109900,
    category: 'Rakhi Hampers',
    stock: 15,
    isActive: true,
    budget: 'under-1100',
    budgetLabel: 'Under ₹1100',
    giftNote: 'The practical hamper parents secretly love too.',
    ribbon: 'Travel duo',
    accent: '#A85D56',
    size: 'Gift-ready combo',
    includes: ['Foldable travel kit', 'Toiletry kit', 'Gift-ready styling'],
    features: ['Two organiser essentials', 'Great for vacations and school trips', 'Easy to pack and use', 'Limited Rakhi drop'],
    images: images('UNDER 1100/foldable travel kit + toiletry kit', foldablePrints),
    variants: variants('rakhi-foldable-toiletry', 'UNDER 1100/foldable travel kit + toiletry kit', 109900, foldablePrints),
  },
  {
    id: 'rakhi-backpack-pencil',
    name: 'Small Backpack + Pencil Pouch Hamper',
    slug: 'rakhi-backpack-pencil',
    description: 'A cute backpack and matching pencil pouch bundle for school days, playdates, and Rakhi gifting.',
    basePrice: 109900,
    category: 'Rakhi Hampers',
    stock: 17,
    isActive: true,
    budget: 'under-1100',
    budgetLabel: 'Under ₹1100',
    giftNote: 'A big-smile gift for school and everyday adventures.',
    ribbon: 'School-ready combo',
    accent: '#1B4D8E',
    size: 'Gift-ready combo',
    includes: ['Small backpack', 'Pencil pouch', 'Gift-ready styling'],
    features: ['Backpack plus matching pouch', 'Useful for school and outings', 'Fun kid-friendly prints', 'Limited Rakhi drop'],
    images: images('UNDER 1100/small backpack + pencil pouch', backpackPrints),
    variants: variants('rakhi-backpack-pencil', 'UNDER 1100/small backpack + pencil pouch', 109900, backpackPrints),
  },
];

export const RAKHI_BUDGETS: { id: 'all' | HamperBudget; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'All Hampers', shortLabel: 'All' },
  { id: 'under-500', label: 'Under ₹500', shortLabel: '₹500' },
  { id: 'under-800', label: 'Under ₹800', shortLabel: '₹800' },
  { id: 'under-1100', label: 'Under ₹1100', shortLabel: '₹1100' },
];
