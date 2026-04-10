import {
  Component,
  signal,
  effect,
  input,
  ElementRef,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-scroll-btn',
  standalone: true,
  template: `
    <button
      (click)="scrollToTop()"
      [class.opacity-100]="isVisible()"
      [class.opacity-0]="!isVisible()"
      [class.pointer-events-none]="!isVisible()"
      class="btn btn-circle btn-primary btn-lg shadow-xl fixed bottom-8 right-8 z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  `,
})
export class ScrollBtnComponent {
  isVisible = signal(false);

  constructor() {
    effect((onCleanup) => {
      const onScroll = () => {
        this.isVisible.set(window.scrollY > 300);
      };

      window.addEventListener('scroll', onScroll);
      onCleanup(() => window.removeEventListener('scroll', onScroll));
    });
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
