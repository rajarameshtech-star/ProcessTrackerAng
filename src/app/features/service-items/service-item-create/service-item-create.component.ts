import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ApplicationService } from '../../../core/services/application.service';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service';
import { ServiceItemService } from '../../../core/services/service-item.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProcessDefinitionProjectMappingService } from '../../../core/services/process-definition-project-mapping.service';

@Component({
  selector: 'app-service-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputsModule, DropDownsModule, ButtonModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="max-w-3xl">
      <app-page-header title="New Service Item" subtitle="Create a new process tracking record."></app-page-header>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-form">
        <div class="form-row split-2">
          <div>
             <label>Application</label>
             <kendo-dropdownlist formControlName="applicationId" [data]="applications" textField="name" valueField="id" [valuePrimitive]="true" (valueChange)="onApplicationChange($event)"></kendo-dropdownlist>
          </div>
          <div>
             <label>Process</label>
             <kendo-dropdownlist formControlName="processDefinitionId" [data]="filteredProcesses" textField="name" valueField="id" [valuePrimitive]="true" [disabled]="!form.get('applicationId')?.value || loadingProcesses"></kendo-dropdownlist>
          </div>
        </div>
        <div class="form-row">
          <label>Title</label><kendo-textbox formControlName="title"></kendo-textbox>
        </div>
        <div class="form-row split-3">
          <div><label>Reference Number</label><kendo-textbox formControlName="referenceNumber"></kendo-textbox></div>
          <div><label>Status</label><kendo-dropdownlist formControlName="status" [data]="['New','In Progress','Resolved']"></kendo-dropdownlist></div>
          <div><label>Priority</label><kendo-dropdownlist formControlName="priority" [data]="['Low','Medium','High']"></kendo-dropdownlist></div>
        </div>
        <div class="form-row split-2">
          <div><label>Assigned To</label><kendo-textbox formControlName="assignedTo"></kendo-textbox></div>
        </div>
        <div class="form-actions mt-4">
          <button kendoButton type="button" routerLink="/service-items">Cancel</button>
          <button kendoButton themeColor="primary" type="submit" [disabled]="form.invalid || submitting">Submit</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .max-w-3xl { max-width: 800px; margin: 0 auto; background: var(--surface-color); padding: 32px; border: 1px solid var(--border-color); border-radius: 12px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem; }
    .mt-4 { margin-top: 24px; }
  `]
})
export class ServiceItemCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appService = inject(ApplicationService);
  private processDefinitionService = inject(ProcessDefinitionService);
  private svcService = inject(ServiceItemService);
  private mappingService = inject(ProcessDefinitionProjectMappingService);
  private router = inject(Router);
  private ns = inject(NotificationService);

  form: FormGroup;
  applications: any[] = [];
  allProcesses: any[] = [];
  filteredProcesses: any[] = [];
  submitting = false;
  loadingProcesses = false;

  constructor() {
    this.form = this.fb.group({
      applicationId: ['', Validators.required],
      processDefinitionId: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      referenceNumber: ['', [Validators.required, Validators.maxLength(50)]],
      status: ['New', [Validators.required, Validators.maxLength(50)]],
      priority: ['Medium', [Validators.required, Validators.maxLength(50)]],
      assignedTo: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit() {
    this.appService.getApplications().subscribe(apps => this.applications = apps);
    this.processDefinitionService.getProcessDefinitions().subscribe(f => this.allProcesses = f);
  }

  onApplicationChange(appId: string) {
    this.form.patchValue({ processDefinitionId: '' });
    this.filteredProcesses = [];
    if (!appId) return;

    const selectedApp = this.applications.find(a => a.id === appId);
    if (!selectedApp || !selectedApp.projectId) {
      this.filteredProcesses = this.allProcesses; // fallback if no project mapping
      return;
    }

    this.loadingProcesses = true;
    this.mappingService.getByProject(selectedApp.projectId).subscribe({
      next: (mappings) => {
        const allowedProcessIds = mappings.map(m => m.processDefinitionId);
        this.filteredProcesses = this.allProcesses.filter(p => allowedProcessIds.includes(p.id));
        this.loadingProcesses = false;
      },
      error: () => {
        this.filteredProcesses = this.allProcesses;
        this.loadingProcesses = false;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.svcService.createServiceItem(this.form.value).subscribe({
      next: (createdItem) => {
        this.ns.success('Created successfully');
        if (createdItem && createdItem.id) {
          this.router.navigate(['/service-items', createdItem.id]);
        } else {
          this.router.navigate(['/service-items']);
        }
      },
      error: () => { this.ns.error('Failed to create service item'); this.submitting = false; }
    });
  }
}
