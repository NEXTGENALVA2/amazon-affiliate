import type { Product } from '../types';

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  sections: BlogSection[];
  relatedProductIds: string[];
  relatedProductKeywords: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'choose-dual-basket-air-fryer',
    title: 'How to Choose an Air Fryer for Your Kitchen',
    description: 'Compare air fryer capacity, counter space, controls, cleaning, and return terms before choosing a model for everyday cooking.',
    category: 'Kitchen Buying Guide',
    publishedAt: '2026-11-18',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Start with portions and counter space',
        paragraphs: [
          'Think about the portions you normally prepare and how often you cook more than one food at a time. Measure the counter space, including room to open the basket and follow the manufacturer’s ventilation guidance. A larger capacity is useful only if it fits your kitchen and routine.',
          'Compare the appliance’s outside dimensions with its usable basket space. Product names and headline capacity do not always tell you how much room a particular meal will have.',
        ],
      },
      {
        heading: 'Choose controls and cleanup you will use',
        paragraphs: [
          'Check temperature and timer controls, preset options, and whether the basket and crisper plate are easy to remove. Read the current cleaning instructions before assuming parts are dishwasher-safe.',
          'For a dual-basket model, confirm how the two zones work independently and whether the controls can coordinate their finish times. If you usually cook one small portion, a simpler model may take less counter and storage space.',
        ],
        bullets: [
          'Measure the appliance footprint and cabinet clearance.',
          'Check basket capacity, cleaning instructions, and included accessories.',
          'Review the exact model, seller, warranty, and return terms.',
        ],
      },
      {
        heading: 'Verify the listing before you buy',
        paragraphs: [
          'Kefayaan’s catalog includes a Ninja Air Fryer Pro 5-Qt 4-in-1 as an option to compare. Confirm its current configuration, price, availability, and delivery terms on the retailer’s page. This guide is a shopping checklist, not a claim of independent appliance testing.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['ninja air fryer'],
  },
  {
    slug: 'choose-wireless-earbuds',
    title: 'How to Choose Wireless Earbuds for Everyday Use',
    description: 'A practical wireless-earbud checklist for fit, calls, device compatibility, battery details, and return policies.',
    category: 'Audio Buying Guide',
    publishedAt: '2026-11-18',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Fit your real listening routine',
        paragraphs: [
          'List where you expect to use earbuds: commuting, calls, study, or exercise. Fit and comfort vary from person to person, so check the available ear-tip sizes and the return policy before relying on a long-wear fit.',
          'Earbuds do not make every setting quiet. If noise reduction is important, verify that the exact model includes the feature you need instead of assuming it from a product category or photo.',
        ],
      },
      {
        heading: 'Check calls, controls, and compatibility',
        paragraphs: [
          'Confirm compatibility with your phone and computer, how the earbuds pair, and how they handle switching between devices. Check the current listing for microphone, call-control, charging-case, and connection details.',
        ],
        bullets: [
          'Check fit options and the retailer’s return window.',
          'Verify microphone, controls, pairing, and charging connector.',
          'Read the stated battery conditions and warranty terms.',
        ],
      },
      {
        heading: 'Compare the exact model and seller',
        paragraphs: [
          'The Kefayaan catalog lists JBL Vibe Beam wireless earbuds as an example to compare. Verify the exact model, included accessories, seller, current price, and return terms on the retailer’s listing. This guide is not a hands-on sound or microphone test.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['jbl vibe beam'],
  },
  {
    slug: 'choose-renewed-ipad',
    title: 'What to Check Before Buying a Renewed iPad',
    description: 'Check storage, Wi-Fi needs, device condition, included accessories, software compatibility, and return coverage before buying a renewed iPad.',
    category: 'Tablet Buying Guide',
    publishedAt: '2026-11-18',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Match the tablet to what you will do',
        paragraphs: [
          'Make a short list of the apps and tasks you need, such as reading, video, browsing, or schoolwork. Check the exact model and software compatibility for those tasks rather than relying on the iPad name alone.',
          'The catalog example is a 10.2-inch Wi-Fi model with 32GB storage, listed as renewed. Storage can fill quickly with downloaded media and large apps, so estimate what you plan to keep on the device.',
        ],
      },
      {
        heading: 'Understand the renewed condition',
        paragraphs: [
          'Renewed condition, included accessories, battery expectations, warranty, and return coverage depend on the specific seller and listing. Read those terms carefully and check what support is available if the device arrives with a problem.',
        ],
        bullets: [
          'Verify model, storage, Wi-Fi/cellular configuration, and included charger.',
          'Read the condition grade, warranty, and return policy.',
          'Check software support for the apps you plan to use.',
        ],
      },
      {
        heading: 'Confirm price and seller before checkout',
        paragraphs: [
          'Kefayaan lists an Apple iPad 10.2-inch, Wi-Fi, 32GB, Space Gray (Renewed) as an option to inspect. Confirm its exact condition, seller, included items, current price, and return terms on the retailer’s page. This is a listing example, not a hands-on device review.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['apple ipad'],
  },
  {
    slug: 'choose-battery-video-doorbell',
    title: 'What to Check Before Buying a Battery Video Doorbell',
    description: 'Check Wi-Fi, chime compatibility, installation, subscriptions, privacy settings, and return terms before choosing a video doorbell.',
    category: 'Home Security Buying Guide',
    publishedAt: '2026-11-19',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Check your entryway and Wi-Fi first',
        paragraphs: [
          'Before choosing a doorbell, check the mounting location, available Wi-Fi signal, and whether you want to use an existing chime. Verify the exact model’s installation requirements and compatibility with your current setup.',
        ],
      },
      {
        heading: 'Understand storage, alerts, and privacy',
        paragraphs: [
          'Review how motion alerts work, what video storage options are available, and whether any features require a paid subscription. Read the current privacy and data-retention controls so the device fits your household’s preferences.',
        ],
        bullets: [
          'Confirm dimensions, mounting hardware, and installation requirements.',
          'Check chime, Wi-Fi, app, and subscription compatibility.',
          'Review warranty, return terms, and privacy controls.',
        ],
      },
      {
        heading: 'Compare the listed model carefully',
        paragraphs: [
          'The Kefayaan catalog includes a Ring Battery Doorbell with Chime as an option to review. Check the exact model generation, what is included, seller, current price, and any subscription requirements on the retailer’s page. We do not claim independent testing of this device.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['ring battery doorbell'],
  },
  {
    slug: 'choose-kitchen-shears',
    title: 'How to Choose Kitchen Shears for Everyday Food Prep',
    description: 'Compare grip, blade care, protective storage, cleaning instructions, and return terms when choosing kitchen shears.',
    category: 'Kitchen Buying Guide',
    publishedAt: '2026-11-19',
    readingMinutes: 4,
    sections: [
      {
        heading: 'Choose a comfortable grip and useful size',
        paragraphs: [
          'Consider what you plan to cut and whether the handle feels comfortable for your hand. Check blade length, grip shape, and whether the shears are designed to separate for cleaning before relying on a product photo.',
        ],
      },
      {
        heading: 'Check cleaning and safe storage',
        paragraphs: [
          'Read the manufacturer’s care instructions for the exact model. A protective sheath can help with storage, but keep sharp tools out of reach of children and use them only for their intended tasks.',
        ],
        bullets: [
          'Verify blade material, handle fit, and whether the blades separate.',
          'Confirm dishwasher guidance and drying instructions.',
          'Check the sheath, warranty, and return terms.',
        ],
      },
      {
        heading: 'Review the product listing',
        paragraphs: [
          'Kefayaan lists KitchenAid All Purpose Kitchen Shears with a protective sheath as an example to compare. Confirm the current materials, care instructions, included sheath, seller, and price on the retailer’s page. This guide is not a durability test.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['kitchenaid all purpose kitchen shears'],
  },
  {
    slug: 'choose-portable-food-warmer',
    title: 'How to Choose a Portable Food Warmer for Work or Travel',
    description: 'Compare capacity, power requirements, cleaning, portability, and safe food handling before choosing a portable food warmer.',
    category: 'Kitchen Buying Guide',
    publishedAt: '2026-11-19',
    readingMinutes: 4,
    sections: [
      {
        heading: 'Start with portion size and where you will use it',
        paragraphs: [
          'Estimate the meal size you want to carry and check the container’s dimensions. Consider where you will use the warmer and what power source the exact model requires; do not assume it works without an outlet or with every vehicle connection.',
        ],
      },
      {
        heading: 'Check cleaning and food-safety directions',
        paragraphs: [
          'Read the instructions for heating, cleaning, and handling food. Follow the manufacturer’s guidance for safe temperatures and timing, especially when transporting perishable meals. Confirm which parts can be removed and how they should be washed.',
        ],
        bullets: [
          'Verify capacity, dimensions, cord, and power requirements.',
          'Check removable-container and cleaning instructions.',
          'Review the warranty, return terms, and included accessories.',
        ],
      },
      {
        heading: 'Verify the exact listing',
        paragraphs: [
          'The Kefayaan catalog features a 20-ounce Crock-Pot Portable Electric Lunch Box as an option to compare. Confirm its exact power requirements, included parts, current price, seller, and delivery terms on the retailer’s page. This guide is not a product safety or heating-performance test.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['crock-pot portable electric lunch box'],
  },
  {
    slug: 'choose-slim-two-slice-toaster',
    title: 'How to Choose a Slim Two-Slice Toaster for a Small Kitchen',
    description: 'Compare counter footprint, slot size, controls, crumb cleanup, and return terms when choosing a compact two-slice toaster.',
    category: 'Kitchen Buying Guide',
    publishedAt: '2026-11-19',
    readingMinutes: 4,
    sections: [
      {
        heading: 'Measure your counter and storage space',
        paragraphs: [
          'Measure the area where the toaster will sit and check whether there is enough clearance around it. Compare the appliance’s actual dimensions with your counter and storage space rather than assuming “slim” means it fits every kitchen.',
        ],
      },
      {
        heading: 'Check the settings and cleaning steps',
        paragraphs: [
          'Review the available shade and cancel controls, the slot size for the foods you normally toast, and the manufacturer’s crumb-cleaning instructions. Check the cord position and any safety guidance before choosing a permanent spot.',
        ],
        bullets: [
          'Compare exterior dimensions and slot size.',
          'Check controls, crumb removal, and cleaning instructions.',
          'Review warranty, seller, and return terms.',
        ],
      },
      {
        heading: 'Confirm the model details',
        paragraphs: [
          'Kefayaan lists the BELLA Fits-Anywhere 2-Slice Slim Toaster as an option to inspect. Verify the exact model, listed features, seller, current price, and return terms on the retailer’s page. Marketing labels are not a substitute for checking whether the dimensions and settings suit your kitchen.',
        ],
      },
    ],
    relatedProductIds: [],
    relatedProductKeywords: ['bella fits-anywhere', 'slim toaster'],
  },
];

export const getRelatedProducts = (article: BlogArticle, products: Product[], limit = 3): Product[] => {
  const explicitMatches = article.relatedProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product?.inStock));
  const keywords = article.relatedProductKeywords.map((keyword) => keyword.toLocaleLowerCase());
  const keywordMatches = products.filter((product) => {
    if (!product.inStock) return false;
    const searchable = `${product.title} ${product.brand} ${product.category}`.toLocaleLowerCase();
    return keywords.some((keyword) => searchable.includes(keyword));
  });
  return [...new Map([...explicitMatches, ...keywordMatches].map((product) => [product.id, product])).values()]
    .slice(0, limit);
};

export const getBlogArticle = (slug: string): BlogArticle | undefined =>
  BLOG_ARTICLES.find((article) => article.slug === slug);
