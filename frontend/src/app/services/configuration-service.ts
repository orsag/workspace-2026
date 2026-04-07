import { Injectable, signal, effect } from '@angular/core';
import { AppFeatureFlags, FeatureName, FEATURES } from '@test-monorepo/shared-models';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly STORAGE_KEY = 'app_config';
  private readonly THEME_KEY = 'app_theme';

  readonly flags = signal<AppFeatureFlags>(this.loadFlags());
  readonly theme = signal<string>(
    localStorage.getItem(this.THEME_KEY) || 'light',
  );

  constructor() {
    // Automatically persist to localStorage whenever flags change
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags()));
    });

    // Automatically apply theme to <html> tag whenever it changes
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem(this.THEME_KEY, currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
    });
  }

  private loadFlags(): AppFeatureFlags {
    const saved = localStorage.getItem('app_config');

    // Create the default object matching the interface
    const defaults: any = {};
    FEATURES.forEach((f) => (defaults[f.name] = !!f.defaultVal));

    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
    return defaults as AppFeatureFlags;
  }

  toggleFlag(name: FeatureName) {
    this.flags.update((f) => ({ ...f, [name]: !f[name] }));
  }

  setTheme(newTheme: string) {
    this.theme.set(newTheme);
  }
}
