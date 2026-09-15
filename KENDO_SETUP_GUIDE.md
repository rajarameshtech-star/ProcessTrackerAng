# Kendo UI Installation & Migration Guide

This document outlines the exact steps taken to migrate the ProcessTracker application from Angular Material to Kendo UI for Angular. If you clone this repository to a fresh machine or need to replicate this setup, follow these steps.

## 1. Remove Angular Material

First, completely uninstall Angular Material and the Component Dev Kit (CDK) from the project:

```bash
npm uninstall @angular/material @angular/cdk
```

## 2. Install Kendo UI Dependencies

Kendo UI consists of many modular packages. To support grids, dropdowns, buttons, icons, indicators, and required utility packages (like drawing and internationalization), run the following command. 

> **Note:** Because Kendo UI might occasionally strictly peer-depend on a slightly older Angular version, we use \`--legacy-peer-deps\` to ensure it installs smoothly on the latest Angular versions.

```bash
npm install @progress/kendo-angular-buttons \
  @progress/kendo-angular-layout \
  @progress/kendo-angular-navigation \
  @progress/kendo-angular-grid \
  @progress/kendo-angular-dropdowns \
  @progress/kendo-angular-inputs \
  @progress/kendo-angular-indicators \
  @progress/kendo-angular-l10n \
  @progress/kendo-angular-common \
  @progress/kendo-theme-material \
  @progress/kendo-angular-icons \
  @progress/kendo-svg-icons \
  @progress/kendo-drawing \
  @progress/kendo-licensing \
  @progress/kendo-angular-intl \
  @progress/kendo-angular-dateinputs \
  @progress/kendo-angular-dialog \
  @progress/kendo-angular-popup \
  @progress/kendo-angular-treeview \
  @progress/kendo-angular-upload \
  @progress/kendo-angular-tooltip \
  @angular/localize \
  --legacy-peer-deps
```

## 3. Configure the Kendo Theme

You must swap out the Material CSS imports for the Kendo CSS structure. In your \`angular.json\` file, find the \`styles\` arrays (usually under \`architect -> build\` and \`architect -> test\`).

Remove:
\`"@angular/material/prebuilt-themes/azure-blue.css"\`

And add the Kendo Theme:
\`"node_modules/@progress/kendo-theme-material/dist/all.css"\`

## 4. Increase Compiler Budgets

Kendo UI modules are comprehensive and their initial chunk size surpasses Angular's default strict production limits (500kB warning / 1MB error). 

In \`angular.json\`, expand the compilation budgets for the production build:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "2MB",
    "maximumError": "4MB"
  },
  ...
]
```

## 5. Angular 19 Compatibility Hotfix (If Applicable)

If you are using Angular 19+ alongside a Kendo UI build that relies on the deprecated \`afterEveryRender\` hook from \`@angular/core\`, you may encounter an \`esbuild\` failure indicating an unresolved export. To bypass this locally while waiting for a minor Kendo package patch, a node string replacement script is required:

```js
const fs = require('fs');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/afterEveryRender/g, 'afterRender');
  fs.writeFileSync(file, content);
};

// Fix inputs
replaceInFile('./node_modules/@progress/kendo-angular-inputs/fesm2022/progress-kendo-angular-inputs.mjs');
// Fix popups
replaceInFile('./node_modules/@progress/kendo-angular-popup/fesm2022/progress-kendo-angular-popup.mjs');
```

You can run this inside a quick Node shell or save it to a script and run \`node fix-kendo.js\`. Note that upon installing a Kendo update that officially shifts to \`afterRender\` (or running \`npm ci\`), this patch may need to be reapplied or will no longer be necessary.

## 6. Update HTML and Component Logic

Material tags were entirely shifted to Kendo equivalents across all files:

**Module Swaps in \`*.component.ts\`:**
* \`MatButtonModule\` → \`ButtonModule\`
* \`MatIconModule\` → \`IconsModule\`
* \`MatTableModule\` → \`GridModule\`
* \`MatSelectModule\` → \`DropDownsModule\`
* \`MatInputModule\`  → \`InputsModule\`
* \`MatProgressSpinnerModule\` → \`IndicatorsModule\`

**Template Swaps:**
* \`<mat-icon>name</mat-icon>\` → \`<kendo-icon name="name"></kendo-icon>\`
* \`<button mat-button>\` → \`<button kendoButton>\`
* Tables → \`<kendo-grid [data]="items">\` with \`<kendo-grid-column>\` definitions.
* \`<mat-select>\` → \`<kendo-dropdownlist>\`
* Spinners → \`<kendo-loader>\`

*That is all! After following these steps, running \`npm run build\` or \`npm run start\` will correctly compile the Kendo-based application.*
