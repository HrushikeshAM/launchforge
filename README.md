# 🚀 LaunchForge

**LaunchForge** is a premium, self-service CI/CD automation platform designed for rapidly deploying GitHub repositories through Jenkins pipelines into Google Cloud, utilizing Terraform and MongoDB.

It has been overhauled into a **one-click runnable product**, allowing any user to stand it up on their local machines seamlessly.

---

## ⚡ Quick Start

You can string up the entire LaunchForge platform in a matter of seconds.

### **Windows Users**
Simply double-click:
```bat
start.bat
```
This will automatically verify Node.js, install dependencies recursively, boot up both backend & frontend processes, and natively open the browser for you.

To safely shut down the instance, run:
```bat
stop.bat
```

### **Manual / Cross-Platform**
If you prefer running manual scripts directly via terminal:

```bash
# 1. Install all root, frontend, and backend packages
npm run install:all

# 2. Start the development servers simultaneously
npm run dev
```

The application will be universally accessible at `http://localhost:5173`.

---

## ⚙️ Configuration & First Launch

LaunchForge now comes with a **First-Launch Setup Wizard**.

You no longer need to strictly modify `.env` configuration files manually. Once you launch the platform:
1. The backend automatically scaffolds a valid `.env` file containing safe starter defaults.
2. If critical parameters are omitted, the UI will automatically redirect you locking you into the **Setup Wizard**.
3. You can safely insert your MongoDB URIs, Jenkins URL / API Keys, and Google Cloud credentials securely via the browser.

### 🛡️ Secure Settings

Inside the App, navigate to the **Settings** tab. Here you can:
- **Test Connections** directly against Mongo, Jenkins, and GCS.
- Mask/Unmask sensitive tokens (`npm / .env` will map safely back to disk).
- LaunchForge preserves history by backing up overrides automatically into a `.env.backup` state.

---

## 🏗️ Architecture Stack

- **Frontend**: React + Vite + TailwindCSS + framer-motion
- **Backend**: Node.js + Express.js + Mongoose + @google-cloud/storage
- **Datastore**: MongoDB
- **Automation CI/CD**: Jenkins Pipeline via Groovy
- **Infrastructure**: Terraform

---

### UI/UX Rules Maintained
- **Premium Themes**: Implements dark-mode interfaces, glassmorphism overlays, and skeleton loader caching.
- **Auto Syncing Engine**: Polls CI status changes aggressively running locking behaviors without risking overlapping request memory drips.
