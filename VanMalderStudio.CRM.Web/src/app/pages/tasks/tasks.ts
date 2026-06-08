import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreateTaskItem, TaskItem, TaskService, UpdateTaskItem } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  imports: [RouterLink, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {
  tasks: TaskItem[] = [];

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  showCreateForm = false;

  newTask: CreateTaskItem = {
    title: '',
    description: '',
    dueDate: null,
    priority: 2,
    leadId: null
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;

    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Taken konden niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createTask(): void {
    if (!this.newTask.title.trim()) {
      this.errorMessage = 'Titel is verplicht.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.taskService.createTask(this.newTask).subscribe({
      next: (createdTask) => {
        this.tasks = [createdTask, ...this.tasks];

        this.newTask = {
          title: '',
          description: '',
          dueDate: null,
          priority: 2,
          leadId: null
        };

        this.showCreateForm = false;
        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Taak kon niet aangemaakt worden.';
        this.isSaving = false;
      }
    });
  }

  updateTaskStatus(task: TaskItem, newStatus: number): void {
    const update: UpdateTaskItem = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ?? null,
      priority: task.priority,
      status: newStatus,
      leadId: task.leadId ?? null
    };

    this.taskService.updateTask(task.id, update).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: () => {
        this.errorMessage = 'Status kon niet bijgewerkt worden.';
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Open';
      case 2: return 'In progress';
      case 3: return 'Done';
      case 4: return 'Postponed';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Normal';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Unknown';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-pill priority-pill--low';
      case 2: return 'priority-pill priority-pill--normal';
      case 3: return 'priority-pill priority-pill--high';
      case 4: return 'priority-pill priority-pill--urgent';
      default: return 'priority-pill';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
