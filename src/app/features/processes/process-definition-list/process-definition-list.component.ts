
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service';

@Component({
  selector: 'app-process-definition-list',
  standalone: true,
  imports: [CommonModule, GridModule, PageHeaderComponent, LoadingStateComponent],
  template: `
    <app-page-header title="ProcessDefinitions" subtitle="Manage dynamic templates."></app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <kendo-grid [data]="processes" *ngIf="!loading && processes.length > 0">
      <kendo-grid-column field="formCode" title="Code"></kendo-grid-column>
      <kendo-grid-column field="name" title="Name"></kendo-grid-column>
      <kendo-grid-column field="description" title="Description"></kendo-grid-column>
      <kendo-grid-column title="Status">
         <ng-template kendoGridCellTemplate let-dataItem>
           <span [class.active-status]="dataItem.active">{{dataItem.active ? 'Active' : 'Inactive'}}</span>
         </ng-template>
      </kendo-grid-column>
    </kendo-grid>
  `,
  styles: [` .active-status { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; } `]
})
export class ProcessDefinitionListComponent implements OnInit {
  private svc = inject(ProcessDefinitionService); processes: any[] = []; loading = true;
  ngOnInit() { this.svc.getProcessDefinitions().subscribe(f => { this.processes = f; this.loading = false; }); }
}
