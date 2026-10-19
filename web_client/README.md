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

## 3. Sovereign Open-Weight Models Catalog

Pre-configured with zero-token-cost open-weight models from the `awesome-free-models` registry:

- **Muse Glimmer 30B** (`open_weight/meta/muse-glimmer-30b`) — Fast coding & reasoning
- **Llama 4 Scout** (`open_weight/meta/llama-4-scout`) — Multilingual reasoning & chat
- **DeepSeek V4 Flash** (`open_weight/deepseek-ai/deepseek-v4-flash`) — Ultra-low latency code synthesis
- **Qwen 2.5 Coder 32B** (`open_weight/qwen/qwen-2.5-coder-32b`) — Full repository coding specialist
- **Gemma 4 31B** (`open_weight/google/gemma-4-31b`) — Context-dense technical workflows

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
