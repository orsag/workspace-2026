import { Component, computed, inject } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner';
import { Filter } from '../../components/filter/filter';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { ScrollBtnComponent } from '../../components/common/scrollToTop';
import { ToastComponent } from '../../components/common/toastComponent';
import { ConfigurationService } from '../../services/configuration-service';

@Component({
  selector: 'app-main-layout',
  imports: [
    BannerComponent,
    Filter,
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtnComponent,
    ToastComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  private config = inject(ConfigurationService);

  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
