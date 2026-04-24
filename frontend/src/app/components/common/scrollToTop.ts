import { Component, signal, effect } from '@angular/core';

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
      // 1. Grab the new scrolling container by its ID
      const scrollArea = document.getElementById('main-scroll-area');

      if (!scrollArea) return; // Safety check

      const onScroll = () => {
        // 2. Use .scrollTop instead of window.scrollY
        this.isVisible.set(scrollArea.scrollTop > 300);
      };

      // 3. Attach the event listener to the div, not the window
      scrollArea.addEventListener('scroll', onScroll);

      onCleanup(() => scrollArea.removeEventListener('scroll', onScroll));
    });
  }

  scrollToTop() {
    const scrollArea = document.getElementById('main-scroll-area');

    if (scrollArea) {
      // 4. Scroll the specific div back to the top
      scrollArea.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
}
