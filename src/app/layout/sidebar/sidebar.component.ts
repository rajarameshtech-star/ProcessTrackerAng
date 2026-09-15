import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconsModule } from '@progress/kendo-angular-icons';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-sidebar', standalone: true, imports: [RouterModule, IconsModule, CommonModule], template: `
<div class="sidebar-container" [class.collapsed]="collapsed">
  <div class="brand"><div class="logo"></div><span class="brand-text" *ngIf="!collapsed">ProcessTracker</span></div>
  <nav class="nav-section">
    <div class="nav-label" *ngIf="!collapsed">ProcessTracker</div>
    <a class="nav-item" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"><kendo-icon name="home"></kendo-icon><span *ngIf="!collapsed">Home</span></a>
    <a class="nav-item" routerLink="/projects" routerLinkActive="active"><kendo-icon name="folder"></kendo-icon><span *ngIf="!collapsed">Projects</span></a>
    <a class="nav-item" routerLink="/applications" routerLinkActive="active"><kendo-icon name="grid"></kendo-icon><span *ngIf="!collapsed">Applications</span></a>
    <a class="nav-item" routerLink="/service-items" routerLinkActive="active"><kendo-icon name="form"></kendo-icon><span *ngIf="!collapsed">Service Items</span></a>
    <a class="nav-item" routerLink="/processes" routerLinkActive="active"><kendo-icon name="list-unordered"></kendo-icon><span *ngIf="!collapsed">ProcessDefinitions</span></a>
  </nav>
  <div class="spacer"></div>
</div>
`, styles: [`
.sidebar-container { display: flex; flex-direction: column; height: 100%; border-right: 1px solid var(--border-color); background: var(--surface-color); transition: width 0.2s; width: 260px; }
.sidebar-container.collapsed { width: 64px; }
.brand { height: 64px; display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid var(--border-color); }
.logo { width: 32px; height: 32px; background: var(--primary-color); border-radius: 8px; margin-right: 16px; flex-shrink: 0; }
.brand-text { font-weight: 600; font-size: 1.125rem; white-space: nowrap; }
.nav-section { margin-top: 16px; display: flex; flex-direction: column; }
.nav-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--muted-text-color); margin: 8px 16px; }
.spacer { flex: 1; }
.nav-item { display: flex; align-items: center; padding: 10px 16px; color: var(--text-color); text-decoration: none; margin: 0 16px 4px 0; border-radius: 0 24px 24px 0; font-weight: 500; font-size: 0.875rem; }
.sidebar-container.collapsed .nav-item { margin: 0 8px 8px 8px; border-radius: 8px; justify-content: center; padding: 10px 0; }
.nav-item:hover { background: #f1f5f9; }
.nav-item.active { background: var(--primary-light); color: var(--primary-color); }
.nav-item kendo-icon { margin-right: 16px; font-size: 20px; }
.sidebar-container.collapsed .nav-item kendo-icon { margin-right: 0; }
`] }) export class SidebarComponent { @Input() collapsed = false; }