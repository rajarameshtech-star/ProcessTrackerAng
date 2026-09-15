const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
    const fullPath = path.resolve(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(fullPath, content);
};

// 1. Application Detail
replaceInFile('src/app/features/applications/application-detail/application-detail.component.ts', [
    {
        search: '<kendo-grid-column title="" [width]="60">',
        replace: '<kendo-grid-column title="Action" [width]="90">'
    },
    {
        search: '<button kendoButton icon="chevron-right" fillMode="flat" [routerLink]="[\'/service-items\', dataItem.id]"></button>',
        replace: '<button kendoButton fillMode="flat" themeColor="primary" [routerLink]="[\'/service-items\', dataItem.id]">Open</button>'
    }
]);

// 2. Process Definition List
replaceInFile('src/app/features/processes/process-definition-list/process-definition-list.component.ts', [
    {
        search: '<kendo-grid-column title="Actions" [width]="100"',
        replace: '<kendo-grid-column title="Actions" [width]="160"'
    },
    {
        search: '<button kendoButton icon="edit" fillMode="flat" (click)="editProcess(dataItem)" title="Edit"></button>\\n             <button kendoButton icon="delete" fillMode="flat" themeColor="error" (click)="deleteProcess(dataItem.id)" title="Delete"></button>',
        replace: '<button kendoButton fillMode="flat" themeColor="primary" (click)="editProcess(dataItem)">Edit</button>\\n             <button kendoButton fillMode="flat" themeColor="error" (click)="deleteProcess(dataItem.id)">Delete</button>'
    }
]);

// 3. Process Definition Detail
replaceInFile('src/app/features/processes/process-definition-detail/process-definition-detail.component.ts', [
    {
        search: '<kendo-grid-column title="Actions" [width]="120">',
        replace: '<kendo-grid-column title="Actions" [width]="180">'
    },
    {
        search: '<button kendoButton icon="pencil" fillMode="flat" (click)="editField(dataItem)"></button>\\n                     <button kendoButton icon="trash" fillMode="flat" themeColor="error" (click)="deleteField(dataItem.id)"></button>',
        replace: '<button kendoButton fillMode="flat" themeColor="primary" (click)="editField(dataItem)">Edit</button>\\n                     <button kendoButton fillMode="flat" themeColor="error" (click)="deleteField(dataItem.id)">Delete</button>'
    }
]);

// 4. Service Item List
replaceInFile('src/app/features/service-items/service-item-list/service-item-list.component.ts', [
    {
        search: '<kendo-grid-column title="Actions" [width]="100"',
        replace: '<kendo-grid-column title="Actions" [width]="160"'
    },
    {
        search: '<button kendoButton icon="edit" fillMode="flat" [routerLink]="[\'/service-items\', dataItem.id, \'edit\']"></button>\\n             <button kendoButton icon="delete" fillMode="flat" themeColor="error" (click)="deleteItem(dataItem.id)"></button>',
        replace: '<button kendoButton fillMode="flat" themeColor="primary" [routerLink]="[\'/service-items\', dataItem.id, \'edit\']">Edit</button>\\n             <button kendoButton fillMode="flat" themeColor="error" (click)="deleteItem(dataItem.id)">Delete</button>'
    },
    {
        search: '<button kendoButton icon="pencil" fillMode="flat" [routerLink]="[\'/service-items\', dataItem.id, \'edit\']"></button>',
        replace: '<button kendoButton fillMode="flat" themeColor="primary" [routerLink]="[\'/service-items\', dataItem.id, \'edit\']">Edit</button>'
    }
]);

// Also check project detail actions if any
replaceInFile('src/app/features/projects/project-detail/project-detail.component.ts', [
    {
        search: '<button kendoButton icon="pencil" (click)="openEdit()">Edit</button>',
        replace: '<button kendoButton (click)="openEdit()">Edit Project</button>'
    }
]);

// Application detail top actions
replaceInFile('src/app/features/applications/application-detail/application-detail.component.ts', [
    {
        search: '<button kendoButton icon="pencil" (click)="openEdit()">Edit</button>',
        replace: '<button kendoButton (click)="openEdit()">Edit App</button>'
    }
]);

// Service Item detail top actions
replaceInFile('src/app/features/service-items/service-item-detail/service-item-detail.component.ts', [
    {
        search: '<button kendoButton icon="pencil" (click)="openEdit()">Edit</button>\\n            <button kendoButton icon="more-vertical" fillMode="flat"></button>',
        replace: '<button kendoButton (click)="openEdit()">Edit Details</button>'
    }
]);

// Topbar actions (maybe replace icon with text or add kendo-icon explicitly with text?)
// Let's leave them if they use kendo-icon explicitly.

console.log('Action buttons converted to textual labels.');
