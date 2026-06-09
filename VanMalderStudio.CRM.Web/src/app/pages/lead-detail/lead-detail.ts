import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateLeadActivity, Lead, LeadService, UpdateLead } from '../../services/lead.service';
import { CreateTaskItem, TaskItem, TaskService } from '../../services/task.service';

@Component({
  selector: 'app-lead-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './lead-detail.html',
  styleUrl: './lead-detail.scss'
})
export class LeadDetail implements OnInit {
  lead?: Lead;
  leadId = 0;

  isLoading = true;
  isSavingActivity = false;
  isSavingStatus = false;
  isSavingEdit = false;
  isEditMode = false;

  errorMessage = '';
  successMessage = '';
  showActivityForm = false;
  selectedStatus = 1;

  editForm: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    website: string;
    city: string;
    source: string;
    status: number;
    lastContactAt: string;
    nextFollowUpAt: string;
    notes: string;
    estimatedValue: number | null;
    proposalValue: number | null;
    winProbability: number | null;
  } = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    source: '',
    status: 1,
    lastContactAt: '',
    nextFollowUpAt: '',
    notes: '',
    estimatedValue: null,
    proposalValue: null,
    winProbability: null,
  };

  newActivity: CreateLeadActivity = {
    type: 'Call',
    description: '',
    activityDate: null
  };

  leadTasks: TaskItem[] = [];
  isLoadingTasks = false;
  showTaskForm = false;
  isSavingTask = false;

  newTask: CreateTaskItem = {
    title: '',
    description: '',
    dueDate: null,
    priority: 2,
    leadId: null
  };

  isArchiving = false;
  showArchiveModal = false;
  showUnarchiveModal = false;
  archiveModalReason = '';
  archiveModalError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Ongeldige lead.';
      this.isLoading = false;
      return;
    }

    this.leadId = id;
    this.loadLead();
    this.loadLeadTasks();
  }

  loadLead(): void {
    this.leadService.getLead(this.leadId).subscribe({
      next: (data) => {
        this.lead = data;
        this.selectedStatus = data.status;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Lead kon niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  loadLeadTasks(): void {
    this.isLoadingTasks = true;

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.leadTasks = tasks.filter(task => task.leadId === this.leadId);
        this.isLoadingTasks = false;
      },
      error: () => {
        this.isLoadingTasks = false;
      }
    });
  }

  enterEditMode(): void {
    if (!this.lead) return;
    this.editForm = {
      companyName: this.lead.companyName,
      contactName: this.lead.contactName ?? '',
      email: this.lead.email ?? '',
      phone: this.lead.phone ?? '',
      website: this.lead.website ?? '',
      city: this.lead.city ?? '',
      source: this.lead.source ?? '',
      status: this.lead.status,
      lastContactAt: this.toDateInput(this.lead.lastContactAt),
      nextFollowUpAt: this.toDateInput(this.lead.nextFollowUpAt),
      notes: this.lead.notes ?? '',
      estimatedValue: this.lead.estimatedValue ?? null,
      proposalValue: this.lead.proposalValue ?? null,
      winProbability: this.lead.winProbability ?? null,
    };
    this.isEditMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
  }

  saveEdit(): void {
    if (!this.editForm.companyName.trim()) {
      this.errorMessage = 'Bedrijfsnaam is verplicht.';
      return;
    }

    this.isSavingEdit = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateLead = {
      companyName: this.editForm.companyName.trim(),
      contactName: this.editForm.contactName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      website: this.editForm.website,
      city: this.editForm.city,
      source: this.editForm.source,
      status: this.editForm.status,
      lastContactAt: this.editForm.lastContactAt || null,
      nextFollowUpAt: this.editForm.nextFollowUpAt || null,
      notes: this.editForm.notes,
      estimatedValue: this.editForm.estimatedValue,
      proposalValue: this.editForm.proposalValue,
      winProbability: this.editForm.winProbability,
    };

    this.leadService.updateLead(this.leadId, payload).subscribe({
      next: () => {
        this.isSavingEdit = false;
        this.isEditMode = false;
        this.successMessage = 'Lead bijgewerkt.';
        this.loadLead();
      },
      error: () => {
        this.errorMessage = 'Lead kon niet opgeslagen worden.';
        this.isSavingEdit = false;
      }
    });
  }

  archiveLead(): void {
    if (!this.lead) return;
    this.archiveModalReason = '';
    this.archiveModalError = '';
    this.showArchiveModal = true;
  }

  confirmArchive(): void {
    this.isArchiving = true;
    this.archiveModalError = '';

    this.leadService.archiveLead(this.leadId, this.archiveModalReason.trim() || null).subscribe({
      next: () => {
        this.showArchiveModal = false;
        this.router.navigate(['/leads']);
      },
      error: () => {
        this.archiveModalError = 'Archivering mislukt. Probeer opnieuw.';
        this.isArchiving = false;
      }
    });
  }

  cancelArchive(): void {
    if (this.isArchiving) return;
    this.showArchiveModal = false;
    this.archiveModalReason = '';
    this.archiveModalError = '';
  }

  unarchiveLead(): void {
    if (!this.lead) return;
    this.archiveModalError = '';
    this.showUnarchiveModal = true;
  }

  confirmUnarchive(): void {
    this.isArchiving = true;
    this.archiveModalError = '';

    this.leadService.unarchiveLead(this.leadId).subscribe({
      next: () => {
        this.showUnarchiveModal = false;
        this.isArchiving = false;
        this.successMessage = 'Lead hersteld.';
        this.loadLead();
      },
      error: () => {
        this.archiveModalError = 'Herstellen mislukt. Probeer opnieuw.';
        this.isArchiving = false;
      }
    });
  }

  cancelUnarchive(): void {
    if (this.isArchiving) return;
    this.showUnarchiveModal = false;
  }

  private toDateInput(iso: string | undefined | null): string {
    if (!iso) return '';
    return iso.substring(0, 10);
  }

  toggleActivityForm(): void {
    this.showActivityForm = !this.showActivityForm;
  }

  toggleTaskForm(): void {
    this.showTaskForm = !this.showTaskForm;
  }

  createActivity(): void {
    if (!this.newActivity.description.trim()) {
      this.errorMessage = 'Beschrijving is verplicht.';
      return;
    }

    this.isSavingActivity = true;
    this.errorMessage = '';

    this.leadService.createActivity(this.leadId, this.newActivity).subscribe({
      next: () => {
        this.newActivity = {
          type: 'Call',
          description: '',
          activityDate: null
        };
        this.showActivityForm = false;
        this.isSavingActivity = false;
        this.loadLead();
      },
      error: () => {
        this.errorMessage = 'Follow-up kon niet toegevoegd worden.';
        this.isSavingActivity = false;
      }
    });
  }

  createLeadTask(): void {
    if (!this.newTask.title.trim()) {
      this.errorMessage = 'Taaknaam is verplicht.';
      return;
    }

    this.isSavingTask = true;
    this.errorMessage = '';

    const taskToCreate: CreateTaskItem = {
      ...this.newTask,
      leadId: this.leadId
    };

    this.taskService.createTask(taskToCreate).subscribe({
      next: () => {
        this.newTask = {
          title: '',
          description: '',
          dueDate: null,
          priority: 2,
          leadId: null
        };
        this.showTaskForm = false;
        this.isSavingTask = false;
        this.loadLeadTasks();
      },
      error: () => {
        this.errorMessage = 'Taak kon niet aangemaakt worden.';
        this.isSavingTask = false;
      }
    });
  }

  updateStatus(): void {
    if (!this.lead) return;

    const updatedLead: UpdateLead = {
      companyName: this.lead.companyName,
      contactName: this.lead.contactName,
      email: this.lead.email,
      phone: this.lead.phone,
      website: this.lead.website,
      city: this.lead.city,
      source: this.lead.source,
      status: Number(this.selectedStatus),
      lastContactAt: this.lead.lastContactAt ?? null,
      nextFollowUpAt: this.lead.nextFollowUpAt ?? null,
      notes: this.lead.notes,
      estimatedValue: this.lead.estimatedValue ?? null,
      proposalValue: this.lead.proposalValue ?? null,
      winProbability: this.lead.winProbability ?? null
    };

    this.isSavingStatus = true;
    this.errorMessage = '';

    this.leadService.updateLead(this.leadId, updatedLead).subscribe({
      next: () => {
        this.isSavingStatus = false;
        this.loadLead();
      },
      error: () => {
        this.errorMessage = 'Status kon niet aangepast worden.';
        this.isSavingStatus = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Nieuw';
      case 2: return 'Gebeld - niet opgenomen';
      case 3: return 'Later terugbellen';
      case 4: return 'Geïnteresseerd';
      case 5: return 'Niet geïnteresseerd';
      case 6: return 'Offerte gevraagd';
      case 7: return 'Offerte verstuurd';
      case 8: return 'Gewonnen';
      case 9: return 'Verloren';
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
      case 1: return 'task-priority-pill task-priority-pill--low';
      case 2: return 'task-priority-pill task-priority-pill--normal';
      case 3: return 'task-priority-pill task-priority-pill--high';
      case 4: return 'task-priority-pill task-priority-pill--urgent';
      default: return 'task-priority-pill';
    }
  }

  getTaskStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Open';
      case 2: return 'In progress';
      case 3: return 'Done';
      case 4: return 'Postponed';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}
