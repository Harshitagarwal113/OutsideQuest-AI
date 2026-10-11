# OutsideQuest AI - AI Architecture & Technical Decisions

This document details the engineering choices behind the on-device AI system, local persistence, offline generation, browser performance optimizations, and open-innovation story for OutsideQuest AI.

---

## 1. Vision: Anti-Chatbot Philosophy

Traditional generative AI products encourage excessive screen-time: infinite chat loops, chat history rabbit holes, and prolonged typing. 

**OutsideQuest AI inverts this dynamic:**
- The AI serves as an **initiation spark**, not a conversation partner.
- It translates environmental constraints (time, location, companion, vibe, interests, accessibility) into **concrete sensory milestones**.
- Its explicit design goal is to prompt the user to **put their device in their pocket** with the reminder: *"Phone away. Adventure on."*

---

## 2. On-Device Model Architecture

OutsideQuest AI integrates browser-native neural inference powered by **Transformers.js v3** (`@huggingface/transformers`) and **ONNX Runtime Web**.

### Primary Model Specification
- **Model Identifier:** `onnx-community/gemma-3-270m-it-ONNX`
- **Original Model Authors:** Google Gemma Team
- **ONNX Community Conversion:** Hugging Face Community
- **License:** [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- **Quantization:** `q4` (INT4 quantized weights, ~200 MB download footprint)
- **Primary Execution Backend:** `WebGPU` (hardware-accelerated tensor computations directly on GPU)
- **Fallback Execution Backend:** `WASM / CPU` (WebAssembly with SIMD instructions for universal compatibility)

---

## 3. The Open-Innovation Story: Why Open Weights Matter

1. **Inference Happens on the User's Device:**
   Computations execute entirely inside the client browser sandbox. No server farms or cloud GPU clusters are invoked.
2. **Zero Paid Inference APIs or Subscriptions:**
   Users never need an OpenAI key, an Anthropic token, a credit card, or a paid subscription. Access to personalized outdoor adventure design is completely free and democratic.
3. **Absolute Data Sovereignty & Privacy:**
   Personal exploration preferences, accessibility constraints, physical limitations, and local landmark descriptions never leave the device. There is no server log, no remote training pipeline, and no central data broker.
4. **Interchangeability & Model Freedom:**
   Because OutsideQuest AI uses standard ONNX pipelines and an isolated `QuestGenerator` interface, the model can be swapped with other compatible open-weight models (such as `SmolLM2-360M-Instruct` or `Llama-3.2-1B-Instruct`) without touching presentation code.
5. **Inspectability & Adaptability:**
   Unlike closed black-box APIs, open-weight models and open-source browser runtimes can be inspected, audited, tested offline, and adapted by the community.

### Clarifying the Terms: Open Weights vs. Open Source vs. Browser Runtime
- **Open Weights:** The mathematical parameters (tensors) of the trained neural network published under open licenses (Apache 2.0). They are static artifacts downloaded once.
- **Open Source Software:** The TypeScript, React, and Next.js application codebase licensed for public modification, auditing, and contribution.
- **Browser Runtime:** The sandboxed execution environment (V8, WebGPU, WebAssembly) provided by modern browsers, isolating model execution from the rest of the user's operating system.

---

## 4. Two-Tiered Generator Architecture

To guarantee zero latency, complete offline availability, and strict safety, generation is unified behind a TypeScript interface:

```typescript
export interface QuestGenerator {
  generate(params: QuestParams): Promise<Quest>;
}
```

### Provider 1: On-Device Language Model (`LocalAiQuestGenerator`)
- Primary provider when the model is initialized and ready.
- Runs in a dedicated Web Worker (`model.worker.ts`) to ensure the main UI thread never drops a single frame.
- Structured output is parsed, sanitized, mathematically normalized, and validated through `questSchema`.
- Incorporates a single constrained repair pass if the initial model output suffers from malformed JSON or timing drift.

### Provider 2: Verified Curated Fallback Engine (`CuratedFallbackGenerator`)
- 100% deterministic, immediate, and zero-data (0 MB download).
- Automatically engaged when:
  1. The user has not downloaded the model weights yet and prefers instant generation.
  2. The device is offline without a previously cached model.
  3. WebGPU/WASM fails due to device memory constraints.
  4. Generation or parsing encounters an unrecoverable failure.
  5. The user explicitly clicks "Instant Curated Quest".

---

## 5. Honest Capabilities & Real Limitations

- **Not Offline Before Download:** The app is **NOT** offline on first use for AI model generation. Downloading the ~350MB model weights requires an active network connection. Once downloaded, weights reside in browser `CacheStorage` and work offline.
- **Cache Eviction Risk:** Mobile operating systems facing extreme disk pressure may evict cached browser assets. OutsideQuest AI gracefully detects missing cache files and falls back to curated templates.
- **SLM vs. Hosted Giant Models:** A 0.5B parameter model quantized to 4 bits is extraordinarily efficient for structured micro-adventure generation, but does not possess the broad factual reasoning of multi-hundred-billion-parameter hosted models. We design prompts and strict validation to keep the model grounded in its specific domain.
- **Outdoor Safety Rule Enforcement:** Language models can hallucinate. Therefore, all generated milestones pass through programmatic safety checks rejecting instructions involving foraging, eating wild plants, touching animals, or trespassing.
