import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  selectedStatusFilter: number | null = null;

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
    notes: ''
  };

  constructor(
    private leadService: LeadService,
    private route: ActivatedRoute
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

    this.leadService.getLeads().subscribe({
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

  applyFilters(): void {
    if (!this.selectedStatusFilter) {
      this.filteredLeads = this.leads;
      return;
    }

    this.filteredLeads = this.leads.filter(
      (lead) => lead.status === this.selectedStatusFilter
    );
  }

  clearFilter(): void {
    this.selectedStatusFilter = null;
    this.filteredLeads = this.leads;
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
          notes: ''
        };

        this.showCreateForm = false;
        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Lead kon niet aangemaakt worden.';
        this.isSaving = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return 'Nieuw';
      case 2:
        return 'Gebeld - niet opgenomen';
      case 3:
        return 'Later terugbellen';
      case 4:
        return 'Geïnteresseerd';
      case 5:
        return 'Niet geïnteresseerd';
      case 6:
        return 'Offerte gevraagd';
      case 7:
        return 'Offerte verstuurd';
      case 8:
        return 'Gewonnen';
      case 9:
        return 'Verloren';
      default:
        return 'Onbekend';
    }
  }

  getActiveFilterLabel(): string {
    if (!this.selectedStatusFilter) {
      return 'Alle leads';
    }

    return this.getStatusLabel(this.selectedStatusFilter);
  }
}