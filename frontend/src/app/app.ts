import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Banner } from './components/banner/banner';
import { Filter } from './components/filter/filter';
import { ConfigurationService } from './services/configuration-service';

@Component({
  imports: [RouterModule, CommonModule, Navbar, Banner, Filter],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  config = inject(ConfigurationService);

  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
