import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Banner } from './components/banner/banner';
import { Filter } from './components/filter/filter';
import { ConfigurationService } from './services/configuration-service';
import { ToastComponent } from './components/toast/toastComponent';
import { AppStore } from './store/app-store';

@Component({
  imports: [RouterModule, CommonModule, Navbar, Banner, Filter, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  config = inject(ConfigurationService);
  readonly store = inject(AppStore);

  ngOnInit() {
    this.store.init();
  }

  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
