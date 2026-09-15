const fs = require('fs');
const path = require('path');

const files = {
    "src/app/features/applications/application-detail/application-detail.component.ts": `
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common'; 
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from '@progress/kendo-angular-buttons'; 
import { IconsModule } from '@progress/kendo-angular-icons'; 
import { DialogsModule } from '@progress/kendo-angular-dialog'; 
import { InputsModule } from '@progress/kendo-angular-inputs'; 
import { GridModule } from '@progress/kendo-angular-grid';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component'; 
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatusChipComponent } from '../../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../../shared/priority-chip/priority-chip.component';
import { ApplicationService } from '../../../core/services/application.service'; 
import { ProjectService } from '../../../core/services/project.service';
import { ServiceItemService } from '../../../core/services/service-item.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, IconsModule, DialogsModule, InputsModule, GridModule, LoadingStateComponent, EmptyStateComponent, StatusChipComponent, PriorityChipComponent, DatePipe],
  template: \`
    <div class="breadcrumb mb-4">
       <a routerLink="/projects">Projects</a>
       <kendo-icon name="chevron-right" class="mx-2"></kendo-icon>
       <a *ngIf="project" [routerLink]="['/projects', project.id]">{{project.name}}</a>
       <kendo-icon name="chevron-right" class="mx-2" *ngIf="project"></kendo-icon>
       <span>{{ app?.name || 'Loading...' }}</span>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && app" class="layout-wrapper">
      <div class="header-section">
         <div style="flex: 1;">
            <div class="title-row">
               <h1 class="main-title">{{app.name}}</h1>
            </div>
            <div class="ref-number">{{app.description || 'Application boundary domain'}}</div>
         </div>
         <div class="header-actions">
            <button kendoButton themeColor="primary" icon="plus" (click)="router.navigate(['/service-items/create'])">New Service Item</button>
            <button kendoButton icon="pencil" (click)="openEdit()">Edit</button>
         </div>
      </div>

      <div class="main-section">
         <h3 class="section-head">Service Items</h3>
         <div class="grid-container" *ngIf="serviceItems.length > 0">
           <kendo-grid [data]="serviceItems">
             <kendo-grid-column field="referenceNumber" title="Ref" [width]="130">
                <ng-template kendoGridCellTemplate let-dataItem>
                   <a [routerLink]="['/service-items', dataItem.id]" class="ref-link">{{dataItem.referenceNumber}}</a>
                </ng-template>
             </kendo-grid-column>
             <kendo-grid-column field="title" title="Title"></kendo-grid-column>
             <kendo-grid-column title="Status" [width]="140">
                <ng-template kendoGridCellTemplate let-dataItem><app-status-chip [status]="dataItem.status"></app-status-chip></ng-template>
             </kendo-grid-column>
             <kendo-grid-column title="Priority" [width]="120">
                <ng-template kendoGridCellTemplate let-dataItem><app-priority-chip [priority]="dataItem.priority"></app-priority-chip></ng-template>
             </kendo-grid-column>
             <kendo-grid-column title="Assigned To" [width]="180">
                <ng-template kendoGridCellTemplate let-dataItem>
                   <span class="muted-text">{{dataItem.assignedTo || 'Unassigned'}}</span>
                </ng-template>
             </kendo-grid-column>
             <kendo-grid-column title="" [width]="60">
                <ng-template kendoGridCellTemplate let-dataItem>
                   <button kendoButton icon="chevron-right" fillMode="flat" [routerLink]="['/service-items', dataItem.id]"></button>
                </ng-template>
             </kendo-grid-column>
           </kendo-grid>
         </div>
         <app-empty-state *ngIf="serviceItems.length === 0" icon="parameter-header" title="No service items" description="Start managing work inside this application domain." actionLabel="Create Service Item" (action)="router.navigate(['/service-items/create'])"></app-empty-state>
      </div>
    </div>
    
    <kendo-dialog *ngIf="isEditing" title="Edit Application" (close)="closeEdit()" [width]="500">
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
  \`,
  styles: [\`
    .mb-4 { margin-bottom: 24px; } .mx-2 { margin: 0 8px; }
    .breadcrumb { display: flex; align-items: center; font-size: 0.875rem; color: var(--muted-text-color); }
    .breadcrumb a { color: var(--primary-color); }
    .layout-wrapper { display: flex; flex-direction: column; gap: 32px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
    .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .main-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--text-color); letter-spacing: -0.02em; }
    .ref-number { font-size: 0.95rem; color: var(--muted-text-color); }
    .header-actions { display: flex; gap: 8px; }
    
    .section-head { margin: 0 0 16px 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
    .grid-container { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
    .ref-link { color: var(--primary-color); font-family: monospace; font-weight: 500; font-size: 0.85rem; }
  \`]
})
export class ApplicationDetailComponent implements OnInit {
  router = inject(Router); private route = inject(ActivatedRoute); private appSvc = inject(ApplicationService); private projSvc = inject(ProjectService); private itemSvc = inject(ServiceItemService); private ns = inject(NotificationService); private fb = inject(FormBuilder); private rv = inject(RecentlyViewedService);
  loading = true; appId: string | null = null; app: any; project: any; 
  serviceItems: any[] = [];
  editForm!: FormGroup; isEditing = false; saving = false;

  ngOnInit() {
    this.appId = this.route.snapshot.paramMap.get('id');
    if (this.appId) this.loadFull();
  }

  loadFull() {
     this.loading = true;
     forkJoin({
        app: this.appSvc.getApplication(this.appId!),
        items: this.itemSvc.getServiceItems(this.appId!).pipe(catchError(()=>of([])))
     }).subscribe(data => {
        this.app = data.app;
        this.rv.add({ id: this.app.id, type: 'Application', title: this.app.name, url: '/applications/' + this.app.id });
        this.serviceItems = data.items;
        
        if (this.app.projectId) {
           this.projSvc.getProject(this.app.projectId).subscribe(p => {
              this.project = p;
              this.loading = false;
           });
        } else {
           this.loading = false;
        }
     });
  }

  openEdit() {
    this.editForm = this.fb.group({ name: [this.app.name, Validators.required], description: [this.app.description] });
    this.isEditing = true;
  }
  closeEdit() { this.isEditing = false; }
  saveEdit() {
    if (this.editForm.invalid) return; this.saving = true;
    this.appSvc.updateApplication(this.appId!, this.editForm.value).subscribe({
       next: () => { this.ns.success('Application updated.'); this.app = {...this.app, ...this.editForm.value}; this.isEditing = false; this.saving = false; },
       error: () => { this.ns.error('Failed to update.'); this.saving = false; }
    });
  }
}
`,

    "src/app/features/dashboard/dashboard.component.ts": `
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { PageHeaderComponent } from '../../shared/page-header/page-header.component'; 
import { StatusChipComponent } from '../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../shared/priority-chip/priority-chip.component';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component'; 
import { ProjectService } from '../../core/services/project.service';
import { ApplicationService } from '../../core/services/application.service';
import { ServiceItemService } from '../../core/services/service-item.service';
import { ProcessDefinitionService } from '../../core/services/process-definition.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({ 
  selector: 'app-dashboard', 
  standalone: true, 
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, DatePipe, IconsModule], 
  template: \`
    <app-page-header title="Process Tracking" subtitle="Operational overview of your projects and work."></app-page-header> 
    
    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading">
       <div class="kpi-grid">
         <div class="kpi-card" routerLink="/projects"><div class="val">{{counts.projects}}</div><div class="kpi-label">Projects</div></div>
         <div class="kpi-card" routerLink="/applications"><div class="val">{{counts.apps}}</div><div class="kpi-label">Applications</div></div>
         <div class="kpi-card" routerLink="/service-items"><div class="val">{{counts.items}}</div><div class="kpi-label">Service Items</div></div>
         <div class="kpi-card" routerLink="/processes"><div class="val">{{counts.processes}}</div><div class="kpi-label">Processes</div></div>
       </div>

       <div class="charts-row">
          <div class="snapshot-card">
             <h3>Work Snapshot</h3>
             <div class="stat-list">
                <div class="stat-item" *ngFor="let s of statusGroups">
                   <div class="stat-name"><div class="status-dot" [attr.data-status]="s.name"></div>{{s.name}}</div>
                   <div class="stat-val">{{s.count}}</div>
                </div>
                <div class="muted-text" *ngIf="statusGroups.length === 0" style="font-size: 0.8rem; margin-top:16px;">No items defined yet.</div>
             </div>
          </div>
          
          <div class="snapshot-card">
             <h3>Priority Snapshot</h3>
             <div class="stat-list">
                <div class="stat-item" *ngFor="let p of priorityGroups">
                   <div class="stat-name">
                     <kendo-icon [name]="p.name === 'Critical' ? 'warning' : 'chevron-up'" style="margin-right:8px; font-size:14px; opacity:0.7;"></kendo-icon>
                     {{p.name}}
                   </div>
                   <div class="stat-val">{{p.count}}</div>
                </div>
                <div class="muted-text" *ngIf="priorityGroups.length === 0" style="font-size: 0.8rem; margin-top:16px;">No items defined yet.</div>
             </div>
          </div>
       </div>

       <h2 style="font-size: 1.1rem; margin: 32px 0 16px;">Recent Service Items</h2>
       <div class="recent-grid" *ngIf="recentItems.length > 0">
          <a class="recent-card" *ngFor="let i of recentItems" [routerLink]="['/service-items', i.id]">
             <div class="rc-header">
                <span class="ref">{{i.referenceNumber}}</span>
                <span class="rc-date">{{i.createdAt | date:'shortDate'}}</span>
             </div>
             <h4>{{i.title}}</h4>
             <div class="rc-badges">
                <app-status-chip [status]="i.status"></app-status-chip>
                <app-priority-chip [priority]="i.priority"></app-priority-chip>
             </div>
          </a>
       </div>
       <div class="muted-text" *ngIf="!loading && recentItems.length === 0">No recent activity detected.</div>
    </div>
  \`, 
  styles: [\` 
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .kpi-card { background: white; padding: 24px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .kpi-card:hover { border-color: var(--primary-color); transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); }
    .val { font-size: 2rem; font-weight: 700; color: var(--text-color); margin-bottom: 4px; line-height: 1; }
    .kpi-label { font-size: 0.875rem; color: var(--muted-text-color); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .snapshot-card { background: white; padding: 24px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .snapshot-card h3 { margin: 0 0 20px 0; font-size: 1rem; color: var(--text-color); font-weight: 600; }
    
    .stat-list { display: flex; flex-direction: column; gap: 12px; }
    .stat-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; background: #f8fafc; }
    .stat-name { font-size: 0.875rem; color: var(--text-color); display: flex; align-items: center; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; margin-right: 12px; }
    .status-dot[data-status="In Progress"] { background: #3b82f6; }
    .status-dot[data-status="New"] { background: #10b981; }
    .status-dot[data-status="Completed"] { background: #a855f7; }
    .status-dot[data-status="Blocked"] { background: #ef4444; }
    .stat-val { font-weight: 600; font-size: 1rem; color: var(--primary-color); }
    
    .recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .recent-card { text-decoration: none; display: flex; flex-direction: column; background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border-color); color: inherit; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .recent-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .rc-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .ref { font-family: monospace; font-size: 0.75rem; color: var(--muted-text-color); }
    .rc-date { font-size: 0.75rem; color: #94a3b8; }
    .recent-card h4 { margin: 0 0 16px 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; }
    .rc-badges { display: flex; gap: 8px; }
  \`] 
}) 
export class DashboardComponent implements OnInit { 
  private projSvc = inject(ProjectService); private appSvc = inject(ApplicationService); private itemSvc = inject(ServiceItemService); private procSvc = inject(ProcessDefinitionService);
  loading = true;
  counts = { projects: 0, apps: 0, items: 0, processes: 0 };
  statusGroups: any[] = []; priorityGroups: any[] = [];
  recentItems: any[] = [];

  ngOnInit() {
     forkJoin({
        p: this.projSvc.getProjects().pipe(catchError(()=>of([]))),
        a: this.appSvc.getApplications().pipe(catchError(()=>of([]))),
        i: this.itemSvc.getServiceItems().pipe(catchError(()=>of([]))),
        pr: this.procSvc.getProcessDefinitions().pipe(catchError(()=>of([])))
     }).subscribe(data => {
        this.counts.projects = data.p.length;
        this.counts.apps = data.a.length;
        this.counts.items = data.i.length;
        this.counts.processes = data.pr.length;

        // Group status
        const sMap = new Map();
        const pMap = new Map();
        data.i.forEach((x:any) => {
           const s = x.status || 'Unknown';
           sMap.set(s, (sMap.get(s) || 0) + 1);
           
           const p = x.priority || 'Medium';
           pMap.set(p, (pMap.get(p) || 0) + 1);
        });
        
        this.statusGroups = Array.from(sMap, ([name, count]) => ({ name, count })).sort((a,b)=>b.count - a.count);
        this.priorityGroups = Array.from(pMap, ([name, count]) => ({ name, count })).sort((a,b)=>b.count - a.count);

        this.recentItems = data.i.sort((a:any,b:any) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).slice(0,6);
        
        this.loading = false;
     });
  }
}
`,

    // --- 5. MODIFY ROUTES SCRIPT ---
    "modify-routes.js": `
const fs = require('fs');
let routes = fs.readFileSync('src/app/app.routes.ts', 'utf8');

// Ensure newly created components are added to routes array
if (!routes.includes('applications/:id')) {
   routes = routes.replace(
      "import { AppShellComponent } from './layout/app-shell/app-shell.component';",
      "import { AppShellComponent } from './layout/app-shell/app-shell.component';\\nimport { ApplicationDetailComponent } from './features/applications/application-detail/application-detail.component';\\nimport { RecentlyViewedComponent } from './features/recently-viewed/recently-viewed.component';\\nimport { MyWorkComponent } from './features/my-work/my-work.component';\\nimport { SettingsComponent } from './features/settings/settings.component';"
   );
   
   routes = routes.replace(
      "loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent) },",
      "loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent) },\\n      { path: 'applications/:id', component: ApplicationDetailComponent },"
   );
   
   routes = routes.replace(
      "loadComponent: () => import('./features/processes/process-definition-detail/process-definition-detail.component').then(m => m.ProcessDefinitionDetailComponent) }",
      "loadComponent: () => import('./features/processes/process-definition-detail/process-definition-detail.component').then(m => m.ProcessDefinitionDetailComponent) },\\n      { path: 'recently-viewed', component: RecentlyViewedComponent },\\n      { path: 'my-work', component: MyWorkComponent },\\n      { path: 'settings', component: SettingsComponent }"
   );
   fs.writeFileSync('src/app/app.routes.ts', routes);
   console.log('Routes amended.');
} else {
   console.log('Routes already present.');
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('UI Polished successfully phase 2.');
