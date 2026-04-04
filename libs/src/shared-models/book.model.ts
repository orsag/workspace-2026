export interface Book {
  id: string; // UUID or Database ID
  title: string;
  author: string;
  isbn: string;
  publishedDate: Date;
  description?: string; // Optional field
  pageCount: number;
  category: BookCategory;
}

export enum BookCategory {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  SCI_FI = 'Sci-Fi',
  BIOGRAPHY = 'Biography',
  POETRY = 'Poetry',
}

// You can also create a type for creating a new book (without the ID)
export type CreateBookDto = Omit<Book, 'id'>;
