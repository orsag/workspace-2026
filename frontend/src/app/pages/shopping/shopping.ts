import { Component, inject } from '@angular/core';
import { CartStore } from '../../store/cart-store';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService, CreatedOrder } from '../../services/order-service';

@Component({
  selector: 'app-shopping',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping {
  protected readonly cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private router = inject(Router);

  async handleCheckout() {
    const items = this.cartStore.items().map((item) => ({
      bookId: item.book.id,
      quantity: item.quantity,
    }));

    this.orderService.createOrder({ items }).subscribe({
      next: (order: CreatedOrder) => {
        console.log('OrderService created successfully!', order);
        this.cartStore.clearCart(); // Wipe the cart logic
        this.router.navigate(['/success', order.id]);
      },
      error: (err) => {
        console.error('Checkout failed', err);
        // Toast notification here would be great!
      },
    });
  }
}
