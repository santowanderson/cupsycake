// src/app/core/services/order.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerOrderHistorySummary, Order } from '../models/order.model';

export interface CreateOrderRequest {
  shipping_address_id: number;
  notes?: string | null;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  // Defina a URL base da sua API para o domínio de pedidos
  private readonly API_URL = 'http://localhost:3000/api/orders';

  /**
   * Retorna o histórico de pedidos resumido do cliente autenticado.
   * Consome o endpoint que mapeia a view otimizada `vw_customer_order_history`.
   */
  getMyOrders(): Observable<CustomerOrderHistorySummary[]> {
    return this.http.get<CustomerOrderHistorySummary[]>(
      `${this.API_URL}/history`,
    );
  }

  /**
   * Retorna os detalhes completos de um pedido específico por ID
   * (incluindo itens comprados, snapshot de preços e endereço de entrega).
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/${id}`);
  }

  /**
   * Realiza a criação/fechamento de um novo pedido de cupcakes no checkout.
   */
  createOrder(orderPayload: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.API_URL, orderPayload);
  }
}
