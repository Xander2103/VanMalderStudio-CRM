import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { Client, ClientService } from '../../services/client.service';
import { ClientPayment, ClientPaymentService } from '../../services/client-payment.service';

@Component({
  selector: 'app-client-detail',
  imports: [RouterLink],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss'
})
export class ClientDetail implements OnInit {
  client?: Client;
  payments: ClientPayment[] = [];

  isLoading = true;
  errorMessage = '';
  paymentsErrorMessage = '';

  private clientId = 0;

  readonly monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private clientPaymentService: ClientPaymentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Ongeldige klant.';
      this.isLoading = false;
      return;
    }

    this.clientId = id;

    forkJoin({
      client: this.clientService.getClient(id),
      payments: this.clientPaymentService.getPaymentsByClient(id).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ client, payments }) => {
        this.client = client;
        this.payments = payments;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Klant kon niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  loadPayments(): void {
    this.clientPaymentService.getPaymentsByClient(this.clientId).subscribe({
      next: (data) => {
        this.payments = data;
      },
      error: () => {
        this.paymentsErrorMessage = 'Betalingen konden niet geladen worden.';
      }
    });
  }

  markPaid(id: number): void {
    this.paymentsErrorMessage = '';
    this.clientPaymentService.markPaid(id).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: () => {
        this.paymentsErrorMessage = 'Betaling kon niet gemarkeerd worden als betaald.';
      }
    });
  }

  get totalPaid(): number {
    return this.payments
      .filter((p) => p.status === 2)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get totalOutstanding(): number {
    return this.payments
      .filter((p) => p.status !== 2 && p.status !== 4)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get pendingCount(): number {
    return this.payments.filter((p) => p.status === 1 || p.status === 3).length;
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Openstaand';
      case 2: return 'Betaald';
      case 3: return 'Te laat';
      case 4: return 'Geannuleerd';
      default: return 'Onbekend';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'cd-payment-status cd-payment-status--pending';
      case 2: return 'cd-payment-status cd-payment-status--paid';
      case 3: return 'cd-payment-status cd-payment-status--overdue';
      case 4: return 'cd-payment-status cd-payment-status--cancelled';
      default: return 'cd-payment-status';
    }
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatEuro(value?: number | null): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
