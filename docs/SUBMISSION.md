---
title: OutsideQuest AI: Screen-Free Nature Quests with On-Device Gemma 3
published: true
tags: devchallenge, hf26challenge, gemma, opensource
canonical_url: https://outside-quest-ai.vercel.app/
cover_image: https://raw.githubusercontent.com/Harshitagarwal113/OutsideQuest-AI/main/public/outsidequest-banner.jpg
description: OutsideQuest AI creates personalized outdoor micro-adventures using Google Gemma 3 running directly in your browser with zero servers, zero API keys, and 100% privacy.
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

---

## What I Built

Most modern technology traps us in continuous dopamine loops, screen fatigue, and doomscrolling. Even outdoor apps often exacerbate this problem by demanding continuous screen interaction—staring at turn-by-turn navigation, checking GPS maps, or curating photos for social validation.

**OutsideQuest AI** was built to do the exact opposite: **use lightweight, open-weight AI to inspire you to put your phone in your pocket and touch grass.**

OutsideQuest AI is an intelligent, privacy-first companion that creates personalized outdoor micro-adventures designed for sensory immersion in living nature. Whether you have 15 minutes between remote work meetings or an hour on the weekend, the app crafts a structured, grounding outdoor mission tailored to:
- **Available Time:** 15, 30, 45, or 60 minutes.
- **Immediate Landscape:** Neighborhood, city park, botanical garden, university campus, or wild forest trail.
- **Sensory Mood & Movement Pace:** Curious, calm, energetic, or social; gentle, moderate, or active.
- **Companion Mode:** Solo mindful walks, friends, family with children, or community groups.
- **Sensory Interests:** Birding & bird song, plant identification, walking rhythms, mindfulness, tactile exploration, or nature photography.
- **Accessibility Needs:** Step-free pathways, flat terrain, frequent rest benches, and sensory-friendly options.

### The Screen-Free Philosophy: Phone Away, Adventure On
Once your quest begins, OutsideQuest AI encourages you to keep your screen off:
1. **Paced Audio Chimes:** Built-in Web Audio API synthesizers play gentle harmonic chimes (528 Hz and 659 Hz) to signal when each sensory milestone concludes, so you never have to watch a ticking clock.
2. **Sensory Focus Prompts:** Every step activates a distinct physical sense—listening for rustling foliage, noticing bark textures, feeling temperature gradients, or tracking shadow angles.
3. **Safety-First Guardrails:** The engine programmatically enforces strict nature safety rules: no eating wild plants/mushrooms, no approaching or handling wildlife, and staying on marked public paths.
4. **Nature Journal & Reflections:** When you return, you record what you noticed (sensory observations, bird sightings, mental headspace) in a private, persistent nature journal stored locally in your browser.

---

## Demo

