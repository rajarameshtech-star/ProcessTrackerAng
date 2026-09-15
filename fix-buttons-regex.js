const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('src/app', (filePath) => {
    if (filePath.endsWith('.component.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let dirty = false;

        if (/<button([^>]*)icon="(?:trash|delete)"([^>]*)>\s*<\/button>/.test(content)) {
            content = content.replace(/<button([^>]*)icon="(?:trash|delete)"([^>]*)>\s*<\/button>/g,
                '<button$1$2 themeColor="error">Delete</button>');
            dirty = true;
        }

        if (/<button([^>]*)icon="(?:edit|pencil)"([^>]*)>\s*<\/button>/.test(content)) {
            content = content.replace(/<button([^>]*)icon="(?:edit|pencil)"([^>]*)>\s*<\/button>/g,
                '<button$1$2 themeColor="primary">Edit</button>');
            dirty = true;
        }

        if (/<button([^>]*)icon="more-vertical"([^>]*)>\s*<\/button>/.test(content)) {
            content = content.replace(/<button([^>]*)icon="more-vertical"([^>]*)>\s*<\/button>/g,
                '<button$1$2>More</button>');
            dirty = true;
        }

        if (/<button([^>]*)icon="chevron-right"([^>]*)>\s*<\/button>/.test(content)) {
            content = content.replace(/<button([^>]*)icon="chevron-right"([^>]*)>\s*<\/button>/g,
                '<button$1$2 themeColor="primary">Open</button>');
            dirty = true;
        }

        content = content.replace(/themeColor="error"[^>]*themeColor="error"/g, 'themeColor="error"');
        content = content.replace(/themeColor="primary"[^>]*themeColor="primary"/g, 'themeColor="primary"');

        if (dirty) {
            content = content.replace(/title="Actions"\s+\[width\]="100"/g, 'title="Actions" [width]="180"');
            content = content.replace(/title="Actions"\s+\[width\]="120"/g, 'title="Actions" [width]="180"');
            content = content.replace(/title=""\s+\[width\]="60"/g, 'title="Action" [width]="100"');
            fs.writeFileSync(filePath, content);
            console.log('Fixed buttons in ' + filePath);
        }
    }
});
