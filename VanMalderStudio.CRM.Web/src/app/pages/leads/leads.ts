import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateLead, Lead, LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-leads',
  imports: [RouterLink, FormsModule],
  templateUrl: './leads.html',
  styleUrl: './leads.scss'
})
export class Leads implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  showCreateForm = false;

  searchQuery = '';
  selectedStatusFilter: number | null = null;
  archiveFilter: 'active' | 'won' | 'archived' | 'all' = 'active';

  newLead: CreateLead = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    source: '',
    status: 1,
    nextFollowUpAt: null,
    notes: '',
    estimatedValue: null,
    proposalValue: null,
    winProbability: null
  };

  constructor(
    private leadService: LeadService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const statusParam = params.get('status');
      this.selectedStatusFilter = statusParam ? Number(statusParam) : null;
      this.applyFilters();
    });

    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading = true;

    this.leadService.getLeads(this.archiveFilter).subscribe({
      next: (data) => {
        this.leads = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Leads konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  setArchiveFilter(filter: 'active' | 'won' | 'archived' | 'all'): void {
    this.archiveFilter = filter;
    this.loadLeads();
  }

  applyFilters(): void {
    let result = this.leads;

    if (this.selectedStatusFilter) {
      result = result.filter((lead) => lead.status === this.selectedStatusFilter);
    }

    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter((lead) =>
        (lead.companyName?.toLowerCase().includes(q)) ||
        (lead.contactName?.toLowerCase().includes(q)) ||
        (lead.email?.toLowerCase().includes(q)) ||
        (lead.phone?.toLowerCase().includes(q)) ||
        (lead.city?.toLowerCase().includes(q)) ||
        (lead.source?.toLowerCase().includes(q))
      );
    }

    this.filteredLeads = result;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatusFilter = null;
    this.router.navigate(['/leads']);
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery.trim() || !!this.selectedStatusFilter;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createLead(): void {
    if (!this.newLead.companyName.trim()) {
      this.errorMessage = 'Bedrijfsnaam is verplicht.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.leadService.createLead(this.newLead).subscribe({
      next: (createdLead) => {
        this.leads = [createdLead, ...this.leads];
        this.applyFilters();

        this.newLead = {
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          city: '',
          source: '',
          status: 1,
          nextFollowUpAt: null,
          notes: '',
          estimatedValue: null,
          proposalValue: null,
          winProbability: null
        };

        this.showCreateForm = false;
        this.isSaving = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message ?? 'Lead kon niet aangemaakt worden.';
        this.isSaving = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Nieuw';
      case 2: return 'Gebeld - niet opgenomen';
      case 3: return 'Later terugbellen';
      case 4: return 'Geïnteresseerd';
      case 5: return 'Niet geïnteresseerd';
      case 6: return 'Offerte gevraagd';
      case 7: return 'Offerte verstuurd';
      case 8: return 'Gewonnen';
      case 9: return 'Verloren';
      default: return 'Onbekend';
    }
  }
}
