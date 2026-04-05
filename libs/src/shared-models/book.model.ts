export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedDate: Date;
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
  coverUrl?: string;
  description?: string;
}

// You can also create a type for creating a new book (without the ID)
export type CreateBookDto = Omit<Book, 'id'>;
