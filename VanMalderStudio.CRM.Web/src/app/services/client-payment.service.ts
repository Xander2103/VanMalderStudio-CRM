import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientPayment {
  id: number;
  clientId: number;
  clientCompanyName: string;
  month: number;
  year: number;
  amount: number;
  status: number; // 1=Pending 2=Paid 3=Overdue 4=Cancelled
  dueDate: string;
  paidAt?: string | null;
  reminderSentAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPayment {
  clientId: number;
  month: number;
  year: number;
  amount: number;
  status?: number;
  dueDate: string;
  notes?: string;
}

export interface GenerateMonthResponse {
  createdCount: number;
  skippedCount: number;
  year: number;
  month: number;
}

export interface UpdateClientPayment {
  amount: number;
  status: number;
  dueDate: string;
  paidAt?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientPaymentService {
  private readonly apiUrl = 'https://localhost:7242/api/ClientPayments';

  constructor(private http: HttpClient) {}

  getPayments(): Observable<ClientPayment[]> {
    return this.http.get<ClientPayment[]>(this.apiUrl);
  }

  getPayment(id: number): Observable<ClientPayment> {
    return this.http.get<ClientPayment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByClient(clientId: number): Observable<ClientPayment[]> {
    return this.http.get<ClientPayment[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getPaymentsByMonth(year: number, month: number): Observable<ClientPayment[]> {
    return this.http.get<ClientPayment[]>(`${this.apiUrl}/month/${year}/${month}`);
  }

  createPayment(payment: CreateClientPayment): Observable<ClientPayment> {
    return this.http.post<ClientPayment>(this.apiUrl, payment);
  }

  updatePayment(id: number, payment: UpdateClientPayment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payment);
  }

  markPaid(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateMonth(year: number, month: number): Observable<GenerateMonthResponse> {
    return this.http.post<GenerateMonthResponse>(`${this.apiUrl}/generate-month/${year}/${month}`, {});
  }
}
