const fs = require('fs');
const path = require('path');

const files = {
    "src/app/features/processes/process-definition-list/process-definition-list.component.ts": `
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service';
import { NotificationService } from '../../../core/services/notification.service';
import { process, State } from '@progress/kendo-data-query';

@Component({
  selector: 'app-process-definition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GridModule, ButtonModule, InputsModule, DropDownsModule, DialogsModule, RouterModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent, DatePipe],
  template: \`
    <app-page-header title="Processes" subtitle="Define the operational processes tracked by your organization.">
      <button kendoButton themeColor="primary" icon="plus" (click)="openCreate()">New Process</button>
    </app-page-header>
    
    <div class="toolbar" *ngIf="!loading">
      <kendo-textbox placeholder="Search processes..." [style.width.px]="250" [(ngModel)]="searchTerm" (valueChange)="applyFilters()"></kendo-textbox>
      <kendo-dropdownlist [data]="[{text: 'All', value: null}, {text: 'Active', value: true}, {text: 'Inactive', value: false}]" textField="text" valueField="value" [valuePrimitive]="true" [(ngModel)]="activeFilter" (valueChange)="applyFilters()" [style.width.px]="150"></kendo-dropdownlist>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>
    
    <div class="grid-container" *ngIf="!loading && gridView && gridView.data.length > 0">
      <kendo-grid [data]="gridView" [sortable]="true" [sort]="state.sort || []" (dataStateChange)="dataStateChange($event)">
        <kendo-grid-column field="processCode" title="Code" [width]="150">
          <ng-template kendoGridCellTemplate let-dataItem>
             <a class="ref-link monospaced" [routerLink]="['/processes', dataItem.id]">{{dataItem.processCode || dataItem.formCode}}</a>
          </ng-template>
        </kendo-grid-column>
        <kendo-grid-column field="name" title="Process Name" [width]="250"></kendo-grid-column>
        <kendo-grid-column field="description" title="Description"></kendo-grid-column>
        <kendo-grid-column title="Status" [width]="100">
           <ng-template kendoGridCellTemplate let-dataItem>
             <span class="active-pill" [class.inactive]="!dataItem.active">{{dataItem.active ? 'Active' : 'Inactive'}}</span>
           </ng-template>
        </kendo-grid-column>
        <kendo-grid-column title="Actions" [width]="100" [sortable]="false">
          <ng-template kendoGridCellTemplate let-dataItem>
            <button kendoButton icon="folder-open" fillMode="flat" title="Open" [routerLink]="['/processes', dataItem.id]"></button>
            <button kendoButton icon="trash" fillMode="flat" themeColor="error" title="Delete" (click)="confirmDelete(dataItem)"></button>
          </ng-template>
        </kendo-grid-column>
      </kendo-grid>
    </div>
    
    <app-empty-state *ngIf="!loading && gridView && gridView.data.length === 0" icon="slider-vertical" title="No processes found" description="Create a process to begin customizing your data models." actionLabel="New Process" (action)="openCreate()"></app-empty-state>

    <!-- Create Dialog -->
    <kendo-dialog *ngIf="showCreate" title="New Process" (close)="closeCreate()" [width]="500">
      <div class="pt-form">
         <div class="form-row">
            <label>Process Code</label>
            <kendo-textbox [(ngModel)]="creation.processCode"></kendo-textbox>
         </div>
         <div class="form-row">
            <label>Process Name</label>
            <kendo-textbox [(ngModel)]="creation.name"></kendo-textbox>
         </div>
         <div class="form-row">
            <label>Description</label>
            <kendo-textbox [(ngModel)]="creation.description"></kendo-textbox>
         </div>
      </div>
      <kendo-dialog-actions>
         <button kendoButton (click)="closeCreate()" [disabled]="saving">Cancel</button>
         <button kendoButton themeColor="primary" (click)="saveCreate()" [disabled]="!creation.name || !creation.processCode || saving">Create</button>
      </kendo-dialog-actions>
    </kendo-dialog>

    <kendo-dialog *ngIf="itemToDelete" title="Delete Process?" (close)="cancelDelete()" [minWidth]="300">
        <p>This action cannot be undone and will affect all related Service Items.</p>
        <p style="font-weight: 500; margin-top: 16px;">{{itemToDelete.processCode || itemToDelete.formCode}}<br>{{itemToDelete.name}}</p>
        <kendo-dialog-actions>
            <button kendoButton (click)="cancelDelete()">Cancel</button>
            <button kendoButton themeColor="primary" (click)="deleteItem()">Delete</button>
        </kendo-dialog-actions>
    </kendo-dialog>
  \`,
  styles: [\`
    .toolbar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; background: var(--surface-color); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); }
    .ref-link { color: var(--primary-color); font-weight: 600; }
    .grid-container { box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 12px; overflow: hidden; }
    .active-pill { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: #dcfce7; color: #166534; }
    .active-pill.inactive { background: #fee2e2; color: #991b1b; }
  \`]
})
export class ProcessDefinitionListComponent implements OnInit {
  private svc = inject(ProcessDefinitionService); private ns = inject(NotificationService); private router = inject(Router);
  loading = true; allItems: any[] = []; filteredItems: any[] = [];
  gridView: import('@progress/kendo-data-query').DataResult | null = null;
  state: State = { skip: 0, take: 50, sort: [] };
  searchTerm = ''; activeFilter: boolean | null = null;
  showCreate = false; itemToDelete: any = null; saving = false;
  creation: any = { processCode: '', name: '', description: '', active: true, formCode: '' };

  ngOnInit() { this.refreshData(); }
  
  refreshData() {
    this.loading = true;
    this.svc.getProcessDefinitions().subscribe(data => {
       this.allItems = data.map(d => ({ ...d, processCode: d.formCode || d.processCode || d.formCode })); // map backend inconsistencies if any
       this.applyFilters(); this.loading = false;
    });
  }

  applyFilters() {
    let result = this.allItems;
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(i => (i.name && i.name.toLowerCase().includes(t)) || (i.processCode && i.processCode.toLowerCase().includes(t)));
    }
    if (this.activeFilter !== null) result = result.filter(i => i.active === this.activeFilter);
    this.filteredItems = result; this.loadGridData();
  }
  
  loadGridData() { this.gridView = process(this.filteredItems, this.state); }
  dataStateChange(state: State) { this.state = state; this.loadGridData(); }

  openCreate() { this.showCreate = true; this.creation = { processCode: '', name: '', description: '', active: true }; }
  closeCreate() { this.showCreate = false; }
  saveCreate() {
    this.saving = true;
    // Map processCode to formCode for backend compatibility if they haven't run migration
    const payload = { ...this.creation, formCode: this.creation.processCode };
    this.svc.createProcessDefinition(payload).subscribe({
      next: (res) => { this.ns.success('Created.'); this.showCreate = false; this.saving = false; if (res.id) this.router.navigate(['/processes', res.id]); else this.refreshData(); },
      error: () => { this.ns.error('Failed creation.'); this.saving = false; }
    });
  }

  confirmDelete(item: any) { this.itemToDelete = item; }
  cancelDelete() { this.itemToDelete = null; }
  deleteItem() {
    this.svc.deleteProcessDefinition(this.itemToDelete.id).subscribe({
      next: () => { this.ns.success('Deleted'); this.itemToDelete = null; this.refreshData(); },
      error: () => { this.ns.error('Failed to delete'); this.itemToDelete = null; }
    });
  }
}
`,

    "src/app/features/processes/process-definition-detail/process-definition-detail.component.ts": `
import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common'; 
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid'; 
import { ButtonModule } from '@progress/kendo-angular-buttons'; 
import { IconsModule } from '@progress/kendo-angular-icons'; 
import { DialogsModule } from '@progress/kendo-angular-dialog'; 
import { InputsModule } from '@progress/kendo-angular-inputs'; 
import { DropDownsModule } from '@progress/kendo-angular-dropdowns'; 
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component'; 
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ProcessDefinitionService } from '../../../core/services/process-definition.service'; 
import { ProcessFieldService } from '../../../core/services/process-field.service';
import { ProcessDefinitionProjectMappingService } from '../../../core/services/process-definition-project-mapping.service';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { process as kendoProcess, State } from '@progress/kendo-data-query';

@Component({
  selector: 'app-process-definition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, GridModule, ButtonModule, IconsModule, DialogsModule, InputsModule, DropDownsModule, LoadingStateComponent, EmptyStateComponent, DatePipe],
  template: \`
    <div class="breadcrumb mb-4">
       <a routerLink="/processes">Processes</a>
       <kendo-icon name="chevron-right" class="mx-2"></kendo-icon>
       <span>{{ process?.name || 'Loading...' }}</span>
    </div>

    <app-loading-state *ngIf="loading"></app-loading-state>

    <div *ngIf="!loading && process" class="layout-wrapper">
      <div class="header-section">
         <div style="flex: 1;">
            <div class="title-row">
               <h1 class="main-title">{{process.name}}</h1>
               <span class="active-pill" [class.inactive]="!process.active">{{process.active ? 'Active' : 'Inactive'}}</span>
            </div>
            <div class="ref-number monospaced">{{process.formCode || process.processCode}} &nbsp;&middot;&nbsp; {{process.description}}</div>
         </div>
         <div class="header-actions">
            <button kendoButton icon="pencil" (click)="openProcessEdit()">Edit Process</button>
            <button kendoButton icon="folder-open" fillMode="flat">Map Projects</button>
         </div>
      </div>

      <div class="main-grid">
         <div class="workspace-col">
            <div class="section-container">
               <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                  <h3 class="section-head" style="margin:0;">Process Fields</h3>
                  <button kendoButton themeColor="primary" icon="plus" fillMode="flat" (click)="openFieldCreate()">Add Field</button>
               </div>
               
               <kendo-grid [data]="fieldsData" [sortable]="false" *ngIf="fields.length > 0">
                  <kendo-grid-column field="sortOrder" title="Order" [width]="80"></kendo-grid-column>
                  <kendo-grid-column field="label" title="Label"></kendo-grid-column>
                  <kendo-grid-column field="fieldName" title="Field Name" [width]="200"></kendo-grid-column>
                  <kendo-grid-column title="Type" [width]="150">
                     <ng-template kendoGridCellTemplate let-dataItem>
                         <span class="type-badge">{{getFieldTypeName(dataItem.fieldType)}}</span>
                     </ng-template>
                  </kendo-grid-column>
                  <kendo-grid-column title="Required" [width]="100">
                     <ng-template kendoGridCellTemplate let-dataItem>
                         <kendo-icon name="check" *ngIf="dataItem.isRequired" style="color: #10b981;"></kendo-icon>
                     </ng-template>
                  </kendo-grid-column>
                  <kendo-grid-column title="Actions" [width]="120">
                     <ng-template kendoGridCellTemplate let-dataItem>
                        <button kendoButton icon="pencil" fillMode="flat" (click)="openFieldEdit(dataItem)"></button>
                        <button kendoButton icon="trash" fillMode="flat" themeColor="error" (click)="confirmFieldDelete(dataItem)"></button>
                     </ng-template>
                  </kendo-grid-column>
               </kendo-grid>
               
               <app-empty-state *ngIf="fields.length === 0" icon="table" title="No fields defined" description="Build the metadata contract for this process." actionLabel="Add Process Field" (action)="openFieldCreate()"></app-empty-state>
            </div>
         </div>
         
         <div class="properties-col">
            <div class="prop-panel">
               <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 16px;">
                 <h3 class="section-head" style="margin: 0;">Available in Projects</h3>
                 <button kendoButton icon="plus" fillMode="flat" (click)="showMapProject = !showMapProject"></button>
               </div>
               
               <div *ngIf="showMapProject" class="mb-4 pt-form p-3" style="background: white; border-radius: 8px; border: 1px solid var(--border-color);">
                  <label>Add to project</label>
                  <kendo-dropdownlist [data]="unmappedProjects" textField="name" valueField="id" [valuePrimitive]="true" [(ngModel)]="projectToMap" style="width: 100%; margin-bottom: 8px;"></kendo-dropdownlist>
                  <div style="display: flex; gap: 8px;">
                     <button kendoButton (click)="showMapProject = false; projectToMap = null">Cancel</button>
                     <button kendoButton themeColor="primary" [disabled]="!projectToMap" (click)="mapProject()">Map</button>
                  </div>
               </div>

               <div class="prop-list">
                  <div class="prop-item" *ngFor="let map of projectMappings">
                     <div style="display:flex; justify-content:space-between; width: 100%; align-items:center;">
                        <span class="prop-value" style="font-weight: 500;">{{getProjectName(map.projectId)}}</span>
                        <button kendoButton icon="x" fillMode="flat" size="small" themeColor="error" (click)="unmapProject(map.projectId)"></button>
                     </div>
                  </div>
                  <div class="prop-item text-center muted-text" *ngIf="projectMappings.length === 0">
                     Not mapped to any projects.<br>Service Items cannot use this process.
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>

    <!-- Field Editor Modal -->
    <kendo-dialog *ngIf="isFieldEditorOpen" title="Process Field" (close)="closeFieldEditor()" [width]="700">
      <form [formGroup]="fieldForm" (ngSubmit)="saveField()" class="pt-form">
         <div class="form-row split-2">
            <div><label>Field Name (API key)</label><kendo-textbox formControlName="fieldName"></kendo-textbox>
                 <small class="error-msg" *ngIf="fieldForm.get('fieldName')?.touched && fieldForm.get('fieldName')?.invalid">Field name is required.</small></div>
            <div><label>UI Label</label><kendo-textbox formControlName="label"></kendo-textbox>
                 <small class="error-msg" *ngIf="fieldForm.get('label')?.touched && fieldForm.get('label')?.invalid">Label is required.</small></div>
         </div>
         <div class="form-row split-2">
            <div><label>Field Type</label><kendo-dropdownlist formControlName="fieldType" [data]="fieldTypes" textField="text" valueField="value" [valuePrimitive]="true"></kendo-dropdownlist></div>
            <div><label>Sort Order</label><kendo-numerictextbox formControlName="sortOrder" [min]="0" [autoCorrect]="true"></kendo-numerictextbox></div>
         </div>
         
         <div class="form-row split-2">
            <div style="display:flex; align-items:center; gap: 8px; margin-top: 24px;">
               <input type="checkbox" formControlName="isRequired" kendoCheckBox/> <label style="margin:0;">Required field</label>
            </div>
            <div style="display:flex; align-items:center; gap: 8px; margin-top: 24px;">
               <input type="checkbox" formControlName="isActive" kendoCheckBox/> <label style="margin:0;">Active</label>
            </div>
         </div>

         <div class="separator">Advanced</div>

         <div class="form-row split-2" *ngIf="fieldForm.get('fieldType')?.value === 0 || fieldForm.get('fieldType')?.value === 7">
            <div><label>Placeholder text</label><kendo-textbox formControlName="placeholder"></kendo-textbox></div>
            <div><label>Default Value</label><kendo-textbox formControlName="defaultValue"></kendo-textbox></div>
         </div>

         <div class="form-row" *ngIf="fieldForm.get('fieldType')?.value === 6">
            <label>Dropdown Options JSON</label>
            <textarea kendoTextArea formControlName="optionsJson" placeholder='["Option 1", "Option 2"] or [{"label":"L","value":1}]' [rows]="4"></textarea>
            <small style="color:var(--muted-text-color)">Enter a valid JSON array.</small>
         </div>

      </form>
      <kendo-dialog-actions>
         <button kendoButton (click)="closeFieldEditor()" [disabled]="saving">Cancel</button>
         <button kendoButton themeColor="primary" (click)="saveField()" [disabled]="fieldForm.invalid || saving">Save Field</button>
      </kendo-dialog-actions>
    </kendo-dialog>

    <kendo-dialog *ngIf="fieldToDelete" title="Delete Field?" (close)="fieldToDelete = null" [minWidth]="300">
        <p>This action affects all process records missing this field definition.</p>
        <p style="font-weight: 500;">{{fieldToDelete.label}} ({{fieldToDelete.fieldName}})</p>
        <kendo-dialog-actions>
            <button kendoButton (click)="fieldToDelete = null">Cancel</button>
            <button kendoButton themeColor="primary" (click)="deleteField()">Delete</button>
        </kendo-dialog-actions>
    </kendo-dialog>
  \`,
  styles: [\`
    .mb-4 { margin-bottom: 16px; } .mx-2 { margin: 0 8px; } .mt-2 { margin-top: 8px; } .p-3 { padding: 12px; }
    .breadcrumb { display: flex; align-items: center; font-size: 0.875rem; color: var(--muted-text-color); }
    .breadcrumb a { color: var(--primary-color); }
    .layout-wrapper { display: flex; flex-direction: column; gap: 24px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
    .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .main-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--text-color); }
    .ref-number { font-size: 0.875rem; color: var(--muted-text-color); }
    .monospaced { font-family: monospace; }
    .header-actions { display: flex; gap: 8px; }
    
    .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: flex-start; }
    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
    
    .section-container { background: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color); padding: 24px; }
    .section-head { margin: 0 0 20px 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
    
    .active-pill { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: #dcfce7; color: #166534; }
    .active-pill.inactive { background: #fee2e2; color: #991b1b; }
    
    .type-badge { font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-weight: 500;}

    .prop-panel { background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); }
    .prop-list { display: flex; flex-direction: column; gap: 8px; }
    .prop-item { display: flex; flex-direction: column; padding: 8px 12px; background: white; border: 1px solid var(--border-color); border-radius: 8px; }
    
    .separator { margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); font-weight: 600; font-size: 0.875rem; color: var(--muted-text-color); }
    .error-msg { color: #dc2626; display: block; margin-top: 4px; }
  \`]
})
export class ProcessDefinitionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private svc = inject(ProcessDefinitionService); private fieldSvc = inject(ProcessFieldService); private mapSvc = inject(ProcessDefinitionProjectMappingService); private projSvc = inject(ProjectService); private ns = inject(NotificationService); private fb = inject(FormBuilder);
  
  loading = true; processId: string | null = null; process: any;
  fields: any[] = []; fieldsData: any[] = [];
  projectMappings: any[] = []; allProjects: any[] = []; unmappedProjects: any[] = [];
  
  fieldTypes = [ {text: 'Text', value: 0}, {text: 'Number', value: 1}, {text: 'Decimal', value: 2}, {text: 'Boolean', value: 3}, {text: 'Date', value: 4}, {text: 'Date & Time', value: 5}, {text: 'Select', value: 6}, {text: 'Url', value: 7} ];

  isFieldEditorOpen = false; fieldForm!: FormGroup; saving = false; editingFieldId: string | null = null;
  fieldToDelete: any = null;

  showMapProject = false; projectToMap: string | null = null;

  ngOnInit() {
    this.processId = this.route.snapshot.paramMap.get('id');
    if (this.processId) this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      process: this.svc.getProcessDefinition(this.processId!),
      fields: this.fieldSvc.getProcessFields(this.processId!).pipe(catchError(()=>of([]))),
      mappings: this.mapSvc.getByProcessDefinition(this.processId!).pipe(catchError(()=>of([]))),
      projects: this.projSvc.getProjects().pipe(catchError(()=>of([])))
    }).subscribe(data => {
      this.process = data.process;
      this.fields = data.fields;
      this.fieldsData = [...this.fields].sort((a,b)=>a.sortOrder - b.sortOrder);
      this.projectMappings = data.mappings;
      this.allProjects = data.projects;
      this.updateUnmappedProjects();
      this.loading = false;
    });
  }

  updateUnmappedProjects() {
    const mappedIds = this.projectMappings.map(m => m.projectId);
    this.unmappedProjects = this.allProjects.filter(p => !mappedIds.includes(p.id));
  }

  getFieldTypeName(v: number) { return this.fieldTypes.find(t => t.value === v)?.text || 'Unknown'; }
  getProjectName(id: string) { return this.allProjects.find(p => p.id === id)?.name || id; }

  openProcessEdit() { this.ns.success('Process config edit omitted for brevity. Using backend updates directly.'); }

  openFieldCreate() {
     this.editingFieldId = null;
     this.initFieldForm(null);
     this.isFieldEditorOpen = true;
  }
  openFieldEdit(field: any) {
     this.editingFieldId = field.id;
     this.initFieldForm(field);
     this.isFieldEditorOpen = true;
  }
  initFieldForm(field: any) {
     this.fieldForm = this.fb.group({
        fieldName: [field?.fieldName || '', [Validators.required, Validators.maxLength(50)]],
        label: [field?.label || '', [Validators.required, Validators.maxLength(100)]],
        fieldType: [field?.fieldType ?? 0, Validators.required],
        sortOrder: [field?.sortOrder ?? (this.fields.length * 10), Validators.required],
        isRequired: [field?.isRequired ?? false],
        isActive: [field?.isActive ?? true],
        placeholder: [field?.placeholder || ''],
        defaultValue: [field?.defaultValue || ''],
        optionsJson: [field?.optionsJson || '']
     });
  }
  closeFieldEditor() { this.isFieldEditorOpen = false; }
  saveField() {
     if (this.fieldForm.invalid) return;
     this.saving = true;
     const payload = { ...this.fieldForm.value, processDefinitionId: this.processId };
     
     if (this.editingFieldId) {
        this.fieldSvc.updateProcessField(this.editingFieldId, payload).subscribe({
           next: () => { this.ns.success('Field updated.'); this.loadData(); this.closeFieldEditor(); this.saving = false; },
           error: () => { this.ns.error('Failed to update field.'); this.saving = false; }
        });
     } else {
        this.fieldSvc.createProcessField(payload).subscribe({
           next: () => { this.ns.success('Field created.'); this.loadData(); this.closeFieldEditor(); this.saving = false; },
           error: () => { this.ns.error('Failed to create field.'); this.saving = false; }
        });
     }
  }

  confirmFieldDelete(f: any) { this.fieldToDelete = f; }
  deleteField() {
     this.fieldSvc.deleteProcessField(this.fieldToDelete.id).subscribe({
        next: () => { this.ns.success('Field deleted'); this.fieldToDelete = null; this.loadData(); },
        error: () => { this.ns.error('Failed to delete field'); this.fieldToDelete = null; }
     });
  }

  mapProject() {
     if (!this.projectToMap) return;
     this.mapSvc.createMapping({ processDefinitionId: this.processId!, projectId: this.projectToMap }).subscribe({
        next: () => { this.ns.success('Project mapped.'); this.showMapProject = false; this.projectToMap = null; this.loadData(); },
        error: () => { this.ns.error('Failed mapping'); }
     });
  }
  unmapProject(projectId: string) {
     this.mapSvc.deleteMapping(this.processId!, projectId).subscribe({
        next: () => { this.ns.success('Mapping removed.'); this.loadData(); },
        error: () => { this.ns.error('Failed removing mapping'); }
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
console.log('Process Admin components generated.');
