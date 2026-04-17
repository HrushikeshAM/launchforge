import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const JENKINS_URL = process.env.JENKINS_URL || 'http://localhost:8080';
const JENKINS_USER = process.env.JENKINS_USER || 'admin';
const JENKINS_API_TOKEN = process.env.JENKINS_API_TOKEN || '';
const JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME || 'launchforge-pipeline';

// Helper to get basic auth token
const getAuthHeaders = () => {
  const token = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
  return {
    Authorization: `Basic ${token}`,
  };
};

export const triggerPipeline = async (repoUrl: string, branch: string, projectName: string) => {
  try {
    // Jenkins parameterized job build URL
    const buildUrl = `${JENKINS_URL}/job/${JENKINS_JOB_NAME}/buildWithParameters`;
    
    // Pass parameters
    const response = await axios.post(
      buildUrl,
      null,
      {
        params: {
          REPO_URL: repoUrl,
          BRANCH: branch,
          PROJECT_NAME: projectName
        },
        headers: getAuthHeaders(),
      }
    );
    
    // Jenkins usually returns 201 Created and a queue item URL in the Location header
    // But since this is a mini-project, we'll try to get the next build number roughly
    // Or we rely on the deployer checking back.
    const jobInfoRes = await axios.get(`${JENKINS_URL}/job/${JENKINS_JOB_NAME}/api/json`, {
      headers: getAuthHeaders()
    });
    
    const nextBuildNumber = jobInfoRes.data.nextBuildNumber;
    return nextBuildNumber;
  } catch (error: any) {
    console.error('Jenkins Trigger Error:', error.response?.data || error.message);
    throw new Error(`Failed to trigger Jenkins pipeline: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
};

export const getBuildStatus = async (buildNumber: number) => {
  try {
    const url = `${JENKINS_URL}/job/${JENKINS_JOB_NAME}/${buildNumber}/api/json`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    
    // building: boolean, result: 'SUCCESS', 'FAILURE', etc.
    return {
      building: response.data.building,
      result: response.data.result,
      duration: response.data.duration
    };
  } catch (error: any) {
    console.error('Jenkins Status Error:', error.message);
    throw new Error(`Failed to fetch build status for #${buildNumber}`);
  }
};

export const getBuildLogs = async (buildNumber: number) => {
  try {
    // text logs
    const url = `${JENKINS_URL}/job/${JENKINS_JOB_NAME}/${buildNumber}/consoleText`;
    const response = await axios.get(url, { headers: getAuthHeaders(), responseType: 'text' });
    return response.data;
  } catch (error: any) {
    console.error('Jenkins Log Error:', error.message);
    return 'Logs not available yet.';
  }
};
