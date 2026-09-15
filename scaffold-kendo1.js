const fs = require('fs');
const path = require('path');

const files = {
    "src/styles.css": `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #3b82f6;
  --primary-light: #eff6ff;
  --primary-dark: #2563eb;
  
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  
  --text-color: #0f172a;
  --muted-text-color: #64748b;
  --border-color: #e2e8f0;
  
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
}
* { box-sizing: border-box; }
h1, h2, h3, h4, h5, h6 { color: var(--text-color); }
a { color: var(--primary-color); text-decoration: none; }
a:hover { text-decoration: underline; }

/* Dashboard layout utility */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
.section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: var(--text-color); }

/* Forms utility */
.pt-form { padding: 8px 0; }
.form-row { margin-bottom: 16px; display: flex; flex-direction: column; width: 100%; }
.split-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.split-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
.form-actions { display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid var(--border-color); padding-top: 24px; margin-top: 24px; }

/* Muted */
.muted-text { color: var(--muted-text-color) !important; }
.monospaced { font-family: monospace; }
.fw-500 { font-weight: 500; }
  `,

    "src/app/core/services/notification.service.ts": `import { Injectable } from '@angular/core';\n@Injectable({ providedIn: 'root' })\nexport class NotificationService {\n  success(message: string) { alert('Success: ' + message); }\n  error(message: string) { alert('Error: ' + message); }\n}`,

    "src/app/shared/empty-state/empty-state.component.ts": `import { Component, Input, Output, EventEmitter } from '@angular/core';\nimport { CommonModule } from '@angular/common';\nimport { ButtonModule } from '@progress/kendo-angular-buttons';\nimport { IconsModule } from '@progress/kendo-angular-icons';\n@Component({ selector: 'app-empty-state', standalone: true, imports: [CommonModule, ButtonModule, IconsModule], template: \`\n<div class="empty-state">\n  <kendo-icon [name]="icon" size="xlarge" class="empty-state-icon"></kendo-icon>\n  <h3 class="empty-state-title">{{title}}</h3>\n  <p class="empty-state-description">{{description}}</p>\n  <button *ngIf="actionLabel" kendoButton themeColor="primary" (click)="action.emit()">{{actionLabel}}</button>\n</div>\n\`, styles: [\`\n.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; border: 1px dashed var(--border-color); border-radius: 8px; background: var(--surface-color); }\n.empty-state-icon { margin-bottom: 16px; color: var(--muted-text-color); }\n.empty-state-title { font-weight: 600; margin: 0 0 8px; font-size: 1.125rem; }\n.empty-state-description { color: var(--muted-text-color); margin: 0 0 24px; max-width: 400px; }\n\`] }) export class EmptyStateComponent { @Input() icon = 'inbox'; @Input() title = 'No data'; @Input() description = ''; @Input() actionLabel = ''; @Output() action = new EventEmitter<void>(); }`,

    "src/app/shared/loading-state/loading-state.component.ts": `import { Component, Input } from '@angular/core';\nimport { CommonModule } from '@angular/common';\nimport { IndicatorsModule } from '@progress/kendo-angular-indicators';\n@Component({ selector: 'app-loading-state', standalone: true, imports: [IndicatorsModule, CommonModule], template: \`\n<div class="loading-state">\n  <kendo-loader type="converging-spinner" size="large"></kendo-loader>\n  <p *ngIf="message" class="loading-message">{{message}}</p>\n</div>\n\`, styles: [\`\n.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; }\n.loading-message { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; }\n\`] }) export class LoadingStateComponent { @Input() message = 'Loading...'; }`,

    "src/app/shared/page-header/page-header.component.ts": `import { Component, Input } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n@Component({ selector: 'app-page-header', standalone: true, imports: [CommonModule], template: \`\n<div class="page-header">\n  <div class="header-content">\n    <h1 class="header-title">{{title}}</h1>\n    <p *ngIf="subtitle" class="header-subtitle">{{subtitle}}</p>\n  </div>\n  <div class="header-actions">\n    <ng-content></ng-content>\n  </div>\n</div>\n\`, styles: [\`\n.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }\n.header-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--text-color); }\n.header-subtitle { margin: 4px 0 0; font-size: 0.875rem; color: var(--muted-text-color); }\n\`] }) export class PageHeaderComponent { @Input() title!: string; @Input() subtitle?: string; }`,

    "src/app/layout/sidebar/sidebar.component.ts": `import { Component, Input } from '@angular/core';\nimport { RouterModule } from '@angular/router';\nimport { IconsModule } from '@progress/kendo-angular-icons';\nimport { CommonModule } from '@angular/common';\n@Component({ selector: 'app-sidebar', standalone: true, imports: [RouterModule, IconsModule, CommonModule], template: \`\n<div class="sidebar-container" [class.collapsed]="collapsed">\n  <div class="brand"><div class="logo"></div><span class="brand-text" *ngIf="!collapsed">ProcessTracker</span></div>\n  <nav class="nav-section">\n    <div class="nav-label" *ngIf="!collapsed">ProcessTracker</div>\n    <a class="nav-item" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"><kendo-icon name="home"></kendo-icon><span *ngIf="!collapsed">Home</span></a>\n    <a class="nav-item" routerLink="/projects" routerLinkActive="active"><kendo-icon name="folder"></kendo-icon><span *ngIf="!collapsed">Projects</span></a>\n    <a class="nav-item" routerLink="/applications" routerLinkActive="active"><kendo-icon name="grid"></kendo-icon><span *ngIf="!collapsed">Applications</span></a>\n    <a class="nav-item" routerLink="/service-items" routerLinkActive="active"><kendo-icon name="form"></kendo-icon><span *ngIf="!collapsed">Service Items</span></a>\n    <a class="nav-item" routerLink="/forms" routerLinkActive="active"><kendo-icon name="list-unordered"></kendo-icon><span *ngIf="!collapsed">Forms</span></a>\n  </nav>\n  <div class="spacer"></div>\n</div>\n\`, styles: [\`\n.sidebar-container { display: flex; flex-direction: column; height: 100%; border-right: 1px solid var(--border-color); background: var(--surface-color); transition: width 0.2s; width: 260px; }\n.sidebar-container.collapsed { width: 64px; }\n.brand { height: 64px; display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid var(--border-color); }\n.logo { width: 32px; height: 32px; background: var(--primary-color); border-radius: 8px; margin-right: 16px; flex-shrink: 0; }\n.brand-text { font-weight: 600; font-size: 1.125rem; white-space: nowrap; }\n.nav-section { margin-top: 16px; display: flex; flex-direction: column; }\n.nav-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--muted-text-color); margin: 8px 16px; }\n.spacer { flex: 1; }\n.nav-item { display: flex; align-items: center; padding: 10px 16px; color: var(--text-color); text-decoration: none; margin: 0 16px 4px 0; border-radius: 0 24px 24px 0; font-weight: 500; font-size: 0.875rem; }\n.sidebar-container.collapsed .nav-item { margin: 0 8px 8px 8px; border-radius: 8px; justify-content: center; padding: 10px 0; }\n.nav-item:hover { background: #f1f5f9; }\n.nav-item.active { background: var(--primary-light); color: var(--primary-color); }\n.nav-item kendo-icon { margin-right: 16px; font-size: 20px; }\n.sidebar-container.collapsed .nav-item kendo-icon { margin-right: 0; }\n\`] }) export class SidebarComponent { @Input() collapsed = false; }`,

    "src/app/layout/topbar/topbar.component.ts": `import { Component, EventEmitter, Output } from '@angular/core';\nimport { CommonModule } from '@angular/common';\nimport { IconsModule } from '@progress/kendo-angular-icons';\nimport { ButtonModule } from '@progress/kendo-angular-buttons';\n@Component({ selector: 'app-topbar', standalone: true, imports: [CommonModule, IconsModule, ButtonModule], template: \`\n<div class="topbar">\n  <button kendoButton fillMode="flat" (click)="toggleSidebar.emit()" class="menu-btn"><kendo-icon name="menu"></kendo-icon></button>\n  <span class="toolbar-title">Workspace</span>\n  <div class="spacer"></div>\n  <div class="search-placeholder"><kendo-icon name="search"></kendo-icon><input type="text" placeholder="Search..."></div>\n  <div class="avatar">R</div>\n</div>\n\`, styles: [\`\n.topbar { display: flex; align-items: center; background: var(--surface-color); border-bottom: 1px solid var(--border-color); padding: 0 16px; height: 64px; }\n.spacer { flex: 1; }\n.toolbar-title { font-size: 1rem; font-weight: 500; border-left: 1px solid var(--border-color); padding-left: 16px; margin-left: 8px; color: var(--muted-text-color); }\n.search-placeholder { display: flex; align-items: center; background: var(--background-color); border-radius: 8px; padding: 0 12px; height: 40px; margin-right: 16px; width: 300px; }\n.search-placeholder kendo-icon { color: var(--muted-text-color); margin-right: 8px; }\n.search-placeholder input { border: none; background: transparent; outline: none; flex: 1; }\n.avatar { width: 32px; height: 32px; border-radius: 50%; background: #9c27b0; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; }\n\`] }) export class TopbarComponent { @Output() toggleSidebar = new EventEmitter<void>(); }`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Kendo basic structure generated.');
