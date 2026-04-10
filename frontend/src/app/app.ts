import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Banner } from './components/banner/banner';
import { Filter } from './components/filter/filter';
import { ConfigurationService } from './services/configuration-service';
import { ToastComponent } from './components/common/toastComponent';
import { AppStore } from './store/app-store';
import { Footer } from './components/footer/footer';
import { ScrollBtnComponent } from './components/common/scrollToTop';

@Component({
  imports: [
    RouterModule,
    CommonModule,
    Navbar,
    Banner,
    Filter,
    ToastComponent,
    ScrollBtnComponent,
    Footer,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  config = inject(ConfigurationService);
  readonly store = inject(AppStore);

  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
