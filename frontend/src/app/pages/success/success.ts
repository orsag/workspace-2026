import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CreatedOrder, OrderService } from '../../services/order-service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-success',
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './success.html',
  styleUrl: './success.css',
})
export class Success implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<CreatedOrder | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (data) => {
          this.order.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }
}

