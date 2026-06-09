import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';
import { Client, ClientService, UpdateClient } from '../../services/client.service';
import { ClientPayment, ClientPaymentService } from '../../services/client-payment.service';
import { ClientProject, ClientProjectService, CreateClientProject, UpdateClientProject } from '../../services/client-project.service';

@Component({
  selector: 'app-client-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss'
})
export class ClientDetail implements OnInit {
  client?: Client;
  payments: ClientPayment[] = [];
  projects: ClientProject[] = [];

  isLoading = true;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  paymentsErrorMessage = '';
  projectsErrorMessage = '';
  showProjectForm = false;
  isSavingProject = false;
  editingProjectId: number | null = null;
  isSavingProjectEdit = false;

  isArchiving = false;
  showArchiveModal = false;
  showUnarchiveModal = false;
  archiveModalReason = '';
  archiveModalError = '';

  editForm: UpdateClient = { companyName: '' };
  newProject: CreateClientProject = { clientId: 0, projectName: '', projectType: 1, status: 1 };
  projectEditForm: UpdateClientProject = { projectName: '', projectType: 1, status: 1 };

  private clientId = 0;

  readonly monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private clientPaymentService: ClientPaymentService,
    private clientProjectService: ClientProjectService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Ongeldige klant.';
      this.isLoading = false;
      return;
    }

    this.clientId = id;
    this.newProject.clientId = id;

    forkJoin({
      client: this.clientService.getClient(id),
      payments: this.clientPaymentService.getPaymentsByClient(id).pipe(catchError(() => of([]))),
      projects: this.clientProjectService.getProjectsByClient(id).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ client, payments, projects }) => {
        this.client = client;
        this.payments = payments;
        this.projects = projects;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Klant kon niet geladen worden.';
        this.isLoading = false;
      }
    });
  }

  // ── Client edit ────────────────────────────────────────────────────────────

  startEdit(): void {
    if (!this.client) return;
    this.editForm = {
      companyName: this.client.companyName,
      contactName: this.client.contactName,
      email: this.client.email,
      phone: this.client.phone,
      website: this.client.website,
      notes: this.client.notes,
      websitePrice: this.client.websitePrice,
      monthlyMaintenanceFee: this.client.monthlyMaintenanceFee,
      amountPaid: this.client.amountPaid,
      serverIpAddress: this.client.serverIpAddress ?? undefined,
      sshUsername: this.client.sshUsername ?? undefined,
      hostingProvider: this.client.hostingProvider ?? undefined,
      hostingPlan: this.client.hostingPlan ?? undefined,
      hostingManagementUrl: this.client.hostingManagementUrl ?? undefined,
      hostingRenewalDate: this.toDateInputValue(this.client.hostingRenewalDate),
      domainName: this.client.domainName ?? undefined,
      domainRegistrar: this.client.domainRegistrar ?? undefined,
      domainManagementUrl: this.client.domainManagementUrl ?? undefined,
      domainRenewalDate: this.toDateInputValue(this.client.domainRenewalDate),
    };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveEdit(): void {
    if (!this.editForm.companyName?.trim()) {
      this.errorMessage = 'Bedrijfsnaam is verplicht.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateClient = {
      ...this.editForm,
      hostingRenewalDate: this.editForm.hostingRenewalDate || null,
      domainRenewalDate: this.editForm.domainRenewalDate || null,
    };

    this.clientService.updateClient(this.clientId, payload).subscribe({
      next: () => {
        if (this.client) {
          this.client = { ...this.client, ...payload, updatedAt: new Date().toISOString() };
        }
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Klantgegevens opgeslagen.';
      },
      error: () => {
        this.errorMessage = 'Opslaan mislukt. Probeer opnieuw.';
        this.isSaving = false;
      }
    });
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  loadPayments(): void {
    this.clientPaymentService.getPaymentsByClient(this.clientId).subscribe({
      next: (data) => { this.payments = data; },
      error: () => { this.paymentsErrorMessage = 'Betalingen konden niet geladen worden.'; }
    });
  }

  markPaid(id: number): void {
    this.paymentsErrorMessage = '';
    this.clientPaymentService.markPaid(id).subscribe({
      next: () => { this.loadPayments(); },
      error: () => { this.paymentsErrorMessage = 'Betaling kon niet gemarkeerd worden als betaald.'; }
    });
  }

  get totalPaid(): number {
    return this.payments.filter((p) => p.status === 2).reduce((sum, p) => sum + p.amount, 0);
  }

  get totalOutstanding(): number {
    return this.payments.filter((p) => p.status !== 2 && p.status !== 4).reduce((sum, p) => sum + p.amount, 0);
  }

  get pendingCount(): number {
    return this.payments.filter((p) => p.status === 1 || p.status === 3).length;
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Openstaand';
      case 2: return 'Betaald';
      case 3: return 'Te laat';
      case 4: return 'Geannuleerd';
      default: return 'Onbekend';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'cd-payment-status cd-payment-status--pending';
      case 2: return 'cd-payment-status cd-payment-status--paid';
      case 3: return 'cd-payment-status cd-payment-status--overdue';
      case 4: return 'cd-payment-status cd-payment-status--cancelled';
      default: return 'cd-payment-status';
    }
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  loadProjects(): void {
    this.clientProjectService.getProjectsByClient(this.clientId).subscribe({
      next: (data) => { this.projects = data; },
      error: () => { this.projectsErrorMessage = 'Projecten konden niet geladen worden.'; }
    });
  }

  toggleProjectForm(): void {
    this.showProjectForm = !this.showProjectForm;
    this.projectsErrorMessage = '';
    if (this.showProjectForm) {
      this.newProject = { clientId: this.clientId, projectName: '', projectType: 1, status: 1 };
    }
  }

  createProject(): void {
    if (!this.newProject.projectName.trim()) {
      this.projectsErrorMessage = 'Projectnaam is verplicht.';
      return;
    }

    this.isSavingProject = true;
    this.projectsErrorMessage = '';

    const payload: CreateClientProject = {
      ...this.newProject,
      startDate: this.newProject.startDate || null,
      deadline: this.newProject.deadline || null,
    };

    this.clientProjectService.createProject(payload).subscribe({
      next: () => {
        this.showProjectForm = false;
        this.isSavingProject = false;
        this.loadProjects();
      },
      error: () => {
        this.projectsErrorMessage = 'Project kon niet aangemaakt worden.';
        this.isSavingProject = false;
      }
    });
  }

  startProjectEdit(project: ClientProject): void {
    this.editingProjectId = project.id;
    this.projectEditForm = {
      projectName: project.projectName,
      projectType: project.projectType,
      status: project.status,
      price: project.price,
      startDate: this.toDateInputValue(project.startDate),
      deadline: this.toDateInputValue(project.deadline),
      liveUrl: project.liveUrl ?? undefined,
      previewUrl: project.previewUrl ?? undefined,
      gitHubRepoUrl: project.gitHubRepoUrl ?? undefined,
      notes: project.notes ?? undefined,
    };
    this.projectsErrorMessage = '';
  }

  cancelProjectEdit(): void {
    this.editingProjectId = null;
    this.projectsErrorMessage = '';
  }

  saveProjectEdit(projectId: number): void {
    if (!this.projectEditForm.projectName.trim()) {
      this.projectsErrorMessage = 'Projectnaam is verplicht.';
      return;
    }

    this.isSavingProjectEdit = true;
    this.projectsErrorMessage = '';

    const payload: UpdateClientProject = {
      ...this.projectEditForm,
      startDate: this.projectEditForm.startDate || null,
      deadline: this.projectEditForm.deadline || null,
    };

    this.clientProjectService.updateProject(projectId, payload).subscribe({
      next: () => {
        const idx = this.projects.findIndex((p) => p.id === projectId);
        if (idx !== -1) {
          this.projects[idx] = {
            ...this.projects[idx],
            ...payload,
            updatedAt: new Date().toISOString()
          };
        }
        this.editingProjectId = null;
        this.isSavingProjectEdit = false;
      },
      error: () => {
        this.projectsErrorMessage = 'Project kon niet opgeslagen worden.';
        this.isSavingProjectEdit = false;
      }
    });
  }

  getProjectTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'Website';
      case 2: return 'Webshop';
      case 3: return 'Redesign';
      case 4: return 'Maintenance';
      case 5: return 'SEO';
      case 6: return 'Other';
      default: return 'Onbekend';
    }
  }

  getProjectTypeClass(type: number): string {
    switch (type) {
      case 1: return 'cd-project-type cd-project-type--website';
      case 2: return 'cd-project-type cd-project-type--webshop';
      case 3: return 'cd-project-type cd-project-type--redesign';
      case 4: return 'cd-project-type cd-project-type--maintenance';
      case 5: return 'cd-project-type cd-project-type--seo';
      case 6: return 'cd-project-type cd-project-type--other';
      default: return 'cd-project-type cd-project-type--other';
    }
  }

  getProjectStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Planned';
      case 2: return 'In progress';
      case 3: return 'Waiting for feedback';
      case 4: return 'Completed';
      case 5: return 'On hold';
      case 6: return 'Cancelled';
      default: return 'Onbekend';
    }
  }

  getProjectStatusClass(status: number): string {
    switch (status) {
      case 1: return 'cd-project-status cd-project-status--planned';
      case 2: return 'cd-project-status cd-project-status--inprogress';
      case 3: return 'cd-project-status cd-project-status--waiting';
      case 4: return 'cd-project-status cd-project-status--completed';
      case 5: return 'cd-project-status cd-project-status--onhold';
      case 6: return 'cd-project-status cd-project-status--cancelled';
      default: return 'cd-project-status';
    }
  }

  // ── Archive ────────────────────────────────────────────────────────────────

  archiveClient(): void {
    if (!this.client) return;
    this.archiveModalReason = '';
    this.archiveModalError = '';
    this.showArchiveModal = true;
  }

  confirmArchive(): void {
    this.isArchiving = true;
    this.archiveModalError = '';

    this.clientService.archiveClient(this.clientId, this.archiveModalReason.trim() || null).subscribe({
      next: () => {
        this.showArchiveModal = false;
        this.router.navigate(['/clients']);
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

  unarchiveClient(): void {
    if (!this.client) return;
    this.archiveModalError = '';
    this.showUnarchiveModal = true;
  }

  confirmUnarchive(): void {
    this.isArchiving = true;
    this.archiveModalError = '';

    this.clientService.unarchiveClient(this.clientId).subscribe({
      next: () => {
        this.showUnarchiveModal = false;
        this.isArchiving = false;
        this.successMessage = 'Klant hersteld.';
        this.clientService.getClient(this.clientId).subscribe({
          next: (c) => { this.client = c; },
          error: () => {}
        });
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  private toDateInputValue(dateString?: string | null): string {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-BE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  formatEuro(value?: number | null): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: 0, maximumFractionDigits: 2
    }).format(value);
  }
}
