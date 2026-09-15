
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
  template: `
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
  `,
  styles: [`
    .breadcrumb { margin-bottom: 24px; color: var(--muted-text-color); font-size: 0.875rem; }
    .breadcrumb a { color: var(--primary-color); }
    .info-card { padding: 20px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); }
    .info-label { font-size: 0.75rem; text-transform: uppercase; color: var(--muted-text-color); font-weight: 600; }
    .mt-4 { margin-top: 32px; }
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .item-card { padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); }
  `]
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private projectService = inject(ProjectService); private appService = inject(ApplicationService);
  project: any; applications: any[] = []; loading = true;
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.projectService.getProject(id).subscribe(p => { this.project = p; this.appService.getApplications(id).subscribe(a => { this.applications = a; this.loading = false }); }); }
  }
}
