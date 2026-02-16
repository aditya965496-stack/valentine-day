
export enum ValentineDay {
  ROSE = 'Rose Day',
  PROPOSE = 'Propose Day',
  CHOCOLATE = 'Chocolate Day',
  TEDDY = 'Teddy Day',
  PROMISE = 'Promise Day',
  HUG = 'Hug Day',
  KISS = 'Kiss Day',
  VALENTINE = 'Valentine\'s Day'
}

export enum GreetingTheme {
  CLASSIC = 'Classic Pink',
  PASSION = 'Passion Red',
  MIDNIGHT = 'Midnight Love',
  VINTAGE = 'Vintage Lace',
  ELEGANT = 'Elegant Gold'
}

export interface GreetingState {
  partnerName: string;
  selectedDay: ValentineDay;
  theme: GreetingTheme;
  quote: string;
  wish: string;
  loading: boolean;
  isAudioPlaying: boolean;
}

export const VALENTINE_WEEK = [
  { day: ValentineDay.ROSE, date: 'Feb 7', color: 'bg-red-500', icon: '🌹' },
  { day: ValentineDay.PROPOSE, date: 'Feb 8', color: 'bg-pink-500', icon: '💍' },
  { day: ValentineDay.CHOCOLATE, date: 'Feb 9', color: 'bg-amber-800', icon: '🍫' },
  { day: ValentineDay.TEDDY, date: 'Feb 10', color: 'bg-orange-400', icon: '🧸' },
  { day: ValentineDay.PROMISE, date: 'Feb 11', color: 'bg-blue-500', icon: '🤝' },
  { day: ValentineDay.HUG, date: 'Feb 12', color: 'bg-emerald-500', icon: '🫂' },
  { day: ValentineDay.KISS, date: 'Feb 13', color: 'bg-rose-600', icon: '💋' },
  { day: ValentineDay.VALENTINE, date: 'Feb 14', color: 'bg-red-600', icon: '❤️' },
];

export const THEMES = [
  { id: GreetingTheme.CLASSIC, class: 'from-pink-100 to-rose-200', text: 'text-rose-600', border: 'border-rose-300' },
  { id: GreetingTheme.PASSION, class: 'from-rose-600 to-red-800', text: 'text-white', border: 'border-red-400' },
  { id: GreetingTheme.MIDNIGHT, class: 'from-indigo-900 via-purple-900 to-rose-900', text: 'text-pink-200', border: 'border-purple-400' },
  { id: GreetingTheme.VINTAGE, class: 'from-orange-50 to-amber-100', text: 'text-amber-900', border: 'border-amber-200' },
  { id: GreetingTheme.ELEGANT, class: 'from-gray-900 via-gray-800 to-amber-900', text: 'text-amber-200', border: 'border-amber-500' },
];
