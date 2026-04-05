import { Component } from '@angular/core';
import { IconComponent } from '../icon/IconComponent';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';

@Component({
  selector: 'app-filter',
  imports: [IconComponent],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  config = inject(ConfigurationService);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);

  public bookCategories: string[] = [
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
}
