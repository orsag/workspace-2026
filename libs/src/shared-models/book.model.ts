// eslint-disable-next-line @nx/enforce-module-boundaries
import { Prisma } from '../../../generated/prisma/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedDate: Date | string;
  pageCount: number; // default 0
  category: string;
  price: number;
  discount: number; // default 0, between 0-1
  popularity: number; // 0-10
  availableCount: number;
  isNewArticle: boolean;
  isSoldOut: boolean;
  isAvailable: boolean;
  isBestSeller: boolean;
  createdAt: Date | string; // Prisma returns ISO strings
  updatedAt: Date | string;
  coverUrl?: string;
  description?: string;
}

// You can also create a type for creating a new book (without the ID)
export type CreateBookDto = Omit<Book, 'id'>;

export type BookWithoutId = Required<Omit<Book, 'id'>>;

// Initialisation
export const EMPTY_BOOK: BookWithoutId = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publishedDate: new Date(),
  pageCount: 0,
  price: 0,
  discount: 0,
  popularity: 0,
  availableCount: 0,
  isNewArticle: false,
  isSoldOut: false,
  isAvailable: false,
  isBestSeller: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  coverUrl: '',
  description: '',
};

export interface ActionResponse {
  success: boolean;
  message: string;
  warning?: boolean;
}

export interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isBestSeller?: boolean;
  newReleases?: boolean;
  isAvailable?: boolean;
  isDiscounted?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
}

// Define an interface for price sorting parameters
export interface PriceSortParams {
  where: Prisma.BookWhereInput;
  limit: number;
  skip: number;
  sortBy: string;
  search?: string;
}

// Define an interface for default sorting parameters
export interface DefaultSortParams {
  where: Prisma.BookWhereInput;
  limit: number;
  skip: number;
  sortBy?: string;
}
