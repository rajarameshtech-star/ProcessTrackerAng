
import { Component } from '@angular/core'; 
import { PageHeaderComponent } from '../../shared/page-header/page-header.component'; 
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component'; 
@Component({ 
   selector: 'app-settings', standalone: true, imports: [PageHeaderComponent, EmptyStateComponent], 
   template: `<app-page-header title="Settings"></app-page-header><app-empty-state icon="sliders" title="Configuration Panel" description="Platform settings will be available in future releases."></app-empty-state>` 
}) 
export class SettingsComponent {}
