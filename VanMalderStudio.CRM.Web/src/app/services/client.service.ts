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
  private readonly apiUrl = 'http://localhost:5080/api/Clients';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
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

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
