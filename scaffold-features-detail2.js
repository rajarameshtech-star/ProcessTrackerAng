const fs = require('fs');
const path = require('path');

const files = {
    "src/app/core/services/process-definition-project-mapping.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { ProcessDefinitionProjectMapping } from '../models/process-definition-project-mapping.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ProcessDefinitionProjectMappingService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/ProcessDefinitionProjectMappings\`;\n\n  getByProject(projectId: string): Observable<ProcessDefinitionProjectMapping[]> {\n    return this.http.get<ProcessDefinitionProjectMapping[]>(\`\${this.apiUrl}/by-project/\${projectId}\`);\n  }\n}`,

    "src/app/core/services/service-item.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { ServiceItem } from '../models/service-item.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ServiceItemService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/ServiceItems\`;\n\n  getServiceItems(applicationId?: string): Observable<ServiceItem[]> {\n    const url = applicationId ? \`\${this.apiUrl}?applicationId=\${applicationId}\` : this.apiUrl;\n    return this.http.get<ServiceItem[]>(url);\n  }\n  getServiceItem(id: string): Observable<ServiceItem> {\n    return this.http.get<ServiceItem>(\`\${this.apiUrl}/\${id}\`);\n  }\n  createServiceItem(item: Partial<ServiceItem>): Observable<ServiceItem> {\n    return this.http.post<ServiceItem>(this.apiUrl, item);\n  }\n  updateServiceItem(id: string, item: Partial<ServiceItem>): Observable<ServiceItem> {\n    return this.http.put<ServiceItem>(\`\${this.apiUrl}/\${id}\`, item);\n  }\n  deleteServiceItem(id: string): Observable<void> {\n    return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`);\n  }\n}`,

    "src/app/features/service-items/service-item-detail/service-item-detail.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { IconsModule } from '@progress/kendo-angular-icons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { StatusChipComponent } from '../../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../../shared/priority-chip/priority-chip.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { ServiceItemService } from '../../../core/services/service-item.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service';
import { ProcessRecordService } from '../../../core/services/process-record.service';
import { ProcessFieldService } from '../../../core/services/process-field.service';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-service-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, IconsModule, DialogsModule, ReactiveFormsModule, InputsModule, DropDownsModule, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, DatePipe],
  template: \`
    <div class="breadcrumb mb-4">
       <a routerLink="/service-items">Service Items</a>
       <kendo-icon name="chevron-right" class="mx-2"></kendo-icon>
       <span>{{ item?.referenceNumber || 'Loading...' }}</span>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && item" class="layout-wrapper">
      <div class="header-section">
         <div style="flex: 1;">
            <div class="title-row">
               <h1 class="main-title">{{item.title}}</h1>
               <app-status-chip [status]="item.status"></app-status-chip>
               <app-priority-chip [priority]="item.priority"></app-priority-chip>
            </div>
            <div class="ref-number monospaced">{{item.referenceNumber}}</div>
         </div>
         <div class="header-actions">
            <button kendoButton icon="pencil" (click)="openEdit()">Edit</button>
            <button kendoButton icon="more-vertical" fillMode="flat"></button>
         </div>
      </div>

      <div class="main-grid">
         <div class="workspace-col">
            <div class="section-container">
               <h3 class="section-head">Process Data</h3>
               
               <div *ngIf="dataLoading" style="padding: 24px;"><kendo-loader></kendo-loader></div>
               
               <ng-container *ngIf="!dataLoading">
                  <div *ngIf="processRecord" class="data-grid">
                     <div class="data-item" *ngFor="let field of processFields">
                        <div class="data-label">{{field.label}}</div>
                        <div class="data-value">
                           <ng-container [ngSwitch]="field.fieldType">
                              <span *ngSwitchCase="3" class="bool-indicator" [class.yes]="parsedData[field.fieldName]">
                                {{parsedData[field.fieldName] ? 'Yes' : 'No'}}
                              </span>
                              <a *ngSwitchCase="7" [href]="parsedData[field.fieldName]" target="_blank" rel="noopener">{{parsedData[field.fieldName]}}</a>
                              <span *ngSwitchCase="4">{{parsedData[field.fieldName] | date:'mediumDate'}}</span>
                              <span *ngSwitchCase="5">{{parsedData[field.fieldName] | date:'medium'}}</span>
                              <span *ngSwitchDefault>{{parsedData[field.fieldName] || '-'}}</span>
                           </ng-container>
                        </div>
                     </div>
                  </div>

                  <div *ngIf="!processRecord" class="empty-inline text-center">
                     <kendo-icon name="form" size="xlarge" class="mb-2" style="color: var(--muted-text-color)"></kendo-icon>
                     <h4>Process data hasn't been entered yet</h4>
                     <p>Complete the process information to start tracking this item's progress.</p>
                     <button kendoButton themeColor="primary" class="mt-2 text-center" (click)="addProcessData()">Add Process Data</button>
                  </div>
               </ng-container>
            </div>
         </div>
         
         <div class="properties-col">
            <div class="prop-panel">
               <h3 class="section-head" style="margin-top: 0;">Properties</h3>
               <div class="prop-list">
                  <div class="prop-item">
                     <span class="prop-label">Application</span>
                     <a [routerLink]="['/applications']" [queryParams]="{projectId: app?.projectId}" class="prop-value link">{{app?.name}}</a>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Process</span>
                     <span class="prop-value">{{process?.name}} ({{process?.code || process?.formCode}})</span>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Status</span>
                     <div class="prop-value"><app-status-chip [status]="item.status"></app-status-chip></div>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Priority</span>
                     <div class="prop-value"><app-priority-chip [priority]="item.priority"></app-priority-chip></div>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Assigned To</span>
                     <div class="prop-value user-pill" *ngIf="item.assignedTo">
                        <div class="sm-avatar">{{item.assignedTo.charAt(0) | uppercase}}</div>
                        {{item.assignedTo}}
                     </div>
                     <span class="prop-value muted-text" *ngIf="!item.assignedTo">Unassigned</span>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Created</span>
                     <span class="prop-value muted-text">{{ (item.createdAt | date:'medium') || '-' }}</span>
                  </div>
                  <div class="prop-item">
                     <span class="prop-label">Updated</span>
                     <span class="prop-value muted-text">{{ (item.updatedAt | date:'medium') || '-' }}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <kendo-dialog *ngIf="isEditing" title="Edit Service Item" (close)="closeEdit()" [width]="600">
      <form [formGroup]="editForm" (ngSubmit)="saveEdit()" class="pt-form">
         <div class="form-row">
            <label>Title</label><kendo-textbox formControlName="title"></kendo-textbox>
         </div>
         <div class="form-row split-2">
            <div><label>Status</label><kendo-dropdownlist formControlName="status" [data]="['New','In Progress','Completed','Blocked','Cancelled']"></kendo-dropdownlist></div>
            <div><label>Priority</label><kendo-dropdownlist formControlName="priority" [data]="['Low','Medium','High','Critical']"></kendo-dropdownlist></div>
         </div>
         <div class="form-row">
            <label>Assigned To</label><kendo-textbox formControlName="assignedTo"></kendo-textbox>
         </div>
      </form>
      <kendo-dialog-actions>
         <button kendoButton (click)="closeEdit()" [disabled]="saving">Cancel</button>
         <button kendoButton themeColor="primary" (click)="saveEdit()" [disabled]="editForm.invalid || saving">{{saving ? 'Saving...' : 'Save Changes'}}</button>
      </kendo-dialog-actions>
    </kendo-dialog>
  \`,
  styles: [\`
    .mb-4 { margin-bottom: 16px; } .mb-2 { margin-bottom: 8px; } .mx-2 { margin: 0 8px; } .mt-2 { margin-top: 8px; }
    .breadcrumb { display: flex; align-items: center; font-size: 0.875rem; color: var(--muted-text-color); }
    .breadcrumb a { color: var(--primary-color); }
    .layout-wrapper { display: flex; flex-direction: column; gap: 24px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
    .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .main-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--text-color); }
    .ref-number { font-size: 0.875rem; color: var(--muted-text-color); }
    .monospaced { font-family: monospace; }
    .header-actions { display: flex; gap: 8px; }
    
    .main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 32px; align-items: flex-start; }
    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
    
    .section-container { background: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color); padding: 24px; }
    .section-head { margin: 0 0 20px 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
    
    .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .data-item { display: flex; flex-direction: column; }
    .data-label { font-size: 0.75rem; font-weight: 600; color: var(--muted-text-color); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
    .data-value { font-size: 0.875rem; color: var(--text-color); }
    
    .bool-indicator { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; background: #fee2e2; color: #991b1b; }
    .bool-indicator.yes { background: #dcfce7; color: #166534; }
    
    .prop-panel { background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); }
    .prop-list { display: flex; flex-direction: column; gap: 16px; }
    .prop-item { display: flex; flex-direction: column; }
    .prop-label { font-size: 0.75rem; font-weight: 500; color: var(--muted-text-color); margin-bottom: 4px; }
    .prop-value { font-size: 0.875rem; font-weight: 500; color: var(--text-color); display: flex; align-items: center; }
    .prop-value.link { color: var(--primary-color); text-decoration: none; }
    
    .user-pill { display: inline-flex; align-items: center; background: white; padding: 4px 12px 4px 4px; border-radius: 16px; border: 1px solid var(--border-color); font-size: 0.8125rem; }
    .sm-avatar { width: 20px; height: 20px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; margin-right: 8px; }
    
    .empty-inline { padding: 48px 24px; border: 1px dashed var(--border-color); border-radius: 8px; background: #f8fafc; }
    .text-center { text-align: center; }
  \`]
})
export class ServiceItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private svc = inject(ServiceItemService); private appSvc = inject(ApplicationService); private procSvc = inject(ProcessDefinitionService); private recSvc = inject(ProcessRecordService); private fieldSvc = inject(ProcessFieldService); private ns = inject(NotificationService); private fb = inject(FormBuilder);
  
  loading = true; dataLoading = true;
  itemId: string | null = null;
  item: any; app: any; process: any;
  processRecord: any = null; processFields: any[] = []; parsedData: any = {};
  
  isEditing = false; saving = false; editForm!: FormGroup;

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) this.loadFullDetails();
  }

  loadFullDetails() {
    this.loading = true;
    this.svc.getServiceItem(this.itemId!).subscribe({
       next: (data) => {
         this.item = data;
         forkJoin({
           app: this.appSvc.getApplications().pipe(catchError(()=>of([]))),
           proc: this.procSvc.getProcessDefinitions().pipe(catchError(()=>of([])))
         }).subscribe(meta => {
           this.app = meta.app.find((a: any) => a.id === this.item.applicationId);
           this.process = meta.proc.find((p: any) => p.id === this.item.processDefinitionId);
           this.loading = false;
           this.loadProcessData();
         });
       },
       error: () => this.loading = false
    });
  }

  loadProcessData() {
    this.dataLoading = true;
    if (!this.item.processDefinitionId) { this.dataLoading = false; return; }
    
    forkJoin({
       f: this.fieldSvc.getProcessFields(this.item.processDefinitionId).pipe(catchError(()=>of([]))),
       r: this.recSvc.getRecordByServiceItem(this.itemId!).pipe(catchError(()=>of(null)))
    }).subscribe(res => {
       this.processFields = res.f.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
       if (res.r) {
          this.processRecord = res.r;
          try { this.parsedData = JSON.parse(this.processRecord.dataJson); } catch (e) { this.parsedData = {}; }
       }
       this.dataLoading = false;
    });
  }

  addProcessData() { this.ns.success('Adding process data (To be done in Prompt 3)'); }

  openEdit() {
    this.editForm = this.fb.group({
      title: [this.item.title, Validators.required],
      status: [this.item.status, Validators.required],
      priority: [this.item.priority, Validators.required],
      assignedTo: [this.item.assignedTo]
    });
    this.isEditing = true;
  }
  closeEdit() { this.isEditing = false; }
  saveEdit() {
    if (this.editForm.invalid) return;
    this.saving = true;
    this.svc.updateServiceItem(this.itemId!, { ...this.item, ...this.editForm.value }).subscribe({
      next: () => {
         this.ns.success('Updated successfully');
         this.item = { ...this.item, ...this.editForm.value };
         this.saving = false; this.isEditing = false;
      },
      error: () => { this.ns.error('Failed to update'); this.saving = false; }
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
console.log('Feature detail generated.');
