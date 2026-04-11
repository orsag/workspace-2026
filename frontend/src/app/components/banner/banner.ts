import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-banner',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class BannerComponent implements OnInit, OnDestroy {
  // Signals
  days = signal(15);
  hours = signal(10);
  minutes = signal(24);
  seconds = signal(59);

  private intervalId: any;

  // The target date for the sale/event
  private targetDate = new Date().getTime() + 15 * 24 * 60 * 60 * 1000; // e.g. 15 days from now

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startCountdown() {
    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.targetDate - now;

      if (distance < 0) {
        clearInterval(this.intervalId);
        this.days.set(0);
        this.hours.set(0);
        this.minutes.set(0);
        this.seconds.set(0);
        return;
      }

      // Calculate time remaining and update signals
      this.days.set(Math.floor(distance / (1000 * 60 * 60 * 24)));
      this.hours.set(
        Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      );
      this.minutes.set(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      this.seconds.set(Math.floor((distance % (1000 * 60)) / 1000));
    }, 1000);
  }
}
