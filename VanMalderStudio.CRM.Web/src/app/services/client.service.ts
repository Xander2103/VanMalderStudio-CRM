import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  // Business
  websitePrice?: number | null;
  monthlyMaintenanceFee?: number | null;
  amountPaid?: number | null;
  // Hosting / Server
  serverIpAddress?: string | null;
  sshUsername?: string | null;
  hostingProvider?: string | null;
  hostingPlan?: string | null;
  hostingManagementUrl?: string | null;
  hostingRenewalDate?: string | null;
  // Domain
  domainName?: string | null;
  domainRegistrar?: string | null;
  domainManagementUrl?: string | null;
  domainRenewalDate?: string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  archiveReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClient {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  // Business
  websitePrice?: number | null;
  monthlyMaintenanceFee?: number | null;
  amountPaid?: number | null;
  // Hosting / Server
  serverIpAddress?: string;
  sshUsername?: string;
  hostingProvider?: string;
  hostingPlan?: string;
  hostingManagementUrl?: string;
  hostingRenewalDate?: string | null;
  // Domain
  domainName?: string;
  domainRegistrar?: string;
  domainManagementUrl?: string;
  domainRenewalDate?: string | null;
}

export interface UpdateClient {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  // Business
  websitePrice?: number | null;
  monthlyMaintenanceFee?: number | null;
  amountPaid?: number | null;
  // Hosting / Server
  serverIpAddress?: string;
  sshUsername?: string;
  hostingProvider?: string;
  hostingPlan?: string;
  hostingManagementUrl?: string;
  hostingRenewalDate?: string | null;
  // Domain
  domainName?: string;
  domainRegistrar?: string;
  domainManagementUrl?: string;
  domainRenewalDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'https://localhost:7242/api/Clients';

  constructor(private http: HttpClient) {}

  getClients(archiveFilter: 'active' | 'archived' | 'all' = 'active'): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}?archiveFilter=${archiveFilter}`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  createClient(client: CreateClient): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: number, client: UpdateClient): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, client);
  }

  archiveClient(id: number, reason: string | null): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/archive`, { reason });
  }

  unarchiveClient(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/unarchive`, {});
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
