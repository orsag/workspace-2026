import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ThemePicker } from '../theme-picker/theme-picker';
import { ConfigurationService } from '../../services/configuration-service';
import { IconComponent } from '../icon/IconComponent';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    ThemePicker,
    NgOptimizedImage,
    IconComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  config = inject(ConfigurationService);

  showSearchbar = computed(() => this.config.flags().SHOW_SEARCHBAR_HEADER);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);

  logout(): void {
    this.router.navigate(['/']);
  }

  toggleSearchbar(): void {
    this.config.toggleFlag('SHOW_FILTER');
  }
}
