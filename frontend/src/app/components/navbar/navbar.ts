import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService } from '../../services/configuration-service';
import { IconComponent } from '../icon/IconComponent';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    NgOptimizedImage,
    IconComponent,
    FormsModule,
    TranslocoDirective,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private translocoService = inject(TranslocoService);
  config = inject(ConfigurationService);
  private router = inject(Router);
  private store = inject(AppStore);
  cartStore = inject(CartStore);

  modelUsername = '';
  // Existing signals
  isPremium = computed(() => this.store.premiumStatus()?.isPremium ?? true);
  userAvatar = computed(() => this.store.user()?.avatarUrl);
  isLoggedIn = computed(() => this.store.isLoggedIn());

  userName = this.store.user;
  isAdmin = this.store.isAdmin;
  searchQuery = signal('');
  protected showLoginModal = signal(false);
  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);

  // Convert the lang changes to a signal
  activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  // Toggle function
  toggleLang() {
    console.log(this.isPremium());
    const newLang = this.activeLang() === 'en' ? 'sk' : 'en';
    this.translocoService.setActiveLang(newLang);
  }

  logoutMenuItem(event: any): void {
    this.closeDropdown(event);
    this.handleLogout();
  }

  toggleSearchbar(): void {
    this.config.toggleFlag('SHOW_FILTER');
  }

  closeDropdown(event: any) {
    event.currentTarget.blur();
    // Or more aggressively:
    (document.activeElement as HTMLElement)?.blur();
  }

  handleLogin() {
    this.showLoginModal.set(true);
  }

  handleLogout() {
    this.store.logout();
    this.cartStore.clearCart(); // Wipe the cart logic
    this.router.navigate(['/']);
  }

  onLoginSubmit(event: Event) {
    event.preventDefault();
    // Logic for auth goes here...
    if (this.modelUsername.trim() !== '') {
      this.store.login({
        username: this.modelUsername,
        onSuccess: () => this.showLoginModal.set(false),
      });
    }
  }

  // Handle the input event
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // 1. Update the local UI signal
    this.searchQuery.set(value);

    // 2. Update ONLY the search parameter in the store
    this.store.updateFilters({
      search: value,
    });
  }

  onClearSearchbar(): void {
    this.searchQuery.set('');
    this.store.updateFilters({
      search: this.searchQuery(),
    });
  }
}
