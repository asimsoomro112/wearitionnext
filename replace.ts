import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/\[#0A0A0A\]/g, 'background');
    content = content.replace(/\[#050505\]/g, 'background-secondary');
    content = content.replace(/\[#F5F0EB\]/g, 'foreground');
    content = content.replace(/\[#D4AF8C\]/g, 'accent');
    content = content.replace(/text-black/g, 'text-background');
    content = content.replace(/bg-black/g, 'bg-background-secondary');
    fs.writeFileSync(filepath, content);
  }
});
