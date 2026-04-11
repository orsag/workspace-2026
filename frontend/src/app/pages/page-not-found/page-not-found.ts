import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, NgOptimizedImage, TranslocoDirective],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound implements OnInit {
  ngOnInit() {
    // We target the custom scroll container from your App Shell layout
    const scrollArea = document.getElementById('main-scroll-area');

    if (scrollArea) {
      scrollArea.scrollTo({
        top: 0,
        // 'instant' is better than 'smooth' for routing.
        behavior: 'instant',
      });
    }
  }
}
