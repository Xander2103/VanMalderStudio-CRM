import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  summary?: DashboardSummary;
  isLoading = true;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Dashboardgegevens konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }
}