# Free Claude Code · Sovereign Client Suite & Isolated Admin Subfolder

This directory provides the standalone, high-fidelity client suite and dedicated administrative subfolder portal for **Free Claude Code**, fully integrated with sovereign open-weight models from [awesome-free-models](https://github.com/djozzybx/awesome-free-models).

---

## 1. Architectural Architecture & Administrative Isolation

In alignment with modern software platform architecture, the system enforces a strict boundary between public/user client capabilities and administrative controls:

- **Zero Admin Leakage in User App**: The user-facing application (`index.html`) contains zero administrative controls, buttons, containers, or script bundles. Users cannot discover or inspect privileged administrative functions from the client runtime.
- **Dedicated Subfolder Portal (`/admin/`)**: Privileged operations (model provider configurations, sovereign router routing, MCP connectors, user directory, and Strict Write Discipline receipts) are isolated exclusively under the dedicated `/admin/` subfolder route.
- **Reverse-Proxy Path Enforcement**: Production ingress gateways enforce path-level authentication, IP allowlisting, and Web Application Firewall (WAF) policies directly on `/admin/*` routes without exposing sensitive endpoints to unauthenticated traffic.
- **Strict Cookie & Storage Scoping**: Administrative tokens and session identifiers are isolated to `Path=/admin; HttpOnly; SameSite=Strict`, preventing credential leakage into general client sessions.

---

## 2. Exact macOS Desktop App Parity

The client suite replicates the official Anthropic Claude Desktop experience running on macOS:

- **Anthropic Serif & Cybernetic Modern Typography**: Styled with high-contrast serif headers, clean sans body text, and dynamic theme tokens.
- **Fluid Light & Dark Mode**: Native palette featuring `#FBF9F5` warm paper sidebar in Light Mode and `#141312` obsidian slate in Dark Mode.
- **macOS Window Traffic Lights Clearance**: 38px top padding on the collapsible sidebar to ensure seamless integration with native macOS window controls.
- **Header Status Pill**: Displays the verified `Free plan · Upgrade` pill with dedicated document and help icons in exact visual alignment with native desktop builds.
- **Navigation Views**: Complete interactive views for:
  - `New Chat` (`/#new`)
  - `Projects` (`/#projects`)
  - `Artifacts` (`/#artifacts`)
  - `Customize` (`/#customize`)
  - `Code Sessions` (`/#code`)
  - `Settings` (`/#settings`)

---

## 3. Sovereign Open-Weight & Awesome Free Models Catalog

Pre-configured with zero-token-cost open-weight models, routers, image generators, and voice processors from the [awesome-free-models](https://github.com/djozzybx/awesome-free-models) registry:

- **🌟 Frontier & Sovereign Free Open-Weights**:
  - **Muse Glimmer 30B** (`open_weight/meta/muse-glimmer-30b`) — Fast coding & reasoning
  - **Llama 4 Scout** (`open_weight/meta-llama/llama-4-scout`) — 10M context multimodal MoE
  - **DeepSeek V4 Pro** (`open_weight/deepseek-ai/deepseek-v4-pro`) — 1.6T MoE SWE-bench leader
  - **DeepSeek V4.1 Flash** (`open_weight/deepseek-ai/deepseek-v4.1-flash`) — Causal Encoder-Decoder architecture
  - **DeepSeek V4 Flash** (`open_weight/deepseek-ai/deepseek-v4-flash`) — 284B efficiency-focused variant
  - **Gemma 4 31B** (`open_weight/google/gemma-4-31b-it`) — Apache 2.0 multimodal standard
  - **Gemma 4 12B** (`open_weight/google/gemma-4-12b-it`) — Laptop-class multimodal open model
  - **Kimi K3** (`open_weight/moonshotai/kimi-k3`) — 2.8T-parameter MoE (world's largest open-weight)
  - **Step 3.7 Flash** (`open_weight/stepfun-ai/step-3.7-flash`) — Native video & image agentic model
  - **GLM-5.2 & GLM-5.3 FlashX** (`open_weight/zhipu-ai/glm-5.2`) — 744B MoE autonomous engineering
  - **Qwen 2.5 Coder 32B & Qwen 3 Coder Next** (`open_weight/alibaba/qwen-3-coder-next`) — Deep repository coding
  - **Inkling 975B MoE** (`open_weight/thinkingmachines/inkling`) — Native multimodal (text, image, audio)
  - **Nemotron 3 Super 120B** (`open_weight/nvidia/nemotron-3-super`) — NVIDIA open weights & recipes
  - **Ternary Bonsai 2 27B** (`open_weight/prism-ml/ternary-bonsai-2-27b`) — 1-bit / ternary edge model
- **🔀 Free API Routers & Gateways**:
  - **OrcaRouter** (`router/orcarouter/free`) — Auto-routes across free models ($0.00)
  - **OpenCode Zen** (`router/opencode/zen-free`) — Curated free coding & general models
  - **LLM7.io** (`router/llm7/free`) — 15 free models with 30 RPM and 1M context
  - **BazaarLink** (`router/bazaarlink/auto-free`) — Auto:Free 130 requests/day
  - **FreeAIapikey** (`router/freeaiapikey/gateway`) — 100K daily tokens across frontier models
- **🖼️ Free Image & Media Generation**:
  - **Pollinations.ai FLUX** (`image/pollinations/flux`) — Instant free image gen with zero API key / signup
  - **Kavel Instant Image** (`image/kavel/free`) — Free image generation endpoint
  - **FLUX.2-dev** (`image/bfl/flux2-dev`) — 32B rectified flow open weights
- **🎵 Audio & Speech Processing**:
  - **Qwen3-TTS** (`audio/alibaba/qwen3-tts`) — 97ms TTFB streaming voice cloning
  - **Chatterbox Turbo** (`audio/resemble-ai/chatterbox-turbo`) — SOTA low-latency TTS
  - **Faster-Whisper** (`audio/systran/faster-whisper`) — 4x faster speech-to-text
- **Offline Structured Catalog**: Over 1,150+ free models comprehensively indexed in `free_ai_models.json`.

---

## 4. Automated Testing Suite

The included test suite (`run_comprehensive_suite_tests.js`) automates verification across 34 distinct assertions:

1. **Admin Isolation**: Verifies 0 occurrences of `#adminViews`, `#btnSwitchPlatform`, `admin.js`, and `admin.css` in the user app.
2. **Subfolder Access Gate**: Verifies HTTP 200 and administrative portal controls at `/admin/`.
3. **Telemetry & Auth**: Validates current user profile and session permissions.
4. **Chat Threads & Demographic Distribution**: Validates active conversations, including audience demographic cohorts and regulatory compliance (COPPA / GDPR).
5. **Awesome Free Models Catalog**: Validates model selector options.
6. **Headless Chrome Visual Captures**: Generates automated screenshot captures for all views.

To execute the suite:
```bash
node run_comprehensive_suite_tests.js
```
