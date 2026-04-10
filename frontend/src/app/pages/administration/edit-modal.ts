import {
  Component,
  signal,
  output,
  inject,
  input,
  computed,
  effect,
  untracked,
} from '@angular/core';
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
  Book,
  Book as IBook,
  BookWithoutId,
  EMPTY_BOOK,
} from '@test-monorepo/libs';
import { BookService } from '../../services/book-service';

@Component({
  selector: 'app-edit-modal',
  imports: [CommonModule, FormField],
  template: `
    <dialog class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-xl mb-6 text-primary">
          {{ selectedBook() ? 'Upraviť knihu' : 'Pridať novú knihu' }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- FULL WIDTH: Title -->
          <div class="form-control md:col-span-2">
            <label class="label" [attr.for]="'title-' + selectedBook()?.id">
              <span class="label-text font-semibold">Názov</span>
            </label>
            <input
              type="text"
              [id]="'title-' + idBook"
              [formField]="editForm.title"
              class="input input-bordered w-full"
              [class.input-error]="
                editForm.title().touched() && editForm.title().invalid()
              "
            />
            @if (editForm.title().touched() && editForm.title().invalid()) {
              <span class="text-error text-xs mt-1"
                >Názov musí mať aspoň 3 znaky</span
              >
            }
          </div>

          <!-- Author -->
          <div class="form-control">
            <label class="label" [attr.for]="'author-' + idBook">
              <span class="label-text font-semibold">Autor</span>
            </label>
            <input
              type="text"
              [id]="'author-' + idBook"
              [formField]="editForm.author"
              class="input input-bordered w-full"
            />
          </div>

          <!-- ISBN -->
          <div class="form-control">
            <label class="label" [attr.for]="'isbn-' + idBook">
              <span class="label-text font-semibold">ISBN</span>
            </label>
            <input
              type="text"
              [id]="'isbn-' + idBook"
              [formField]="editForm.isbn"
              class="input input-bordered w-full"
              [class.input-error]="editForm.isbn().invalid()"
            />
          </div>

          <!-- Price -->
          <div class="form-control">
            <label class="label" [attr.for]="'price-' + idBook">
              <span class="label-text font-semibold">Cena (€)</span>
            </label>
            <input
              type="number"
              [id]="'price-' + idBook"
              [formField]="editForm.price"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Available count -->
          <div class="form-control">
            <label class="label" [attr.for]="'available-' + idBook">
              <span class="label-text font-semibold">Skladom (ks)</span>
            </label>
            <input
              type="number"
              [id]="'available-' + idBook"
              [formField]="editForm.availableCount"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Category -->
          <div class="form-control md:col-span-2">
            <label class="label" [attr.for]="'category-' + idBook">
              <span class="label-text font-semibold">Kategória</span>
            </label>
            <select
              [id]="'category-' + idBook"
              [formField]="editForm.category"
              class="select select-bordered w-full"
            >
              <option value="" disabled selected>Vyberte kategóriu</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- FULL WIDTH: Description -->
          <div class="form-control md:col-span-2">
            <label class="label" [attr.for]="'description-' + idBook">
              <span class="label-text font-semibold">Popis</span>
            </label>
            <textarea
              [id]="'description-' + idBook"
              [formField]="editForm.description"
              class="textarea textarea-bordered w-full h-28"
            ></textarea>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" (click)="handleClose()">Zrušiť</button>
          <button
            class="btn btn-primary px-10"
            [disabled]="editForm().invalid()"
            (click)="handleSave()"
          >
            {{ selectedBook() ? 'Uložiť zmeny' : 'Vytvoriť knihu' }}
          </button>
        </div>
      </div>
      <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        aria-label="Zatvoriť okno"
        (click)="handleClose()"
        (keydown.enter)="handleClose()"
        (keydown.space)="handleClose()"
      ></div>
    </dialog>
  `,
  styles: [],
})
export class EditModalComponent {
  readonly selectedBook = input.required<Book | null>();
  bookService = inject(BookService);
  closeModal = output<void>();
  readonly idBook = computed(() => this.selectedBook()?.id);
  private hasOpened = false;

  constructor() {
    effect(() => {
      const book = this.selectedBook();

      // Check if value is defined and we haven't opened yet
      if (book && !this.hasOpened) {
        this.hasOpened = true;

        // Execute your logic
        untracked(() => {
          this.openEditModal(book);
        });
      }
    });
  }

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

  openEditModal(book: IBook) {
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
  }

  handleSave() {
    if (this.editForm().invalid()) return;

    const formData: Partial<IBook> = this.editForm().value();
    const value = this.idBook();

    if (value) {
      // EDIT MODE
      this.bookService.update(value, formData);
    } else {
      // CREATE MODE
      this.bookService.create(formData as BookWithoutId);
    }

    this.handleClose();
  }

  handleClose() {
    this.closeModal.emit();
  }
}
