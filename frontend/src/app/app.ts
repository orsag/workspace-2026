import { Component, computed, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { BannerComponent } from './components/banner/banner';
import { Filter } from './components/filter/filter';
import { ConfigurationService } from './services/configuration-service';
import { ToastComponent } from './components/common/toastComponent';
import { AppStore } from './store/app-store';
import { Footer } from './components/footer/footer';
import { ScrollBtnComponent } from './components/common/scrollToTop';
import { filter } from 'rxjs';
import { ScrollService } from './services/scroll-service';

@Component({
  imports: [
    RouterModule,
    CommonModule,
    Navbar,
    Filter,
    BannerComponent,
    ToastComponent,
    ScrollBtnComponent,
    Footer,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  router = inject(Router);
  scrollService = inject(ScrollService);
  config = inject(ConfigurationService);
  readonly store = inject(AppStore);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollService.scrollToTop();
      });
  }

  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Logic: Ctrl + Shift + D (for Dark mode toggle)
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.config.toggleTheme();
    }
  }
}
