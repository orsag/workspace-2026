import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '@test-monorepo/shared-models';
import { Observable } from 'rxjs';

export interface OrderItem {
  bookId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: OrderItem[];
}

export interface CreatedOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; // Based on status: 'PENDING'
  createdAt: Date;
  items: {
    bookId: string;
    quantity: number;
    price: number; // The price locked at purchase
    book: Book; // Full book details included via relation
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/order';

  createOrder(orderData: CreateOrderDto): Observable<CreatedOrder> {
    return this.http.post<CreatedOrder>(this.API_URL, orderData);
  }

  getOrderById(orderId: string): Observable<CreatedOrder> {
    return this.http.get<CreatedOrder>(`${this.API_URL}/${orderId}`);
  }

  getUserOrders(userId: string): Observable<CreatedOrder[]> {
    return this.http.get<CreatedOrder[]>(`${this.API_URL}/user/${userId}`);
  }

  cancelOrder(orderId: string): Observable<CreatedOrder> {
    return this.http.patch<CreatedOrder>(
      `${this.API_URL}/${orderId}/cancel`,
      {},
    );
  }
}
