import { Book as IBook } from '@test-monorepo/libs';

export interface BookFilters {
  search: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isNewRelease: boolean;
  isDiscounted: boolean;
  sortBy: 'popularity' | 'price_asc' | 'price_desc' | null;
  category: string | null;
}

export type QuickFilterState = {
  mode: 'all' | 'bestsellers' | 'newReleases' | 'discounted' | 'soldOut';
  sortBy: 'price_asc' | 'price_desc' | null;
};

export interface PaginatedBooks {
  data: IBook[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    count: number;
  };
}

// Define a type for your filter/sort items
export type FilterItem = {
  label: string;
  icon: string;
  isActive: () => boolean;
  action: () => void;
  style: 'warning' | 'outline'; // To distinguish your specific button styles
};
