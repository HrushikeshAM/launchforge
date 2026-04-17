import { Router, Response, Request } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import fs from 'fs';
import { parseEnv, updateEnv } from '../services/env.service';

const router = Router();

// Get settings
router.get('/env', (req: Request, res: Response) => {
    try {
        const settings = parseEnv();
        res.json(settings);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Update settings
router.post('/env', (req: Request, res: Response) => {
    try {
        const settings = req.body;
        updateEnv(settings);
        res.json({ message: 'Environment updated successfully' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Test MongoDB
router.post('/test/mongo', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uri } = req.body;
        if (!uri) return res.status(400).json({ error: 'Missing URI' });
        
        // Temp connection
        const conn = await mongoose.createConnection(uri).asPromise();
        await conn.close();
        res.json({ success: true, message: 'MongoDB connection successful' });
    } catch (e: any) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// Test Jenkins
router.post('/test/jenkins', async (req: Request, res: Response): Promise<any> => {
    try {
        const { url, user, token } = req.body;
        if (!url || !user || !token) return res.status(400).json({ error: 'Missing Jenkins credentials' });
        
        const auth = Buffer.from(`${user}:${token}`).toString('base64');
        await axios.get(`${url}/api/json`, {
            headers: { Authorization: `Basic ${auth}` },
            timeout: 5000
        });
        
        res.json({ success: true, message: 'Jenkins connection successful' });
    } catch (e: any) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// Test GCS
router.post('/test/gcs', (req: Request, res: Response): any => {
    try {
        const { credentialsPath } = req.body;
        if (!credentialsPath) return res.status(400).json({ error: 'Missing credentials path' });
        
        if (!fs.existsSync(credentialsPath)) {
            return res.status(400).json({ success: false, error: 'Credentials file not found at path' });
        }
        res.json({ success: true, message: 'Google Cloud credentials located' });
    } catch(e: any) {
        res.status(400).json({ success: false, error: e.message });
    }
});

export default router;
