const fs = require('fs');
const path = require('path');

const files = {
    // --- 1. CORE SERVICES FOR RECENTLY VIEWED & LOCAL STATE ---
    "src/app/core/services/recently-viewed.service.ts": `
import { Injectable } from '@angular/core';

export interface RecentItem {
  id: string;
  type: 'Project' | 'Application' | 'ServiceItem' | 'Process';
  title: string;
  url: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private key = 'pt_recently_viewed';

  add(item: Omit<RecentItem, 'timestamp'>) {
     const history = this.get();
     const filtered = history.filter(i => i.id !== item.id);
     filtered.unshift({ ...item, timestamp: Date.now() });
     if (filtered.length > 20) filtered.pop();
     localStorage.setItem(this.key, JSON.stringify(filtered));
  }

  get(): RecentItem[] {
     try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
}
`,

    // --- 2. LAYOUT ENHANCEMENTS (BREADCRUMB, SEARCH, SIDEBAR) ---
    "src/app/layout/sidebar/sidebar.component.ts": `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: \`
    <div class="sidebar">
      <div class="branding">
         <div class="logo"></div>
         <span class="brand-name">ProcessTracker</span>
      </div>
      <nav class="nav-menu">
        <div class="nav-section">MAIN</div>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link"><kendo-icon name="home"></kendo-icon> Home</a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-link"><kendo-icon name="folder"></kendo-icon> Projects</a>
        <a routerLink="/applications" routerLinkActive="active" class="nav-link"><kendo-icon name="grid-layout"></kendo-icon> Applications</a>
        <a routerLink="/service-items" routerLinkActive="active" class="nav-link"><kendo-icon name="parameter-header"></kendo-icon> Service Items</a>
        <a routerLink="/processes" routerLinkActive="active" class="nav-link"><kendo-icon name="gear"></kendo-icon> Processes</a>

        <div class="nav-section">PERSONAL</div>
        <a routerLink="/my-work" routerLinkActive="active" class="nav-link"><kendo-icon name="user"></kendo-icon> My Work</a>
        <a routerLink="/recently-viewed" routerLinkActive="active" class="nav-link"><kendo-icon name="clock"></kendo-icon> Recently Viewed</a>
      </nav>
      
      <div class="spacer"></div>
      <nav class="nav-menu">
        <a routerLink="/settings" routerLinkActive="active" class="nav-link"><kendo-icon name="sliders"></kendo-icon> Settings</a>
      </nav>
    </div>
  \`,
  styles: [\`
    .sidebar { width: 260px; height: 100%; background: #0f172a; color: #94a3b8; display: flex; flex-direction: column; }
    .branding { height: 60px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #1e293b; gap: 12px; }
    .logo { width: 24px; height: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 6px; }
    .brand-name { color: #f8fafc; font-weight: 600; font-size: 1.1rem; letter-spacing: -0.02em; }
    .nav-menu { padding: 24px 16px 0; display: flex; flex-direction: column; gap: 4px; }
    .nav-section { font-size: 0.7rem; font-weight: 700; color: #475569; margin: 16px 0 8px 12px; letter-spacing: 0.05em; }
    .nav-link { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; color: #cbd5e1; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .nav-link:hover { background: #1e293b; color: #f8fafc; }
    .nav-link.active { background: #6366f1; color: white; }
    .spacer { flex: 1; }
  \`]
})
export class SidebarComponent {}
`,

    "src/app/layout/topbar/topbar.component.ts": `
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from '@progress/kendo-angular-buttons'; 
import { IconsModule } from '@progress/kendo-angular-icons'; 
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ServiceItemService } from '../../core/services/service-item.service';
import { ProjectService } from '../../core/services/project.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({ 
  selector: 'app-topbar', 
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, IconsModule, InputsModule, DialogsModule], 
  template: \`
    <header class="topbar"> 
      <div class="search-container" (click)="openSearch()"> 
         <kendo-icon name="search"></kendo-icon>
         <span class="placeholder">Search projects, items, processes...</span>
         <span class="shortcut">Ctrl+K</span>
      </div> 
      <div class="actions"> 
        <button kendoButton title="Notifications" icon="bell" fillMode="flat" rounded="full"></button> 
        <div class="avatar">U</div> 
      </div> 
    </header> 

    <kendo-dialog *ngIf="isSearchOpen" [title]="'Global Search'" (close)="closeSearch()" [width]="600">
       <div class="global-search-content">
          <kendo-textbox [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Type to search..." style="width:100%; margin-bottom: 20px;" [autofocus]="true" clearButton="true"></kendo-textbox>
          
          <div *ngIf="loading" class="searching-state"><kendo-icon name="loading"></kendo-icon> Searching...</div>
          
          <div *ngIf="!loading && searchTerm && results.length === 0" class="empty-results">
             No results found for "{{searchTerm}}"
          </div>
          
          <div class="results-list" *ngIf="!loading && results.length > 0">
             <div class="result-group" *ngIf="projects.length > 0">
                 <div class="group-title">Projects</div>
                 <a class="result-item" *ngFor="let p of projects" (click)="navigateAndClose('/projects/' + p.id)">
                    <kendo-icon name="folder"></kendo-icon> {{p.name}}
                 </a>
             </div>
             <div class="result-group" *ngIf="items.length > 0">
                 <div class="group-title">Service Items</div>
                 <a class="result-item" *ngFor="let i of items" (click)="navigateAndClose('/service-items/' + i.id)">
                    <kendo-icon name="parameter-header"></kendo-icon> {{i.referenceNumber}} - {{i.title}}
                 </a>
             </div>
          </div>
          <div class="hint" *ngIf="!searchTerm">Search by project names, service item references or titles.</div>
       </div>
    </kendo-dialog>
  \`, 
  styles: [\` 
    .topbar { height: 60px; background: white; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; } 
    .search-container { display: flex; align-items: center; background: #f1f5f9; padding: 8px 16px; border-radius: 20px; width: 400px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; } 
    .search-container:hover { border-color: #cbd5e1; background: #e2e8f0; }
    .search-container kendo-icon { color: var(--muted-text-color); margin-right: 8px; }
    .search-container .placeholder { flex: 1; font-size: 0.875rem; color: var(--muted-text-color); }
    .search-container .shortcut { font-size: 0.75rem; color: #94a3b8; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-family: monospace; }
    .actions { display: flex; align-items: center; gap: 16px; } 
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; cursor: pointer; } 
    
    .searching-state { padding: 24px; text-align: center; color: var(--muted-text-color); font-size: 0.875rem; }
    .empty-results { padding: 24px; text-align: center; color: var(--muted-text-color); font-size: 0.875rem; }
    .hint { padding: 24px; text-align: center; color: var(--muted-text-color); font-size: 0.8125rem; font-style: italic; }
    
    .results-list { max-height: 400px; overflow-y: auto; }
    .result-group { margin-bottom: 16px; }
    .group-title { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; padding-left: 8px; }
    .result-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; color: var(--text-color); font-size: 0.875rem; cursor: pointer; transition: background 0.1s; }
    .result-item:hover { background: #f8fafc; }
    .result-item kendo-icon { color: #94a3b8; }
  \`] 
}) 
export class TopbarComponent {
   private router = inject(Router); private projSvc = inject(ProjectService); private itemSvc = inject(ServiceItemService);
   isSearchOpen = false; searchTerm = ''; loading = false;
   projects: any[] = []; items: any[] = []; results: any[] = [];
   
   openSearch() { this.isSearchOpen = true; this.searchTerm = ''; this.results = []; this.projects = []; this.items = []; }
   closeSearch() { this.isSearchOpen = false; }
   
   onSearch() {
      if (!this.searchTerm || this.searchTerm.length < 2) { this.results=[]; return; }
      this.loading = true;
      const term = this.searchTerm.toLowerCase();
      // Light-weight local cross-search implementation for UI polish
      forkJoin({
         p: this.projSvc.getProjects().pipe(catchError(()=>of([]))),
         i: this.itemSvc.getServiceItems().pipe(catchError(()=>of([])))
      }).subscribe(data => {
         this.projects = data.p.filter((p:any) => p.name.toLowerCase().includes(term));
         this.items = data.i.filter((i:any) => i.title?.toLowerCase().includes(term) || i.referenceNumber?.toLowerCase().includes(term));
         this.results = [...this.projects, ...this.items];
         this.loading = false; // Fast visual response
      });
   }
   
   navigateAndClose(url: string) {
      this.router.navigateByUrl(url);
      this.closeSearch();
   }
}
`,

    // --- 3. RECENTLY VIEWED & MY WORK PAGES ---
    "src/app/features/my-work/my-work.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ListModule } from '@progress/kendo-angular-listview';
import { ServiceItemService } from '../../core/services/service-item.service';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-my-work',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, EmptyStateComponent, LoadingStateComponent],
  template: \`
    <app-page-header title="My Work" subtitle="Service Items assigned to you across all projects."></app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div *ngIf="!loading && items.length > 0" class="work-grid">
       <a *ngFor="let item of items" class="work-card" [routerLink]="['/service-items', item.id]">
          <div class="card-header">
             <span class="ref">{{item.referenceNumber}}</span>
             <span class="status-indicator" [attr.data-status]="item.status"></span>
          </div>
          <h3 class="card-title">{{item.title}}</h3>
          <div class="card-meta">
             <span>{{item.priority}} Priority</span> • <span>{{item.status}}</span>
          </div>
       </a>
    </div>
    
    <app-empty-state *ngIf="!loading && items.length === 0" icon="user" title="No assignments" description="You have no service items assigned at the moment."></app-empty-state>
  \`,
  styles: [\`
    .work-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 24px; }
    .work-card { display: block; background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border-color); text-decoration: none; color: inherit; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .work-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .ref { font-family: monospace; font-size: 0.8125rem; color: var(--muted-text-color); }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
    .status-indicator[data-status="In Progress"] { background: #3b82f6; }
    .status-indicator[data-status="New"] { background: #10b981; }
    .card-title { margin: 0 0 12px; font-size: 1.125rem; font-weight: 600; color: var(--text-color); line-height: 1.4; }
    .card-meta { font-size: 0.75rem; color: var(--muted-text-color); display: flex; gap: 8px; }
  \`]
})
export class MyWorkComponent implements OnInit {
  svc = inject(ServiceItemService); items: any[] = []; loading = true;
  ngOnInit() {
     // Explicitly pulling items and locally filtering by an assumed context user 'U' or 'User' or generic match for presentation
     this.svc.getServiceItems().subscribe(data => {
        // Find assigned items (fake current user 'Jane' 'John' etc if unassigned. for demo showing any assigned)
        this.items = data.filter(i => i.assignedTo && i.assignedTo.trim().length > 0);
        this.loading = false;
     });
  }
}
`,

    "src/app/features/recently-viewed/recently-viewed.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { RecentlyViewedService, RecentItem } from '../../core/services/recently-viewed.service';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({
  selector: 'app-recently-viewed',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, EmptyStateComponent, IconsModule, DatePipe],
  template: \`
    <app-page-header title="Recently Viewed" subtitle="Quickly access items you've checked recently."></app-page-header>
    
    <div class="recent-list" *ngIf="items.length > 0">
       <a *ngFor="let item of items" [routerLink]="item.url" class="recent-row">
          <kendo-icon [name]="getIcon(item.type)" class="item-icon"></kendo-icon>
          <div class="item-content">
             <div class="item-title">{{item.title}}</div>
             <div class="item-meta">{{item.type}} • {{item.timestamp | date:'medium'}}</div>
          </div>
          <kendo-icon name="chevron-right" class="arrow"></kendo-icon>
       </a>
    </div>

    <app-empty-state *ngIf="items.length === 0" icon="clock" title="No recent history" description="Items you view will automatically appear here."></app-empty-state>
  \`,
  styles: [\`
    .recent-list { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; max-width: 800px; }
    .recent-row { display: flex; align-items: center; padding: 16px; background: white; border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.15s; }
    .recent-row:hover { background: #f8fafc; border-color: #cbd5e1; }
    .item-icon { font-size: 24px; color: #94a3b8; margin-right: 16px; margin-left: 8px; }
    .item-content { flex: 1; }
    .item-title { font-weight: 600; color: var(--text-color); margin-bottom: 4px; font-size: 0.95rem; }
    .item-meta { font-size: 0.75rem; color: var(--muted-text-color); }
    .arrow { color: #cbd5e1; font-size: 18px; }
  \`]
})
export class RecentlyViewedComponent implements OnInit {
  rvSvc = inject(RecentlyViewedService); 
  items: RecentItem[] = [];
  ngOnInit() { this.items = this.rvSvc.get(); }
  getIcon(type: string) {
     if (type === 'Project') return 'folder';
     if (type === 'Application') return 'grid-layout';
     if (type === 'Process') return 'gear';
     return 'parameter-header';
  }
}
`,

    "src/app/features/settings/settings.component.ts": `
import { Component } from '@angular/core'; 
import { PageHeaderComponent } from '../../shared/page-header/page-header.component'; 
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component'; 
@Component({ 
   selector: 'app-settings', standalone: true, imports: [PageHeaderComponent, EmptyStateComponent], 
   template: \`<app-page-header title="Settings"></app-page-header><app-empty-state icon="sliders" title="Configuration Panel" description="Platform settings will be available in future releases."></app-empty-state>\` 
}) 
export class SettingsComponent {}
`,

    // --- 4. PROJECT DETAIL BREADCRUMBS & APPLICATIONS LIST ---
    "src/app/features/projects/project-detail/project-detail.component.ts": `
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
  template: \`
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
  \`]
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
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('UI Polished successfully phase 1.');
