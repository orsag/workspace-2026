export interface FeatureFlag {
  name: string;
  label: string;
  defaultVal?: boolean;
}

export const FEATURES: FeatureFlag[] = [
  {
    name: 'INFINITE_SCROLL_GRID',
    label: 'Enable infinite scrolling on dashboard grid',
    defaultVal: false,
  },
  {
    name: 'INFINITE_SCROLL_LIST',
    label: 'Enable infinite scrolling on dashboard list',
    defaultVal: false,
  },
  {
    name: 'INFINITE_COLOR_THEMES',
    label: 'Enable all possible color themes',
    defaultVal: true,
  },
  {
    name: 'SHOW_FILTER',
    label: 'Show filter component',
    defaultVal: false,
  },
  {
    name: 'SHOW_SEARCHBAR_HEADER',
    label: 'Show search bar inside navigation bar',
    defaultVal: false,
  },
  {
    name: 'SHOW_DISCOUNT_BANNER',
    label: 'Show discount banner',
    defaultVal: false,
  },
] as const;

// This maps the 'name' literal values into a concrete interface
export interface AppFeatureFlags {
  INFINITE_SCROLL_GRID: boolean;
  INFINITE_SCROLL_LIST: boolean;
  INFINITE_COLOR_THEMES: boolean;
  SHOW_FILTER: boolean;
  SHOW_SEARCHBAR_HEADER: boolean;
  SHOW_DISCOUNT_BANNER: boolean;
}

export type FeatureName = keyof AppFeatureFlags;
