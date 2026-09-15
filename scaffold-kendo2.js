const fs = require('fs');
const path = require('path');

const files = {
    "src/app/layout/app-shell/app-shell.component.ts": `import { Component } from '@angular/core';\nimport { RouterModule } from '@angular/router';\nimport { SidebarComponent } from '../sidebar/sidebar.component';\nimport { TopbarComponent } from '../topbar/topbar.component';\nimport { CommonModule } from '@angular/common';\n@Component({ selector: 'app-shell', standalone: true, imports: [RouterModule, SidebarComponent, TopbarComponent, CommonModule], template: \`\n<div class="app-layout">\n  <div class="sidebar-desktop">\n    <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>\n  </div>\n  <div class="main-container">\n    <app-topbar (toggleSidebar)="toggleSidebar()"></app-topbar>\n    <main class="content-area">\n      <router-outlet></router-outlet>\n    </main>\n  </div>\n</div>\n\`, styles: [\`\n.app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--background-color); }\n.sidebar-desktop { flex-shrink: 0; z-index: 2; }\n.main-container { display: flex; flex-direction: column; flex: 1; min-width: 0; }\n.content-area { flex: 1; overflow-y: auto; padding: 24px; }\n\`] }) export class AppShellComponent { sidebarCollapsed = false; toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; } }`,

    "src/app/features/dashboard/dashboard.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { IconsModule } from '@progress/kendo-angular-icons';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../shared/priority-chip/priority-chip.component';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ProjectService } from '../../core/services/project.service';
import { ApplicationService } from '../../core/services/application.service';
import { ServiceItemService } from '../../core/services/service-item.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridModule, IconsModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, EmptyStateComponent, DatePipe],
  template: \`
    <app-page-header title="Good morning" subtitle="Process Tracking Workspace"></app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div *ngIf="!loading && !error" class="dashboard-content">
      <div class="kpi-grid">
        <div class="kpi-card" routerLink="/projects"><div class="kpi-icon-wrapper project-kpi"><kendo-icon name="folder"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Projects</span><span class="kpi-value">{{projectCount}}</span></div></div>
        <div class="kpi-card" routerLink="/applications"><div class="kpi-icon-wrapper app-kpi"><kendo-icon name="grid"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Applications</span><span class="kpi-value">{{appCount}}</span></div></div>
        <div class="kpi-card" routerLink="/service-items"><div class="kpi-icon-wrapper service-kpi"><kendo-icon name="form"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Service Items</span><span class="kpi-value">{{serviceItemCount}}</span></div></div>
        <div class="kpi-card" routerLink="/forms"><div class="kpi-icon-wrapper form-kpi"><kendo-icon name="list-unordered"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Forms</span><span class="kpi-value">--</span></div></div>
      </div>
      <h2 class="section-title">Recent Service Items</h2>
      <div *ngIf="recentItems.length > 0">
        <kendo-grid [data]="recentItems">
          <kendo-grid-column field="referenceNumber" title="Reference"></kendo-grid-column>
          <kendo-grid-column field="title" title="Title"></kendo-grid-column>
          <kendo-grid-column title="Status">
            <ng-template kendoGridCellTemplate let-dataItem><app-status-chip [status]="dataItem.status"></app-status-chip></ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Priority">
             <ng-template kendoGridCellTemplate let-dataItem><app-priority-chip [priority]="dataItem.priority"></app-priority-chip></ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="assignedTo" title="Assigned"></kendo-grid-column>
        </kendo-grid>
      </div>
      <app-empty-state *ngIf="recentItems.length === 0" icon="file" title="No service items yet" description="Create a service item to start tracking process work." actionLabel="Create Service Item"></app-empty-state>
    </div>
  \`,
  styles: [\`
    .kpi-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; cursor: pointer; }
    .kpi-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; }
    .project-kpi { background: #3b82f6; } .app-kpi { background: #8b5cf6; } .service-kpi { background: #10b981; } .form-kpi { background: #f59e0b; }
    .kpi-details { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.875rem; color: var(--muted-text-color); font-weight: 500; }
    .kpi-value { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin-top: 4px; }
  \`]
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private appService = inject(ApplicationService);
  private svcItemService = inject(ServiceItemService);

  loading = true; error = false; projectCount = 0; appCount = 0; serviceItemCount = 0; recentItems: any[] = [];
  ngOnInit() {
    this.loading = true; this.error = false;
    forkJoin({
      projects: this.projectService.getProjects().pipe(catchError(() => of([]))),
      apps: this.appService.getApplications().pipe(catchError(() => of([]))),
      items: this.svcItemService.getServiceItems().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => { this.projectCount = data.projects.length; this.appCount = data.apps.length; this.serviceItemCount = data.items.length; this.recentItems = data.items.slice(0, 5); this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
`,

    "src/app/features/projects/project-list/project-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { IconsModule } from '@progress/kendo-angular-icons';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputsModule, IconsModule, RouterModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Projects" subtitle="Organize process tracking by project.">
      <button kendoButton themeColor="primary">New Project</button>
    </app-page-header>
    
    <div class="toolbar" *ngIf="projects.length > 0">
      <kendo-textbox placeholder="Search projects..."> <ng-template kendoTextBoxPrefixTemplate><kendo-icon name="search"></kendo-icon></ng-template> </kendo-textbox>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>
    <div class="project-grid" *ngIf="!loading && !error && projects.length > 0">
      <div class="item-card" *ngFor="let p of projects" [routerLink]="['/projects', p.id]">
        <div class="card-header"><div class="card-avatar"><kendo-icon name="folder"></kendo-icon></div>
        <div><h4>{{p.name}}</h4><span class="muted-text">ID: {{p.id | slice:0:8}}</span></div></div>
        <p class="description-text">{{p.description || 'No description provided.'}}</p>
      </div>
    </div>
    <app-empty-state *ngIf="!loading && !error && projects.length === 0" icon="folder" title="No projects yet" actionLabel="Create Project"></app-empty-state>
  \`,
  styles: [\`
    .toolbar { display: flex; margin-bottom: 24px; width: 300px; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer; }
    .card-header { display: flex; align-items: center; margin-bottom: 12px; }
    .card-header h4 { margin: 0 0 4px; }
    .card-avatar { background: var(--primary-light); color: var(--primary-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .description-text { color: var(--muted-text-color); font-size: 0.875rem; margin: 0; }
  \`]
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  projects: Project[] = []; loading = true; error = false;
  ngOnInit() { this.projectService.getProjects().subscribe({ next: (v) => { this.projects = v; this.loading = false; }, error: () => { this.error = true; this.loading = false; }}); }
}
`,

    "src/app/features/projects/project-detail/project-detail.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { IconsModule } from '@progress/kendo-angular-icons';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { ProjectService } from '../../../core/services/project.service';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, IconsModule, PageHeaderComponent, LoadingStateComponent],
  template: \`
    <div class="breadcrumb"><a routerLink="/projects">Projects</a> &rsaquo; <span>{{project?.name || 'Loading...'}}</span></div>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div *ngIf="!loading && project">
      <app-page-header [title]="project.name" [subtitle]="project.description || 'No description'">
        <button kendoButton><kendo-icon name="edit"></kendo-icon> Edit</button>
      </app-page-header>
      <div class="info-card">
        <span class="info-label">Project ID</span><div class="info-value monospaced">{{project.id}}</div>
      </div>
      <h2 class="section-title mt-4">Related Applications</h2>
      <div class="app-grid" *ngIf="applications.length > 0">
        <div class="item-card" *ngFor="let app of applications">
          <h4 style="margin: 0 0 8px;">{{app.name}}</h4>
          <button kendoButton themeColor="primary" fillMode="flat" [routerLink]="['/applications']" [queryParams]="{projectId: project.id}">View details</button>
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    .breadcrumb { margin-bottom: 24px; color: var(--muted-text-color); font-size: 0.875rem; }
    .breadcrumb a { color: var(--primary-color); }
    .info-card { padding: 20px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); }
    .info-label { font-size: 0.75rem; text-transform: uppercase; color: var(--muted-text-color); font-weight: 600; }
    .mt-4 { margin-top: 32px; }
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .item-card { padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); }
  \`]
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private projectService = inject(ProjectService); private appService = inject(ApplicationService);
  project: any; applications: any[] = []; loading = true;
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.projectService.getProject(id).subscribe(p => { this.project = p; this.appService.getApplications(id).subscribe(a => { this.applications = a; this.loading = false }); }); }
  }
}
`,

    "src/app/features/applications/application-list/application-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Applications" subtitle="Manage specific applications within your projects.">
      <button kendoButton themeColor="primary">New Application</button>
    </app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div class="app-grid" *ngIf="!loading && applications.length > 0">
      <div class="item-card" *ngFor="let a of applications">
        <h4>{{a.name}}</h4><span class="muted-text">Project: {{a.projectId | slice:0:8}}</span>
        <p class="description-text">{{a.description || 'No description provided.'}}</p>
      </div>
    </div>
    <app-empty-state *ngIf="!loading && applications.length === 0" icon="grid" title="No applications found" actionLabel="Create Application"></app-empty-state>
  \`,
  styles: [\`
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: var(--surface-color); }
    .description-text { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; }
  \`]
})
export class ApplicationListComponent implements OnInit {
  private appService = inject(ApplicationService); private route = inject(ActivatedRoute);
  applications: any[] = []; loading = true;
  ngOnInit() {
    this.route.queryParams.subscribe(p => { this.appService.getApplications(p['projectId'] || undefined).subscribe(d => { this.applications = d; this.loading = false; }); });
  }
}
`,

    "src/app/features/service-items/service-item-list/service-item-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../../shared/priority-chip/priority-chip.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ServiceItemService } from '../../../core/services/service-item.service';

@Component({
  selector: 'app-service-item-list',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule, InputsModule, DropDownsModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Service Items" subtitle="Track requests, work items, ownership and process status.">
      <button kendoButton themeColor="primary" routerLink="/service-items/create">New Service Item</button>
    </app-page-header>
    <div class="toolbar" *ngIf="!loading">
      <kendo-textbox placeholder="Search..."></kendo-textbox>
      <kendo-dropdownlist [data]="['All', 'New', 'In Progress', 'Resolved']" [defaultItem]="'All'"></kendo-dropdownlist>
    </div>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <kendo-grid [data]="items" *ngIf="!loading && items.length > 0">
      <kendo-grid-column field="referenceNumber" title="Reference"></kendo-grid-column>
      <kendo-grid-column field="title" title="Title"></kendo-grid-column>
      <kendo-grid-column title="Status">
        <ng-template kendoGridCellTemplate let-dataItem><app-status-chip [status]="dataItem.status"></app-status-chip></ng-template>
      </kendo-grid-column>
      <kendo-grid-column title="Priority">
         <ng-template kendoGridCellTemplate let-dataItem><app-priority-chip [priority]="dataItem.priority"></app-priority-chip></ng-template>
      </kendo-grid-column>
      <kendo-grid-column field="assignedTo" title="Assigned"></kendo-grid-column>
    </kendo-grid>
    <app-empty-state *ngIf="!loading && items.length === 0" icon="form" title="No service items found" actionLabel="Create Service Item"></app-empty-state>
  \`,
  styles: [\` .toolbar { display: flex; gap: 16px; margin-bottom: 24px; } \`]
})
export class ServiceItemListComponent implements OnInit {
  private svc = inject(ServiceItemService); items: any[] = []; loading = true;
  ngOnInit() { this.svc.getServiceItems().subscribe(d => { this.items = d; this.loading = false; }); }
}
`,

    "src/app/features/service-items/service-item-create/service-item-create.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ApplicationService } from '../../../core/services/application.service';
import { FormService } from '../../../core/services/form.service';
import { ServiceItemService } from '../../../core/services/service-item.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-service-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputsModule, DropDownsModule, ButtonModule, RouterModule, PageHeaderComponent],
  template: \`
    <div class="max-w-3xl">
      <app-page-header title="New Service Item" subtitle="Create a new process tracking record."></app-page-header>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-form">
        <div class="form-row split-2">
          <div><label>Application</label><kendo-dropdownlist formControlName="applicationId" [data]="applications" textField="name" valueField="id" [valuePrimitive]="true"></kendo-dropdownlist></div>
          <div><label>Form Template</label><kendo-dropdownlist formControlName="formId" [data]="forms" textField="name" valueField="id" [valuePrimitive]="true"></kendo-dropdownlist></div>
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
  \`,
  styles: [\`
    .max-w-3xl { max-width: 800px; margin: 0 auto; background: var(--surface-color); padding: 32px; border: 1px solid var(--border-color); border-radius: 12px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.875rem; }
    .mt-4 { margin-top: 24px; }
  \`]
})
export class ServiceItemCreateComponent implements OnInit {
  private fb = inject(FormBuilder); private appService = inject(ApplicationService); private formService = inject(FormService); private svcService = inject(ServiceItemService); private router = inject(Router); private ns = inject(NotificationService);
  form: FormGroup; applications: any[] = []; forms: any[] = []; submitting = false;
  constructor() { this.form = this.fb.group({ applicationId: ['', Validators.required], formId: [''], title: ['', Validators.required], referenceNumber: ['', Validators.required], status: ['New', Validators.required], priority: ['Medium', Validators.required], assignedTo: [''] }); }
  ngOnInit() { this.appService.getApplications().subscribe(apps => this.applications = apps); this.formService.getForms().subscribe(f => this.forms = f); }
  onSubmit() { if (this.form.invalid) return; this.submitting = true; this.svcService.createServiceItem(this.form.value).subscribe({ next: () => { this.ns.success('Created'); this.router.navigate(['/service-items']); }, error: () => { this.ns.error('Failed'); this.submitting = false; }}); }
}
`,

    "src/app/features/forms/form-list/form-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { FormService } from '../../../core/services/form.service';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [CommonModule, GridModule, PageHeaderComponent, LoadingStateComponent],
  template: \`
    <app-page-header title="Forms" subtitle="Manage dynamic templates."></app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <kendo-grid [data]="forms" *ngIf="!loading && forms.length > 0">
      <kendo-grid-column field="formCode" title="Code"></kendo-grid-column>
      <kendo-grid-column field="name" title="Name"></kendo-grid-column>
      <kendo-grid-column field="description" title="Description"></kendo-grid-column>
      <kendo-grid-column title="Status">
         <ng-template kendoGridCellTemplate let-dataItem>
           <span [class.active-status]="dataItem.active">{{dataItem.active ? 'Active' : 'Inactive'}}</span>
         </ng-template>
      </kendo-grid-column>
    </kendo-grid>
  \`,
  styles: [\` .active-status { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; } \`]
})
export class FormListComponent implements OnInit {
  private svc = inject(FormService); forms: any[] = []; loading = true;
  ngOnInit() { this.svc.getForms().subscribe(f => { this.forms = f; this.loading = false; }); }
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Kendo basic features generated.');
