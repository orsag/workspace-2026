import { Component, inject, OnInit, signal } from '@angular/core';
import { BookTable } from '../../components/book-table/book-table';
import { CommonModule } from '@angular/common';
import { Book as IBook } from '@test-monorepo/shared-models';
import { AppStore } from '../../store/app-store';
import { EditModalComponent } from './edit-modal';
import { OrderTable } from '../../components/order-table/order-table';
import { TranslocoDirective } from '@jsverse/transloco';
import { CoverModalComponent } from './cover-modal';
import { DeleteModalComponent } from './delete-modal';
import { LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-administration',
  imports: [
    BookTable,
    LucidePlus,
    CommonModule,
    EditModalComponent,
    OrderTable,
    TranslocoDirective,
    CoverModalComponent,
    DeleteModalComponent,
  ],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  store = inject(AppStore);

  selectedBook = signal<IBook | null>(null);
  isCoverModalOpen = signal<boolean>(false);
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

  openCoverModal(book: IBook) {
    this.selectedBook.set(book);
    this.isCoverModalOpen.set(true);
  }

  closeModals() {
    this.isCoverModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.selectedBook.set(null);
  }

  openCreateModal() {
    this.selectedBook.set(null);
    this.isEditModalOpen.set(true);
  }

  openEditModal(book: IBook) {
    this.selectedBook.set(book);
    this.isEditModalOpen.set(true);
  }
}
