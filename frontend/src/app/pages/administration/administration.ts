import { Component, inject, signal } from '@angular/core';
import { BookTable} from '../../components/book-table/book-table';
import { BookService } from '../../services/book';
import { CommonModule } from '@angular/common';
import {
  form,
  min,
  max,
  required,
  maxLength,
  minLength,
  FormField,
} from '@angular/forms/signals';
import {
  Book as IBook,
  EMPTY_BOOK,
  BookWithoutId,
} from '@test-monorepo/shared-models';
import { IconComponent } from '../../components/icon/IconComponent';

@Component({
  selector: 'app-administration',
  imports: [BookTable, FormField, CommonModule, IconComponent],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration {
  bookService = inject(BookService);

  protected selectedBook = signal<IBook | null>(null);
  protected isDeleteModalOpen = signal(false);
  protected isEditModalOpen = signal(false);

  editModel = signal<BookWithoutId>({ ...EMPTY_BOOK });

  editForm = form(this.editModel, (schemaPath) => {
    required(schemaPath.title, {
      message: 'Title is required',
    });
    required(schemaPath.author, {
      message: 'Author is required',
    });
    minLength(schemaPath.title, 3, {
      message: 'Title must be min 3 chars',
    });
    maxLength(schemaPath.title, 50, {
      message: 'Title must be max 50 chars',
    });
    maxLength(schemaPath.isbn, 20, {
      message: 'ISBN must be max 20 chars',
    });
    min(schemaPath.pageCount, 1, {
      message: 'Page count must be min 1 pages',
    });
    min(schemaPath.popularity, 0, {
      message: 'Popularity must be min 0',
    });
    max(schemaPath.popularity, 10, {
      message: 'Popularity must be max 10',
    });
    min(schemaPath.availableCount, 0, {
      message: 'Available count must be min 0',
    });
  });

  protected readonly categories = [
    'Fiction',
    'Non-fiction',
    'Fantasy',
    'Sci-Fi',
    'Romance',
    'History',
    'Biography',
    'Self-help',
    'Mystery',
  ];

  openDeleteConfirmation(book: IBook) {
    this.selectedBook.set(book);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const bookId = this.selectedBook()?.id;

    if (bookId) {
      this.bookService.delete(bookId);
    }
    this.closeModals();
  }

  openEditModal(book: IBook) {
    this.selectedBook.set(book);

    this.editModel.set({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      pageCount: book.pageCount,
      price: book.price,
      discount: book.discount,
      popularity: book.popularity,
      availableCount: book.availableCount,
      isNewArticle: book.isNewArticle,
      isSoldOut: book.isSoldOut,
      isAvailable: book.isAvailable,
      isBestSeller: book.isBestSeller,
      coverUrl: book.coverUrl ?? '',
      description: book.description ?? '',
    });

    this.isEditModalOpen.set(true);
  }

  handleSave() {
    if (this.editForm().invalid()) return;

    const formData: Partial<IBook> = this.editForm().value();
    const currentBook = this.selectedBook();

    if (currentBook) {
      // EDIT MODE
      this.bookService.update(currentBook.id, formData);
    } else {
      // CREATE MODE
      this.bookService.create(formData as BookWithoutId);
    }

    this.closeModals();
  }

  openCreateModal() {
    this.selectedBook.set(null);
    this.editModel.set({ ...EMPTY_BOOK });
    this.isEditModalOpen.set(true);
  }

  closeModals() {
    this.isDeleteModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.selectedBook.set(null);
  }
}
