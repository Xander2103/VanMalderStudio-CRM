import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Client, ClientService, CreateClient } from '../../services/client.service';

@Component({
  selector: 'app-clients',
  imports: [RouterLink, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss'
})
export class Clients implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  showCreateForm = false;

  searchQuery = '';
  archiveFilter: 'active' | 'archived' | 'all' = 'active';

  newClient: CreateClient = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
    websitePrice: null,
    monthlyMaintenanceFee: null,
    amountPaid: null,
    serverIpAddress: '',
    sshUsername: '',
    hostingProvider: '',
    hostingPlan: '',
    hostingManagementUrl: '',
    hostingRenewalDate: null,
    domainName: '',
    domainRegistrar: '',
    domainManagementUrl: '',
    domainRenewalDate: null
  };

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;

    this.clientService.getClients(this.archiveFilter).subscribe({
      next: (data) => {
        this.clients = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Klanten konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  setArchiveFilter(filter: 'active' | 'archived' | 'all'): void {
    this.archiveFilter = filter;
    this.loadClients();
  }

  applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.filteredClients = this.clients;
      return;
    }

    this.filteredClients = this.clients.filter((c) =>
      (c.companyName?.toLowerCase().includes(q)) ||
      (c.contactName?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.phone?.toLowerCase().includes(q)) ||
      (c.domainName?.toLowerCase().includes(q)) ||
      (c.hostingProvider?.toLowerCase().includes(q))
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  get hasActiveSearch(): boolean {
    return !!this.searchQuery.trim();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createClient(): void {
    if (!this.newClient.companyName.trim()) {
      this.errorMessage = 'Bedrijfsnaam is verplicht.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.clientService.createClient(this.newClient).subscribe({
      next: (created) => {
        this.clients = [created, ...this.clients];
        this.applyFilters();

        this.newClient = {
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          notes: '',
          websitePrice: null,
          monthlyMaintenanceFee: null,
          amountPaid: null,
          serverIpAddress: '',
          sshUsername: '',
          hostingProvider: '',
          hostingPlan: '',
          hostingManagementUrl: '',
          hostingRenewalDate: null,
          domainName: '',
          domainRegistrar: '',
          domainManagementUrl: '',
          domainRenewalDate: null
        };

        this.showCreateForm = false;
        this.isSaving = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message ?? 'Klant kon niet aangemaakt worden.';
        this.isSaving = false;
      }
    });
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
