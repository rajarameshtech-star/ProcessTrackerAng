
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div class="sidebar" [class.collapsed]="collapsed">
      <div class="branding">
         <div class="logo"></div>
         <span class="brand-name">ProcessTracker</span>
      </div>
      <nav class="nav-menu">
        <div class="nav-section">MAIN</div>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link" title="Home"><kendo-icon name="home"></kendo-icon> <span class="nav-link-text">Home</span></a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-link" title="Projects"><kendo-icon name="folder"></kendo-icon> <span class="nav-link-text">Projects</span></a>
        <a routerLink="/applications" routerLinkActive="active" class="nav-link" title="Applications"><kendo-icon name="grid-layout"></kendo-icon> <span class="nav-link-text">Applications</span></a>
        <a routerLink="/service-items" routerLinkActive="active" class="nav-link" title="Service Items"><kendo-icon name="parameter-header"></kendo-icon> <span class="nav-link-text">Service Items</span></a>
        <a routerLink="/processes" routerLinkActive="active" class="nav-link" title="Processes"><kendo-icon name="gear"></kendo-icon> <span class="nav-link-text">Processes</span></a>

        <div class="nav-section">PERSONAL</div>
        <a routerLink="/my-work" routerLinkActive="active" class="nav-link" title="My Work"><kendo-icon name="user"></kendo-icon> <span class="nav-link-text">My Work</span></a>
        <a routerLink="/recently-viewed" routerLinkActive="active" class="nav-link" title="Recently Viewed"><kendo-icon name="clock"></kendo-icon> <span class="nav-link-text">Recently Viewed</span></a>
      </nav>
      <div class="spacer"></div>
    </div>
  `,
  styles: [`
    .sidebar { width: 260px; height: 100%; background: #0f172a; color: #94a3b8; display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; white-space: nowrap; }
    .sidebar.collapsed { width: 70px; }
    .sidebar.collapsed .brand-name, .sidebar.collapsed .nav-section, .sidebar.collapsed .nav-link-text { display: none; }
    .sidebar.collapsed .branding { justify-content: center; padding: 0; }
    .sidebar.collapsed .nav-link { justify-content: center; padding: 12px; }
    .sidebar.collapsed kendo-icon { margin: 0; font-size: 1.25rem; }
    
    .branding { height: 60px; min-height: 60px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #1e293b; gap: 12px; }
    .logo { width: 24px; height: 24px; min-width: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 6px; }
    .brand-name { color: #f8fafc; font-weight: 600; font-size: 1.1rem; letter-spacing: -0.02em; }
    .nav-menu { padding: 24px 16px 0; display: flex; flex-direction: column; gap: 4px; }
    .nav-section { font-size: 0.7rem; font-weight: 700; color: #475569; margin: 16px 0 8px 12px; letter-spacing: 0.05em; }
    .nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #cbd5e1; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .nav-link kendo-icon { font-size: 1.125rem; }
    .nav-link:hover { background: #1e293b; color: #f8fafc; }
    .nav-link.active { background: #6366f1; color: white; }
    .spacer { flex: 1; }
  `]
})
export class SidebarComponent { @Input() collapsed = false; }
