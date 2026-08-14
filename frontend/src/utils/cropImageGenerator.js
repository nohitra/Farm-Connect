// Smart Automatic Farm & Dairy Product Photo Generator Utility
// Intelligently maps any produce/fruit/farm/dairy item name entered by the farmer to a high-resolution photo.

const CROP_PHOTO_DATABASE = [
  // DAIRY & FARM FRESH
  { keywords: ['milk', 'a2 milk', 'cow milk', 'buffalo milk', 'doodh', 'paalu'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['ghee', 'pure ghee', 'desi ghee', 'neyyi'], url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEXU0cepmuFvq-oQx3xtZ700qq83WpnQWMzISwsAVWxg&s=10' },
  { keywords: ['paneer', 'cottage cheese'], url: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['curd', 'dahi', 'yogurt', 'perugu'], url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['butter', 'makhan', 'venna'], url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['egg', 'eggs', 'guddu', 'farm eggs', 'desi eggs'], url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['honey', 'pure honey', 'teene'], url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },

  // VEGETABLES & CROPS
  { keywords: ['tomato', 'tomatoes', 'desi tomato', 'tamatar'], url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['carrot', 'carrots', 'gajar', 'gajjara', 'gajji'], url: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['potato', 'potatoes', 'aloo'], url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['spinach', 'palak', 'greens', 'leafy', 'methi', 'coriander', 'kothimeera', 'pudina', 'mint'], url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['onion', 'onions', 'pyaz', 'ulli'], url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['corn', 'sweetcorn', 'sweet corn', 'maize', 'bhutta', 'jonnalu'], url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['apple', 'apples', 'kashmir apple', 'red apple'], url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['mango', 'mangoes', 'aam', 'alphonso', 'banganapalli'], url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['banana', 'bananas', 'kela', 'ariti'], url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['watermelon', 'tarbooz', 'water melon'], url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cabbage', 'patta gobi'], url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cauliflower', 'phool gobi', 'gobi'], url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['capsicum', 'bell pepper', 'shimla mirchi'], url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['chilli', 'chili', 'mirchi', 'green chilli', 'red chilli'], url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['brinjal', 'eggplant', 'baingan', 'vankaya'], url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['cucumber', 'kheera', 'dosakaya'], url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['garlic', 'lahsun', 'vellulli'], url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['ginger', 'adrak', 'allam'], url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['lady finger', 'ladyfinger', 'okra', 'bhindi', 'bendakaya'], url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['pumpkin', 'kaddu', 'gummadikaya'], url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['beetroot', 'chukandar'], url: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['papaya', 'boppayi'], url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['guava', 'amrood', 'jama'], url: 'https://images.unsplash.com/photo-1536511135885-3b0805175b94?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['grapes', 'angoor'], url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['pomegranate', 'anar', 'danimma'], url: 'https://images.unsplash.com/photo-1541345023926-55d6e0853f4b?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['pineapple', 'ananas'], url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['lemon', 'nimbu', 'nimmakaya'], url: 'https://images.unsplash.com/photo-1534531141161-e41d133a4bcd?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['strawberry', 'strawberries'], url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['orange', 'oranges', 'santra'], url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['coconut', 'nariyal', 'kobbari'], url: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['sugarcane', 'cheruku'], url: 'https://images.unsplash.com/photo-1589927986076-2d54e489569b?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['rice', 'paddy', 'biyyam'], url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['wheat', 'gehu'], url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
];

const DEFAULT_HARVEST_PHOTO = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export const getAutoCropImage = (produceName) => {
  if (!produceName || typeof produceName !== 'string') return DEFAULT_HARVEST_PHOTO;

  const lowerName = produceName.toLowerCase().trim();

  for (const entry of CROP_PHOTO_DATABASE) {
    if (entry.keywords.some((kw) => lowerName.includes(kw))) {
      return entry.url;
    }
  }

  return DEFAULT_HARVEST_PHOTO;
};
