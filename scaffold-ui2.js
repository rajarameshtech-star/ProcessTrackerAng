const fs = require('fs');
const path = require('path');

const files = {
    "src/app/features/dashboard/dashboard.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, EmptyStateComponent, DatePipe],
  template: \`
    <app-page-header title="Good morning" subtitle="Process Tracking Workspace"></app-page-header>
    
    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && !error" class="dashboard-content">
      <div class="kpi-grid">
        <div class="kpi-card" routerLink="/projects">
          <div class="kpi-icon-wrapper project-kpi">
            <mat-icon>folder</mat-icon>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Projects</span>
            <span class="kpi-value">{{projectCount}}</span>
          </div>
        </div>
        <div class="kpi-card" routerLink="/applications">
          <div class="kpi-icon-wrapper app-kpi">
            <mat-icon>apps</mat-icon>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Applications</span>
            <span class="kpi-value">{{appCount}}</span>
          </div>
        </div>
        <div class="kpi-card" routerLink="/service-items">
          <div class="kpi-icon-wrapper service-kpi">
            <mat-icon>assignment</mat-icon>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Service Items</span>
            <span class="kpi-value">{{serviceItemCount}}</span>
          </div>
        </div>
        <div class="kpi-card" routerLink="/forms">
          <div class="kpi-icon-wrapper form-kpi">
            <mat-icon>dynamic_form</mat-icon>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Forms</span>
            <span class="kpi-value">--</span>
          </div>
        </div>
      </div>

      <h2 class="section-title">Recent Service Items</h2>
      
      <mat-card class="table-card table-responsive" *ngIf="recentItems.length > 0">
        <table mat-table [dataSource]="recentItems" class="custom-table">
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef> Reference </th>
            <td mat-cell *matCellDef="let element" class="ref-cell"> {{element.referenceNumber}} </td>
          </ng-container>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef> Title </th>
            <td mat-cell *matCellDef="let element" class="title-cell"> {{element.title}} </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> <app-status-chip [status]="element.status"></app-status-chip> </td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef> Priority </th>
            <td mat-cell *matCellDef="let element"> <app-priority-chip [priority]="element.priority"></app-priority-chip> </td>
          </ng-container>
          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef> Assigned </th>
            <td mat-cell *matCellDef="let element" class="muted-text"> {{element.assignedTo || 'Unassigned'}} </td>
          </ng-container>
          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef> Updated </th>
            <td mat-cell *matCellDef="let element" class="muted-text"> {{element.updatedAt | date:'mediumDate'} || '-'} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" routerLink="/service-items/{{row.id}}"></tr>
        </table>
      </mat-card>

      <app-empty-state *ngIf="recentItems.length === 0" icon="assignment" title="No service items yet" description="Create a service item to start tracking process work." actionLabel="Create Service Item"></app-empty-state>
    </div>
    
    <div *ngIf="error" class="error-container">
      <app-empty-state icon="error_outline" title="Unable to load dashboard" description="There was a problem reaching the server." actionLabel="Try again" (action)="loadData()"></app-empty-state>
    </div>
  \`,
  styles: [\`
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .kpi-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .kpi-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .kpi-icon-wrapper mat-icon { color: white; }
    .project-kpi { background: #3b82f6; }
    .app-kpi { background: #8b5cf6; }
    .service-kpi { background: #10b981; }
    .form-kpi { background: #f59e0b; }
    .kpi-details { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.875rem; color: var(--muted-text-color); font-weight: 500; }
    .kpi-value { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin-top: 4px; }
    .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: var(--text-color); }
    .error-container { margin-top: 32px; }
  \`]
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private appService = inject(ApplicationService);
  private svcItemService = inject(ServiceItemService);

  loading = true;
  error = false;
  projectCount = 0;
  appCount = 0;
  serviceItemCount = 0;
  recentItems: any[] = [];
  displayedColumns: string[] = ['reference', 'title', 'status', 'priority', 'assignedTo', 'updatedAt'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    forkJoin({
      projects: this.projectService.getProjects().pipe(catchError(() => of([]))),
      apps: this.appService.getApplications().pipe(catchError(() => of([]))),
      items: this.svcItemService.getServiceItems().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.projectCount = data.projects.length;
        this.appCount = data.apps.length;
        this.serviceItemCount = data.items.length;
        this.recentItems = data.items.slice(0, 5); // top 5
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
`,

    "src/app/features/projects/project-list/project-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, RouterModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Projects" subtitle="Organize process tracking by project.">
      <button mat-flat-button color="primary">New Project</button>
    </app-page-header>
    
    <div class="toolbar" *ngIf="projects.length > 0">
      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input type="text" placeholder="Search projects...">
      </div>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div *ngIf="error" class="error-container">
      <app-empty-state icon="error_outline" title="Unable to load projects" description="There was a problem reaching the server." actionLabel="Try again" (action)="loadProjects()"></app-empty-state>
    </div>

    <div class="project-grid" *ngIf="!loading && !error && projects.length > 0">
      <mat-card class="item-card" *ngFor="let p of projects" [routerLink]="['/projects', p.id]">
        <mat-card-header>
          <div mat-card-avatar class="card-avatar"><mat-icon>folder</mat-icon></div>
          <mat-card-title>{{p.name}}</mat-card-title>
          <mat-card-subtitle>ID: {{p.id | slice:0:8}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="description-text">{{p.description || 'No description provided.'}}</p>
        </mat-card-content>
      </mat-card>
    </div>

    <app-empty-state *ngIf="!loading && !error && projects.length === 0" icon="folder_open" title="No projects yet" description="Create your first project to organize your process tracking work." actionLabel="Create Project"></app-empty-state>
  \`,
  styles: [\`
    .toolbar { display: flex; margin-bottom: 24px; }
    .search-box { display: flex; align-items: center; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 0 12px; height: 40px; width: 300px; }
    .search-box mat-icon { color: var(--muted-text-color); margin-right: 8px; }
    .search-box input { border: none; background: transparent; outline: none; flex: 1; font-size: 0.875rem; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid transparent; }
    .item-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: var(--border-color); }
    .card-avatar { background: var(--primary-light); color: var(--primary-color); display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .description-text { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  \`]
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  projects: Project[] = [];
  loading = true;
  error = false;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true; this.error = false;
    this.projectService.getProjects().subscribe({
      next: (data) => { this.projects = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
`,

    "src/app/features/projects/project-detail/project-detail.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { ProjectService } from '../../../core/services/project.service';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent, LoadingStateComponent],
  template: \`
    <div class="breadcrumb">
      <a routerLink="/projects">Projects</a> <mat-icon>chevron_right</mat-icon> <span>{{project?.name || 'Loading...'}}</span>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && project" class="detail-container">
      <app-page-header [title]="project.name" [subtitle]="project.description || 'No description'">
        <button mat-stroked-button class="mr-2">Edit</button>
        <button mat-icon-button><mat-icon>more_vert</mat-icon></button>
      </app-page-header>

      <div class="overview-section">
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Project ID</div>
                <div class="info-value monospaced">{{project.id}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <h2 class="section-title">Related Applications</h2>
      
      <div class="app-grid" *ngIf="applications.length > 0">
        <mat-card class="item-card" *ngFor="let app of applications">
          <mat-card-header>
            <div mat-card-avatar class="card-avatar"><mat-icon>apps</mat-icon></div>
            <mat-card-title>{{app.name}}</mat-card-title>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/applications']" [queryParams]="{projectId: project.id}">View details</button>
          </mat-card-actions>
        </mat-card>
      </div>
      <div *ngIf="applications.length === 0" class="empty-inline">
        No applications found for this project.
      </div>
    </div>
  \`,
  styles: [\`
    .breadcrumb { display: flex; align-items: center; margin-bottom: 24px; color: var(--muted-text-color); font-size: 0.875rem; }
    .breadcrumb a { color: var(--primary-color); text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb mat-icon { font-size: 16px; width: 16px; height: 16px; margin: 0 4px; }
    .mr-2 { margin-right: 8px; }
    .info-card { margin-bottom: 32px; box-shadow: none; border: 1px solid var(--border-color); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 0.75rem; color: var(--muted-text-color); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px; }
    .info-value { font-size: 0.875rem; color: var(--text-color); }
    .monospaced { font-family: monospace; }
    .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: var(--text-color); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .item-card { border: 1px solid var(--border-color); box-shadow: none; }
    .card-avatar { background: #f3e8ff; color: #8b5cf6; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .empty-inline { padding: 24px; text-align: center; color: var(--muted-text-color); border: 1px dashed var(--border-color); border-radius: 8px; }
  \`]
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private appService = inject(ApplicationService);

  project: any;
  applications: any[] = [];
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProject(id).subscribe({
        next: (p) => { this.project = p; this.loadApps(id); },
        error: () => { this.loading = false; }
      });
    }
  }

  loadApps(projectId: string) {
    this.appService.getApplications(projectId).subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
`,

    "src/app/features/applications/application-list/application-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Applications" subtitle="Manage specific applications within your projects.">
      <button mat-flat-button color="primary">New Application</button>
    </app-page-header>

    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div *ngIf="error" class="error-container">
      <app-empty-state icon="error_outline" title="Unable to load applications" description="There was a problem reaching the server." actionLabel="Try again" (action)="loadApps()"></app-empty-state>
    </div>

    <div class="app-grid" *ngIf="!loading && !error && applications.length > 0">
      <mat-card class="item-card" *ngFor="let a of applications">
        <mat-card-header>
          <div mat-card-avatar class="card-avatar"><mat-icon>apps</mat-icon></div>
          <mat-card-title>{{a.name}}</mat-card-title>
          <mat-card-subtitle>Project: {{a.projectId | slice:0:8}}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="description-text">{{a.description || 'No description provided.'}}</p>
        </mat-card-content>
      </mat-card>
    </div>

    <app-empty-state *ngIf="!loading && !error && applications.length === 0" icon="apps" title="No applications found" description="There are no applications available in the current context." actionLabel="Create Application"></app-empty-state>
  \`,
  styles: [\`
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { border: 1px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: border-color 0.2s; }
    .item-card:hover { border-color: var(--border-color); }
    .card-avatar { background: #f3e8ff; color: #8b5cf6; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .description-text { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; }
  \`]
})
export class ApplicationListComponent implements OnInit {
  private appService = inject(ApplicationService);
  private route = inject(ActivatedRoute);

  applications: any[] = [];
  loading = true;
  error = false;
  projectId: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'] || null;
      this.loadApps();
    });
  }

  loadApps() {
    this.loading = true; this.error = false;
    this.appService.getApplications(this.projectId || undefined).subscribe({
      next: (data) => { this.applications = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
`,

    "src/app/features/service-items/service-item-list/service-item-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Service Items" subtitle="Track requests, work items, ownership and process status.">
      <button mat-flat-button color="primary" routerLink="/service-items/create">New Service Item</button>
    </app-page-header>

    <div class="toolbar" *ngIf="items.length > 0 || !loading">
      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input type="text" placeholder="Search service items...">
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
        <mat-label>Status</mat-label>
        <mat-select>
          <mat-option value="all">All</mat-option>
          <mat-option value="new">New</mat-option>
          <mat-option value="in_progress">In Progress</mat-option>
          <mat-option value="resolved">Resolved</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
        <mat-label>Priority</mat-label>
        <mat-select>
          <mat-option value="all">All</mat-option>
          <mat-option value="high">High</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="low">Low</mat-option>
        </mat-select>
      </mat-form-field>
      <div class="spacer"></div>
      <button mat-stroked-button><mat-icon>sort</mat-icon> Sort</button>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div *ngIf="error" class="error-container">
      <app-empty-state icon="error_outline" title="Unable to load service items" description="There was a problem reaching the server." actionLabel="Try again" (action)="loadItems()"></app-empty-state>
    </div>

    <mat-card class="table-card table-responsive" *ngIf="!loading && !error && items.length > 0">
      <table mat-table [dataSource]="items" class="custom-table">
        <ng-container matColumnDef="reference">
          <th mat-header-cell *matHeaderCellDef> Reference </th>
          <td mat-cell *matCellDef="let element" class="ref-cell monospaced"> {{element.referenceNumber}} </td>
        </ng-container>
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef> Title </th>
          <td mat-cell *matCellDef="let element" class="title-cell fw-500"> {{element.title}} </td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element"> <app-status-chip [status]="element.status"></app-status-chip> </td>
        </ng-container>
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef> Priority </th>
          <td mat-cell *matCellDef="let element"> <app-priority-chip [priority]="element.priority"></app-priority-chip> </td>
        </ng-container>
        <ng-container matColumnDef="assignedTo">
          <th mat-header-cell *matHeaderCellDef> Assigned </th>
          <td mat-cell *matCellDef="let element">
            <div class="user-cell">
               <div class="mini-avatar" *ngIf="element.assignedTo">{{element.assignedTo.charAt(0) | uppercase}}</div>
               <span class="muted-text">{{element.assignedTo || 'Unassigned'}}</span>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="updatedAt">
          <th mat-header-cell *matHeaderCellDef> Updated </th>
          <td mat-cell *matCellDef="let element" class="muted-text"> {{ (element.updatedAt | date:'mediumDate') || '-' }} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="interactive-row"></tr>
      </table>
    </mat-card>

    <app-empty-state *ngIf="!loading && !error && items.length === 0" icon="assignment" title="No service items found" description="Create a service item to start tracking process work." actionLabel="Create Service Item"></app-empty-state>
  \`,
  styles: [\`
    .toolbar { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 0 12px; height: 40px; min-width: 280px; flex: 1; max-width: 400px; }
    .search-box mat-icon { color: var(--muted-text-color); margin-right: 8px; font-size: 20px; width: 20px; height: 20px; }
    .search-box input { border: none; background: transparent; outline: none; flex: 1; font-size: 0.875rem; }
    .filter-field { width: 160px; }
    ::ng-deep .filter-field .mdc-text-field--outlined { height: 40px; padding: 0 !important; }
    .spacer { flex: 1 1 auto; }
    .monospaced { font-family: monospace; color: var(--muted-text-color); }
    .fw-500 { font-weight: 500; }
    .user-cell { display: flex; align-items: center; }
    .mini-avatar { width: 24px; height: 24px; border-radius: 50%; background: #3f51b5; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 8px; font-weight: 600; }
  \`]
})
export class ServiceItemListComponent implements OnInit {
  private svc = inject(ServiceItemService);
  
  items: any[] = [];
  loading = true;
  error = false;
  displayedColumns = ['reference', 'title', 'status', 'priority', 'assignedTo', 'updatedAt'];

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true; this.error = false;
    this.svc.getServiceItems().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
`,

    "src/app/features/service-items/service-item-create/service-item-create.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ApplicationService } from '../../../core/services/application.service';
import { FormService } from '../../../core/services/form.service';
import { ServiceItemService } from '../../../core/services/service-item.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-service-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatSelectModule, MatButtonModule, RouterModule, PageHeaderComponent],
  template: \`
    <div class="max-w-3xl">
      <app-page-header title="New Service Item" subtitle="Create a new process tracking record."></app-page-header>
      
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-form">
            <div class="form-row split-2">
              <mat-form-field appearance="outline">
                <mat-label>Application</mat-label>
                <mat-select formControlName="applicationId">
                  <mat-option *ngFor="let a of applications" [value]="a.id">{{a.name}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Form Template</mat-label>
                <mat-select formControlName="formId">
                  <mat-option *ngFor="let f of forms" [value]="f.id">{{f.name}}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" placeholder="Brief description of the request">
              </mat-form-field>
            </div>
            
            <div class="form-row split-3">
              <mat-form-field appearance="outline">
                <mat-label>Reference Number</mat-label>
                <input matInput formControlName="referenceNumber" placeholder="e.g. CR-1001">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="New">New</mat-option>
                  <mat-option value="In Progress">In Progress</mat-option>
                  <mat-option value="Resolved">Resolved</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="Low">Low</mat-option>
                  <mat-option value="Medium">Medium</mat-option>
                  <mat-option value="High">High</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row split-2">
              <mat-form-field appearance="outline">
                <mat-label>Assigned To</mat-label>
                <input matInput formControlName="assignedTo" placeholder="Email or Username">
              </mat-form-field>
            </div>

            <div class="form-actions mt-4">
              <button mat-button type="button" routerLink="/service-items">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting">
                {{ submitting ? 'Creating...' : 'Create Service Item' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: [\`
    .max-w-3xl { max-width: 800px; margin: 0 auto; }
    .form-card { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color); border-radius: 12px; }
    .pt-form { padding: 8px 0; }
    .form-row { margin-bottom: 16px; }
    .split-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .split-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
    .full-width { width: 100%; display: block; }
    .form-actions { display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid var(--border-color); padding-top: 24px; }
    .mt-4 { margin-top: 24px; }
  \`]
})
export class ServiceItemCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appService = inject(ApplicationService);
  private formService = inject(FormService);
  private svcService = inject(ServiceItemService);
  private router = inject(Router);
  private ns = inject(NotificationService);

  form: FormGroup;
  applications: any[] = [];
  forms: any[] = [];
  submitting = false;

  constructor() {
    this.form = this.fb.group({
      applicationId: ['', Validators.required],
      formId: [''],
      title: ['', Validators.required],
      referenceNumber: ['', Validators.required],
      status: ['New', Validators.required],
      priority: ['Medium', Validators.required],
      assignedTo: ['']
    });
  }

  ngOnInit() {
    this.appService.getApplications().subscribe(apps => this.applications = apps);
    this.formService.getForms().subscribe(f => this.forms = f);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.svcService.createServiceItem(this.form.value).subscribe({
      next: () => {
        this.ns.success('Service Item created successfully.');
        this.router.navigate(['/service-items']);
      },
      error: () => {
        this.ns.error('Failed to create Service Item. Please try again.');
        this.submitting = false;
      }
    });
  }
}
`,

    "src/app/features/forms/form-list/form-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { FormService } from '../../../core/services/form.service';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: \`
    <app-page-header title="Forms" subtitle="Manage dynamic templates for your service items."></app-page-header>

    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div *ngIf="error" class="error-container">
      <app-empty-state icon="error_outline" title="Unable to load forms" description="There was a problem reaching the server." actionLabel="Try again" (action)="loadForms()"></app-empty-state>
    </div>

    <mat-card class="table-card table-responsive" *ngIf="!loading && !error && forms.length > 0">
      <table mat-table [dataSource]="forms" class="custom-table">
        <ng-container matColumnDef="formCode">
          <th mat-header-cell *matHeaderCellDef> Code </th>
          <td mat-cell *matCellDef="let element" class="monospaced"> {{element.formCode}} </td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let element" class="fw-500"> {{element.name}} </td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef> Description </th>
          <td mat-cell *matCellDef="let element" class="muted-text"> {{element.description}} </td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <span class="status-badge" [class.active]="element.active">{{element.active ? 'Active' : 'Inactive'}}</span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card>

    <app-empty-state *ngIf="!loading && !error && forms.length === 0" icon="dynamic_form" title="No forms configured" description="Form templates structure your processes."></app-empty-state>
  \`,
  styles: [\`
    .monospaced { font-family: monospace; }
    .fw-500 { font-weight: 500; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; background: var(--border-color); color: var(--muted-text-color); }
    .status-badge.active { background: #dcfce7; color: #166534; }
  \`]
})
export class FormListComponent implements OnInit {
  private svc = inject(FormService);
  forms: any[] = [];
  loading = true; error = false;
  displayedColumns = ['formCode', 'name', 'description', 'status'];
  
  ngOnInit() { this.loadForms(); }
  loadForms() {
    this.loading = true; this.error = false;
    this.svc.getForms().subscribe({
      next: (data) => { this.forms = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Feature components generated.');
