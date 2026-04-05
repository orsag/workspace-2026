import { Component, computed, input, inject } from '@angular/core';
import { CATEGORY_ICONS } from '@test-monorepo/libs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [innerHTML]="svgContent()" class="icon-container"></span>`,
  styles: [
    `
      .icon-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* This is the magic: aligns the icon bottom to the text baseline */
        vertical-align: middle;
        /* Sometimes -1px or -2px is needed depending on the font */
        margin-top: -1px;
      }
      :host ::ng-deep svg {
        width: 1rem;
        height: 1rem;
        display: block; /* Prevents unwanted baseline spacing */
        stroke-width: 2px; /* Keeps the lines crisp at smaller sizes */
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
