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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'https://localhost:7242/api/Dashboard/summary';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.apiUrl);
  }
}