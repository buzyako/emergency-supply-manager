export interface InspirationalQuote {
  text: string;
  source: string;
  category: 'preparation' | 'faith' | 'self-reliance' | 'encouragement';
  reference?: string;
}

export const inspirationalQuotes: InspirationalQuote[] = [
  {
    text: "If ye are prepared ye shall not fear.",
    source: "Doctrine and Covenants 38:30",
    category: "preparation",
    reference: "D&C 38:30"
  },
  {
    text: "By small and simple means are great things brought to pass.",
    source: "Alma 37:6",
    category: "self-reliance",
    reference: "Alma 37:6"
  },
  {
    text: "Preparation, both spiritual and temporal, can dispel fear.",
    source: "Church of Jesus Christ of Latter-day Saints",
    category: "preparation"
  },
  {
    text: "The need for preparation is abundantly clear. The great blessing of being prepared gives us freedom from fear.",
    source: "Elder L. Tom Perry",
    category: "preparation"
  },
  {
    text: "Store enough food to feed your family for one day. Multiply that by seven to build a one-week supply.",
    source: "Church of Jesus Christ of Latter-day Saints",
    category: "self-reliance"
  },
  {
    text: "For decades, the Lord's prophets have urged us to store food, water, and financial reserves for a time of need.",
    source: "Church of Jesus Christ of Latter-day Saints",
    category: "preparation"
  },
  {
    text: "As disciples of the Savior, we are commanded to 'prepare every needful thing.'",
    source: "Doctrine and Covenants 88:119",
    category: "preparation",
    reference: "D&C 88:119"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    source: "Chinese Proverb",
    category: "encouragement"
  },
  {
    text: "Emergency preparedness is not an event, but a process.",
    source: "Emergency Preparedness Principles",
    category: "self-reliance"
  },
  {
    text: "When we are prepared, we shall not fear.",
    source: "Doctrine and Covenants 38:30",
    category: "faith",
    reference: "D&C 38:30"
  }
];

export function getRandomQuote(): InspirationalQuote {
  return inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
}

export function getQuotesByCategory(category: InspirationalQuote['category']): InspirationalQuote[] {
  return inspirationalQuotes.filter(quote => quote.category === category);
}

export function getDailyQuote(): InspirationalQuote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return inspirationalQuotes[dayOfYear % inspirationalQuotes.length];
}
