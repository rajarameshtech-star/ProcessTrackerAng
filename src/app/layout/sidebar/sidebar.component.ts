
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from '@progress/kendo-angular-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
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
  `,
  styles: [`
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
  `]
})
export class SidebarComponent { @Input() collapsed = false; }
