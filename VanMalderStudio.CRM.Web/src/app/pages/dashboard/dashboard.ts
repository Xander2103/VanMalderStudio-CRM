import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardActions, DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { Lead, LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  summary?: DashboardSummary;
  actions?: DashboardActions;

  openPipelineValue = 0;
  proposalSentValue = 0;
  wonValue = 0;
  weightedPipelineValue = 0;

  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private leadService: LeadService
  ) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboardService.getSummary(),
      actions: this.dashboardService.getActions(),
      leads: this.leadService.getLeads('all').pipe(catchError(() => of([] as Lead[])))
    }).subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.actions = data.actions;

        const activeLeads = data.leads.filter((l) => l.status !== 8 && l.status !== 9 && !l.isArchived);

        this.openPipelineValue = activeLeads.reduce((sum, l) => {
          return sum + (l.proposalValue ?? l.estimatedValue ?? 0);
        }, 0);

        this.proposalSentValue = data.leads
          .filter((l) => l.status === 7 && !l.isArchived)
          .reduce((sum, l) => sum + (l.proposalValue ?? 0), 0);

        this.wonValue = data.leads
          .filter((l) => l.status === 8 && !l.isArchived)
          .reduce((sum, l) => sum + (l.proposalValue ?? l.estimatedValue ?? 0), 0);

        this.weightedPipelineValue = activeLeads.reduce((sum, l) => {
          const value = l.proposalValue ?? l.estimatedValue ?? 0;
          const prob = l.winProbability != null ? l.winProbability / 100 : 1;
          return sum + value * prob;
        }, 0);

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Dashboardgegevens konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  getLeadStatusLabel(status: number): string {
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

  getTaskPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Normal';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Unknown';
    }
  }

  getTaskPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'action-priority action-priority--low';
      case 2: return 'action-priority action-priority--normal';
      case 3: return 'action-priority action-priority--high';
      case 4: return 'action-priority action-priority--urgent';
      default: return 'action-priority';
    }
  }

  formatDate(dateString?: string): string {
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
      maximumFractionDigits: 0
    }).format(value);
  }

  monthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleDateString('nl-BE', { month: 'long' });
  }
}
