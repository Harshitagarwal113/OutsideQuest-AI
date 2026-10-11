# OutsideQuest AI 🌲

> **Turn routine neighborhood walks into sensory outdoor micro-adventures with browser-native, open-weight AI.**  
> *Built for the Touch Grass Open-Source AI Challenge.*

[![Version](https://img.shields.io/badge/version-v0.1.0-315D44.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-CBD9C7.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-252B25.svg)](https://nextjs.org/)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-v3.0-D88D51.svg)](https://huggingface.co/docs/transformers.js)
[![Zero Cloud Secrets](https://img.shields.io/badge/Cloud%20Secrets-Zero-315D44.svg)](docs/DEPLOYMENT.md)

---

## 🧭 Product Overview

In an era of hyper-connected screens and infinite AI chat loops, **OutsideQuest AI** was built to turn artificial intelligence inside out: instead of capturing your gaze, it encourages you to pocket your phone and explore the living world with your physical senses.

OutsideQuest AI runs open-weight Small Language Models (SLMs) **directly inside the user's browser** via WebGPU and WebAssembly. It personalizes sensory exploration missions tailored to your immediate environment (park, garden, neighborhood, campus), available duration (15 to 60 minutes), social setting (solo, friends, family), mood, and accessibility preferences.

Every quest is private, free, and self-contained:
- **Zero Cloud Inference APIs:** No OpenAI, Anthropic, or external serverless endpoints.
- **Zero Account Creation:** No login walls, passwords, or tracking cookies.
- **Zero Ongoing Cost:** Hosted on Vercel Hobby (Free Tier) with no database bills.
- **True Offline Capability:** Fallback generation engine and local IndexedDB operate with 100% network disconnection.

---

## ✨ Main Features

1. **Personalized Quest Builder:** Form with 8 granular outdoor dimensions (duration, environment, mood, intensity, experience type, sensory interests, custom local context, accessibility limitations).
2. **On-Device Open-Weight AI Generation:** Browser-native text generation powered by `@huggingface/transformers` running in a dedicated Web Worker thread.
3. **Deterministic Curated Fallback Engine:** Instantaneous, zero-latency generator providing structured, themed trails when the device lacks hardware support or is fully offline.
4. **Active Trail Companion:** Pocket-friendly step-by-step guidance, real-time timer tracking, screen-free reminders, and milestone completion toggles.
5. **Private Field Journal:** Structured post-walk sensory reflections (observations, physical feelings, favorite moments) stored strictly in client-side IndexedDB.
6. **Transparent Nature Achievements:** Real computed milestones (e.g., "First Step", "Sensory Explorer", "Park Wanderer") derived from actual local adventure records—never fabricated.
7. **PWA Offline Mode:** Progressive Web App service worker that caches the application shell and enables exploration deep in nature reserves without cellular reception.

---

## 🏛️ System Architecture & Folder Structure

OutsideQuest AI follows a clean, domain-driven modular architecture:

```text
OutsideQuest AI/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── history/              # My Journal (walk history, filters, metrics)
│   │   ├── privacy/              # Privacy & Data Architecture page
│   │   ├── about-ai/             # On-Device AI mechanics & model attribution
│   │   ├── offline/              # Offline Explorer guide & PWA fallback
│   │   ├── globals.css           # Natural earthy design tokens & accessibility
│   │   ├── layout.tsx            # Semantic root layout, landmarks & navigation
│   │   ├── page.tsx              # Home view, hero banner, builder & active trail
│   │   └── manifest.ts           # PWA web manifest
│   ├── components/               # Reusable atomic design system
│   │   ├── layout/               # AppHeader, AppFooter, MobileNavigation
│   │   └── ui/                   # Button, Card, Badge, ProgressBar, LoadingState, etc.
│   ├── features/                 # Domain-driven feature slices
│   │   ├── quest-builder/        # Form state, Zod schemas, validation & preview
│   │   ├── quest-session/        # Active trail runner, timer & reflection submission
│   │   ├── ai/                   # Web Worker, prompt templates, hardware detector & status
│   │   ├── history/              # Journal repository queries & activity cards
│   │   └── achievements/         # Transparent rule-based achievement evaluation
│   ├── lib/                      # Core infrastructure
│   │   ├── storage/              # IndexedDB abstraction (idb) & repositories
│   │   ├── constants.ts          # Earth color tokens, option sets & model metadata
│   │   └── utils.ts              # Duration formatting, class merging (cn), UUIDs
│   └── types/                    # Strict TypeScript domain interfaces
├── tests/
│   ├── unit/                     # Unit test suites (schemas, formatters, fallback engine)
│   ├── integration/              # Integration test suites (lifecycle, IndexedDB, achievements)
│   └── e2e/                      # Playwright E2E suites (8-step journey, offline behavior)
├── docs/
│   ├── ARCHITECTURE.md           # Deep dive into system architecture & data flows
│   ├── AI_DECISIONS.md           # Model trade-offs, quantizations & runtime decisions
│   └── DEPLOYMENT.md             # 10-step zero-cost Vercel deployment guide
└── public/
    ├── sw.js                     # Same-origin Service Worker for offline PWA caching
    ├── offline.html              # Standalone offline emergency fallback
    └── icons/                    # Nature-inspired PWA icons
```

---

## 💻 Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 App Router | React 18, static site generation (SSG), optimized client hydration |
| **Language** | TypeScript 5 (Strict Mode) | Full type safety, zero `any` evasions, runtime Zod inference |
| **Styling** | Tailwind CSS 3 | Bespoke earth palette (`#F7F6EF`, `#315D44`, `#CBD9C7`, `#E9E0D0`, `#D88D51`) |
| **Icons** | Lucide React | Clean, tree-shakeable SVG icons |
| **Runtime Validation** | Zod 3 | Guaranteed validation of form inputs, AI outputs, and storage records |
| **Local Storage** | IndexedDB (`idb` v8) | Asynchronous, structured, quota-resilient client-side storage |
| **AI Inference** | `@huggingface/transformers` v3 | Open-weight WebGPU / WASM execution in a background Web Worker |
| **Unit Testing** | Vitest 2 + RTL | Fast ESM unit and component test runner |
| **End-to-End Testing**| Playwright 1.48 | Deterministic multi-browser testing (Desktop Chromium & Mobile Chrome) |

---

## 🤖 AI Model Name, Attribution & Licensing

OutsideQuest AI uses open-weight Small Language Models developed and released by the open-source community:

- **Model Identity:** `onnx-community/gemma-3-270m-it-ONNX`
- **Original Model Authors:** Google Gemma Team (`google/gemma-3-270m-it`)
- **ONNX Quantization & Conversion:** ONNX Community on Hugging Face
- **Precision:** 4-bit Quantized (`q4` / `ONNX` format)
- **Approximate Download Footprint:** ~200 MB (quantized weights and tokenizer files)
- **Model License:** [Gemma Open Model Terms of Use](https://ai.google.dev/gemma/terms) (open-weights license permitting local inference and research)

---

## ⚙️ How Local Inference Works

1. **User Opt-In Initialization:** Model weights are **never** downloaded automatically upon page visit. The user explicitly triggers model initialization via the Local AI status card or dialog.
2. **Background Web Worker Isolation:** Inference runs inside `src/features/ai/workers/model.worker.ts`, completely off the UI thread. The main thread remains responsive at a smooth 60 FPS.
3. **Hardware Acceleration Detection:** The engine probes browser capabilities:
   - **WebGPU:** Selected on supported GPUs (Metal, Direct3D 12, Vulkan) for fast parallel tensor execution (~15–30 tokens/sec).
   - **WASM / CPU:** Graceful fallback using multi-threaded WebAssembly when WebGPU is unavailable (~2–6 tokens/sec).
4. **Strict JSON Schema Enforcement:** Prompts are seeded with explicit role instructions and JSON structural constraints. Raw model outputs are cleaned of markdown formatting and parsed through `questSchema` using Zod.
5. **Deterministic Fallback Redundancy:** If the browser cannot initialize the model, runs out of memory, or fails parsing, the system seamlessly activates the `CuratedFallbackGenerator` without throwing user-facing errors.

---

## 🔒 Privacy & Offline Behavior

- **No Third-Party AI Transmission:** Your prompt configurations and journal reflections are never sent to third-party AI APIs (OpenAI, Anthropic, Google, etc.).
- **No Telemetry or Tracking:** OutsideQuest AI does not install Google Analytics, Meta Pixels, Mixpanel, or cookie consent banners because zero tracking occurs.
- **Honest Network Transparency:** The application downloads model weights once from the public Hugging Face CDN. During that download, standard HTTP GET requests are made to Hugging Face servers. Once downloaded, the model is cached in browser storage for offline execution.
- **No Location Tracking:** OutsideQuest AI does **not** request browser geolocation (`navigator.geolocation`) permissions. You enter high-level environmental context (e.g. "near oak grove") manually.

---

## 📦 Installation Instructions

### Prerequisites
- Node.js `18.18.0` or higher
- npm `9.x` or higher

```bash
# 1. Clone the repository
git clone https://github.com/Harshitagarwal113/Agent-Baymax-.git
cd "OutsideQuest AI"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 🧪 Testing Instructions

Run the automated test suites to verify system integrity:

```bash
# 1. Run unit & integration test suites (Vitest)
npm run test

# 2. Run static TypeScript typecheck
npm run typecheck

# 3. Run ESLint checks
npm run lint

# 4. Run full end-to-end user journeys (Playwright)
npm run test:e2e
```

---

## 🚀 Deployment Instructions (Vercel Free Tier)

OutsideQuest AI is pre-configured for deployment to the **Vercel Hobby (Free)** tier:

1. Push your repository to GitHub.
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Leave all environment variables **blank**.
5. Click **"Deploy"**.
6. The application compiles and deploys in under 60 seconds with zero infrastructure costs.

For a comprehensive guide covering custom domains, WebGPU security headers, and post-deployment validation, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## ⚠️ Known Limitations

1. **Initial Model Download Size:** The on-device SLM requires a ~350 MB one-time download over Wi-Fi / cellular. Users with metered mobile connections should rely on the curated fallback engine.
2. **Older Mobile Browser WebGPU Support:** WebGPU is currently available on modern desktop browsers (Chrome, Edge) and newer Safari / iOS versions. Older Android and iOS browsers fall back to WebAssembly (WASM), which produces slower token generation.
3. **Browser Storage Eviction:** Storing models and history in browser IndexedDB/Cache API is subject to device storage pressure. If a mobile OS aggressively clears browser data under low-storage conditions, the model may need to be re-downloaded.

---

## 🤝 Contribution Instructions

We welcome contributions that improve sensory adventure design, accessibility, and local AI efficiency:

1. Fork the repository and create your feature branch: `git checkout -b feature/sensory-milestones`.
2. Ensure all quality checks pass:
   ```bash
   npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build
   ```
3. Commit your changes using Conventional Commits (`feat: add tactile moss observation prompt`).
4. Submit a Pull Request with a clear description of changes.

---

## 📄 License

OutsideQuest AI is open-source software licensed under the [MIT License](LICENSE).
The underlying AI model weights (`gemma-3-270m-it-ONNX`) are licensed under the [Gemma Open Model Terms of Use](https://ai.google.dev/gemma/terms).
