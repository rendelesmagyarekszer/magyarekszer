import fs from 'fs';
import path from 'path';
import { AdminSettings } from './data';

export type { AdminSettings };

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export function getSettings(): AdminSettings {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('Error reading settings.json:', err);
    }
    return {};
}

export function saveSettings(newSettings: Partial<AdminSettings>): AdminSettings {
    try {
        const dir = path.dirname(SETTINGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const current = getSettings();
        const merged = { ...current, ...newSettings };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
        return merged;
    } catch (err) {
        console.error('Error saving settings.json:', err);
        throw err;
    }
}
