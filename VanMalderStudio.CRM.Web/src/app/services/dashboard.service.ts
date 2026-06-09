import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  totalLeads: number;
  newLeads: number;
  calledNoAnswerLeads: number;
  interestedLeads: number;
  notInterestedLeads: number;
  proposalRequestedLeads: number;
  proposalSentLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalTasks: number;
  openTasks: number;
  dueTasks: number;
  urgentTasks: number;
}

export interface DashboardTaskItem {
  id: number;
  title: string;
  dueDate?: string;
  priority: number;
  leadId?: number;
  leadCompanyName?: string;
}

export interface DashboardPaymentItem {
  clientId: number;
  companyName: string;
  amount: number;
  dueDate: string;
  month: number;
  year: number;
}

export interface DashboardRenewalItem {
  clientId: number;
  companyName: string;
  type: string;
  label: string;
  renewalDate: string;
  daysRemaining: number;
}

export interface DashboardLeadItem {
  id: number;
  companyName: string;
  contactName?: string;
  status: number;
  updatedAt: string;
}

export interface DashboardActions {
  overdueTasks: DashboardTaskItem[];
  todayTasks: DashboardTaskItem[];
  overduePayments: DashboardPaymentItem[];
  upcomingRenewals: DashboardRenewalItem[];
  warmLeadsWithoutTask: DashboardLeadItem[];
  recentlyWonLeads: DashboardLeadItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = 'https://localhost:7242/api/Dashboard';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`);
  }

  getActions(): Observable<DashboardActions> {
    return this.http.get<DashboardActions>(`${this.baseUrl}/actions`);
  }
}
