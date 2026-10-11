# OutsideQuest AI - Production & Free Vercel Deployment Guide

OutsideQuest AI is an open-source, client-side outdoor adventure generator engineered to deploy on the **Vercel Hobby (Free)** tier without requiring any paid infrastructure, cloud databases, serverless functions, or API keys.

---

## 1. Prerequisites

Before setting up or deploying OutsideQuest AI, ensure your local development environment meets the following minimum requirements:

- **Node.js:** `v18.18.0` or higher (tested and verified on Node.js `v20.x` and `v24.x`).
- **npm:** `v9.x` or higher (packaged with modern Node.js distributions).
- **Git:** Git CLI configured with your user details.
- **GitHub Account:** A free GitHub account to host your repository.
- **Vercel Account:** A free Vercel Hobby account (sign up at [vercel.com](https://vercel.com) using your GitHub account).
- **Modern Web Browser:** Chrome, Edge, Safari, or Firefox with WebAssembly (WASM) and IndexedDB support (WebGPU supported on modern Chromium and Safari 18+).

---

## 2. How to Install Dependencies

Clone the project repository to your local machine and install all required runtime and development dependencies:

```bash
# Clone the repository
git clone https://github.com/Harshitagarwal113/OutsideQuest-AI.git
cd "OutsideQuest AI"

# Install dependencies deterministically
npm install
```

> **Note on Bundled AI Assets:**  
> The model weight binaries are **never** bundled into `node_modules` or checked into Git. The client-side runtime dependency `@huggingface/transformers` loads quantized ONNX weights directly on demand in the user's browser.

---

## 3. How to Run in Development

Start the local Next.js development server:

```bash
npm run dev
```

- By default, the development server will be available at: **`http://localhost:3000`**
- Hot module replacement (HMR) is active for UI components, Tailwind utility classes, and page routes.
- The web worker thread (`model.worker.ts`) initializes dynamically on client invocation.

---

## 4. How to Run Tests

OutsideQuest AI maintains comprehensive automated test coverage across unit schemas, business logic, storage persistence, and full browser user journeys.

### Run Unit and Integration Tests (Vitest & React Testing Library)
```bash
# Run all unit and integration test suites
npm run test

# Run tests in interactive watch mode during development
npm run test:watch
```

### Run End-to-End Tests (Playwright)
```bash
# Run full browser end-to-end tests across Chromium and Mobile emulation
npm run test:e2e
```

### Static Analysis & Type Checking
```bash
# Validate strict TypeScript compliance
npm run typecheck

# Check for ESLint warnings and errors
npm run lint
```

---

## 5. How to Build and Serve Locally

To simulate the exact production runtime environment prior to pushing to Vercel:

```bash
# 1. Compile the production bundle
npm run build

# 2. Serve the compiled production build locally
npm run start
```

- Navigate to `http://localhost:3000` in an incognito window.
- Verify that all static pages render with zero console errors.
- Confirm that the PWA service worker registers successfully on `localhost`.

---

## 6. How to Push the Project to GitHub

Initialize git (if not already tracked) and push to your GitHub repository:

```bash
# Check status of local git tree
git status

# Stage all changes
git add .

# Create a clear commit
git commit -m "chore(release): prepare production-ready build for Vercel deployment"

# Ensure main branch is selected
git branch -M main

# Add your remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/outsidequest-ai.git

# Push to GitHub
git push -u origin main
```

---

## 7. How to Import the Repository into Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** in the top-right corner and select **"Project"**.
3. Under **"Import Git Repository"**, locate your `outsidequest-ai` repository and click **"Import"**.
4. Configure the project settings:
   - **Project Name:** `outsidequest-ai` (or your preferred name)
   - **Framework Preset:** `Next.js` (detected automatically)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)
5. **Environment Variables:** **Leave completely empty!**  
   OutsideQuest AI requires **zero** API keys, database connection strings, or cloud secrets.

---

## 8. How to Deploy and Obtain the Public URL

1. Click the **"Deploy"** button.
2. Vercel will execute the build pipeline:
   - Installing dependencies with `npm install`.
   - Running Next.js build compilation (`next build`).
   - Statically generating and optimizing all routes (`/`, `/history`, `/privacy`, `/about-ai`, `/offline`).
3. Once the build completes (typically in ~45–60 seconds), Vercel will present a congratulatory screen with a screenshot of the app.
4. Your canonical public URL will be provided immediately (e.g., `https://outsidequest-ai.vercel.app`).
5. Any subsequent `git push` to your `main` branch will automatically trigger a zero-downtime production deployment.

---

## 9. How to Validate the Production Deployment

Perform these verification checks on the live Vercel URL:

1. **Brand & Hero Rendering:** Open the public URL on desktop and mobile. Verify that the typography, natural color scheme, and hero headers load smoothly.
2. **Deterministic Offline Fallback Generation:**
   - Configure a quest (e.g., 15 min, Garden, Curious).
   - Click **"Generate Personalized Outdoor Quest"**.
   - Verify that the quest preview card renders instantly with the badge `Curated Offline Fallback`.
3. **Trail Execution & Journal Persistence:**
   - Click **"Begin Adventure Now"**.
   - Mark milestone steps complete.
   - Click **"Finish & Log Nature Journal"** and submit sensory reflection notes.
   - Navigate to `/history` (My Journal) and verify your new entry is present with computed metrics.
4. **IndexedDB Local Storage:**
   - Refresh the page (`Ctrl+R` / `Cmd+R`).
   - Confirm the journal entry remains intact in your browser's local IndexedDB sandbox.
5. **Static Routing & Informational Pages:**
   - Navigate to `/privacy` and `/about-ai`.
   - Confirm all attribution, privacy pillars, and technical architecture explanations render cleanly.
6. **Lighthouse / PWA Audit:**
   - Open Chrome DevTools > Lighthouse.
   - Run an audit for **Performance**, **Accessibility**, and **PWA**.
   - Confirm 0 console errors and high accessibility scores.

---

## 10. Free-Tier, Model-Download, and Offline Limitations

To ensure transparency and manage user expectations, please note the operational characteristics of this free architecture:

### Vercel Hobby Free Tier Scope
- **Personal & Non-Commercial Use:** The Vercel Hobby tier is provided strictly for personal and non-commercial projects.
- **Fair-Use Limits:** Standard Vercel free limits apply (100GB bandwidth per month, 100 builds per day), which is more than sufficient for thousands of daily static page views since no server-side compute is utilized.
- **Zero Ongoing Infrastructure Cost:** Because inference and storage run on the user's browser, there are zero serverless function execution costs or third-party API bills.

### On-Device Model Download Behavior
- **Initial Download Bandwidth:** While the application shell is lightweight (< 150 KB gzip), activating the on-device AI model requires downloading the quantized weights (`onnx-community/gemma-3-270m-it-ONNX`, ~200 MB) directly from the public Hugging Face CDN.
- **Network Requirement:** The model download requires an initial stable internet connection.
- **Browser Cache Persistence:** Once downloaded, model assets are cached locally by the browser's Cache API / IndexedDB, allowing subsequent runs to load from local storage without re-downloading.

### Hardware & Execution Differences
- **WebGPU vs. WASM:** Devices with modern GPUs and WebGPU support will execute tokens at high speed (~15–30 tokens/sec). Older devices fallback to CPU WebAssembly (WASM), which may run noticeably slower (~2–6 tokens/sec).
- **Curated Fallback Engine:** For users on constrained devices, metered data connections, or older hardware, the application includes a deterministic, instant offline generator that requires zero model downloads.
