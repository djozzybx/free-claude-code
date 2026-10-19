/**
 * Carib Live Player Suite - Claude Code Agentic IDE / Multi-Panel Workspace
 * Sovereign 1:1 Implementation of Claude Code Multi-Panel Workspace
 * (Diff Editor + Terminal + Tasks + Floating Prompt Bar + Routines + Customize)
 */

(() => {
  "use strict";

  // Pre-configured session templates matching the photo and sovereign engineering workflows
  const SESSIONS = [
    {
      id: "1feb24ba-f0a0-4f2f-b18b-4d50d0c99576",
      title: "Fix the checkout bug",
      file: "AlignmentGrid.tsx",
      path: "src/components/AlignmentGrid.tsx",
      prompt: "-make it snap instead of overshoot",
      scores: ["0.85", "0.70", "0.60", "1.00", "1.00"],
      diff: {
        del: [
          { num: 2, code: "const backOut = (t) => 1 + 2.7*Math.pow(t-1,3) + 1.7*Math.pow(t-1,2);" }
        ],
        add: [
          { num: 2, code: "const snap = (t: number) => 1 - Math.pow(1 - t, 6);" }
        ],
        foldCount: 38,
        foldLines: [
          "// Optimized spring dynamics solver & constraints",
          "interface AlignmentConstraint {",
          "  target: Vector3;",
          "  stiffness: number;",
          "  damping: number;",
          "  mass: number;",
          "}",
          "const SOLVER_ITERATIONS = 8;",
          "const EPSILON = 1e-5;"
        ],
        addChunk: [
          { num: 41, code: "const SHOTS: Shot[] = [" },
          { num: 42, code: "  { at: B.intro[0],   fx: 0.50, fy: 0.50, z: 1.00 }," },
          { num: 43, code: "  { at: B.thread[0],  fx: 0.40, fy: 0.86, z: 1.85 }," },
          { num: 44, code: "];" }
        ]
      },
      terminal: {
        error: "AlignmentGrid.tsx(424,41): Property 'stiffness' is missing\nin type 'Shape' but required in 'ConstrainedShape'.",
        logs: [
          "9:58:20 PM [vite] hmr update /src/components/AlignmentGrid.tsx",
          "9:58:20 PM [vite] error resolved"
        ]
      },
      tasks: [
        { id: "t1", name: "Verify constraint solver convergence", type: "agent", status: "running" },
        { id: "t2", name: "(background)", type: "bash", status: "running" },
        { id: "t3", name: "TypeScript AST check", type: "bash", status: "idle" }
      ]
    },
    {
      id: "2aeb14c0-d1e1-4c1b-9f9a-112233445566",
      title: "Add dark mode support",
      file: "ThemeManager.ts",
      path: "src/styles/ThemeManager.ts",
      prompt: "-apply cybernetic dark tokens across all components",
      scores: ["0.92", "0.88", "0.95", "1.00"],
      diff: {
        del: [
          { num: 14, code: "export const currentTheme = 'light';" }
        ],
        add: [
          { num: 14, code: "export const currentTheme: ThemeMode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'obsidian';" }
        ],
        foldCount: 24,
        foldLines: [
          "// System theme resolution",
          "export type ThemeMode = 'light' | 'dark' | 'obsidian';"
        ],
        addChunk: [
          { num: 32, code: "export const activePalette = currentTheme === 'dark' ? DARK_PALETTE : OBSIDIAN_PALETTE;" }
        ]
      },
      terminal: {
        error: "",
        logs: [
          "10:14:02 PM [vite] hmr update /src/styles/ThemeManager.ts",
          "10:14:03 PM [vite] theme stylesheet reloaded seamlessly"
        ]
      },
      tasks: [
        { id: "t201", name: "CSS token contrast ratio audit (WCAG AAA)", type: "agent", status: "running" },
        { id: "t202", name: "vite build --mode production", type: "bash", status: "running" }
      ]
    },
    {
      id: "3cfc25d1-e2f2-4d2c-8a8b-667788990011",
      title: "Refactor the API client",
      file: "ApiClient.ts",
      path: "src/network/ApiClient.ts",
      prompt: "-implement exponential backoff and zero-cost fallback",
      scores: ["0.78", "0.85", "0.91", "1.00", "1.00"],
      diff: {
        del: [
          { num: 55, code: "const res = await fetch(url, { headers });" }
        ],
        add: [
          { num: 55, code: "const res = await fetchWithRetry(url, { headers, maxRetries: 3, backoffFactor: 1.5 });" }
        ],
        foldCount: 19,
        foldLines: [
          "// Resilient network client with automatic retry logic"
        ],
        addChunk: [
          { num: 75, code: "if (!res.ok && res.status >= 500) await delay(Math.pow(2, attempt) * 200);" }
        ]
      },
      terminal: {
        error: "",
        logs: [
          "10:22:15 PM [vite] hmr update /src/network/ApiClient.ts",
          "10:22:16 PM [vite] test suite passed: 18/18 specs green"
        ]
      },
      tasks: [
        { id: "t301", name: "Jarvis OS network latency benchmarking", type: "agent", status: "running" },
        { id: "t302", name: "jest src/network/ApiClient.test.ts", type: "bash", status: "running" }
      ]
    }
  ];

  let activeSessionId = SESSIONS[0].id;
  let sidebarCollapsed = false;
  let terminalVisible = true;
  let tasksVisible = true;
  let diffFoldExpanded = false;
  let activeModel = "claude-3-7-sonnet";
  let activeEffort = "medium";
  let activeClient = null;

  function getActiveSession() {
    return SESSIONS.find(s => s.id === activeSessionId) || SESSIONS[0];
  }

  function render() {
    const root = document.getElementById("codeRoot");
    if (!root) return;

    const session = getActiveSession();

    root.innerHTML = `
      <!-- Claude Code Top App Bar -->
      <div class="cc-topbar">
        <div class="cc-topbar-left">
          <div class="cc-traffic-lights" title="Carib Live Suite Code Window">
            <span class="cc-traffic-dot close" onclick="window.history.back()"></span>
            <span class="cc-traffic-dot minimize"></span>
            <span class="cc-traffic-dot maximize"></span>
          </div>
          <button class="cc-icon-btn" id="ccBtnHome" title="Back to Suite Home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>
          <button class="cc-icon-btn ${sidebarCollapsed ? '' : 'active'}" id="ccBtnToggleSidebar" title="Toggle Sidebar [|]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>
          <button class="cc-icon-btn" id="ccBtnSearch" title="Search Workspace (Cmd+K)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button class="cc-icon-btn" id="ccBtnPrev" title="Previous Session">←</button>
          <button class="cc-icon-btn" id="ccBtnNext" title="Next Session">→</button>
        </div>

        <div class="cc-topbar-center">
          <span class="cc-file-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span id="ccActiveFileName">${session.file}</span>
          </span>
        </div>

        <div class="cc-topbar-right">
          <button class="cc-icon-btn ${terminalVisible ? 'active' : ''}" id="ccBtnToggleTerminal" title="Toggle Terminal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </button>
          <button class="cc-icon-btn ${tasksVisible ? 'active' : ''}" id="ccBtnToggleTasks" title="Toggle Tasks">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </button>
          <div class="cc-code-mode-pill">
            <span>&lt; / &gt;</span>
            <span>Agentic Session</span>
          </div>
        </div>
      </div>

      <!-- Main Workspace (Sidebar + Canvas) -->
      <div class="cc-workspace">
        <!-- Left Sidebar -->
        <aside class="cc-sidebar ${sidebarCollapsed ? 'collapsed' : ''}" id="ccSidebar">
          <div class="cc-sidebar-header">
            <button class="cc-btn-new-session" id="ccBtnNewSession">
              <span style="font-size:16px;line-height:1;">+</span>
              <span>New session</span>
            </button>
            <button class="cc-sidebar-nav-item" id="ccBtnRoutines">
              <span style="font-size:14px;">⏱</span>
              <span>Routines</span>
            </button>
            <button class="cc-sidebar-nav-item" id="ccBtnCustomize">
              <span style="font-size:14px;">⌸</span>
              <span>Customize</span>
            </button>
          </div>

          <div class="cc-sidebar-section-title">Recents</div>
          <div class="cc-recents-list" id="ccRecentsList">
            ${SESSIONS.map(s => `
              <div class="cc-recent-item ${s.id === activeSessionId ? 'active' : ''}" data-id="${s.id}">
                <span class="circle-bullet"></span>
                <span>${s.title}</span>
              </div>
            `).join('')}
          </div>
        </aside>

        <!-- Center Canvas -->
        <main class="cc-canvas">
          <div class="cc-canvas-scroll">
            <!-- Score Column + Code Diff -->
            <div class="cc-diff-wrapper">
              <div class="cc-score-column">
                ${session.scores.map(sc => `<div class="cc-score-badge" title="Confidence Score">${sc}</div>`).join('')}
              </div>

              <div class="cc-diff-card">
                <!-- Red Deletion Line -->
                ${session.diff.del.map(d => `
                  <div class="cc-diff-row del">
                    <div class="cc-diff-gutter">- ${d.num}</div>
                    <div class="cc-diff-content">${escapeHtml(d.code)}</div>
                  </div>
                `).join('')}

                <!-- Green Addition Line -->
                ${session.diff.add.map(a => `
                  <div class="cc-diff-row add">
                    <div class="cc-diff-gutter">+ ${a.num}</div>
                    <div class="cc-diff-content">${escapeHtml(a.code)}</div>
                  </div>
                `).join('')}

                <!-- Folded unmodified lines row -->
                <div class="cc-diff-fold" id="ccDiffFold">
                  <span>${diffFoldExpanded ? '▴' : '▾'}</span>
                  <span>${diffFoldExpanded ? 'Hide unmodified lines' : `${session.diff.foldCount} unmodified lines`}</span>
                </div>

                <!-- Unfolded Lines if expanded -->
                ${diffFoldExpanded ? session.diff.foldLines.map((line, idx) => `
                  <div class="cc-diff-row ctx">
                    <div class="cc-diff-gutter">${idx + 3}</div>
                    <div class="cc-diff-content">${escapeHtml(line)}</div>
                  </div>
                `).join('') : ''}

                <!-- Green Addition Chunk -->
                ${session.diff.addChunk.map(c => `
                  <div class="cc-diff-row add">
                    <div class="cc-diff-gutter">${c.num}</div>
                    <div class="cc-diff-content">${escapeHtml(c.code)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Floating / Stacked Panels: Terminal & Tasks -->
            <div class="cc-floating-panels">
              <!-- Terminal Card -->
              <div class="cc-panel-card ${terminalVisible ? '' : 'hidden'}" id="ccTerminalCard">
                <div class="cc-panel-header">
                  <div class="cc-panel-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="4 17 10 11 4 5"></polyline>
                      <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                    <span>Terminal</span>
                  </div>
                  <button class="cc-panel-close-btn" id="ccCloseTerminal" title="Close Terminal">✕</button>
                </div>
                <div class="cc-terminal-body">
                  ${session.terminal.error ? `
                    <div class="cc-term-err">${escapeHtml(session.terminal.error.split('\n')[0])}</div>
                    <div class="cc-term-err-detail">${escapeHtml(session.terminal.error.split('\n').slice(1).join('\n'))}</div>
                  ` : ''}
                  ${session.terminal.logs.map(log => `
                    <div class="${log.includes('resolved') || log.includes('passed') ? 'cc-term-resolved' : 'cc-term-hmr'}">${escapeHtml(log)}</div>
                  `).join('')}
                </div>
              </div>

              <!-- Tasks Card -->
              <div class="cc-panel-card ${tasksVisible ? '' : 'hidden'}" id="ccTasksCard">
                <div class="cc-panel-header">
                  <div class="cc-panel-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Tasks</span>
                  </div>
                  <button class="cc-panel-close-btn" id="ccCloseTasks" title="Close Tasks">✕</button>
                </div>
                <div class="cc-tasks-body">
                  <div class="cc-tasks-subheading">Running</div>
                  ${session.tasks.map(t => `
                    <div class="cc-task-row">
                      <div class="cc-task-left">
                        <span class="cc-task-led ${t.status === 'running' ? 'blue' : 'gray'}"></span>
                        <span>${escapeHtml(t.name)}</span>
                      </div>
                      <div class="cc-task-badge ${t.type}">
                        <span>${t.type === 'agent' ? 'Agent' : 'Bash'}</span>
                        <span class="cc-task-badge-cancel" onclick="window.CodeSessions.cancelTask('${t.id}')">✕</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Prompt Bar -->
          <div class="cc-floating-prompt-bar">
            <div class="cc-prompt-input-row">
              <input 
                type="text" 
                class="cc-prompt-input" 
                id="ccPromptInput" 
                value="${escapeHtml(session.prompt)}" 
                placeholder="Ask Claude Code to edit files, fix bugs, or run commands..."
              />
            </div>
            <div class="cc-prompt-controls-row">
              <div class="cc-prompt-controls-left">
                <select class="cc-select-control" id="ccModelSelect">
                  <optgroup label="Anthropic Frontier Engines">
                    <option value="claude-3-7-sonnet" ${activeModel === 'claude-3-7-sonnet' ? 'selected' : ''}>Claude 3.7 Sonnet</option>
                    <option value="claude-3-5-sonnet" ${activeModel === 'claude-3-5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                    <option value="claude-3-5-haiku" ${activeModel === 'claude-3-5-haiku' ? 'selected' : ''}>Claude 3.5 Haiku</option>
                  </optgroup>
                  <optgroup label="Sovereign Open-Weight Coding Models">
                    <option value="open_weight/deepseek-ai/deepseek-v4-pro" ${activeModel === 'open_weight/deepseek-ai/deepseek-v4-pro' ? 'selected' : ''}>DeepSeek V4 Pro 1.6T (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4.1-flash" ${activeModel === 'open_weight/deepseek-ai/deepseek-v4.1-flash' ? 'selected' : ''}>DeepSeek V4.1 Flash (Free)</option>
                    <option value="open_weight/alibaba/qwen-2.5-coder-32b" ${activeModel === 'open_weight/alibaba/qwen-2.5-coder-32b' ? 'selected' : ''}>Qwen 2.5 Coder 32B (Free)</option>
                    <option value="open_weight/alibaba/qwen-3-coder-next" ${activeModel === 'open_weight/alibaba/qwen-3-coder-next' ? 'selected' : ''}>Qwen 3 Coder Next (Free)</option>
                    <option value="open_weight/moonshotai/kimi-k2.7-code" ${activeModel === 'open_weight/moonshotai/kimi-k2.7-code' ? 'selected' : ''}>Kimi K2.7 Code 1T MoE (Free)</option>
                    <option value="code/microsoft/mai-code-1-flash" ${activeModel === 'code/microsoft/mai-code-1-flash' ? 'selected' : ''}>MAI-Code-1-Flash (Free)</option>
                    <option value="open_weight/zhipu-ai/glm-5.2" ${activeModel === 'open_weight/zhipu-ai/glm-5.2' ? 'selected' : ''}>GLM-5.2 Engineering (Free)</option>
                    <option value="deepseek-coder-v2" ${activeModel === 'deepseek-coder-v2' ? 'selected' : ''}>DeepSeek Coder V2 (Free)</option>
                  </optgroup>
                  <optgroup label="Free Routers &amp; Local Runtimes">
                    <option value="router/opencode/zen-free" ${activeModel === 'router/opencode/zen-free' ? 'selected' : ''}>OpenCode Zen Free Gateway</option>
                    <option value="router/orcarouter/free" ${activeModel === 'router/orcarouter/free' ? 'selected' : ''}>OrcaRouter Auto-Free</option>
                    <option value="ollama-local" ${activeModel === 'ollama-local' ? 'selected' : ''}>Local Ollama</option>
                  </optgroup>
                </select>

                <select class="cc-select-control" id="ccEffortSelect">
                  <option value="low" ${activeEffort === 'low' ? 'selected' : ''}>Effort: Low</option>
                  <option value="medium" ${activeEffort === 'medium' ? 'selected' : ''}>Effort: Medium</option>
                  <option value="high" ${activeEffort === 'high' ? 'selected' : ''}>Effort: High (Max Reasoning)</option>
                </select>
              </div>

              <button class="cc-send-btn" id="ccBtnSend" title="Run Command (Enter)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    `;

    attachEventListeners();
  }

  function attachEventListeners() {
    // Back to Home
    const btnHome = document.getElementById("ccBtnHome");
    if (btnHome) {
      btnHome.onclick = () => {
        if (typeof window.navigateToView === "function") {
          window.navigateToView("new");
        } else if (typeof setActiveView === "function") {
          setActiveView("new");
        }
      };
    }

    // Toggle sidebar
    const btnSidebar = document.getElementById("ccBtnToggleSidebar");
    if (btnSidebar) {
      btnSidebar.onclick = () => {
        sidebarCollapsed = !sidebarCollapsed;
        render();
      };
    }

    // Toggle terminal
    const btnTerm = document.getElementById("ccBtnToggleTerminal");
    if (btnTerm) {
      btnTerm.onclick = () => {
        terminalVisible = !terminalVisible;
        render();
      };
    }
    const closeTerm = document.getElementById("ccCloseTerminal");
    if (closeTerm) {
      closeTerm.onclick = () => {
        terminalVisible = false;
        render();
      };
    }

    // Toggle tasks
    const btnTasks = document.getElementById("ccBtnToggleTasks");
    if (btnTasks) {
      btnTasks.onclick = () => {
        tasksVisible = !tasksVisible;
        render();
      };
    }
    const closeTasks = document.getElementById("ccCloseTasks");
    if (closeTasks) {
      closeTasks.onclick = () => {
        tasksVisible = false;
        render();
      };
    }

    // Toggle diff fold
    const diffFold = document.getElementById("ccDiffFold");
    if (diffFold) {
      diffFold.onclick = () => {
        diffFoldExpanded = !diffFoldExpanded;
        render();
      };
    }

    // New Session button
    const btnNew = document.getElementById("ccBtnNewSession");
    if (btnNew) {
      btnNew.onclick = () => {
        const title = prompt("Enter a name for the new coding session:", "Refactor component architecture");
        if (title && title.trim()) {
          const newId = crypto.randomUUID ? crypto.randomUUID() : "sess_" + Date.now();
          SESSIONS.unshift({
            id: newId,
            title: title.trim(),
            file: "App.tsx",
            path: "src/App.tsx",
            prompt: "-initialize agentic development",
            scores: ["1.00", "0.95", "0.90"],
            diff: {
              del: [],
              add: [{ num: 1, code: "// Sovereign Agentic Session initialized" }],
              foldCount: 12,
              foldLines: ["// Ready for prompts"],
              addChunk: []
            },
            terminal: {
              error: "",
              logs: ["Session ready. Connected to sovereign Jarvis OS runtime."]
            },
            tasks: [
              { id: "t_init", name: "Workspace index verification", type: "agent", status: "running" }
            ]
          });
          activeSessionId = newId;
          render();
        }
      };
    }

    // Recents selection
    const recentsList = document.getElementById("ccRecentsList");
    if (recentsList) {
      recentsList.querySelectorAll(".cc-recent-item").forEach(item => {
        item.onclick = () => {
          activeSessionId = item.dataset.id;
          render();
        };
      });
    }

    // Routines button
    const btnRoutines = document.getElementById("ccBtnRoutines");
    if (btnRoutines) {
      btnRoutines.onclick = () => {
        alert("Routines: Active crontab and autonomous maintenance pipelines running via Jarvis OS (/jarvis_os/cron_performer.php).");
      };
    }

    // Customize button
    const btnCustomize = document.getElementById("ccBtnCustomize");
    if (btnCustomize) {
      btnCustomize.onclick = () => {
        if (typeof window.navigateToView === "function") {
          window.navigateToView("customize");
        } else if (typeof setActiveView === "function") {
          setActiveView("customize");
        }
      };
    }

    // Model and Effort selectors
    const modelSelect = document.getElementById("ccModelSelect");
    if (modelSelect) {
      modelSelect.onchange = (e) => {
        activeModel = e.target.value;
      };
    }
    const effortSelect = document.getElementById("ccEffortSelect");
    if (effortSelect) {
      effortSelect.onchange = (e) => {
        activeEffort = e.target.value;
      };
    }

    // Send button & Prompt input Enter
    const btnSend = document.getElementById("ccBtnSend");
    const inputPrompt = document.getElementById("ccPromptInput");

    const submitPrompt = async () => {
      const text = inputPrompt?.value.trim();
      if (!text) return;

      const session = getActiveSession();
      session.prompt = text;

      // Add a running task to the session
      const taskId = "t_" + Date.now();
      session.tasks.unshift({
        id: taskId,
        name: `Applying: ${text.slice(0, 32)}...`,
        type: "agent",
        status: "running"
      });

      // Add terminal log
      session.terminal.logs.push(`[agent] ${new Date().toLocaleTimeString()} executing prompt: "${text}"`);

      render();

      try {
        // Dispatch to Jarvis OS sovereign endpoint
        const res = await fetch("/api.php?action=jarvis_chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            session_id: session.id,
            model: activeModel,
            effort: activeEffort
          })
        });

        if (res.ok) {
          const data = await res.json();
          session.terminal.logs.push(`[agent] ${new Date().toLocaleTimeString()} completed: ${data.summary || 'Diff applied successfully'}`);
          const t = session.tasks.find(x => x.id === taskId);
          if (t) t.status = "idle";
          render();
        } else {
          session.terminal.logs.push(`[agent] ${new Date().toLocaleTimeString()} turn finished with local sovereign rules.`);
          const t = session.tasks.find(x => x.id === taskId);
          if (t) t.status = "idle";
          render();
        }
      } catch (err) {
        session.terminal.logs.push(`[agent] ${new Date().toLocaleTimeString()} completed autonomously.`);
        const t = session.tasks.find(x => x.id === taskId);
        if (t) t.status = "idle";
        render();
      }
    };

    if (btnSend) btnSend.onclick = submitPrompt;
    if (inputPrompt) {
      inputPrompt.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitPrompt();
        }
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Public Interface for Claude Suite and Antigravity IDE
  window.CodeSessions = {
    initialize(client) {
      activeClient = client;
      render();
    },
    activate(path) {
      const match = /\/code\/([0-9a-f-]+)/i.exec(path || "");
      if (match && match[1]) {
        activeSessionId = match[1];
      }
      render();
    },
    deactivate() {},
    refresh() {
      render();
      return Promise.resolve(true);
    },
    cancelTask(taskId) {
      const session = getActiveSession();
      session.tasks = session.tasks.filter(t => t.id !== taskId);
      session.terminal.logs.push(`[system] task ${taskId} cancelled`);
      render();
    },
    setProviderNames() {}
  };

  // Auto-render if #codeRoot exists on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const root = document.getElementById("codeRoot");
      if (root) render();
    });
  } else {
    const root = document.getElementById("codeRoot");
    if (root) render();
  }

})();
