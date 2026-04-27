import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DAISY_THEMES } from '@test-monorepo/shared-models';
import { ConfigurationService } from '../../services/configuration-service';
import { NoBtnHoverDirective } from '../../core/no-btn-hover.directive';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'app-theme-picker',
  imports: [CommonModule, LucideCheck, NoBtnHoverDirective],
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker {
  config = inject(ConfigurationService);

  currentTheme = this.config.theme;

  // only part that needs "logic"
  availableThemes = computed(() => {
    return this.config.flags().INFINITE_COLOR_THEMES
      ? DAISY_THEMES
      : DAISY_THEMES.filter((t) => ['light', 'dark'].includes(t.name));
  });

  changeTheme(theme: string) {
    // One call, the Service's 'effect' does the rest
    this.config.setTheme(theme);
  }
}


