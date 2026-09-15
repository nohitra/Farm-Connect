// Smart Automatic Farm & Dairy Product Photo Generator Utility
// Intelligently maps any produce/fruit/farm/dairy item name entered by the farmer to a high-resolution photo.

export const CROP_PHOTO_DATABASE = [
  // DAIRY & POULTRY
  {
    category: 'dairy',
    name: 'Fresh Cow Milk (A2 / Pure)',
    keywords: ['milk', 'a2 milk', 'cow milk', 'buffalo milk', 'doodh', 'paalu', 'dairy'],
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Pure Desi Ghee',
    keywords: ['ghee', 'pure ghee', 'desi ghee', 'neyyi', 'clarified butter', 'cow ghee', 'bilona'],
    url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Fresh Farm Paneer',
    keywords: ['paneer', 'cottage cheese', 'fresh paneer', 'malai paneer'],
    url: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Thick Farm Curd / Dahi',
    keywords: ['curd', 'dahi', 'yogurt', 'perugu', 'mattha', 'buttermilk', 'lassi'],
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Country Farm Butter (Makhan)',
    keywords: ['butter', 'makhan', 'venna', 'white butter', 'churned butter'],
    url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Country Farm Eggs (Desi / Free-Range)',
    keywords: ['egg', 'eggs', 'guddu', 'farm eggs', 'desi eggs', 'natukodi', 'country egg'],
    url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'dairy',
    name: 'Pure Raw Forest Honey',
    keywords: ['honey', 'pure honey', 'teene', 'raw honey', 'wild honey'],
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  },

  // VEGETABLES & GREENS
  {
    category: 'vegetables',
    name: 'Country Tomatoes (Desi / Hybrid)',
    keywords: ['tomato', 'tomatoes', 'desi tomato', 'tamatar', 'tamata'],
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Carrots',
    keywords: ['carrot', 'carrots', 'gajar', 'gajjara', 'gajji'],
    url: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Farm Potatoes (Desi Aloo)',
    keywords: ['potato', 'potatoes', 'aloo', 'batata', 'bangaladumpa'],
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Spinach & Leafy Greens',
    keywords: ['spinach', 'palak', 'greens', 'leafy', 'methi', 'coriander', 'kothimeera', 'pudina', 'mint', 'keerai', 'thotakura', 'gongura'],
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Country Red Onions',
    keywords: ['onion', 'onions', 'pyaz', 'ulli', 'shallots', 'sambar onion'],
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Sweet Corn & Maize',
    keywords: ['corn', 'sweetcorn', 'sweet corn', 'maize', 'bhutta', 'jonnalu', 'makka'],
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Green Cabbage',
    keywords: ['cabbage', 'patta gobi', 'gobi'],
    url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Cauliflower',
    keywords: ['cauliflower', 'phool gobi'],
    url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Capsicum & Bell Peppers',
    keywords: ['capsicum', 'bell pepper', 'shimla mirchi', 'yellow capsicum', 'red capsicum'],
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Spicy Green / Red Chillies',
    keywords: ['chilli', 'chili', 'mirchi', 'green chilli', 'red chilli', 'pachimirapa', 'guntur'],
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Purple Brinjal (Eggplant)',
    keywords: ['brinjal', 'eggplant', 'baingan', 'vankaya', 'aubergine', 'gutti vankaya'],
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Farm Fresh Cucumber (Kheera)',
    keywords: ['cucumber', 'kheera', 'dosakaya', 'kakdi'],
    url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Garlic Bulbs (Desi Lahsun)',
    keywords: ['garlic', 'lahsun', 'vellulli', 'poondu'],
    url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Ginger Root (Adrak)',
    keywords: ['ginger', 'adrak', 'allam', 'inji'],
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Tender Lady Finger (Okra / Bhindi)',
    keywords: ['lady finger', 'ladyfinger', 'okra', 'bhindi', 'bendakaya', 'vendakkai'],
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Golden Pumpkin',
    keywords: ['pumpkin', 'kaddu', 'gummadikaya', 'parangikai'],
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'vegetables',
    name: 'Fresh Beetroot',
    keywords: ['beetroot', 'chukandar', 'beet'],
    url: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80',
  },

  // FRUITS
  {
    category: 'fruits',
    name: 'Farm Mangoes (Banganapalli / Alphonso)',
    keywords: ['mango', 'mangoes', 'aam', 'alphonso', 'banganapalli', 'kesar', 'totapuri', 'mamidi'],
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Organic Bananas',
    keywords: ['banana', 'bananas', 'kela', 'ariti', 'yelakki', 'robusta'],
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Sweet Watermelon',
    keywords: ['watermelon', 'tarbooz', 'water melon', 'puchakaya'],
    url: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Fresh Guava (Amrood)',
    keywords: ['guava', 'amrood', 'jama', 'koyya', 'peru'],
    url: 'https://images.unsplash.com/photo-1536511135885-3b0805175b94?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Sweet Papaya',
    keywords: ['papaya', 'boppayi', 'pappali', 'papita'],
    url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Juicy Pomegranate (Anar)',
    keywords: ['pomegranate', 'anar', 'danimma', 'dalimb'],
    url: 'https://images.unsplash.com/photo-1541345023926-55d6e0853f4b?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Fresh Lemons & Citrus',
    keywords: ['lemon', 'nimbu', 'nimmakaya', 'lime', 'citrus'],
    url: 'https://images.unsplash.com/photo-1534531141161-e41d133a4bcd?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'fruits',
    name: 'Tender Coconut',
    keywords: ['coconut', 'nariyal', 'kobbari', 'tender coconut', 'elaneer'],
    url: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=600&q=80',
  },

  // GRAINS & STAPLES
  {
    category: 'grains',
    name: 'Organic Paddy & Rice',
    keywords: ['rice', 'paddy', 'biyyam', 'sona masoori', 'basmati', 'brown rice'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'grains',
    name: 'Whole Wheat & Atta',
    keywords: ['wheat', 'gehu', 'godhumalu', 'atta', 'flour'],
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    category: 'grains',
    name: 'Fresh Sugarcane',
    keywords: ['sugarcane', 'cheruku', 'ganna', 'jaggery', 'bellam'],
    url: 'https://images.unsplash.com/photo-1589927986076-2d54e489569b?auto=format&fit=crop&w=600&q=80',
  },
];

export const DEFAULT_HARVEST_PHOTO = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
export const DEFAULT_DAIRY_PHOTO = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';

export const getAutoCropImage = (produceName, categoryHint = '') => {
  if (!produceName || typeof produceName !== 'string') {
    return categoryHint === 'dairy' ? DEFAULT_DAIRY_PHOTO : DEFAULT_HARVEST_PHOTO;
  }

  const lowerName = produceName.toLowerCase().trim();

  // Exact / partial keyword match in database
  for (const entry of CROP_PHOTO_DATABASE) {
    if (entry.keywords.some((kw) => lowerName.includes(kw))) {
      return entry.url;
    }
  }

  // Fallback by category hint
  if (categoryHint === 'dairy' || lowerName.includes('milk') || lowerName.includes('ghee') || lowerName.includes('curd')) {
    return DEFAULT_DAIRY_PHOTO;
  }

  return DEFAULT_HARVEST_PHOTO;
};

// Popular 1-Click Fast Presets for Farmers
export const POPULAR_FARM_PRESETS = [
  { name: 'Country Tomatoes (Desi)', category: 'vegetables', unit: 'kg', defaultEarning: 30, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Palak & Spinach Greens', category: 'vegetables', unit: 'bunch', defaultEarning: 20, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Country Red Onions', category: 'vegetables', unit: 'kg', defaultEarning: 35, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Farm Potatoes', category: 'vegetables', unit: 'kg', defaultEarning: 28, practiceTag: 'Conventional', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
  { name: 'Crisp Sweetcorn', category: 'vegetables', unit: 'piece', defaultEarning: 15, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tender Ladyfinger (Bhindi)', category: 'vegetables', unit: 'kg', defaultEarning: 40, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Purple Brinjal (Vankaya)', category: 'vegetables', unit: 'kg', defaultEarning: 35, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Spicy Green Chillies', category: 'vegetables', unit: 'pack', defaultEarning: 25, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80' },
];

export const POPULAR_DAIRY_PRESETS = [
  { name: 'Fresh A2 Cow Milk', category: 'dairy', unit: 'litre', defaultEarning: 65, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pure Desi Cow Ghee', category: 'dairy', unit: 'kg', defaultEarning: 650, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80' },
  { name: 'Farm Fresh Soft Paneer', category: 'dairy', unit: 'kg', defaultEarning: 320, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80' },
  { name: 'Thick Country Curd (Dahi)', category: 'dairy', unit: '500ml', defaultEarning: 40, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Country Eggs (Desi)', category: 'dairy', unit: 'dozen', defaultEarning: 90, practiceTag: 'Natural', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pure Raw Wild Honey', category: 'dairy', unit: '500ml', defaultEarning: 280, practiceTag: 'Organic', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
];
