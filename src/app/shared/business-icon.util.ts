// Maps the emoji stored in business_types.icon / habit_businesses.business_icon
// to the matching illustrated asset. Kept in sync with
// supabase/migrations/20250827000400_business_types_seed.sql — any business
// type without an entry here simply keeps rendering its emoji.
const BUSINESS_ICON_ASSETS: Record<string, string> = {
  '🍋': 'assets/business-icons/lemonade-stand.png',
  '📰': 'assets/business-icons/newspaper-route.png',
  '🚗': 'assets/business-icons/car-wash.png',
  '🍕': 'assets/business-icons/pizza-delivery.png',
  '🍩': 'assets/business-icons/donut-shop.png',
  '🦐': 'assets/business-icons/shrimp-boat.png',
  '🏒': 'assets/business-icons/hockey-team.png',
  '🎬': 'assets/business-icons/movie-studio.png',
  '🏦': 'assets/business-icons/bank.png',
  '🛢️': 'assets/business-icons/oil-company.png',
};

export function businessIconAsset(icon: string | null | undefined): string | null {
  if (!icon) return null;
  return BUSINESS_ICON_ASSETS[icon] ?? null;
}
