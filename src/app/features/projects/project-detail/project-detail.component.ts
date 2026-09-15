
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common'; 
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from '@progress/kendo-angular-buttons'; 
import { IconsModule } from '@progress/kendo-angular-icons'; 
import { DialogsModule } from '@progress/kendo-angular-dialog'; 
import { InputsModule } from '@progress/kendo-angular-inputs'; 
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component'; 
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ProjectService } from '../../../core/services/project.service'; 
import { ApplicationService } from '../../../core/services/application.service';
import { ProcessDefinitionProjectMappingService } from '../../../core/services/process-definition-project-mapping.service';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, IconsModule, DialogsModule, InputsModule, LoadingStateComponent, EmptyStateComponent],
  template: `
    <div class="breadcrumb mb-4">
       <a routerLink="/projects">Projects</a>
       <kendo-icon name="chevron-right" class="mx-2"></kendo-icon>
       <span>{{ project?.name || 'Loading...' }}</span>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && project" class="layout-wrapper">
      <div class="header-section">
         <div style="flex: 1;">
            <div class="title-row">
               <h1 class="main-title">{{project.name}}</h1>
            </div>
            <div class="ref-number">{{project.description || 'No description provided'}}</div>
         </div>
         <div class="header-actions">
            <button kendoButton themeColor="primary" icon="plus" (click)="router.navigate(['/applications/create'], {queryParams: {projectId: project.id}})">New Application</button>
            <button kendoButton icon="pencil" (click)="openEdit()">Edit</button>
         </div>
      </div>

      <div class="main-grid">
         <div class="workspace-col">
            <h3 class="section-head">Applications</h3>
            <div class="card-list" *ngIf="applications.length > 0">
               <a class="resource-card" *ngFor="let app of applications" [routerLink]="['/applications', app.id]">
                  <div class="r-icon"><kendo-icon name="grid-layout"></kendo-icon></div>
                  <div class="r-content">
                     <h4>{{app.name}}</h4>
                     <p>{{app.description || 'Application domain'}}</p>
                  </div>
               </a>
            </div>
            <app-empty-state *ngIf="applications.length === 0" icon="grid-layout" title="No applications found" description="Create an application to organize your operational workspace under this project." actionLabel="Create Application" (action)="null"></app-empty-state>
         </div>
         
         <div class="properties-col">
            <div class="prop-panel">
               <h3 class="section-head" style="margin-top: 0; margin-bottom: 12px; font-size: 1rem;">Available Processes</h3>
               <p class="muted-text mb-4" style="font-size:0.8rem; margin-top:0;">These templates are allowed within this project workspace.</p>
               
               <div class="prop-list">
                  <div class="prop-item" *ngFor="let proc of mappedProcesses">
                     <span class="prop-value" style="font-weight: 500;">
                        <kendo-icon name="gear" style="margin-right: 8px; color: var(--muted-text-color)"></kendo-icon>
                        <a [routerLink]="['/processes', proc.id]" class="link">{{proc.name}}</a>
                     </span>
                  </div>
                  <div *ngIf="mappedProcesses.length === 0" class="muted-text text-center" style="font-size: 0.8rem; padding: 12px 0;">
                     No processes mapped. <br> Map via <a routerLink="/processes">Process definitions</a>.
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
    
    <kendo-dialog *ngIf="isEditing" title="Edit Project" (close)="closeEdit()" [width]="500">
      <form [formGroup]="editForm" (ngSubmit)="saveEdit()" class="pt-form">
         <div class="form-row">
            <label>Name</label><kendo-textbox formControlName="name"></kendo-textbox>
         </div>
         <div class="form-row">
            <label>Description</label><textarea kendoTextArea formControlName="description"></textarea>
         </div>
      </form>
      <kendo-dialog-actions>
         <button kendoButton (click)="closeEdit()" [disabled]="saving">Cancel</button>
         <button kendoButton themeColor="primary" (click)="saveEdit()" [disabled]="editForm.invalid || saving">Save Changes</button>
      </kendo-dialog-actions>
    </kendo-dialog>
  `,
  styles: [`
    .mb-4 { margin-bottom: 24px; } .mx-2 { margin: 0 8px; }
    .breadcrumb { display: flex; align-items: center; font-size: 0.875rem; color: var(--muted-text-color); }
    .breadcrumb a { color: var(--primary-color); }
    .layout-wrapper { display: flex; flex-direction: column; gap: 32px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
    .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .main-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--text-color); letter-spacing: -0.02em; }
    .ref-number { font-size: 0.95rem; color: var(--muted-text-color); }
    .header-actions { display: flex; gap: 8px; }
    
    .main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 32px; align-items: flex-start; }
    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
    
    .section-head { margin: 0 0 16px 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
    
    .prop-panel { background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); }
    .prop-list { display: flex; flex-direction: column; gap: 12px; }
    .prop-item { display: flex; flex-direction: column; padding: 12px; background: white; border: 1px solid var(--border-color); border-radius: 8px; }
    .prop-value { font-size: 0.875rem; color: var(--text-color); display: flex; align-items: center; }
    .prop-value .link { color: var(--primary-color); font-weight: 500; text-decoration: none; }
    
    .card-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .resource-card { display: flex; align-items: center; padding: 16px; background: white; border: 1px solid var(--border-color); border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
    .resource-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .r-icon { width: 40px; height: 40px; background: #e0e7ff; color: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 1.25rem; }
    .r-content h4 { margin: 0 0 4px 0; font-size: 0.95rem; font-weight: 600; color: var(--text-color); }
    .r-content p { margin: 0; font-size: 0.8125rem; color: var(--muted-text-color); }
  `]
})
export class ProjectDetailComponent implements OnInit {
  router = inject(Router); private route = inject(ActivatedRoute); private svc = inject(ProjectService); private appSvc = inject(ApplicationService); private mapSvc = inject(ProcessDefinitionProjectMappingService); private procSvc = inject(ProcessDefinitionService); private ns = inject(NotificationService); private fb = inject(FormBuilder); private rv = inject(RecentlyViewedService);
  loading = true; projectId: string | null = null; project: any; 
  applications: any[] = []; mappedProcesses: any[] = [];
  editForm!: FormGroup; isEditing = false; saving = false;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) this.loadFull();
  }

  loadFull() {
     this.loading = true;
     forkJoin({
        proj: this.svc.getProject(this.projectId!),
        apps: this.appSvc.getApplications().pipe(catchError(()=>of([]))),
        maps: this.mapSvc.getByProject(this.projectId!).pipe(catchError(()=>of([]))),
        procs: this.procSvc.getProcessDefinitions().pipe(catchError(()=>of([])))
     }).subscribe(data => {
        this.project = data.proj;
        this.rv.add({ id: this.project.id, type: 'Project', title: this.project.name, url: '/projects/' + this.project.id });
        this.applications = data.apps.filter((a: any) => a.projectId === this.projectId);
        
        const mappedProcessIds = data.maps.map(m => m.processDefinitionId);
        this.mappedProcesses = data.procs.filter((p: any) => mappedProcessIds.includes(p.id));
        
        this.loading = false;
     });
  }

  openEdit() {
    this.editForm = this.fb.group({ name: [this.project.name, Validators.required], description: [this.project.description] });
    this.isEditing = true;
  }
  closeEdit() { this.isEditing = false; }
  saveEdit() {
    if (this.editForm.invalid) return; this.saving = true;
    this.svc.updateProject(this.projectId!, this.editForm.value).subscribe({
       next: () => { this.ns.success('Project updated.'); this.project = {...this.project, ...this.editForm.value}; this.isEditing = false; this.saving = false; },
       error: () => { this.ns.error('Failed to update.'); this.saving = false; }
    });
  }
}
