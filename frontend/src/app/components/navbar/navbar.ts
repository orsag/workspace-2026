import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService } from '../../services/configuration-service';
import { IconComponent } from '../icon/IconComponent';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../store/cart-store';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    NgOptimizedImage,
    IconComponent,
    FormsModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  config = inject(ConfigurationService);
  private router = inject(Router);
  private store = inject(AppStore);
  cartStore = inject(CartStore);

  modelUsername = '';
  userName = this.store.user;
  isLoggedIn = this.store.isLoggedIn;
  isAdmin = this.store.isAdmin;
  protected showLoginModal = signal(false);
  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);

  logout(event: any): void {
    this.router.navigate(['/']);
    this.closeDropdown(event);
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
  }

  onLoginSubmit(event: Event) {
    event.preventDefault();
    // Logic for auth goes here...
    if (this.modelUsername.trim() !== '') {
      this.store.login(this.modelUsername);
    }
    this.showLoginModal.set(false);
  }
}
