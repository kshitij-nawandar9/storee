import type { Product } from '@/types';

// Mock product data using the images you've added
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Medicine Pouch',
    slug: 'medicine-pouch',
    description: 'Perfect for organizing medicines and small essentials. Compact and durable design.',
    basePrice: 69900, // ₹699.00
    category: 'pouch',
    stock: 50,
    isActive: true,
    images: [
      {
        id: '1-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.29 AM.jpeg',
        altText: 'Medicine Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '2',
    name: 'Travel Organizer Pouch',
    slug: 'travel-organizer-pouch',
    description: 'Compact organizer for travel essentials. Keep your items organized on the go.',
    basePrice: 89900, // ₹899.00
    category: 'pouch',
    stock: 45,
    isActive: true,
    images: [
      {
        id: '2-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.30 AM.jpeg',
        altText: 'Travel Organizer Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '3',
    name: 'School Pouch',
    slug: 'school-pouch',
    description: 'Perfect for school supplies. Keep your stationery organized and easily accessible.',
    basePrice: 59900, // ₹599.00
    category: 'pouch',
    stock: 60,
    isActive: true,
    images: [
      {
        id: '3-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.30 AM (1).jpeg',
        altText: 'School Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '4',
    name: 'Cosmetic Pouch',
    slug: 'cosmetic-pouch',
    description: 'Stylish pouch for cosmetics and toiletries. Keep your beauty essentials organized.',
    basePrice: 79900, // ₹799.00
    category: 'pouch',
    stock: 40,
    isActive: true,
    images: [
      {
        id: '4-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.30 AM (2).jpeg',
        altText: 'Cosmetic Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '5',
    name: 'Electronics Pouch',
    slug: 'electronics-pouch',
    description: 'Protective pouch for electronic devices and cables. Keep your gadgets safe.',
    basePrice: 99900, // ₹999.00
    category: 'pouch',
    stock: 35,
    isActive: true,
    images: [
      {
        id: '5-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.31 AM.jpeg',
        altText: 'Electronics Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '6',
    name: 'Lunch Bag Pouch',
    slug: 'lunch-bag-pouch',
    description: 'Insulated lunch bag to keep your food fresh. Perfect for school and office.',
    basePrice: 84900, // ₹849.00
    category: 'pouch',
    stock: 55,
    isActive: true,
    images: [
      {
        id: '6-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.31 AM (1).jpeg',
        altText: 'Lunch Bag Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '7',
    name: 'Swim Bag Pouch',
    slug: 'swim-bag-pouch',
    description: 'Waterproof bag for swim essentials. Keep your wet items separate and organized.',
    basePrice: 74900, // ₹749.00
    category: 'pouch',
    stock: 42,
    isActive: true,
    images: [
      {
        id: '7-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.32 AM.jpeg',
        altText: 'Swim Bag Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
  {
    id: '8',
    name: 'Storage Pouch',
    slug: 'storage-pouch',
    description: 'Versatile storage pouch for various items. Perfect for organizing your space.',
    basePrice: 64900, // ₹649.00
    category: 'pouch',
    stock: 48,
    isActive: true,
    images: [
      {
        id: '8-1',
        url: '/images/products/WhatsApp Image 2026-01-09 at 8.36.32 AM (1).jpeg',
        altText: 'Storage Pouch',
        order: 1,
        isPrimary: true,
      },
    ],
    features: [
      'Multipurpose Storage',
      'Water-Resistant Protection',
      'Durable & Easy to Wash',
      'Perfect for Travel',
      'Stylish & Functional',
    ],
  },
];
