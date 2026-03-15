import type { Product } from '@/types';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'bddc617e-8864-4d6d-884e-aaa68079b316',
    name: 'Accessory Pouch',
    slug: 'accessory-pouch',
    description: 'A smart organiser for small accessories like hair clips, rubber bands, and tiny essentials. Designed with thoughtful compartments to keep everything neatly sorted and easy to find. Perfect for everyday use and travel.',
    basePrice: 45000,
    category: 'Pouches',
    stock: 50,
    isActive: true,
    features: [
      'Multiple compartments for organization',
      'Compact and lightweight design',
      'Perfect for hair accessories and small items',
      'Durable and easy to clean',
      'Ideal for travel and daily use'
    ],
    images: [
      {
        id: '0258a103-35f5-4c2f-b8a2-4bab2d4fcbcb',
        url: '/images/products/accessories_kit/accessories_kit_1.jpg',
        altText: 'Accessory Pouch - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'beffbc52-76f3-4d43-b21f-495a1839d59e',
        url: '/images/products/accessories_kit/accessories_kit_2.jpg',
        altText: 'Accessory Pouch - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'eb04ece0-4653-4940-8104-7ceaaf62a050',
        url: '/images/products/accessories_kit/accessories_kit_3.jpg',
        altText: 'Accessory Pouch - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: '73a10fd1-5367-4f46-8455-f16e861c6c96',
        url: '/images/products/accessories_kit/accessories_kit_4.jpg',
        altText: 'Accessory Pouch - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '6c549be7-0606-4fb0-929c-5e7c56bf1004',
        url: '/images/products/accessories_kit/accessories_kit_5.jpg',
        altText: 'Accessory Pouch - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: 'e94068f0-817e-4cce-bb61-46dd9061cd17',
    name: 'Toiletry Kit',
    slug: 'toiletry-kit',
    description: "Keep kids' toiletries organised with this compact and travel-friendly pouch. Designed with a clear front for quick visibility, it's perfect for storing creams, hygiene products, and daily essentials. Lightweight, practical, and easy to clean.",
    basePrice: 100000,
    category: 'Travel Kits',
    stock: 40,
    isActive: true,
    features: [
      'Clear front panel for visibility',
      'Water-resistant material',
      'Multiple compartments',
      'Compact and travel-friendly',
      'Easy to clean'
    ],
    images: [
      {
        id: '62d10a12-7bbe-4713-b9f1-18e76b76e47b',
        url: '/images/products/toiletry_kit/toiletry_kit_1.jpg',
        altText: 'Toiletry Kit - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'b0fb2d40-ddc4-4419-b7c7-bb272805a5d2',
        url: '/images/products/toiletry_kit/toiletry_kit_2.jpg',
        altText: 'Toiletry Kit - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: '4d46b395-c2b0-4c44-b913-6bd2bd09b978',
        url: '/images/products/toiletry_kit/toiletry_kit_3.jpg',
        altText: 'Toiletry Kit - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'af80c01b-ba1a-4755-a7ba-9b9a4a78502a',
        url: '/images/products/toiletry_kit/toiletry_kit_4.jpg',
        altText: 'Toiletry Kit - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: 'e58abd70-9d10-4618-9ba7-742b5598184b',
        url: '/images/products/toiletry_kit/toiletry_kit_5.jpg',
        altText: 'Toiletry Kit - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: '655975b3-9bdb-4841-a05f-1d7f325989d6',
    name: 'Foldable Travel Kit',
    slug: 'foldable-travel-kit',
    description: "A compact foldable travel organiser designed to keep kids' essentials neatly sorted. With multiple compartments and a space-saving design, it's perfect for travel, sleepovers, and everyday organisation. Lightweight, practical, and easy to carry.",
    basePrice: 50000,
    category: 'Travel Kits',
    stock: 35,
    isActive: true,
    features: [
      'Foldable space-saving design',
      'Multiple compartments',
      'Perfect for travel and sleepovers',
      'Lightweight and portable',
      'Durable construction'
    ],
    images: [
      {
        id: '7f063ffa-2e41-4211-9437-6132ec9a2281',
        url: '/images/products/foldable_travel_kit/foldable_travel_kit_1.jpg',
        altText: 'Foldable Travel Kit - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'd0ccb2b3-9275-4c78-8f5e-c1877a2f0fa2',
        url: '/images/products/foldable_travel_kit/foldable_travel_kit_2.jpg',
        altText: 'Foldable Travel Kit - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'f76c5d68-23e6-480e-b0b0-202b39a13a21',
        url: '/images/products/foldable_travel_kit/foldable_travel_kit_3.jpg',
        altText: 'Foldable Travel Kit - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: '6a72fe85-272c-4d2b-87a9-44c20036d8a1',
        url: '/images/products/foldable_travel_kit/foldable_travel_kit_4.jpg',
        altText: 'Foldable Travel Kit - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '0deba021-383b-4d44-b50f-416ccffd6bd4',
        url: '/images/products/foldable_travel_kit/foldable_travel_kit_5.jpg',
        altText: 'Foldable Travel Kit - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: 'e8a475ce-3166-461f-b544-e02dfd2f1504',
    name: '7 Days Pack Kit',
    slug: '7-days-pack-kit',
    description: 'Plan outfits and essentials effortlessly with our 7 Days Pack Kit. Seven separate pouches help organise each day of the week, all stored inside one larger pouch for easy packing. Ideal for travel, school trips, and organised routines.',
    basePrice: 260000,
    category: 'Travel Kits',
    stock: 30,
    isActive: true,
    features: [
      'Seven separate daily pouches',
      'One large storage pouch included',
      'Perfect for weekly organization',
      'Ideal for school trips and travel',
      'Easy to pack and unpack'
    ],
    images: [
      {
        id: '6f4c2498-d8f5-42ef-bfaa-8cd4169b1739',
        url: '/images/products/pack_a_week_kit/pack_a_week_kit_1.jpg',
        altText: '7 Days Pack Kit - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: '0492fc28-909a-484d-a30c-94aacd843d62',
        url: '/images/products/pack_a_week_kit/pack_a_week_kit_2.jpg',
        altText: '7 Days Pack Kit - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'dd196528-4e45-4ec1-b00d-3e6e349d380f',
        url: '/images/products/pack_a_week_kit/pack_a_week_kit_3.jpg',
        altText: '7 Days Pack Kit - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'b635c43e-c66c-4207-9d71-c04f65fee6fa',
        url: '/images/products/pack_a_week_kit/pack_a_week_kit_4.jpg',
        altText: '7 Days Pack Kit - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '84cf01a0-2629-4886-88b6-38ac11f36a1b',
        url: '/images/products/pack_a_week_kit/pack_a_week_kit_5.jpg',
        altText: '7 Days Pack Kit - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: 'a92e319c-25c0-4a4e-94d4-f56621a4a5cb',
    name: 'Packing Cubes',
    slug: 'packing-cubes',
    description: "A set of four packing cubes designed to organise clothes, accessories, and essentials inside your suitcase. These lightweight travel organisers maximise space while keeping everything neat and easy to find. Perfect for family travel and kids' packing.",
    basePrice: 250000,
    category: 'Travel Organizers',
    stock: 45,
    isActive: true,
    features: [
      'Set of 4 packing cubes',
      'Space-saving compression design',
      'Lightweight and durable',
      'Perfect for suitcase organization',
      'Easy to identify contents'
    ],
    images: [
      {
        id: 'c219c498-a9cc-4120-907d-ee90b7f34de6',
        url: '/images/products/packing_cubes/packing_cubes_1.jpg',
        altText: 'Packing Cubes - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: '91b9a691-f83f-4efe-930f-335069828d73',
        url: '/images/products/packing_cubes/packing_cubes_2.jpg',
        altText: 'Packing Cubes - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'b38b2881-015b-41da-b512-84dd5fa55267',
        url: '/images/products/packing_cubes/packing_cubes_3.jpg',
        altText: 'Packing Cubes - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'e59c9288-088d-4656-9d52-58a6d43b23aa',
        url: '/images/products/packing_cubes/packing_cubes_4.jpg',
        altText: 'Packing Cubes - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '528aaad7-2456-49c8-8396-229d06babb04',
        url: '/images/products/packing_cubes/packing_cubes_5.jpg',
        altText: 'Packing Cubes - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: 'b9c7c7f2-94fc-4b39-bc06-8d9db1a7341c',
    name: 'Shoe Pouch',
    slug: 'shoe-pouch',
    description: 'A protective shoe pouch designed to keep footwear separate from clothes while travelling. Spacious, easy to pack, and perfect for keeping luggage clean and organised. A must-have travel organiser for kids and families.',
    basePrice: 100000,
    category: 'Travel Organizers',
    stock: 50,
    isActive: true,
    features: [
      'Protects shoes during travel',
      'Keeps luggage clean',
      'Breathable material',
      'Easy to pack and store',
      'Spacious design'
    ],
    images: [
      {
        id: 'bf55f39d-8410-4075-8720-834927d6cf33',
        url: '/images/products/shoe_pouch/shoe_pouch_1.jpg',
        altText: 'Shoe Pouch - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: '2c5a4ee9-95f4-447e-99e6-a6810bcdaacb',
        url: '/images/products/shoe_pouch/shoe_pouch_2.jpg',
        altText: 'Shoe Pouch - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'c17f3aaf-3bf7-4a40-a8a9-d834820db26c',
        url: '/images/products/shoe_pouch/shoe_pouch_3.jpg',
        altText: 'Shoe Pouch - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'd3bf43e2-9b06-4403-938f-87a64082f756',
        url: '/images/products/shoe_pouch/shoe_pouch_4.jpg',
        altText: 'Shoe Pouch - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '4761171d-af83-4f64-83a3-141fd05bc008',
        url: '/images/products/shoe_pouch/shoe_pouch_5.jpg',
        altText: 'Shoe Pouch - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: 'ead82f2c-ea92-4a92-9702-f7e464262639',
    name: 'Multipurpose Pouch',
    slug: 'multipurpose-pouch',
    description: 'A versatile pouch set designed to organise everything from toys and stationery to travel essentials. With multiple sizes and spacious compartments, it keeps everyday items sorted and easy to access. A practical organiser for home and travel.',
    basePrice: 90000,
    category: 'Pouches',
    stock: 40,
    isActive: true,
    features: [
      'Multiple sizes in set',
      'Versatile for various items',
      'Spacious compartments',
      'Perfect for home and travel',
      'Durable construction'
    ],
    images: [
      {
        id: 'e07f0114-5a54-459d-b44d-bfdf8a45c22e',
        url: '/images/products/multipurpose_pouch/1.jpg',
        altText: 'Multipurpose Pouch - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'f41a10ce-dc0a-42ef-922e-9cc7ce779a23',
        url: '/images/products/multipurpose_pouch/2.jpg',
        altText: 'Multipurpose Pouch - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: '3861394d-9b4f-4029-9662-707ca0dceab7',
        url: '/images/products/multipurpose_pouch/3.jpg',
        altText: 'Multipurpose Pouch - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'e3523746-7c5e-43fb-a9b1-84935a563c3e',
        url: '/images/products/multipurpose_pouch/4.jpg',
        altText: 'Multipurpose Pouch - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: '02872f00-9855-4787-9c3f-6ca7d13149a0',
        url: '/images/products/multipurpose_pouch/5.jpg',
        altText: 'Multipurpose Pouch - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: '168eef9e-27c8-409e-b65a-f6ba779f90ce',
    name: 'On-the-Go Foldable Pouch',
    slug: 'on-the-go-foldable-pouch',
    description: 'A smart foldable pouch that opens into organised compartments for quick access to essentials. Perfect for travel, school bags, or day trips when you need everything in one place. Compact when folded, spacious when opened.',
    basePrice: 90000,
    category: 'Pouches',
    stock: 30,
    isActive: true,
    features: [
      'Foldable compact design',
      'Opens to organized compartments',
      'Perfect for day trips',
      'Quick access to essentials',
      'Lightweight and portable'
    ],
    images: [
      {
        id: '9f130f80-9803-464b-be3c-50d1307257f5',
        url: '/images/products/on_the_go_foldable_pouch/on_the_go_foldable_pouch_1.jpg',
        altText: 'On-the-Go Foldable Pouch',
        order: 1,
        isPrimary: true
      }
    ]
  },
  {
    id: '1d4973fe-d94f-464d-87a0-e94b807e9fd6',
    name: 'Dental Kit',
    slug: 'dental-kit',
    description: "A compact dental organiser designed to keep kids' oral care essentials in one place. Perfect for storing toothbrush, toothpaste, and hygiene products during travel or daily routines. Practical, organised, and easy to carry.",
    basePrice: 20000,
    category: 'Specialty Kits',
    stock: 35,
    isActive: true,
    features: [
      'Compact dental organizer',
      'Perfect for toothbrush and toothpaste',
      'Travel-friendly design',
      'Easy to clean',
      'Keeps oral care items organized'
    ],
    images: [
      {
        id: '7a0cceb3-4946-4f25-8700-c94cad3ff28a',
        url: '/images/products/dental_pouch/1.png',
        altText: 'Dental Kit - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: '28c50891-d36c-4787-9375-12ebf64b1a34',
        url: '/images/products/dental_pouch/2.png',
        altText: 'Dental Kit - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'a8dd3fbf-225d-470e-8ae8-2059570eee75',
        url: '/images/products/dental_pouch/3.png',
        altText: 'Dental Kit - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'bfaeda0c-7b04-4f9c-a4cf-283f1039c36a',
        url: '/images/products/dental_pouch/4.png',
        altText: 'Dental Kit - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: 'd8659310-1749-4fcb-8713-2e2f01e954ff',
        url: '/images/products/dental_pouch/5.png',
        altText: 'Dental Kit - Design 5',
        order: 5,
        isPrimary: false
      }
    ]
  },
  {
    id: '313c09df-3e40-44ea-be6c-fb005850e3a0',
    name: 'Crossbody Bag',
    slug: 'crossbody-bag',
    description: "A lightweight crossbody bag designed especially for kids' little adventures. Spacious enough for small essentials while staying comfortable and easy to carry. Available in fun prints kids will love.",
    basePrice: 65000,
    category: 'Bags',
    stock: 50,
    isActive: true,
    features: [
      'Lightweight design',
      'Perfect for kids',
      'Adjustable strap',
      'Fun and colorful prints',
      'Spacious for essentials'
    ],
    images: [
      {
        id: 'cb1a0e3f-7d24-4a1b-9e6c-3f8b5a2d1c0e',
        url: '/images/products/crossbody_bag/crossbody_bag_1.png',
        altText: 'Crossbody Bag - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
        url: '/images/products/crossbody_bag/crossbody_bag_2.png',
        altText: 'Crossbody Bag - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'd7e8f9a0-b1c2-4d3e-8f4a-5b6c7d8e9f0a',
        url: '/images/products/crossbody_bag/crossbody_bag_3.png',
        altText: 'Crossbody Bag - Design 3',
        order: 3,
        isPrimary: false
      }
    ]
  },
  {
    id: '099cc195-d44c-4557-b7ff-1a0ceb1e7659',
    name: 'Medicine Kit',
    slug: 'medicine-kit',
    description: "A travel-friendly medicine organiser designed to keep your child's medicines neatly arranged. Dedicated loops hold bottles securely to prevent spills, with enough space for strips, syrups, and essentials. Perfect for travel and everyday preparedness.",
    basePrice: 45000,
    category: 'Specialty Kits',
    stock: 50,
    isActive: true,
    features: [
      'Secure bottle loops',
      'Prevents medicine spills',
      'Organized compartments',
      'Perfect for travel',
      'Easy to carry'
    ],
    images: [
      {
        id: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
        url: '/images/products/medice_kit/medicine_kit_1.jpg',
        altText: 'Medicine Kit - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'a3b4c5d6-e7f8-4a9b-8c0d-1e2f3a4b5c6d',
        url: '/images/products/medice_kit/medicine_kit_2.jpg',
        altText: 'Medicine Kit - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'b4c5d6e7-f8a9-4b0c-8d1e-2f3a4b5c6d7e',
        url: '/images/products/medice_kit/medicine_kit_3.jpg',
        altText: 'Medicine Kit - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'c5d6e7f8-a9b0-4c1d-8e2f-3a4b5c6d7e8f',
        url: '/images/products/medice_kit/medicine_kit_4.jpg',
        altText: 'Medicine Kit - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: 'd6e7f8a9-b0c1-4d2e-8f3a-4b5c6d7e8f9a',
        url: '/images/products/medice_kit/medicine_kit_5.jpg',
        altText: 'Medicine Kit - Design 5',
        order: 5,
        isPrimary: false
      },
      {
        id: 'e7f8a9b0-c1d2-4e3f-8a4b-5c6d7e8f9a0b',
        url: '/images/products/medice_kit/medicine_kit_6.jpg',
        altText: 'Medicine Kit - Design 6',
        order: 6,
        isPrimary: false
      },
      {
        id: 'f8a9b0c1-d2e3-4f4a-8b5c-6d7e8f9a0b1c',
        url: '/images/products/medice_kit/medicine_kit_7.jpg',
        altText: 'Medicine Kit - Design 7',
        order: 7,
        isPrimary: false
      },
      {
        id: 'a9b0c1d2-e3f4-4a5b-8c6d-7e8f9a0b1c2d',
        url: '/images/products/medice_kit/medicine_kit_8.jpg',
        altText: 'Medicine Kit - Design 8',
        order: 8,
        isPrimary: false
      },
      {
        id: 'b0c1d2e3-f4a5-4b6c-8d7e-8f9a0b1c2d3e',
        url: '/images/products/medice_kit/medicine_kit_9.jpg',
        altText: 'Medicine Kit - Design 9',
        order: 9,
        isPrimary: false
      },
      {
        id: 'c1d2e3f4-a5b6-4c7d-8e8f-9a0b1c2d3e4f',
        url: '/images/products/medice_kit/medicine_kit_10.jpg',
        altText: 'Medicine Kit - Design 10',
        order: 10,
        isPrimary: false
      },
      {
        id: 'd2e3f4a5-b6c7-4d8e-8f9a-0b1c2d3e4f5a',
        url: '/images/products/medice_kit/medicine_kit_11.png',
        altText: 'Medicine Kit - Design 11',
        order: 11,
        isPrimary: false
      }
    ]
  },
  {
    id: 'c17724c2-3608-47c6-9ee5-ee791d7baf21',
    name: 'Pencil Pouch',
    slug: 'pencil-pouch',
    description: 'A clever pencil pouch that also works as a standing pencil organiser. With multiple compartments for pencils, crayons, and stationery, it keeps study time neat and organised. Spacious, functional, and fun for kids.',
    basePrice: 55000,
    category: 'Specialty Kits',
    stock: 50,
    isActive: true,
    features: [
      'Dual-function design',
      'Standing pencil organizer',
      'Multiple compartments',
      'Perfect for study time',
      'Fun and functional'
    ],
    images: [
      {
        id: 'e3f4a5b6-c7d8-4e9f-8a0b-1c2d3e4f5a6b',
        url: '/images/products/pencil_pouch/pencil_pouch_1.png',
        altText: 'Pencil Pouch - Design 1',
        order: 1,
        isPrimary: true
      },
      {
        id: 'f4a5b6c7-d8e9-4f0a-8b1c-2d3e4f5a6b7c',
        url: '/images/products/pencil_pouch/pencil_pouch_2.png',
        altText: 'Pencil Pouch - Design 2',
        order: 2,
        isPrimary: false
      },
      {
        id: 'a5b6c7d8-e9f0-4a1b-8c2d-3e4f5a6b7c8d',
        url: '/images/products/pencil_pouch/pencil_pouch_3.png',
        altText: 'Pencil Pouch - Design 3',
        order: 3,
        isPrimary: false
      },
      {
        id: 'b6c7d8e9-f0a1-4b2c-8d3e-4f5a6b7c8d9e',
        url: '/images/products/pencil_pouch/pencil_pouch_4.png',
        altText: 'Pencil Pouch - Design 4',
        order: 4,
        isPrimary: false
      },
      {
        id: 'c7d8e9f0-a1b2-4c3d-8e4f-5a6b7c8d9e0f',
        url: '/images/products/pencil_pouch/pencil_pouch_5.png',
        altText: 'Pencil Pouch - Design 5',
        order: 5,
        isPrimary: false
      },
      {
        id: 'd8e9f0a1-b2c3-4d4e-8f5a-6b7c8d9e0f1a',
        url: '/images/products/pencil_pouch/pencil_pouch_6.png',
        altText: 'Pencil Pouch - Design 6',
        order: 6,
        isPrimary: false
      },
      {
        id: 'e9f0a1b2-c3d4-4e5f-8a6b-7c8d9e0f1a2b',
        url: '/images/products/pencil_pouch/pencil_pouch_7.png',
        altText: 'Pencil Pouch - Design 7',
        order: 7,
        isPrimary: false
      },
      {
        id: 'f0a1b2c3-d4e5-4f6a-8b7c-8d9e0f1a2b3c',
        url: '/images/products/pencil_pouch/pencil_pouch_8.png',
        altText: 'Pencil Pouch - Design 8',
        order: 8,
        isPrimary: false
      },
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c8d-9e0f1a2b3c4d',
        url: '/images/products/pencil_pouch/pencil_pouch_9.png',
        altText: 'Pencil Pouch - Design 9',
        order: 9,
        isPrimary: false
      },
      {
        id: 'b2c3d4e5-f6a7-4b8c-8d9e-0f1a2b3c4d5e',
        url: '/images/products/pencil_pouch/pencil_pouch_10.png',
        altText: 'Pencil Pouch - Design 10',
        order: 10,
        isPrimary: false
      },
      {
        id: 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f',
        url: '/images/products/pencil_pouch/pencil_pouch_11.jpg',
        altText: 'Pencil Pouch - Design 11',
        order: 11,
        isPrimary: false
      }
    ]
  }
];
