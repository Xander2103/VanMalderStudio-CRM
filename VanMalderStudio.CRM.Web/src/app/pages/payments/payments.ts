import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ClientPayment,
  ClientPaymentService,
  CreateClientPayment,
  GenerateMonthResponse
} from '../../services/client-payment.service';

@Component({
  selector: 'app-payments',
  imports: [RouterLink, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {
  payments: ClientPayment[] = [];
  filteredPayments: ClientPayment[] = [];

  isLoading = true;
  isSaving = false;
  isGenerating = false;
  errorMessage = '';
  generateMessage = '';
  showCreateForm = false;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedStatusFilter: number | null = null;

  readonly monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  newPayment: CreateClientPayment = {
    clientId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    dueDate: '',
    notes: ''
  };

  constructor(private clientPaymentService: ClientPaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;

    this.clientPaymentService.getPaymentsByMonth(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.payments = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Betalingen konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  onMonthYearChange(): void {
    this.loadPayments();
  }

  applyFilters(): void {
    if (this.selectedStatusFilter === null) {
      this.filteredPayments = this.payments;
    } else {
      this.filteredPayments = this.payments.filter((p) => p.status === this.selectedStatusFilter);
    }
  }

  clearFilters(): void {
    this.selectedStatusFilter = null;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.selectedStatusFilter !== null;
  }

  // Summary computed from all payments for the selected month (ignores status filter)
  get totalExpected(): number {
    return this.payments.reduce((sum, p) => sum + p.amount, 0);
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

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  generateMonth(): void {
    this.isGenerating = true;
    this.generateMessage = '';
    this.errorMessage = '';

    this.clientPaymentService.generateMonth(this.selectedYear, this.selectedMonth).subscribe({
      next: (result: GenerateMonthResponse) => {
        this.generateMessage = `${result.createdCount} betalingen aangemaakt, ${result.skippedCount} overgeslagen.`;
        this.isGenerating = false;
        this.loadPayments();
      },
      error: () => {
        this.errorMessage = 'Betalingen konden niet gegenereerd worden.';
        this.isGenerating = false;
      }
    });
  }

  markPaid(id: number): void {
    this.clientPaymentService.markPaid(id).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: () => {
        this.errorMessage = 'Betaling kon niet gemarkeerd worden als betaald.';
      }
    });
  }

  createPayment(): void {
    if (!this.newPayment.clientId || this.newPayment.amount <= 0 || !this.newPayment.dueDate) {
      this.errorMessage = 'Klant-ID, bedrag en vervaldatum zijn verplicht.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.clientPaymentService.createPayment(this.newPayment).subscribe({
      next: () => {
        this.newPayment = {
          clientId: 0,
          month: this.selectedMonth,
          year: this.selectedYear,
          amount: 0,
          dueDate: '',
          notes: ''
        };

        this.showCreateForm = false;
        this.isSaving = false;
        this.loadPayments();
      },
      error: () => {
        this.errorMessage = 'Betaling kon niet aangemaakt worden.';
        this.isSaving = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Openstaand';
      case 2: return 'Betaald';
      case 3: return 'Achterstallig';
      case 4: return 'Geannuleerd';
      default: return 'Onbekend';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'payment-status payment-status--pending';
      case 2: return 'payment-status payment-status--paid';
      case 3: return 'payment-status payment-status--overdue';
      case 4: return 'payment-status payment-status--cancelled';
      default: return 'payment-status';
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

  formatEuro(value: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
