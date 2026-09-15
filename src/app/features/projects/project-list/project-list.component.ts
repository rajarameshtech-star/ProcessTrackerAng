
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
  template: `
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
        <div><h4>{{p.name}}</h4><span class="muted-text">ID: {{p.id}}</span></div></div>
        <p class="description-text">{{p.description || 'No description provided.'}}</p>
      </div>
    </div>
    <app-empty-state *ngIf="!loading && !error && projects.length === 0" icon="folder" title="No projects yet" actionLabel="Create Project"></app-empty-state>
  `,
  styles: [`
    .toolbar { display: flex; margin-bottom: 24px; width: 300px; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer; }
    .card-header { display: flex; align-items: center; margin-bottom: 12px; }
    .card-header h4 { margin: 0 0 4px; }
    .card-avatar { background: var(--primary-light); color: var(--primary-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .description-text { color: var(--muted-text-color); font-size: 0.875rem; margin: 0; }
  `]
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  projects: Project[] = []; loading = true; error = false;
  ngOnInit() { this.projectService.getProjects().subscribe({ next: (v) => { this.projects = v; this.loading = false; }, error: () => { this.error = true; this.loading = false; } }); }
}
