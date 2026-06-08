import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { Lead, LeadService } from '../../services/lead.service';
import { TaskItem, TaskService } from '../../services/task.service';

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

  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private leadService: LeadService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboardService.getSummary(),
      tasks: this.taskService.getTasks().pipe(catchError(() => of([]))),
      leads: this.leadService.getLeads().pipe(catchError(() => of([])))
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
}
