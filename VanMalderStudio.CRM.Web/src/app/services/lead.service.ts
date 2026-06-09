import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeadActivity {
  id: number;
  leadId: number;
  type: string;
  description: string;
  activityDate: string;
  createdAt: string;
}

export interface Lead {
  id: number;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  source?: string;
  status: number;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  estimatedValue?: number | null;
  proposalValue?: number | null;
  winProbability?: number | null;
  createdAt: string;
  updatedAt: string;
  activities: LeadActivity[];
}

export interface CreateLead {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  source?: string;
  status: number;
  nextFollowUpAt?: string | null;
  notes?: string;
  estimatedValue?: number | null;
  proposalValue?: number | null;
  winProbability?: number | null;
}

export interface UpdateLead {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  source?: string;
  status: number;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string;
  estimatedValue?: number | null;
  proposalValue?: number | null;
  winProbability?: number | null;
}

export interface CreateLeadActivity {
  type: string;
  description: string;
  activityDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly apiUrl = 'https://localhost:7242/api/Leads';

  constructor(private http: HttpClient) {}

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.apiUrl);
  }

  getLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  createLead(lead: CreateLead): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }

  updateLead(id: number, lead: UpdateLead): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, lead);
  }

  createActivity(leadId: number, activity: CreateLeadActivity): Observable<LeadActivity> {
    return this.http.post<LeadActivity>(`${this.apiUrl}/${leadId}/activities`, activity);
  }
}