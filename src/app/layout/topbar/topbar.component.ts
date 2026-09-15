import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@progress/kendo-angular-icons';
import { ButtonModule } from '@progress/kendo-angular-buttons';
@Component({ selector: 'app-topbar', standalone: true, imports: [CommonModule, IconsModule, ButtonModule], template: `
<div class="topbar">
  <button kendoButton fillMode="flat" (click)="toggleSidebar.emit()" class="menu-btn"><kendo-icon name="menu"></kendo-icon></button>
  <span class="toolbar-title">Workspace</span>
  <div class="spacer"></div>
  <div class="search-placeholder"><kendo-icon name="search"></kendo-icon><input type="text" placeholder="Search..."></div>
  <div class="avatar">R</div>
</div>
`, styles: [`
.topbar { display: flex; align-items: center; background: var(--surface-color); border-bottom: 1px solid var(--border-color); padding: 0 16px; height: 64px; }
.spacer { flex: 1; }
.toolbar-title { font-size: 1rem; font-weight: 500; border-left: 1px solid var(--border-color); padding-left: 16px; margin-left: 8px; color: var(--muted-text-color); }
.search-placeholder { display: flex; align-items: center; background: var(--background-color); border-radius: 8px; padding: 0 12px; height: 40px; margin-right: 16px; width: 300px; }
.search-placeholder kendo-icon { color: var(--muted-text-color); margin-right: 8px; }
.search-placeholder input { border: none; background: transparent; outline: none; flex: 1; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: #9c27b0; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; }
`] }) export class TopbarComponent { @Output() toggleSidebar = new EventEmitter<void>(); }