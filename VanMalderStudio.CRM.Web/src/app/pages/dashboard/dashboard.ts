import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { Lead, LeadService } from '../../services/lead.service';
import { TaskItem, TaskService } from '../../services/task.service';
import { Client, ClientService } from '../../services/client.service';

interface RenewalAlert {
  clientId: number;
  companyName: string;
  type: 'Hosting' | 'Domein';
  label: string;
  renewalDate: string;
  daysRemaining: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  summary?: DashboardSummary;
  dueTodayTasks: TaskItem[] = [];
  warmLeads: Lead[] = [];
  renewalAlerts: RenewalAlert[] = [];

  openPipelineValue = 0;
  proposalSentValue = 0;
  wonValue = 0;
  weightedPipelineValue = 0;

  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private leadService: LeadService,
    private taskService: TaskService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboardService.getSummary(),
      tasks: this.taskService.getTasks().pipe(catchError(() => of([]))),
      leads: this.leadService.getLeads().pipe(catchError(() => of([]))),
      clients: this.clientService.getClients().pipe(catchError(() => of([] as Client[])))
    }).subscribe({
      next: (data) => {
        this.summary = data.summary;

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        this.dueTodayTasks = data.tasks
          .filter((t) =>
            (t.status === 1 || t.status === 2) &&
            t.dueDate != null &&
            new Date(t.dueDate) <= endOfToday
          )
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
          .slice(0, 5);

        this.warmLeads = data.leads
          .filter((l) => l.status === 4 || l.status === 6 || l.status === 7)
          .slice(0, 5);

        const activeLeads = data.leads.filter((l) => l.status !== 8 && l.status !== 9);

        this.openPipelineValue = activeLeads.reduce((sum, l) => {
          return sum + (l.proposalValue ?? l.estimatedValue ?? 0);
        }, 0);

        this.proposalSentValue = data.leads
          .filter((l) => l.status === 7)
          .reduce((sum, l) => sum + (l.proposalValue ?? 0), 0);

        this.wonValue = data.leads
          .filter((l) => l.status === 8)
          .reduce((sum, l) => sum + (l.proposalValue ?? l.estimatedValue ?? 0), 0);

        this.weightedPipelineValue = activeLeads.reduce((sum, l) => {
          const value = l.proposalValue ?? l.estimatedValue ?? 0;
          const prob = l.winProbability != null ? l.winProbability / 100 : 1;
          return sum + value * prob;
        }, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() + 30);

        const alerts: RenewalAlert[] = [];
        for (const client of data.clients) {
          if (client.hostingRenewalDate) {
            const d = new Date(client.hostingRenewalDate);
            d.setHours(0, 0, 0, 0);
            if (d >= today && d <= cutoff) {
              alerts.push({
                clientId: client.id,
                companyName: client.companyName,
                type: 'Hosting',
                label: client.hostingProvider || 'Hosting',
                renewalDate: client.hostingRenewalDate,
                daysRemaining: Math.round((d.getTime() - today.getTime()) / 86400000)
              });
            }
          }
          if (client.domainRenewalDate) {
            const d = new Date(client.domainRenewalDate);
            d.setHours(0, 0, 0, 0);
            if (d >= today && d <= cutoff) {
              alerts.push({
                clientId: client.id,
                companyName: client.companyName,
                type: 'Domein',
                label: client.domainName || 'Domein',
                renewalDate: client.domainRenewalDate,
                daysRemaining: Math.round((d.getTime() - today.getTime()) / 86400000)
              });
            }
          }
        }

        this.renewalAlerts = alerts
          .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
          .slice(0, 6);

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
      case 4: return 'Geïnteresseerd';
      case 6: return 'Offerte gevraagd';
      case 7: return 'Offerte verstuurd';
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
}
