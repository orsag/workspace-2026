import { Component, inject, OnInit, signal } from '@angular/core';
import { BookTable} from '../../components/book-table/book-table';
import { BookService } from '../../services/book-service';
import { CommonModule } from '@angular/common';
import { Book as IBook, ActionResponse } from '@test-monorepo/shared-models';
import { IconComponent } from '../../components/icon/IconComponent';
import { AppStore } from '../../store/app-store';
import { ToastService } from '../../services/toast-service';
import { EditModalComponent } from './edit-modal';
import { OrderTable } from '../../components/order-table/order-table';

@Component({
  selector: 'app-administration',
  imports: [BookTable, CommonModule, IconComponent, EditModalComponent, OrderTable],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  store = inject(AppStore);
  bookService = inject(BookService);
  toast = inject(ToastService);

  selectedBook = signal<IBook | null>(null);
  isDeleteModalOpen = signal(false);
  isEditModalOpen = signal(false);

  ngOnInit() {
    if (this.store.totalBooks() === 0) {
      this.store.loadBooks();
    }
  }

  openDeleteConfirmation(book: IBook) {
    this.selectedBook.set(book);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const bookId = this.selectedBook()?.id;

    if (bookId) {
      this.bookService.delete(bookId).subscribe((res: ActionResponse) => {
        if (res.warning) {
          this.toast.alert(res.message);
        } else {
          this.toast.success(res.message);
          this.store.loadBooks();
        }
      });
    }

    this.closeModals();
  }

  closeModals() {
    this.isDeleteModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.selectedBook.set(null);
  }

  openCreateModal() {
    this.selectedBook.set(null);
    this.isEditModalOpen.set(true);
  }

  openEditModal(book: IBook) {
    console.log(book);
    this.selectedBook.set(book);
    this.isEditModalOpen.set(true);
  }
}
