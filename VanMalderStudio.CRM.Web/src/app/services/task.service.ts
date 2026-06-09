import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: number;
  status: number;
  leadId?: number;
  leadCompanyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskItem {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: number;
  leadId?: number | null;
}

export interface UpdateTaskItem {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: number;
  status: number;
  leadId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = 'https://localhost:7242/api/Tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  createTask(task: CreateTaskItem): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