- 🌐 **Live Web Application:** [https://outside-quest-ai.vercel.app/](https://outside-quest-ai.vercel.app/)
- ⚡ **Zero Setup Required:** Deployed on Vercel with zero required API keys, accounts, or environment variables. Works on desktop, tablet, and mobile browsers.

---

## Code

- 📦 **GitHub Repository:** [https://github.com/Harshitagarwal113/OutsideQuest-AI](https://github.com/Harshitagarwal113/OutsideQuest-AI)
- 📄 **License:** MIT License (Open Source)
- 🏷️ **Current Release:** `v0.1.0`

{% github Harshitagarwal113/OutsideQuest-AI %}

---

## How I Built It

OutsideQuest AI runs an open-weight Small Language Model directly in the user's browser—**no cloud GPU clusters, no external inference APIs, and no server-side execution.**

### 1. On-Device AI Engine: Google Gemma 3
- **Model:** [`onnx-community/gemma-3-270m-it-ONNX`](https://huggingface.co/onnx-community/gemma-3-270m-it-ONNX) (Google Gemma 3 270M Instruction-Tuned).
- **Quantization:** 4-bit INT4 (`q4`) weights (~200 MB download footprint), optimized for consumer mobile devices and laptops.
- **Inference Library:** **Transformers.js v3** (`@huggingface/transformers`) coupled with **ONNX Runtime Web**.
- **Hardware Acceleration:** Automatically targets **WebGPU** for parallel tensor arithmetic on device silicon, with graceful degradation to multi-threaded **WebAssembly (WASM)**.

### 2. Multi-Threaded Web Worker Architecture
Running heavy neural network matrix calculations on the browser UI thread can freeze scrolling and animations. We isolated the model lifecycle inside a dedicated Web Worker (`src/features/ai/workers/model.worker.ts`):
- Non-blocking token generation keeps the React user interface at a butter-smooth 60 FPS.
- Dynamic Gemma chat template handling formats prompt turns and seamlessly handles system-prompt merging.
- Comprehensive progress tracking reports byte-level download and shader compilation progress back to the UI.

### 3. Dual-Engine Generation & Zero-Drop Resilience
To guarantee that you can always head outside even with zero connectivity:
- **Primary Generator:** Browser-native Google Gemma 3 neural generation.
- **Deterministic Curated Engine:** If the model has not yet been downloaded, or if you are already on a deep trail with cellular reception turned off, a deterministic engine instantly generates rich, sensory-grounded quests in 0 milliseconds with 0 MB downloaded.

### 4. Local-First Nature Journaling with IndexedDB
Your thoughts and reflections are stored in a sandboxed, client-side database using `idb` (IndexedDB):
- Quests, completion statuses, sensory notes, and nature metrics persist across browser sessions.
- Built-in data export (formatted JSON) and print-ready expedition note summaries.

### Tech Stack Summary
- **Framework:** Next.js 14 App Router (Full static prerendering)
- **Language & Runtime:** TypeScript (Strict Mode) + React 18
- **Styling:** Tailwind CSS with a curated, nature-inspired palette (Forest, Sage, Sand, Earth Amber)
- **Validation:** Zod schemas for runtime parameter checking and LLM JSON output repair
- **Audio:** Custom Web Audio API synthesizer for serene nature chimes
- **Testing:** 15 Vitest test suites (71 tests passing) + Playwright E2E suites for desktop and mobile viewports

---

## Why Does Open Innovation Matter?

Outdoor exploration and nature connection should be universal, safe, and free. Building OutsideQuest AI around an open-weight, browser-native model unlocks benefits that closed, proprietary cloud APIs simply cannot match:

1. **True Offline Functionality in Living Nature:**
   Closed APIs require constant high-speed internet. But the best places to "touch grass"—state parks, botanical gardens, coastal headlands, and dense woodlands—often have spotty or zero cellular coverage. Because Gemma 3 is cached on-device, OutsideQuest AI continues generating adventures even when completely disconnected in Airplane Mode.

2. **Absolute Privacy & Data Sovereignty:**
   Closed APIs log your prompts, location hints, daily walking routines, physical limitations, and sensory reflection journals onto commercial cloud servers. With open weights on-device, your thoughts and personal context never leave your browser sandbox.

3. **Zero Cost & Democratic Access:**
   There are no token costs, subscription tiers, API credit expirations, or paywalls. Anyone with a smartphone or laptop can experience personalized nature guidance without entering a credit card or registering an account.

4. **Reliability & Immortality:**
   A closed API can be sunset, rate-limited, or altered overnight. An open-weight model with an open-source web application remains fully operational forever.

---

## My Agent Session

This application was engineered collaboratively with **Antigravity AI**, Google DeepMind's agentic coding pair programmer. 

The full agent workflow covered:
- Architecting the client-side Web Worker communication layer and Zod output repair pipeline.
- Integrating `onnx-community/gemma-3-270m-it-ONNX` via Transformers.js v3 with WebGPU/WASM fallback.
- Conducting rigorous security and code audits, resolving PostCSS configurations, and achieving 100% test pass rates across 71 unit/integration tests.
- Deploying the static bundle to Vercel Hobby with zero environment variables and zero paid compute.

*(Transcripts and architecture documents are preserved directly in the repository under [`docs/ARCHITECTURE.md`](https://github.com/Harshitagarwal113/OutsideQuest-AI/blob/main/docs/ARCHITECTURE.md) and [`docs/AI_DECISIONS.md`](https://github.com/Harshitagarwal113/OutsideQuest-AI/blob/main/docs/AI_DECISIONS.md)).*

---

## Prize Categories

We are entering OutsideQuest AI into the following track:

- **Best Use of Gemma** (Primary Partner Category)
- **Grand Prize / Overall Track** (Hacktoberfest Open-Source AI Challenge: Week 1 — Touch Grass)

---

## 🌲 Step Outside

OutsideQuest AI proves that open-source AI doesn't have to keep us glued to glowing rectangles. By taking advantage of Google Gemma 3 running on your device silicon, we can use artificial intelligence to celebrate and preserve our connection with the real, tactile, beautiful natural world.

Take 15 minutes today, put your phone in your pocket, and go explore:
👉 **[Launch OutsideQuest AI](https://outside-quest-ai.vercel.app/)**
