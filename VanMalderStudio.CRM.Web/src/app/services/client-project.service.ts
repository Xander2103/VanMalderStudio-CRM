import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientProject {
  id: number;
  clientId: number;
  clientCompanyName: string;
  projectName: string;
  projectType: number;
  status: number;
  price?: number | null;
  startDate?: string | null;
  deadline?: string | null;
  liveUrl?: string | null;
  previewUrl?: string | null;
  gitHubRepoUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientProject {
  clientId: number;
  projectName: string;
  projectType: number;
  status: number;
  price?: number | null;
  startDate?: string | null;
  deadline?: string | null;
  liveUrl?: string | null;
  previewUrl?: string | null;
  gitHubRepoUrl?: string | null;
  notes?: string | null;
}

export interface UpdateClientProject {
  projectName: string;
  projectType: number;
  status: number;
  price?: number | null;
  startDate?: string | null;
  deadline?: string | null;
  liveUrl?: string | null;
  previewUrl?: string | null;
  gitHubRepoUrl?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientProjectService {
  private readonly apiUrl = 'http://localhost:5080/api/ClientProjects';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(this.apiUrl);
  }

  getProject(id: number): Observable<ClientProject> {
    return this.http.get<ClientProject>(`${this.apiUrl}/${id}`);
  }

  getProjectsByClient(clientId: number): Observable<ClientProject[]> {
    return this.http.get<ClientProject[]>(`${this.apiUrl}/client/${clientId}`);
  }

  createProject(project: CreateClientProject): Observable<ClientProject> {
    return this.http.post<ClientProject>(this.apiUrl, project);
  }

  updateProject(id: number, project: UpdateClientProject): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
