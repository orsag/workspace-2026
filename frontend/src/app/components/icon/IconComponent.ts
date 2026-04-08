import { Component, computed, input, inject } from '@angular/core';
import { CATEGORY_ICONS } from '@test-monorepo/libs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [innerHTML]="svgContent()" class="icon-container"></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
      }
      .icon-container {
        display: inline-flex;
        width: 100%;
        height: 100%;
      }
      /* Remove the hardcoded 1rem and use inherit instead */
      :host ::ng-deep svg {
        width: inherit;
        height: inherit;
        display: block;
        /* Ensure the stroke color comes from the parent's text color */
        stroke: currentColor;
        fill: none;
      }
    `,
  ],
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);
  name = input.required<string>();

  svgContent = computed<SafeHtml>(() => {
    const rawSvg = CATEGORY_ICONS[this.name()] || CATEGORY_ICONS['Default'];
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  });
}
