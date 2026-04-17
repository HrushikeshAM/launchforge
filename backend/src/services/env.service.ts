import fs from 'fs';
import path from 'path';

const ENV_PATH = path.join(__dirname, '../../../.env');
const BACKUP_PATH = path.join(__dirname, '../../../.env.backup');

const DEFAULT_ENV = `
# App
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/launchforge

# Jenkins
JENKINS_URL=http://localhost:8080
JENKINS_USER=admin
JENKINS_API_TOKEN=
JENKINS_JOB_NAME=launchforge-pipeline

# Google Cloud
GCP_PROJECT_ID=
GCS_BUCKET_NAME=
GOOGLE_APPLICATION_CREDENTIALS=

# URLs
APP_BASE_URL=http://localhost:5173
`.trim() + '\n';

const DEFAULT_KEYS = [
    'PORT', 'NODE_ENV', 'MONGO_URI', 'JENKINS_URL', 'JENKINS_USER', 
    'JENKINS_API_TOKEN', 'JENKINS_JOB_NAME', 'GCP_PROJECT_ID', 
    'GCS_BUCKET_NAME', 'GOOGLE_APPLICATION_CREDENTIALS', 'APP_BASE_URL'
];

export const ensureEnv = () => {
    if (!fs.existsSync(ENV_PATH)) {
        console.log('.env not found, default config created.');
        fs.writeFileSync(ENV_PATH, DEFAULT_ENV);
        return;
    }

    const currentEnv = fs.readFileSync(ENV_PATH, 'utf-8');
    const existingKeys = currentEnv
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('=')[0]);

    const missingKeys = DEFAULT_KEYS.filter(key => !existingKeys.includes(key));

    if (missingKeys.length > 0) {
        console.log(`Appending missing keys to .env: ${missingKeys.join(', ')}`);
        // Backup
        fs.writeFileSync(BACKUP_PATH, currentEnv);
        
        let appendString = `\n# Auto-appended missing keys\n`;
        missingKeys.forEach(key => {
            appendString += `${key}=\n`;
        });
        
        fs.appendFileSync(ENV_PATH, appendString);
    }
};

export const updateEnv = (settings: Record<string, string>) => {
    if (!fs.existsSync(ENV_PATH)) ensureEnv();
    
    const currentEnv = fs.readFileSync(ENV_PATH, 'utf-8');
    fs.writeFileSync(BACKUP_PATH, currentEnv); // Backup before override

    let newEnv = currentEnv;
    
    for (const [key, value] of Object.entries(settings)) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(newEnv)) {
            newEnv = newEnv.replace(regex, `${key}=${value}`);
        } else {
            newEnv += `\n${key}=${value}`;
        }
    }

    fs.writeFileSync(ENV_PATH, newEnv);
};

export const parseEnv = () => {
    if (!fs.existsSync(ENV_PATH)) return {};
    
    const currentEnv = fs.readFileSync(ENV_PATH, 'utf-8');
    const settings: Record<string, string> = {};
    
    currentEnv.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...rest] = trimmed.split('=');
            settings[key.trim()] = rest.join('=').trim();
        }
    });
    
    return settings;
};
