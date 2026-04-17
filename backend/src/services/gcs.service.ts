import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const projectId = process.env.GCP_PROJECT_ID;
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const bucketName = process.env.GCS_BUCKET_NAME || 'cicd-mini';

let storage: Storage;

try {
    storage = new Storage({ projectId, keyFilename });
} catch(e) {
    console.error("Failed to initialize Google Cloud Storage client", e);
}

export const listArtifacts = async () => {
    try {
        if (!storage) throw new Error("Storage client not initialized");
        const [files] = await storage.bucket(bucketName).getFiles();
        
        return files.map(file => ({
            name: file.name,
            size: file.metadata?.size || "0",
            updated: file.metadata?.updated || new Date().toISOString(),
            url: `https://storage.googleapis.com/${bucketName}/${file.name}`
        }));
    } catch (error: any) {
        console.error('Error listing artifacts:', error);
        throw new Error('Failed to list artifacts');
    }
};

export const getArtifactStream = (filename: string) => {
    if (!storage) throw new Error("Storage client not initialized");
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);
    return file.createReadStream();
};
