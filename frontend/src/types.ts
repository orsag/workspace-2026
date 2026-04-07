export interface BookFilters {
  search: string;
  available: boolean;
  newReleases: boolean;
  discounted: boolean;
  bestsellers: boolean;
  sortBy: 'popularity' | 'price_asc' | 'price_desc' | null;
  category: string | null;
}
