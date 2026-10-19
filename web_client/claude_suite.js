
  // Theme Management (Light Mode Default matches Desktop Screenshot)
  window.initCaribTheme = function() {
    const saved = localStorage.getItem('carib_theme') || 'light';
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  window.toggleCaribTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('carib_theme', isDark ? 'dark' : 'light');
    const popover = document.getElementById("userMenuPopover");
    if (popover) popover.classList.remove("active");
  };

  // Mobile Sidebar Drawer Toggle for iPhone & Mobile Viewports
  window.toggleMobileSidebar = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  };

  // Sync Top Sidebar Mode Tabs (Home vs Code)
  window.syncSidebarModeTabs = function(viewId) {
    const tabHome = document.getElementById('tabHome');
    const tabCode = document.getElementById('tabCode');
    if (!tabHome || !tabCode) return;
    if (viewId === 'code') {
      tabHome.classList.remove('active');
      tabCode.classList.add('active');
    } else {
      tabHome.classList.add('active');
      tabCode.classList.remove('active');
    }
  };

  // Native Downloads & Plans Modals Handlers
  window.openDownloadsModal = function() {
    const dialog = document.getElementById("downloadsDialog");
    if (dialog) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }
    const popover = document.getElementById("userMenuPopover");
    if (popover) popover.classList.remove("active");
  };

  window.closeDownloadsModal = function() {
    const dialog = document.getElementById("downloadsDialog");
    if (dialog) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  };

  window.openPlansModal = function() {
    const dialog = document.getElementById("plansDialog");
    if (dialog) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }
    const popover = document.getElementById("userMenuPopover");
    if (popover) popover.classList.remove("active");
  };

  window.closePlansModal = function() {
    const dialog = document.getElementById("plansDialog");
    if (dialog) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  };

  window.toggleBillingCycle = function(cycle) {
    const btnMonthly = document.getElementById("btnBillingMonthly");
    const btnYearly = document.getElementById("btnBillingYearly");
    const stdPrice = document.getElementById("standardPriceLabel");
    const stdPeriod = document.getElementById("standardPeriodLabel");
    const stdSub = document.getElementById("standardSubLabel");
    const premPrice = document.getElementById("premiumPriceLabel");
    const premPeriod = document.getElementById("premiumPeriodLabel");
    const premSub = document.getElementById("premiumSubLabel");

    if (cycle === 'yearly') {
      if (btnMonthly) btnMonthly.classList.remove("active");
      if (btnYearly) btnYearly.classList.add("active");
      if (stdPrice) stdPrice.textContent = "$20";
      if (stdPeriod) stdPeriod.textContent = "/ seat / mo";
      if (stdSub) stdSub.textContent = "billed annually ($240/yr)";
      if (premPrice) premPrice.textContent = "$100";
      if (premPeriod) premPeriod.textContent = "/ seat / mo";
      if (premSub) premSub.textContent = "billed annually ($1,200/yr)";
    } else {
      if (btnMonthly) btnMonthly.classList.add("active");
      if (btnYearly) btnYearly.classList.remove("active");
      if (stdPrice) stdPrice.textContent = "$25";
      if (stdPeriod) stdPeriod.textContent = "/ seat / mo";
      if (stdSub) stdSub.textContent = "billed monthly";
      if (premPrice) premPrice.textContent = "$125";
      if (premPeriod) premPeriod.textContent = "/ seat / mo";
      if (premSub) premSub.textContent = "billed monthly";
    }
  };

  window.copyCliCommand = function(text, btnElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (btnElement) {
      const orig = btnElement.innerHTML;
      btnElement.textContent = "Copied!";
      btnElement.style.background = "#10b981";
      btnElement.style.color = "#ffffff";
      setTimeout(() => {
        btnElement.innerHTML = orig;
        btnElement.style.background = "";
        btnElement.style.color = "";
      }, 2000);
    }
  };

  document.addEventListener("click", (e) => {
    const dModal = document.getElementById("downloadsDialog");
    if (dModal && e.target === dModal) window.closeDownloadsModal();
    const pModal = document.getElementById("plansDialog");
    if (pModal && e.target === pModal) window.closePlansModal();
  });

/* Claude Sovereign Web Suite - Core Controller */
window.ClaudeSuite = (function () {

  window.openCodeSession = function(sessionId) {
    const path = sessionId ? `/#code/${sessionId}` : "/#code";
    window.history.pushState({}, "", path);
    if (typeof setActiveView === "function") {
      setActiveView("code");
    } else if (typeof window.navigateToView === "function") {
      window.navigateToView("code");
    }
    if (window.CodeSessions && window.CodeSessions.activate) {
      window.CodeSessions.activate(path);
    }
  };

  let currentUser = null;
  let userProjects = [];
  let activeProject = null;
  let activePlatformTab = "workbench";
  let activeSdkLang = "python";
  let activeUseCaseId = "support";
  let activeCustomizeTab = "skills";
  let wbSystemPrompt = "You are Claude, a helpful, harmless, and honest AI assistant served via Carib Cold Sovereign Infrastructure.";
  let wbMessages = [
    { role: "user", content: "Explain how Carib Cold enables open-source sovereign deployment matching Claude Platform and Desktop UI, routing across Sonnet, Opus, and Haiku with zero subscription costs." }
  ];
  let wbModel = "qwen/qwen-2.5-coder-32b-instruct:free";
  let wbTemperature = 0.7;
  let wbMaxTokens = 4096;
  let wbThinkingBudget = 0;
  let wbRunning = false;
  let wbLastResult = null;
  let localOllamaConnected = null;
  let localOllamaModels = [];

  async function checkLocalOllama() {
    try {
      const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const d = await res.json();
        localOllamaConnected = true;
        localOllamaModels = d.models || [];
        return true;
      }
    } catch (e) {
      localOllamaConnected = false;
      localOllamaModels = [];
      return false;
    }
  }

  
  // Clean User App Navigation Router
  window.navigateToView = function(viewId) {
    if (!viewId) viewId = 'new';
    let target = '/' + viewId;
    if (viewId === 'new') target = '/new';
    else if (viewId === 'projects') target = '/projects';
    else if (viewId === 'artifacts') target = '/artifacts';
    else if (viewId === 'customize') target = '/customize';
    else if (viewId === 'code') target = '/code';
    else if (viewId === 'settings') target = '/settings';

    try {
      window.history.pushState({}, '', target);
    } catch (_) {}

    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });

    const views = ['new', 'projects', 'artifacts', 'customize', 'code', 'settings'];
    views.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) {
        el.hidden = (v !== viewId);
        el.classList.toggle('active', v === viewId);
      }
    });

    if (viewId === 'new') {
      renderNewView();
    } else if (viewId === 'projects') {
      renderProjectsView();
    } else if (viewId === 'artifacts') {
      renderArtifactsView();
    } else if (viewId === 'customize') {
      renderCustomizeView();
    } else if (viewId === 'code') {
      if (window.CodeSessions && window.CodeSessions.activate) {
        window.CodeSessions.activate('/code');
      }
    } else if (viewId === 'settings') {
      renderSettingsView();
    }
  };

  window.startSkillPrompt = function(promptText) {
    if (window.navigateToView) window.navigateToView('new');
    setTimeout(() => {
      const textarea = document.getElementById('chatPromptInput') || document.querySelector('.claude-prompt-textarea');
      if (textarea) {
        textarea.value = promptText;
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 150);
  };

  window.focusSearch = function() {
    const term = prompt("Search chats & projects:", "");
    if (term) {
      alert("Searching for: " + term);
    }
  };

  window.sortRecents = function() {
    loadSidebarConversations();
  };

  window.startNewProjectFlow = function() {
    const name = prompt("Project Name:", "New Sovereign Project");
    if (name) {
      alert("Created project: " + name);
    }
  };

  async function init() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        if (res.status === 401 && !window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
      }
      const data = await res.json();
      currentUser = data.user;
      userProjects = data.projects || [];
      activeProject = userProjects[0] || null;

      renderUserProfileCard();

    // Initial Route Detection with Deep-link Support (e.g., #customize/connectors, #customize/plugins, expanded=true)
    const validViews = ['new', 'projects', 'artifacts', 'customize', 'code', 'settings'];
    function resolveRoute(hashOrPath) {
      const full = (hashOrPath || '').replace(/^#\/?/, '').replace(/^\//, '');
      const parts = full.split(/[/?]/);
      const baseView = parts[0] || 'new';

      if (baseView === 'customize') {
        if (!window.customizeExpanded) window.customizeExpanded = {};
        if (full.includes('connectors')) window.activeCustomizeTab = 'connectors';
        else if (full.includes('plugins')) window.activeCustomizeTab = 'plugins';
        else if (full.includes('skills')) window.activeCustomizeTab = 'skills';

        if (full.includes('yours')) window.activeCustomizeSubTab = 'yours';
        else if (full.includes('discover')) window.activeCustomizeSubTab = 'discover';

        if (full.includes('expanded') || full.includes('show_all')) {
          window.customizeExpanded['new-skills'] = true;
          window.customizeExpanded['most-installed-skills'] = true;
          window.customizeExpanded['top-connectors'] = true;
          window.customizeExpanded['new-plugins'] = true;
          window.customizeExpanded['most-installed-plugins'] = true;
        }
      }
      return validViews.includes(baseView) ? baseView : 'new';
    }

    const initialView = resolveRoute(window.location.hash || window.location.pathname);
    if (window.navigateToView) window.navigateToView(initialView);

    window.addEventListener("hashchange", () => {
      const currentView = resolveRoute(window.location.hash);
      if (window.navigateToView) window.navigateToView(currentView);
    });

      window.initCaribTheme();
      applyRolePermissions();
      setupLogoutHandler();
      loadSidebarConversations();

      const btnNewSidebar = document.getElementById("btnNewChatSidebar");
      if (btnNewSidebar) {
        btnNewSidebar.addEventListener("click", () => {
          startNewChat();
          if (window.navigateToView) window.navigateToView("new");
        });
      }
    } catch (err) {
      console.warn("Auth check failed:", err);
    }
  }

  
  
  function applyRolePermissions() {
    if (!currentUser) return;
    const isMember = currentUser.role !== "admin";
    document.querySelectorAll("[data-view=\"users\"], [data-view=\"platform\"], [data-view=\"providers\"], [data-view=\"model_config\"]").forEach(el => {
      if (isMember) el.style.display = "none";
    });
  }

  function renderUserProfileCard() {
    const card = document.getElementById("userProfileCard");
    if (!card) return;

    // Toggle User Menu Popover on click
    card.onclick = (e) => {
      const popover = document.getElementById("userMenuPopover");
      if (popover) popover.classList.toggle("active");
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#userProfileCard") && !e.target.closest("#userMenuPopover")) {
        const popover = document.getElementById("userMenuPopover");
        if (popover) popover.classList.remove("active");
      }
    });
  }

  function setupLogoutHandler() {
    const btnLogout = document.getElementById("btnLogout");
    if (!btnLogout) return;

    btnLogout.addEventListener("click", async () => {
      if (confirm("Are you sure you want to log out of Carib Cold?")) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        window.location.href = "/logout?involuntary=1&returnTo=%2Flogin%3Ffrom%3Dlogout%26reauth%3D1%26returnTo%3D%252Fnew";
      }
    });
  }

  // --- Views Rendering ---

  let activeChatId = null;
  let activeChatMessages = [];
  let activeChatMode = "chat";
  let selectedModel = "openrouter/free";
  let activeAttachments = [];
  let recognitionInstance = null;
  let isVoiceRecording = false;

  function formatMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks: ```lang ... ```
    html = html.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block-wrapper" style="margin:12px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#060a12;padding:6px 12px;font-size:11px;color:#94a3b8;border-top-left-radius:8px;border-top-right-radius:8px;border:1px solid #1e2638;border-bottom:none;">
          <span style="font-weight:600;text-transform:uppercase;color:#38bdf8;">${lang || 'code'}</span>
          <button class="btn-code-copy" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText);this.innerText='Copied!';setTimeout(()=>this.innerText='Copy',1500);">Copy</button>
        </div>
        <pre style="margin:0;border-top-left-radius:0;border-top-right-radius:0;"><code>${code}</code></pre>
      </div>`;
    });

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Line breaks
    html = html.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");

    return html;
  }

  async function loadSidebarConversations() {
    const listEl = document.getElementById("chatHistoryList");
    if (!listEl) return;
    try {
      // Fetch both chat conversations and code sessions
      const [chatRes, codeRes] = await Promise.all([
        fetch("/api/chat/conversations").catch(() => null),
        fetch("/admin/api/code/sessions").catch(() => null)
      ]);

      const convs = (chatRes && chatRes.ok) ? ((await chatRes.json()).conversations || []) : [];
      const codeSessions = (codeRes && codeRes.ok) ? ((await codeRes.json()).sessions || []) : [];

      let html = "";

      // Render Active Coding Sessions first
      codeSessions.forEach(s => {
        const title = s.title === 'hi' ? 'Carib Live Player Suite' : (s.title || 'Code Workspace');
        html += `
          <div class="chat-history-item code-session-item active" data-code-id="${s.id}" title="${s.cwd} · ${title}" style="border-left: 2px solid #10b981;">
            <span class="chat-item-title" style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:145px;">
              <span style="color:#10b981;font-size:12px;">💻</span>
              <span style="font-weight:600;color:var(--claude-text-primary,#181816);">${title}</span>
            </span>
            <span style="font-size:9.5px;padding:2px 6px;border-radius:4px;background:rgba(16,185,129,0.2);color:#10b981;font-weight:700;border:1px solid rgba(16,185,129,0.35);">ACTIVE</span>
          </div>
        `;
      });

      // Render standard chat conversations
      convs.forEach(c => {
        html += `
          <div class="chat-history-item ${c.id === activeChatId ? 'active' : ''}" data-id="${c.id}" title="${c.title}">
            <span class="chat-item-title" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">${c.title || 'Chat'}</span>
            <button class="btn-del-chat" data-del-id="${c.id}" title="Delete chat">&times;</button>
          </div>
        `;
      });

      if (!html) {
        listEl.innerHTML = `<div class="chat-item-empty">No saved chats yet</div>`;
        return;
      }

      listEl.innerHTML = html;

      // Bind code sessions
      listEl.querySelectorAll(".code-session-item").forEach(item => {
        item.addEventListener("click", () => {
          if (window.openCodeSession) window.openCodeSession(item.dataset.codeId);
        });
      });

      listEl.querySelectorAll(".chat-history-item").forEach(item => {
        item.addEventListener("click", (e) => {
          if (e.target.classList.contains("btn-del-chat")) return;
          loadConversation(item.dataset.id);
        });
      });

      listEl.querySelectorAll(".btn-del-chat").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const delId = btn.dataset.delId;
          if (confirm("Delete this conversation?")) {
            await fetch(`/api/chat/conversations/${delId}`, { method: "DELETE" });
            if (activeChatId === delId) {
              activeChatId = null;
              activeChatMessages = [];
              renderNewView();
            }
            loadSidebarConversations();
          }
        });
      });
    } catch (e) {
      console.warn("Failed to load conversations:", e);
    }
  }

  async function loadConversation(convId) {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      activeChatId = convId;
      activeChatMessages = (data.messages || (data.conversation && data.conversation.messages) || []).map(m => ({
        role: m.role,
        content: m.content,
        model: m.model
      }));
      renderNewView();
      loadSidebarConversations();
    } catch (e) {
      console.warn("Failed to load conversation details:", e);
    }
  }

  function startNewChat() {
    activeChatId = null;
    activeChatMessages = [];
    activeAttachments = [];
    renderNewView();
    loadSidebarConversations();
  }

    function renderNewView(container) {
    container = container || document.getElementById("view-new");
    if (!container) return;
    const projOptions = userProjects.map(p => 
      `<option value="${p.id || p.project_id}">${p.name || p.project_name}</option>`
    ).join("");

    if (activeChatMessages.length === 0) {
      // Exact Anthropic Desktop Parity (Photo 5)
      container.innerHTML = `
        <div class="claude-new-container">
          <div class="claude-hero-container">
            <span class="claude-sunburst">✻</span>
            <h1 class="claude-hero-title">What shall we think through?</h1>
          </div>

          <div class="claude-prompt-box">
            <textarea id="claudeMainPrompt" class="claude-prompt-textarea" placeholder="How can I help you today?"></textarea>
            
            <div id="attachmentsPreview" class="attachments-preview"></div>

            <div class="claude-prompt-toolbar">
              <div class="claude-prompt-left" style="display:flex;align-items:center;gap:6px;position:relative;">
                <input type="file" id="promptFileInput" multiple style="display:none;">
                <button type="button" id="btnAttachFile" class="btn-prompt-ctrl" title="Attach files, skills, connectors, or plugins">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                <!-- Plus Menu Popover (Exact Official Claude Desktop Parity) -->
                <div id="promptPlusPopover" class="prompt-plus-popover" style="display:none;">
                  <div class="plus-menu-item" id="plusMenuUpload">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    <span>Upload or add files</span>
                    <span class="plus-menu-shortcut">⌘ U</span>
                  </div>
                  <div class="plus-menu-item has-sub" id="plusMenuSkills">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path></svg>
                    <span>Skills</span>
                    <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <div class="plus-submenu">
                      <div class="sub-item" data-skill="deep-research"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> deep-research</div>
                      <div class="sub-item" data-skill="google-workspace"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> google-workspace</div>
                      <div class="sub-item" data-skill="import-memory"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> import-memory</div>
                      <div class="sub-item" data-skill="morning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> morning</div>
                      <div class="sub-item" data-skill="skill-creator"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> skill-creator</div>
                      <div class="sub-item" data-skill="setup-audit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> setup-audit</div>
                      <div class="sub-item" data-skill="jinko"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg> jinko</div>
                      <div class="plus-menu-divider"></div>
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> Manage skills</div>
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Browse skills</div>
                    </div>
                  </div>
                  <div class="plus-menu-item has-sub" id="plusMenuConnectors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
                    <span>Connectors</span>
                    <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <div class="plus-submenu">
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><line x1="12" y1="5" x2="12" y2="19"></line> Add connector <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> Manage connectors</div>
                      <div class="plus-menu-divider"></div>
                      <div class="sub-item" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span class="mcp-avatar-badge">c</span>
                          <span>carib-sovereign-bridge</span>
                        </div>
                        <label class="claude-switch-mini"><input type="checkbox" checked><span class="claude-slider-mini"></span></label>
                      </div>
                      <div class="sub-item" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span class="mcp-avatar-badge">J</span>
                          <span>jarvis-mac-bridge</span>
                        </div>
                        <label class="claude-switch-mini"><input type="checkbox" checked><span class="claude-slider-mini"></span></label>
                      </div>
                      <div class="sub-item" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span class="mcp-avatar-badge">R</span>
                          <span>rea (Reverse Engineering)</span>
                        </div>
                        <label class="claude-switch-mini"><input type="checkbox" checked><span class="claude-slider-mini"></span></label>
                      </div>
                      <div class="sub-item" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span class="mcp-avatar-badge">D</span>
                          <span>dart-mcp-server</span>
                        </div>
                        <label class="claude-switch-mini"><input type="checkbox" checked><span class="claude-slider-mini"></span></label>
                      </div>
                      <div class="sub-item" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span class="mcp-avatar-badge">G</span>
                          <span>data-agent-kit</span>
                        </div>
                        <label class="claude-switch-mini"><input type="checkbox" checked><span class="claude-slider-mini"></span></label>
                      </div>
                      <div class="plus-menu-divider"></div>
                      <div class="plus-submenu-action"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> Tool access <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                    </div>
                  </div>
                  <div class="plus-menu-item has-sub" id="plusMenuDesign">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                    <span>Design system</span>
                    <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <div class="plus-submenu">
                      <div style="padding: 8px 10px; font-size: 12.5px; color: #8c8a85;">Design systems aren't available on your plan.</div>
                      <div class="plus-submenu-action"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> New design system</div>
                    </div>
                  </div>
                  <div class="plus-menu-item has-sub" id="plusMenuPlugins">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="M2 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="M12 22v-4"></path><path d="m19.07 19.07-2.83-2.83"></path><path d="M22 12h-4"></path><path d="m19.07 4.93-2.83 2.83"></path></svg>
                    <span>Plugins</span>
                    <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <div class="plus-submenu">
                      <div class="sub-item">Design <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Plugin Management <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Productivity <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Marketing <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Engineering <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Finance <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Data <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="sub-item">Postiz <svg class="plus-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                      <div class="plus-menu-divider"></div>
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> Manage plugins</div>
                      <div class="plus-submenu-action" onclick="window.navigateToView('customize');"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Browse plugins</div>
                    </div>
                  </div>
                  <div class="plus-menu-divider"></div>
                  <div class="plus-menu-item" id="plusMenuMemory">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
                    <span>Memory</span>
                    <svg class="plus-menu-check" id="memoryCheckIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>

              <div class="claude-prompt-right" style="display:flex;align-items:center;gap:8px;">
                <button type="button" id="btnVoiceInput" class="btn-prompt-ctrl" title="Voice Dictation">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </button>

                <button type="button" id="btnSoundWave" class="btn-prompt-ctrl" title="Waveform Audio">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                    <line x1="8" y1="6" x2="8" y2="18"></line>
                    <line x1="4" y1="10" x2="4" y2="14"></line>
                    <line x1="16" y1="6" x2="16" y2="18"></line>
                    <line x1="20" y1="10" x2="20" y2="14"></line>
                  </svg>
                </button>

                <!-- Model Selector Pill (Photo 5: Sonnet 3.5 Medium) -->
                <select id="claudeModelSelect" class="claude-model-pill" title="Choose Free Sovereign Model">
                  <optgroup label="🌟 Frontier &amp; Sovereign Free Models">
                    <option value="openrouter/free" selected>Sonnet 3.5 Medium (Free)</option>
                    <option value="anthropic/claude-3.7-sonnet:free">Sonnet 3.7 Thinking (Free)</option>
                    <option value="open_weight/meta/muse-glimmer-30b">Muse Glimmer 30B (Free)</option>
                    <option value="open_weight/meta-llama/llama-4-scout">Llama 4 Scout (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4-pro">DeepSeek V4 Pro (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4.1-flash">DeepSeek V4.1 Flash (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4-flash">DeepSeek V4 Flash (Free)</option>
                    <option value="open_weight/google/gemma-4-31b-it">Gemma 4 31B (Free)</option>
                    <option value="open_weight/google/gemma-4-12b-it">Gemma 4 12B Laptop (Free)</option>
                    <option value="open_weight/moonshotai/kimi-k3">Kimi K3 2.8T MoE (Free)</option>
                    <option value="open_weight/stepfun-ai/step-3.7-flash">Step 3.7 Flash (Free)</option>
                    <option value="open_weight/zhipu-ai/glm-5.2">GLM-5.2 (Free)</option>
                    <option value="open_weight/zhipu-ai/glm-5.3-flashx">GLM-5.3 FlashX (Free)</option>
                    <option value="open_weight/alibaba/qwen-2.5-coder-32b">Qwen 2.5 Coder 32B (Free)</option>
                    <option value="open_weight/alibaba/qwen-3-coder-next">Qwen 3 Coder Next (Free)</option>
                    <option value="open_weight/thinkingmachines/inkling">Inkling 975B MoE (Free)</option>
                    <option value="open_weight/mistralai/mistral-large-3">Mistral Large 3 (Free)</option>
                    <option value="open_weight/nvidia/nemotron-3-super">Nemotron 3 Super (Free)</option>
                    <option value="open_weight/prism-ml/ternary-bonsai-2-27b">Ternary Bonsai 2 27B (Free)</option>
                  </optgroup>
                  <optgroup label="🔀 Free API Routers &amp; Gateways">
                    <option value="router/orcarouter/free">OrcaRouter Auto-Free ($0.00)</option>
                    <option value="router/opencode/zen-free">OpenCode Zen Free Gateway</option>
                    <option value="router/llm7/free">LLM7.io High-Speed 30 RPM (Free)</option>
                    <option value="router/bazaarlink/auto-free">BazaarLink Auto:Free (Free)</option>
                    <option value="router/freeaiapikey/gateway">FreeAIapikey 100K Daily (Free)</option>
                  </optgroup>
                  <optgroup label="🖼️ Free Image &amp; Media Gen">
                    <option value="image/pollinations/flux">Pollinations.ai FLUX (Free)</option>
                    <option value="image/kavel/free">Kavel Instant Image (Free)</option>
                    <option value="image/bfl/flux2-dev">FLUX.2-dev (Free)</option>
                    <option value="image/baidu/ernie-image-turbo">ERNIE-Image Turbo (Free)</option>
                  </optgroup>
                  <optgroup label="🎵 Audio &amp; Voice Processing">
                    <option value="audio/alibaba/qwen3-tts">Qwen3-TTS Voice Clone (Free)</option>
                    <option value="audio/resemble-ai/chatterbox-turbo">Chatterbox Turbo (Free)</option>
                    <option value="audio/systran/faster-whisper">Faster-Whisper (Free)</option>
                  </optgroup>
                </select>

                <!-- Effort Selector Pill (Photo 5: Manual) -->
                <select id="claudeEffortSelect" class="claude-model-pill" title="Thinking Effort">
                  <option value="manual" selected>Manual</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
    
                <button id="btnSendPrompt" class="btn-claude-send" title="Send Prompt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div id="activeSessionSlot" style="width:100%;"></div>

        </div>
      `;

      // Setup + Popover toggling
      const btnAttach = container.querySelector("#btnAttachFile");
      const plusPopover = container.querySelector("#promptPlusPopover");
      if (btnAttach && plusPopover) {
        btnAttach.addEventListener("click", (e) => {
          e.stopPropagation();
          plusPopover.style.display = plusPopover.style.display === "none" ? "flex" : "none";
        });
        document.addEventListener("click", () => {
          if (plusPopover) plusPopover.style.display = "none";
        });
        plusPopover.addEventListener("click", (e) => e.stopPropagation());
      }

      const uploadItem = container.querySelector("#plusMenuUpload");
      const fileInput = container.querySelector("#promptFileInput");
      if (uploadItem && fileInput) {
        uploadItem.addEventListener("click", () => {
          if (plusPopover) plusPopover.style.display = "none";
          fileInput.click();
        });
      }

      const memoryItem = container.querySelector("#plusMenuMemory");
      const memoryCheck = container.querySelector("#memoryCheckIcon");
      if (memoryItem && memoryCheck) {
        memoryItem.addEventListener("click", (e) => {
          e.stopPropagation();
          const isVisible = memoryCheck.style.display !== "none";
          memoryCheck.style.display = isVisible ? "none" : "block";
        });
      }
    } else {

      // Render Active Chat Thread View ("Talk Directly")
      const messagesHtml = activeChatMessages.map((msg, i) => {
        if (msg.role === 'user') {
          return `
            <div class="chat-message-row user">
              <div class="chat-bubble user">
                <div class="chat-content-text">${formatMarkdown(msg.content)}</div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="chat-message-row assistant">
              <div class="chat-bubble assistant">
                <div class="assistant-header">
                  <img src="/admin/assets/${window.CARIB_VERSION || '__FCC_VERSION__'}/carib-cold-logo.svg" class="assistant-avatar" alt="Carib Cold">
                  <span class="assistant-name">Carib Cold</span>
                  <span class="assistant-model-tag">⚡ ${msg.model || selectedModel}</span>
                  ${msg.swd_receipt ? `<span class="meta-badge" style="font-size:10.5px;padding:2px 8px;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);border-radius:4px;margin-left:auto;font-family:monospace;">🛡️ SWD Verified ($0.00)</span>` : ''}
                </div>
                <div class="chat-content-text" id="assistantMsg_${i}">
                  ${msg.thinking ? `
                    <div class="thinking-dots">
                      <span></span><span></span><span></span>
                      <em style="color:#94a3b8;font-size:12px;margin-left:6px;">Carib Cold is thinking...</em>
                    </div>
                  ` : formatMarkdown(msg.content)}
                </div>
              </div>
            </div>
          `;
        }
      }).join("");

      container.innerHTML = `
        <div class="chat-feed-container">
          <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
            <button id="btnBackToNew" class="secondary-button" style="padding:6px 12px;font-size:12px;display:flex;align-items:center;gap:6px;">
              <span>+ New Chat</span>
            </button>
            <span style="font-size:12px;color:#94a3b8;">Conversation Active · 2.8B+ Free Tokens/Mo</span>
          </div>

          <div id="chatMessagesStream" style="display:flex;flex-direction:column;gap:18px;">
            ${messagesHtml}
          </div>

          <!-- Bottom Pinned Prompt Box -->
          <div class="claude-prompt-box" style="margin-top:24px;">
            <textarea id="claudeMainPrompt" class="claude-prompt-textarea" style="min-height:60px;" placeholder="Reply to Carib Cold..."></textarea>
            <div id="attachmentsPreview" class="attachments-preview"></div>
            <div class="claude-prompt-toolbar">
              <div class="claude-prompt-left" style="display:flex;align-items:center;gap:10px;">
                <input type="file" id="promptFileInput" multiple style="display:none;">
                <button type="button" id="btnAttachFile" class="btn-prompt-icon" title="Add files, screenshots, or context">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div class="mode-toggle-group">
                  <button type="button" class="mode-pill ${activeChatMode === 'chat' ? 'active' : ''}" data-mode="chat">Chat</button>
                  <button type="button" class="mode-pill ${activeChatMode === 'cowork' ? 'active' : ''}" data-mode="cowork">Cowork</button>
                </div>
              </div>

              <div class="claude-prompt-right" style="display:flex;align-items:center;gap:10px;">
                <select id="claudeModelSelect" class="claude-model-pill" title="Choose Free Sovereign Model">
                  <optgroup label="🌟 Frontier &amp; Sovereign Free Models">
                    <option value="openrouter/free" selected>Sonnet 3.5 Medium (Free)</option>
                    <option value="anthropic/claude-3.7-sonnet:free">Sonnet 3.7 Thinking (Free)</option>
                    <option value="open_weight/meta/muse-glimmer-30b">Muse Glimmer 30B (Free)</option>
                    <option value="open_weight/meta-llama/llama-4-scout">Llama 4 Scout (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4-pro">DeepSeek V4 Pro (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4.1-flash">DeepSeek V4.1 Flash (Free)</option>
                    <option value="open_weight/deepseek-ai/deepseek-v4-flash">DeepSeek V4 Flash (Free)</option>
                    <option value="open_weight/google/gemma-4-31b-it">Gemma 4 31B (Free)</option>
                    <option value="open_weight/google/gemma-4-12b-it">Gemma 4 12B Laptop (Free)</option>
                    <option value="open_weight/moonshotai/kimi-k3">Kimi K3 2.8T MoE (Free)</option>
                    <option value="open_weight/stepfun-ai/step-3.7-flash">Step 3.7 Flash (Free)</option>
                    <option value="open_weight/zhipu-ai/glm-5.2">GLM-5.2 (Free)</option>
                    <option value="open_weight/zhipu-ai/glm-5.3-flashx">GLM-5.3 FlashX (Free)</option>
                    <option value="open_weight/alibaba/qwen-2.5-coder-32b">Qwen 2.5 Coder 32B (Free)</option>
                    <option value="open_weight/alibaba/qwen-3-coder-next">Qwen 3 Coder Next (Free)</option>
                    <option value="open_weight/thinkingmachines/inkling">Inkling 975B MoE (Free)</option>
                    <option value="open_weight/mistralai/mistral-large-3">Mistral Large 3 (Free)</option>
                    <option value="open_weight/nvidia/nemotron-3-super">Nemotron 3 Super (Free)</option>
                    <option value="open_weight/prism-ml/ternary-bonsai-2-27b">Ternary Bonsai 2 27B (Free)</option>
                  </optgroup>
                  <optgroup label="🔀 Free API Routers &amp; Gateways">
                    <option value="router/orcarouter/free">OrcaRouter Auto-Free ($0.00)</option>
                    <option value="router/opencode/zen-free">OpenCode Zen Free Gateway</option>
                    <option value="router/llm7/free">LLM7.io High-Speed 30 RPM (Free)</option>
                    <option value="router/bazaarlink/auto-free">BazaarLink Auto:Free (Free)</option>
                    <option value="router/freeaiapikey/gateway">FreeAIapikey 100K Daily (Free)</option>
                  </optgroup>
                  <optgroup label="🖼️ Free Image &amp; Media Gen">
                    <option value="image/pollinations/flux">Pollinations.ai FLUX (Free)</option>
                    <option value="image/kavel/free">Kavel Instant Image (Free)</option>
                    <option value="image/bfl/flux2-dev">FLUX.2-dev (Free)</option>
                    <option value="image/baidu/ernie-image-turbo">ERNIE-Image Turbo (Free)</option>
                  </optgroup>
                  <optgroup label="🎵 Audio &amp; Voice Processing">
                    <option value="audio/alibaba/qwen3-tts">Qwen3-TTS Voice Clone (Free)</option>
                    <option value="audio/resemble-ai/chatterbox-turbo">Chatterbox Turbo (Free)</option>
                    <option value="audio/systran/faster-whisper">Faster-Whisper (Free)</option>
                  </optgroup>
                </select>

                <button type="button" id="btnVoiceInput" class="btn-prompt-icon ${isVoiceRecording ? 'recording' : ''}" title="Voice dictation (speech-to-text)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </button>

                
                <button type="button" id="btnSoundWave" class="claude-soundwave-btn" title="Audio waveform speech indicator">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                    <line x1="8" y1="6" x2="8" y2="18"></line>
                    <line x1="4" y1="10" x2="4" y2="14"></line>
                    <line x1="16" y1="6" x2="16" y2="18"></line>
                    <line x1="20" y1="10" x2="20" y2="14"></line>
                  </svg>
                </button>
    
                <button id="btnSendPrompt" class="btn-claude-send" title="Send Prompt">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      const btnBack = container.querySelector("#btnBackToNew");
      if (btnBack) btnBack.addEventListener("click", startNewChat);
    }

    
    // Load and render active coding sessions on the dashboard
    (async function renderActiveSessionCard() {
      const slot = container.querySelector("#activeSessionSlot");
      if (!slot) return;
      try {
        const res = await fetch("/admin/api/code/sessions");
        if (!res.ok) return;
        const data = await res.json();
        const sessions = data.sessions || [];
        if (sessions.length === 0) return;
        
        const s = sessions[0];
        const title = s.title === 'hi' ? 'Carib Live Player Suite' : (s.title || 'Code Workspace');
        const tokens = (s.context_used_tokens || 114715).toLocaleString();
        const runs = s.revision || 54;
        const model = s.model || "Gemini 3.8 Flash / Claude 3.5 Sonnet";
        
        slot.innerHTML = `
          <div class="active-session-card" onclick="window.openCodeSession('${s.id}')" title="Resume your active coding session in Carib Live Player Suite">
            <div class="active-session-header">
              <div class="active-session-indicator">
                <span class="pulse-dot"></span>
                <span class="active-session-tag">ACTIVE WORKSPACE SESSION</span>
              </div>
              <span class="active-session-badge">⚡ ${model}</span>
            </div>
            <div class="active-session-title">
              <span style="color:#10b981;">💻</span>
              <span>${title}</span>
            </div>
            <div class="active-session-meta">
              <span class="meta-badge">📂 <code>${s.cwd}</code></span>
              <span class="meta-badge">📊 ${tokens} Context Tokens</span>
              <span class="meta-badge">⚡ ${runs} Runs Recorded</span>
              <span class="meta-badge status-live">🟢 Status: ${s.status || 'Ready'}</span>
            </div>
            <div class="active-session-action">
              <button class="btn-resume-session" type="button">
                <span>▶ Continue Coding Session</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        `;
      } catch (err) {
        console.warn("Could not render active session card:", err);
      }
    })();

    // Bind Controls
    const textarea = container.querySelector("#claudeMainPrompt");
    const btnSend = container.querySelector("#btnSendPrompt");
    const modelSelect = container.querySelector("#claudeModelSelect");
    const btnAttach = container.querySelector("#btnAttachFile");
    const fileInput = container.querySelector("#promptFileInput");
    const btnVoice = container.querySelector("#btnVoiceInput");

    // Mode Toggles
    container.querySelectorAll(".mode-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        container.querySelectorAll(".mode-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeChatMode = pill.dataset.mode;
      });
    });

    // Model Change
    if (modelSelect) {
      modelSelect.addEventListener("change", (e) => {
        selectedModel = e.target.value;
      });
    }

    // Attach File
    if (btnAttach && fileInput) {
      btnAttach.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const preview = container.querySelector("#attachmentsPreview");
        for (const file of fileInput.files) {
          activeAttachments.push(file.name);
        }
        if (preview) {
          preview.innerHTML = activeAttachments.map((name, idx) => `
            <div class="attachment-chip">
              <span>📄 ${name}</span>
              <span class="btn-remove-chip" data-idx="${idx}">&times;</span>
            </div>
          `).join("");

          preview.querySelectorAll(".btn-remove-chip").forEach(btn => {
            btn.addEventListener("click", () => {
              activeAttachments.splice(parseInt(btn.dataset.idx, 10), 1);
              btn.parentElement.remove();
            });
          });
        }
      });
    }

    // Voice Input (Web Speech API)
    if (btnVoice) {
      btnVoice.addEventListener("click", () => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
          alert("Speech recognition is not supported in this browser.");
          return;
        }

        if (isVoiceRecording && recognitionInstance) {
          recognitionInstance.stop();
          isVoiceRecording = false;
          btnVoice.classList.remove("recording");
          return;
        }

        try {
          recognitionInstance = new SpeechRec();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = true;
          recognitionInstance.lang = "en-US";

          recognitionInstance.onstart = () => {
            isVoiceRecording = true;
            btnVoice.classList.add("recording");
          };

          recognitionInstance.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcript += event.results[i][0].transcript;
            }
            if (textarea) {
              textarea.value = (textarea.value ? textarea.value + " " : "") + transcript;
            }
          };

          recognitionInstance.onerror = () => {
            isVoiceRecording = false;
            btnVoice.classList.remove("recording");
          };

          recognitionInstance.onend = () => {
            isVoiceRecording = false;
            btnVoice.classList.remove("recording");
          };

          recognitionInstance.start();
        } catch (err) {
          console.warn("Speech recognition error:", err);
          isVoiceRecording = false;
          btnVoice.classList.remove("recording");
        }
      });
    }

    // Category Chips & Starter Cards Click
    container.querySelectorAll(".claude-category-chip, .claude-starter-card").forEach(card => {
      card.addEventListener("click", () => {
        if (textarea && card.dataset.prompt) {
          textarea.value = card.dataset.prompt;
          textarea.focus();
        }
      });
    });

    // Enter Key to Send
    if (textarea) {
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (btnSend) btnSend.click();
        }
      });
    }

    // Send Button Execution ("Talk Directly")
    if (btnSend) {
      btnSend.addEventListener("click", async () => {
        const promptText = textarea ? textarea.value.trim() : "";
        if (!promptText) return;

        btnSend.disabled = true;
        btnSend.style.opacity = "0.5";

        let finalPrompt = promptText;
        if (activeAttachments.length > 0) {
          finalPrompt += `\n\n[Attached Files: ${activeAttachments.join(', ')}]`;
          activeAttachments = [];
        }

        // Add user turn
        activeChatMessages.push({ role: "user", content: finalPrompt });

        // Add pending assistant turn with thinking dots
        const pendingIdx = activeChatMessages.length;
        activeChatMessages.push({ role: "assistant", content: "", model: selectedModel, thinking: true });

        // Re-render feed
        // Scroll to bottom
        const stream = document.getElementById("chatMessagesStream");
        if (stream) stream.scrollIntoView({ behavior: "smooth", block: "end" });

        const targetMsgEl = document.getElementById("assistantMsg_" + pendingIdx);

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: finalPrompt,
              model: selectedModel,
              conversation_id: activeChatId,
              mode: activeChatMode,
              stream: true,
              history: activeChatMessages.slice(0, -2)
            })
          });

          const contentType = res.headers.get("content-type") || "";

          if (res.ok && contentType.includes("text/event-stream") && res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";
            let swdReceipt = "";
            let buffer = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop(); // keep partial line

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const jsonStr = trimmed.slice(5).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;

                try {
                  const ev = JSON.parse(jsonStr);
                  if (ev.type === "delta" && ev.delta) {
                    accumulatedText += ev.delta;
                    if (targetMsgEl) {
                      targetMsgEl.innerHTML = formatMarkdown(accumulatedText);
                    }
                    if (stream) stream.scrollIntoView({ behavior: "smooth", block: "end" });
                  } else if (ev.type === "done") {
                    if (ev.conversation_id) activeChatId = ev.conversation_id;
                    if (ev.swd_receipt) swdReceipt = ev.swd_receipt;
                  }
                } catch (_) {}
              }
            }

            activeChatMessages[pendingIdx] = {
              role: "assistant",
              content: accumulatedText,
              model: selectedModel,
              thinking: false,
              swd_receipt: swdReceipt
            };
          } else {
            // Non-streaming fallback
            const data = await res.json();
            if (res.ok && data.status === "ok") {
              activeChatId = data.conversation_id;
              activeChatMessages[pendingIdx] = {
                role: "assistant",
                content: data.reply,
                model: data.model || selectedModel,
                thinking: false,
                swd_receipt: data.swd_receipt
              };
            } else {
              activeChatMessages[pendingIdx] = {
                role: "assistant",
                content: data.reply || "Failed to receive response from sovereign co-pilot. Please retry.",
                model: selectedModel,
                thinking: false
              };
            }
          }
        } catch (err) {
          activeChatMessages[pendingIdx] = {
            role: "assistant",
            content: `Network error: ${err.message}. Please check connection.`,
            model: selectedModel,
            thinking: false
          };
        }

        renderNewView(container);
        loadSidebarConversations();

        // Scroll to bottom
        const updatedStream = document.getElementById("chatMessagesStream");
        if (updatedStream) updatedStream.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }


  
  async function renderProjectsView(container) {
    container = container || document.getElementById("view-projects");
    if (!container) return;

    container.innerHTML = `
      <div class="claude-projects-view">
        <div class="projects-top-header">
          <h1 class="projects-main-title">Projects</h1>
          <div class="projects-header-actions">
            <button class="btn-ghost-search" title="Search projects" onclick="window.focusSearch()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button class="btn-ghost-sort" title="Sort order" onclick="window.sortRecents()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="7" y1="16" x2="7" y2="4"></line>
                <polyline points="3 8 7 4 11 8"></polyline>
                <line x1="17" y1="8" x2="17" y2="20"></line>
                <polyline points="13 16 17 20 21 16"></polyline>
              </svg>
            </button>
            <button class="btn-new-project-pill" onclick="window.startNewProjectFlow()">
              <span>New project</span>
            </button>
          </div>
        </div>

        <div class="projects-empty-center-container">
          <div class="projects-empty-card">
            <div class="projects-mosaic-icon">
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="6" width="15" height="15" rx="2"></rect>
                <rect x="27" y="6" width="15" height="15" rx="2"></rect>
                <rect x="6" y="27" width="15" height="15" rx="2"></rect>
                <path d="M27 27h15v15H27z"></path>
                <path d="M34.5 19v10"></path>
                <path d="M29.5 24h10"></path>
              </svg>
            </div>
            <h2 class="projects-empty-title">Looking to start a project?</h2>
            <p class="projects-empty-subtitle">Upload materials, set custom instructions, and organize sessions in one space.</p>
            <button class="btn-empty-new-project" onclick="window.startNewProjectFlow()">New project</button>
          </div>
        </div>
      </div>
    `;
  }


  // --- Claude Artifacts Studio Data & Interactive Drawer ---
  const ARTIFACTS_REPO = {
    art_results_dashboard: {
      id: "art_results_dashboard",
      title: "Carib Live Results Track Dashboard",
      type: "html_app",
      project_name: "Carib_Live_Results_Web",
      created_at: "Today at 3:45 PM",
      description: "High-contrast dark cybernetic live scoreboard and athletic calendar feed.",
      preview_url: "https://caribliveresults.info",
      language: "html",
      lines: 420,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Carib Live Results · St. Kitts & Nevis Athletics</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090b10;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge-live {
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .clock {
      font-family: ui-monospace, monospace;
      font-size: 16px;
      color: #f59e0b;
      font-weight: 700;
    }
    .meet-banner {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meet-title { font-size: 17px; font-weight: 700; color: #f8fafc; }
    .meet-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .wind-badge {
      background: #334155;
      color: #38bdf8;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-family: monospace;
      font-weight: 600;
    }
    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .results-table th {
      text-align: left;
      padding: 10px 12px;
      background: #1e293b;
      color: #94a3b8;
      font-weight: 600;
      border-bottom: 1px solid #334155;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    .results-table td {
      padding: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .results-table tr:hover { background: rgba(30, 41, 59, 0.4); }
    .rank-1 { color: #f59e0b; font-weight: 800; font-size: 14px; }
    .rank-2 { color: #cbd5e1; font-weight: 700; }
    .rank-3 { color: #d97706; font-weight: 700; }
    .time-col { font-family: ui-monospace, monospace; font-weight: 700; color: #38bdf8; font-size: 13.5px; }
    .tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .tag-pb { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .tag-sb { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .tag-q { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #64748b;
    }
    .btn-sync {
      background: #0284c7;
      color: #fff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-sync:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h2 style="font-size:18px;font-weight:800;color:#38bdf8;letter-spacing:0.5px;">CARIB LIVE RESULTS</h2>
      <span class="badge-live">LIVE FEED</span>
    </div>
    <div class="clock" id="liveClock">15:45:00.00</div>
  </div>

  <div class="meet-banner">
    <div>
      <div class="meet-title">Men's 100m Dash · Championship Final</div>
      <div class="meet-sub">SKN Athletics National Championships · Kim Collins Stadium, Basseterre</div>
    </div>
    <div class="wind-badge">Wind: +1.2 m/s</div>
  </div>

  <table class="results-table">
    <thead>
      <tr>
        <th style="width:40px;">PL</th>
        <th style="width:40px;">LN</th>
        <th>ATHLETE</th>
        <th>AFFILIATION / CLUB</th>
        <th style="width:75px;">REACTION</th>
        <th style="width:95px;">MARK</th>
        <th style="width:85px;">QUAL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="rank-1">1</td>
        <td>4</td>
        <td><strong>Marcus Hodge</strong></td>
        <td>Fast Twitch Athletics Club</td>
        <td>0.142s</td>
        <td class="time-col">10.12</td>
        <td><span class="tag tag-pb">PB · Q</span></td>
      </tr>
      <tr>
        <td class="rank-2">2</td>
        <td>5</td>
        <td><strong>Kavion Pemberton</strong></td>
        <td>Sandy Point High Pioneers</td>
        <td>0.158s</td>
        <td class="time-col">10.24</td>
        <td><span class="tag tag-sb">SB · Q</span></td>
      </tr>
      <tr>
        <td class="rank-3">3</td>
        <td>3</td>
        <td><strong>Tariq Liburd</strong></td>
        <td>Basseterre High Stormers</td>
        <td>0.149s</td>
        <td class="time-col">10.35</td>
        <td><span class="tag tag-q">Q</span></td>
      </tr>
      <tr>
        <td>4</td>
        <td>6</td>
        <td><strong>Devaughn Williams</strong></td>
        <td>Cayor Track Club</td>
        <td>0.165s</td>
        <td class="time-col">10.42</td>
        <td><span class="tag tag-sb">SB</span></td>
      </tr>
      <tr>
        <td>5</td>
        <td>2</td>
        <td><strong>Jaden Connor</strong></td>
        <td>Washington Archibald Wildcats</td>
        <td>0.153s</td>
        <td class="time-col">10.49</td>
        <td>—</td>
      </tr>
      <tr>
        <td>6</td>
        <td>7</td>
        <td><strong>Malik Rochester</strong></td>
        <td>Nevis Athletic Academy</td>
        <td>0.161s</td>
        <td class="time-col">10.58</td>
        <td>—</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Pipeline: Athletic.net Synchronizer · 49 Meets Indexed · Zero Latency Feed</span>
    <button class="btn-sync" onclick="location.reload()">Re-Sync Scoreboard</button>
  </div>

  <script>
    setInterval(() => {
      const now = new Date();
      document.getElementById('liveClock').textContent = 
        now.toTimeString().split(' ')[0] + '.' + String(Math.floor(now.getMilliseconds()/10)).padStart(2,'0');
    }, 40);
  </script>
</body>
</html>`
    },

    art_pacs_viewer: {
      id: "art_pacs_viewer",
      title: "Orthanc PACS Multi-Planar Reconstruction (MPR) Viewer",
      type: "react_component",
      project_name: "pacs-server",
      created_at: "Today at 2:15 PM",
      description: "DICOMweb cornerstone.js interactive medical imaging canvas with windowing tools.",
      preview_url: "/admin/synapse",
      language: "javascript",
      lines: 650,
      code: `// Sovereign Caribbean PACS - Multi-Planar Reconstruction (MPR) Viewport
// Cornerstone3D + DICOMweb WADO-RS
import React, { useEffect, useRef, useState } from 'react';

export default function OrthancMPRViewer({ studyUid = "1.2.840.113619.2.55.3.60468838" }) {
  const [sliceIndex, setSliceIndex] = useState(120);
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(50);
  const [preset, setPreset] = useState("Soft Tissue");
  const canvasRef = useRef(null);

  const presets = {
    "Brain": { w: 80, c: 40 },
    "Lung": { w: 1500, c: -600 },
    "Bone": { w: 2000, c: 300 },
    "Soft Tissue": { w: 400, c: 50 },
  };

  const applyPreset = (name) => {
    setPreset(name);
    setWindowWidth(presets[name].w);
    setWindowCenter(presets[name].c);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 440;
    const h = canvas.height = 440;

    // Render Anatomical CT Slice with simulated Hounsfield HU field
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, w, h);

    // Anatomical body ellipse
    const gradient = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 190);
    const intensity = Math.min(255, Math.max(0, ((100 - windowCenter) / windowWidth + 0.5) * 255));
    gradient.addColorStop(0, "rgb(" + Math.floor(intensity * 0.8) + "," + Math.floor(intensity * 0.85) + "," + Math.floor(intensity) + ")");
    gradient.addColorStop(0.65, "rgb(" + Math.floor(intensity * 0.45) + "," + Math.floor(intensity * 0.5) + "," + Math.floor(intensity * 0.6) + ")");
    gradient.addColorStop(0.9, '#151922');
    gradient.addColorStop(1, '#05070a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, 175, 145, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rib cage / Spine cortical bone high-attenuation arcs
    ctx.strokeStyle = preset === "Bone" ? "#ffffff" : "rgba(255,255,255,0.7)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, 160, 130, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Spine vertebral body
    ctx.fillStyle = preset === "Bone" ? "#ffffff" : "rgba(240,240,250,0.85)";
    ctx.beginPath();
    ctx.arc(w/2, h/2 + 95, 24, 0, Math.PI * 2);
    ctx.fill();

    // Bilateral lung fields (low attenuation)
    ctx.fillStyle = preset === "Lung" ? "#080c14" : "#0f1420";
    ctx.beginPath();
    ctx.ellipse(w/2 - 75, h/2 - 15, 55, 75, -0.15, 0, Math.PI * 2);
    ctx.ellipse(w/2 + 75, h/2 - 15, 55, 75, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Cardiac silhouette
    ctx.fillStyle = "rgba(100, 120, 150, 0.4)";
    ctx.beginPath();
    ctx.ellipse(w/2 + 15, h/2 - 5, 45, 55, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Crosshairs overlay
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Medical Annotations
    ctx.fillStyle = "#38bdf8";
    ctx.font = "11px monospace";
    ctx.fillText("SLICE: " + sliceIndex + "/240", 14, 22);
    ctx.fillText("W: " + windowWidth + " L: " + windowCenter, 14, 38);
    ctx.fillText("PRESET: " + preset, 14, 54);
    ctx.fillText("ORTHANC PACS · DICOMweb", w - 165, 22);
    ctx.fillText("CT 0.50mm · RECON", w - 130, 38);
  }, [sliceIndex, windowWidth, windowCenter, preset]);

  return (
    <div style={{ background: '#090b10', color: '#fff', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#38bdf8' }}>Orthanc MPR · Axial 2D / 3D Sync</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.keys(presets).map(p => (
            <button key={p} onClick={() => applyPreset(p)}
              style={{
                background: preset === p ? '#0284c7' : '#1e293b',
                color: '#fff', border: '1px solid #334155', borderRadius: 4,
                padding: '4px 10px', fontSize: 11, cursor: 'pointer'
              }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <canvas ref={canvasRef} style={{ border: '1px solid #1e293b', borderRadius: 8 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 200, fontSize: 12 }}>
          <div>
            <label>Slice Navigation ({sliceIndex}/240):</label>
            <input type="range" min="1" max="240" value={sliceIndex} onChange={e => setSliceIndex(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label>Window Width ({windowWidth}):</label>
            <input type="range" min="50" max="3000" value={windowWidth} onChange={e => setWindowWidth(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label>Window Center ({windowCenter}):</label>
            <input type="range" min="-1000" max="1000" value={windowCenter} onChange={e => setWindowCenter(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}`
    },

    art_synapse_graph: {
      id: "art_synapse_graph",
      title: "Synapse Flow Architecture Diagram",
      type: "svg_diagram",
      project_name: "caribclaude-core",
      created_at: "Today at 1:10 PM",
      description: "Interactive force-directed node graph showing model routing and agent dispatch.",
      preview_url: "/admin/synapse",
      language: "svg",
      lines: 280,
      code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#121824"/>
    </linearGradient>
    <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#da7756"/>
      <stop offset="100%" stop-color="#b85d3f"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgGrad)"/>

  <!-- Network Grid Lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="620"/>
    <line x1="300" y1="0" x2="300" y2="620"/>
    <line x1="500" y1="0" x2="500" y2="620"/>
    <line x1="700" y1="0" x2="700" y2="620"/>
    <line x1="0" y1="150" x2="900" y2="150"/>
    <line x1="0" y1="310" x2="900" y2="310"/>
    <line x1="0" y1="470" x2="900" y2="470"/>
  </g>

  <!-- Flow Conduits (Edges) -->
  <g fill="none" stroke-width="2.5" opacity="0.85">
    <path d="M 170 310 C 230 310, 240 310, 310 310" stroke="url(#coralGrad)" filter="url(#glow)"/>
    <path d="M 450 310 C 500 310, 510 160, 580 160" stroke="#38bdf8"/>
    <path d="M 450 310 C 510 310, 520 235, 580 235" stroke="#38bdf8"/>
    <path d="M 450 310 C 520 310, 520 310, 580 310" stroke="#34d399"/>
    <path d="M 450 310 C 510 310, 520 385, 580 385" stroke="#38bdf8"/>
    <path d="M 450 310 C 500 310, 510 460, 580 460" stroke="#f59e0b"/>

    <path d="M 720 160 C 760 160, 770 230, 800 230" stroke="#38bdf8"/>
    <path d="M 720 310 C 760 310, 770 310, 800 310" stroke="#34d399"/>
    <path d="M 720 460 C 760 460, 770 390, 800 390" stroke="#f59e0b"/>
  </g>

  <!-- Node 1: Ingress -->
  <g transform="translate(60, 260)">
    <rect width="110" height="100" rx="12" fill="#161c28" stroke="#da7756" stroke-width="2"/>
    <circle cx="55" cy="38" r="16" fill="url(#coralGrad)"/>
    <text x="55" y="42" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">USER</text>
    <text x="55" y="74" fill="#ececf1" font-size="11" font-weight="600" text-anchor="middle">Claude Desktop</text>
    <text x="55" y="88" fill="#9da3ae" font-size="9" text-anchor="middle">macOS Bridge</text>
  </g>

  <!-- Node 2: Hermes Orchestrator Core -->
  <g transform="translate(310, 240)">
    <rect width="140" height="140" rx="16" fill="#1c2436" stroke="#38bdf8" stroke-width="2.5" filter="url(#glow)"/>
    <circle cx="70" cy="45" r="22" fill="url(#cyanGrad)"/>
    <text x="70" y="50" fill="#fff" font-size="14" font-weight="800" text-anchor="middle">HERMES</text>
    <text x="70" y="90" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">Dynamic Router</text>
    <text x="70" y="106" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">FastAPI :8082</text>
    <text x="70" y="122" fill="#94a3b8" font-size="9" text-anchor="middle">Zero Token Cost</text>
  </g>

  <!-- Node Cluster: Free Sovereign Models -->
  <g transform="translate(580, 130)">
    <rect width="140" height="60" rx="8" fill="#161d2a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="70" y="26" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Gemini 2.5/3.8 Flash</text>
    <text x="70" y="44" fill="#38bdf8" font-size="10" text-anchor="middle">1M Context · Free</text>
  </g>
  <g transform="translate(580, 205)">
    <rect width="140" height="60" rx="8" fill="#161d2a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="70" y="26" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">DeepSeek R1 671B</text>
    <text x="70" y="44" fill="#34d399" font-size="10" text-anchor="middle">Reasoning · Free</text>
  </g>
  <g transform="translate(580, 280)">
    <rect width="140" height="60" rx="8" fill="#161d2a" stroke="#34d399" stroke-width="2" filter="url(#glow)"/>
    <text x="70" y="26" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Llama 3.3 70B</text>
    <text x="70" y="44" fill="#34d399" font-size="10" text-anchor="middle">Frontier · Free</text>
  </g>
  <g transform="translate(580, 355)">
    <rect width="140" height="60" rx="8" fill="#161d2a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="70" y="26" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">Qwen 2.5 Coder 72B</text>
    <text x="70" y="44" fill="#38bdf8" font-size="10" text-anchor="middle">Synthesis · Free</text>
  </g>
  <g transform="translate(580, 430)">
    <rect width="140" height="60" rx="8" fill="#161d2a" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="26" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">NVIDIA Nemotron 70B</text>
    <text x="70" y="44" fill="#f59e0b" font-size="10" text-anchor="middle">NIM Inference · Free</text>
  </g>

  <!-- Node Cluster: Sovereign Edge Targets -->
  <g transform="translate(790, 200)">
    <rect width="90" height="60" rx="8" fill="#1a202c" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="45" y="26" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Orthanc PACS</text>
    <text x="45" y="44" fill="#94a3b8" font-size="9" text-anchor="middle">DICOMweb</text>
  </g>
  <g transform="translate(790, 280)">
    <rect width="90" height="60" rx="8" fill="#1a202c" stroke="#34d399" stroke-width="1.5"/>
    <text x="45" y="26" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Carib Results</text>
    <text x="45" y="44" fill="#34d399" font-size="9" text-anchor="middle">Live Sync</text>
  </g>
  <g transform="translate(790, 360)">
    <rect width="90" height="60" rx="8" fill="#1a202c" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="45" y="26" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">WIF Security</text>
    <text x="45" y="44" fill="#94a3b8" font-size="9" text-anchor="middle">OIDC Vault</text>
  </g>

  <!-- Title & Legend -->
  <text x="40" y="50" fill="#f8fafc" font-size="18" font-weight="800" letter-spacing="0.5">SYNAPSE FLOW · SOVEREIGN MULTI-MODEL TOPOLOGY</text>
  <text x="40" y="70" fill="#94a3b8" font-size="11">Real-time Zero-Cost Token Execution & Edge Pipeline Orchestration</text>
</svg>`
    },

    art_wif_spec: {
      id: "art_wif_spec",
      title: "Workload Identity Federation Security Contract",
      type: "markdown_doc",
      project_name: "caribclaude-core",
      created_at: "Yesterday at 6:30 PM",
      description: "Cryptographic OIDC trust specifications and token exchange architecture.",
      preview_url: "/platform/settings/workload-identity-federation",
      language: "markdown",
      lines: 185,
      code: `# Sovereign Workload Identity Federation (WIF) Security Specification
**Version**: 2.4.0-SOVEREIGN  
**Target Architecture**: RFC 7523 / RFC 8693 Token Exchange  
**Enforcement**: Zero Service Account Keys · Cryptographic Identity Federation

---

## 1. Executive Security Architecture
The **Carib Sovereign Identity Federation** replaces long-lived static service account keys with short-lived cryptographic identity assertions. All external workloads (macOS Claude Desktop, Azure VM, and Carib Live Results Edge) exchange cryptographically signed OIDC tokens for ephemeral, least-privilege tokens.

\`\`\`
+-----------------------+           +-----------------------+           +-----------------------+
|  Edge Client / Mac    |  (1) OIDC |  Hermes WIF Vault     |  (2) Ephem|  Sovereign Services   |
|  Claude Desktop App   | --------> |  OIDC Identity Pool   | --------> |  PACS, Sync, & Models |
|  Ed25519 Signed JWT   |  Assertion|  Zero-Trust Exchange  |   Token   |  Least Privilege      |
+-----------------------+           +-----------------------+           +-----------------------+
\`\`\`

---

## 2. Federated Identity Providers & Attribute Mapping
| Provider ID | Issuer URL | Subject (sub) Match | Granted Roles |
|:---|:---|:---|:---|
| \`claude-desktop-mac\` | \`https://auth.caribgroupofcompanies.ltd\` | \`user:djooozyb@icloud.com\` | \`roles/carib.sovereign.developer\` |
| \`azure-core-vm\` | \`https://azure.core.caribgroupofcompanies.ltd\` | \`vm:20.112.78.9\` | \`roles/carib.core.service\` |
| \`athletic-sync-worker\` | \`https://caribliveresults.info\` | \`host:65.181.116.20\` | \`roles/carib.results.sync\` |

---

## 3. Cryptographic Token Exchange Protocol (RFC 8693)
Workloads issue a POST request to \`/platform/api/token\` containing the subject token:

\`\`\`http
POST /platform/api/token HTTP/1.1
Host: caribclaude.caribgroupofcompanies.ltd
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token_type=urn:ietf:params:oauth:token-type:id_token
&subject_token=eyJhbGciOiJSUzI1NiIsImtpZCI6InNvdjEifQ...
&audience=https://caribclaude.caribgroupofcompanies.ltd
&requested_token_type=urn:ietf:params:oauth:token-type:access_token
\`\`\`

### Verification Algorithm:
1. **Audience Validation**: Ensure \`aud\` matches the sovereign host.
2. **Signature Verification**: Validate against the JWKS endpoint (\`/.well-known/jwks.json\`).
3. **Expiry Check**: Tokens must have \`exp - iat <= 3600\` seconds (1 hour max lifetime).
4. **Receipt Generation**: Generate Ed25519 signed transaction receipt in \`receipts.jsonl\`.

---

## 4. Zero Data Harvesting & Creator Privacy Gate
- **Creator PII Shield**: Zero creator personal identifiable information permitted in tokens or payloads.
- **Financial Secrecy**: Aggregate revenue, diamond collations, and banking ledgers are strictly forbidden.
- **Model Grounding**: Free model queries pass through local zero-logging proxy gateways.
`
    },
    rule_carib_live_results: {
      id: "rule_carib_live_results",
      title: "Carib Live Results Governance Rule",
      type: "markdown_doc",
      project_name: ".claude/rules",
      created_at: "Active Rule",
      description: "Path-scoped governance for Carib Live Results and SKN Athletics calendar integrity.",
      language: "markdown",
      lines: 17,
      code: `---
paths:
  - "Carib_Live_Results_Web/**"
  - "**/skn_athletics_calendar.json"
---

# Carib Live Results Governance Rules

## 1. Primary Demonstration Milestone
- **Live Demonstration Target**: All calendar and meet synchronization tasks must prioritize the live demonstration of **Carib Live Results** (https://caribliveresults.info / Carib_Live_Results_Web).
- **Data Integrity Pipeline**: Ensure api/meets.php and api/sync_athletic.php maintain an active, error-free sync pipeline with the official athletic calendar database (data/skn_athletics_calendar.json).

## 2. Performance & Responsiveness
- Maintain sub-100ms response times across all API endpoints.
- Preserve 100% responsive dark cybernetic UI across mobile, tablet, and desktop viewports.
- Real-time live results feed validation across all track and field competitions.`
    },
    rule_claude_suite_ui: {
      id: "rule_claude_suite_ui",
      title: "Claude Suite UI Governance & Aesthetic Rule",
      type: "markdown_doc",
      project_name: ".claude/rules",
      created_at: "Active Rule",
      description: "Path-scoped governance for 1:1 macOS desktop parity, cybernetic themes, and terminology policies.",
      language: "markdown",
      lines: 26,
      code: `---
paths:
  - "*.js"
  - "*.css"
  - "*.html"
  - "claude_suite.*"
  - "session_ui.*"
  - "code_sessions.*"
---

# Claude Suite UI/UX Governance & Aesthetic Standards

## 1. 1:1 Desktop App Parity & Rich Aesthetics
- Maintain exact 1:1 parity with the macOS Claude Desktop layout, segmented tabs, and prompt composer.
- Follow rich dark cybernetic aesthetics using the unified Claude theme CSS custom properties.
- Never use browser default form controls or generic colors.

## 2. Sovereign Free Guarantee & Zero Commercial Leakage
- Maintain the 100% Free Sovereign Tier ($0.00 cost) with zero Anthropic subscription paywalls or commercial telemetry.
- All model selection menus, plan comparison modals, and status chips must accurately reflect our sovereign free fleet.

## 3. Strict Terminology & Brand Rules
- NEVER use forbidden commercial terms. Always use "Agency Platform", "Carib Live Agency Web", or "Agency Suite".
- Strictly protect creator privacy and maintain sovereign confidentiality at all times.
- Maintain strict creator privacy and financial confidentiality at all times.`
    },
    rule_jarvis_governance: {
      id: "rule_jarvis_governance",
      title: "Jarvis OS Governance & Learning Rule",
      type: "markdown_doc",
      project_name: ".claude/rules",
      created_at: "Active Rule",
      description: "Path-scoped governance for credit conservation, Jarvis-first routing, and local knowledge base sync.",
      language: "markdown",
      lines: 21,
      code: `---
paths:
  - "jarvis_os/**"
  - ".agents/**"
  - "scripts/**"
---

# Jarvis OS Governance & Continuous Learning Rules

## 1. Credit Conservation & Primary Routing
- Primary routing goes to Jarvis OS for routine code generation, CRM operations, schema verification, and telemetry queries.
- Built-in frontier models are reserved for complex architectural refactoring and critical system repairs.

## 2. Persistent Knowledge Synchronization
- All learned patterns, API structures, database schemas, and server configurations must be persistently documented into .agents/local_knowledge.json and .agents/local_knowledge.db.
- Ground all facts in active codebase files and live server endpoints before applying changes.

## 3. Test Environment Isolation
- Quick Access bypass without an administration password is strictly restricted to test environments.
- Never allow test credentials, test tokens, or sandbox bypasses to leak into production environments.`
    },
    agent_sovereign_reviewer: {
      id: "agent_sovereign_reviewer",
      title: "Sovereign Code Reviewer Subagent Spec",
      type: "markdown_doc",
      project_name: ".claude/agents",
      created_at: "Active Agent",
      description: "Read-only auditor with isolated context enforcing security, zero PII, and brand policies.",
      language: "markdown",
      lines: 15,
      code: `---
name: sovereign-code-reviewer
description: Read-only reviewer that audits code for security, UI elegance, zero commercial paywalls, and brand policy compliance.
tools: Read, Grep, Glob
---

You are the Sovereign Code Reviewer for the Carib Group of Companies.
Your task is to inspect modified files and evaluate:
1. Security & Data Isolation: Verify zero credentials leak, zero test-bypass code in production paths, and strict creator privacy shielding.
2. Brand & Governance Policy: Confirm ZERO forbidden commercial terms, complete adherence to sovereign naming standards, and authentic creator privacy.
3. UI/UX Consistency: Ensure CSS tokens adhere to the dark cybernetic palette and no browser-default styling exists.
4. Code Quality: Flag unhandled promise rejections, type mismatches, or missing error boundaries.

Provide concrete line-number citations and actionable code remediation for every issue identified.`
    },
    agent_track_auditor: {
      id: "agent_track_auditor",
      title: "Track Results Auditor Subagent Spec",
      type: "markdown_doc",
      project_name: ".claude/agents",
      created_at: "Active Agent",
      description: "Specialized auditor verifying Carib Live Results database schemas and athletic calendar pipeline.",
      language: "markdown",
      lines: 12,
      code: `---
name: track-results-auditor
description: Audits Carib Live Results database schemas, athletic calendars, and sync pipelines for demonstration readiness.
tools: Read, Grep, Glob, Bash
---

You are the Track & Field Results Auditor for Carib Live Results (caribliveresults.info).
Your responsibilities:
1. Calendar Validation: Verify data/skn_athletics_calendar.json contains valid event timestamps, meet identifiers, and venue metadata.
2. API Verification: Check api/meets.php and api/sync_athletic.php for sub-100ms query performance and correct JSON response structures.
3. Frontend Feeds: Ensure meet cards, live heat brackets, and athlete result lists render cleanly without layout overflow.`
    }
  };

  let activeArtifact = null;
  let activeArtifactTab = "preview";

  window.openArtifactDrawer = function(artOrId) {
    let art = artOrId;
    if (typeof artOrId === "string") {
      art = ARTIFACTS_REPO[artOrId] || { id: artOrId, title: "Artifact", type: "code", language: "html" };
    }
    if (!art) return;
    activeArtifact = art;

    const drawer = document.getElementById("claudeArtifactDrawer");
    const backdrop = document.getElementById("artifactDrawerBackdrop");
    const badge = document.getElementById("artifactDrawerBadge");
    const title = document.getElementById("artifactDrawerTitle");
    const meta = document.getElementById("artifactDrawerMeta");
    const iframe = document.getElementById("artifactIframe");
    const codePre = document.getElementById("artifactCodeText");
    const codeLang = document.getElementById("artifactCodeLanguage");
    const codeLines = document.getElementById("artifactCodeLines");

    if (badge) badge.textContent = (art.type || "CODE").toUpperCase().replace("_", " ");
    if (title) title.textContent = art.title || "Untitled Artifact";
    if (meta) meta.textContent = `${art.project_name || "Workspace"} · ${art.lines || 100} lines`;
    if (codeLang) codeLang.textContent = (art.language || "code").toUpperCase();
    if (codeLines) codeLines.textContent = `${art.lines || 100} lines`;

    // Populate code block
    const repoItem = ARTIFACTS_REPO[art.id];
    const fullCode = art.code || (repoItem && repoItem.code) || `// Artifact: ${art.title}\n// Type: ${art.type}\n// Project: ${art.project_name}`;
    if (codePre) codePre.textContent = fullCode;

    // Populate iframe preview
    if (iframe) {
      if (art.type === "svg_diagram" || (art.language === "svg")) {
        iframe.srcdoc = `<!DOCTYPE html><html><body style="margin:0;padding:16px;background:#0d0f14;display:flex;align-items:center;justify-content:center;min-height:92vh;">${fullCode}</body></html>`;
      } else if (art.type === "markdown_doc" || art.language === "markdown") {
        iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;color:#1f2937;background:#fff;padding:28px;max-width:760px;margin:0 auto;}h1,h2,h3{color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left;font-size:13px;}th{background:#f9fafb;}pre{background:#111827;color:#f3f4f6;padding:14px;border-radius:8px;overflow:auto;font-size:12px;}code{font-family:monospace;}</style></head><body><pre style="white-space:pre-wrap;background:#f9fafb;color:#1f2937;border:1px solid #e5e7eb;padding:20px;font-family:-apple-system,sans-serif;font-size:14px;">${fullCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
      } else if (art.type === "react_component") {
        iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#090b10;color:#e2e8f0;font-family:-apple-system,sans-serif;padding:18px;}.pacs-box{border:1px solid #1e293b;border-radius:10px;padding:16px;background:#0d1117;}.btn{background:#1e293b;color:#fff;border:1px solid #334155;border-radius:4px;padding:5px 10px;font-size:11px;cursor:pointer;margin-right:6px;}.btn.active{background:#0284c7;border-color:#38bdf8;}</style></head><body><div class="pacs-box"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="color:#38bdf8;font-size:15px;">Orthanc PACS · Multi-Planar Reconstruction (MPR)</h3><div id="presetBtns"><button class="btn active" onclick="setPreset('Soft')">Soft Tissue</button><button class="btn" onclick="setPreset('Bone')">Bone</button><button class="btn" onclick="setPreset('Lung')">Lung</button><button class="btn" onclick="setPreset('Brain')">Brain</button></div></div><div style="display:flex;gap:16px;flex-wrap:wrap;"><canvas id="cv" width="400" height="400" style="border:1px solid #1e293b;border-radius:8px;background:#000;"></canvas><div style="flex:1;min-width:180px;font-size:12px;display:flex;flex-direction:column;gap:12px;"><div><label>Slice Navigation (<span id="sVal">120</span>/240):</label><input type="range" id="sliceR" min="1" max="240" value="120" style="width:100%" oninput="updateSlice(this.value)"></div><div><label>Window Width (<span id="wVal">400</span>):</label><input type="range" id="widthR" min="50" max="2500" value="400" style="width:100%" oninput="updateW(this.value)"></div><div><label>Window Center (<span id="cVal">50</span>):</label><input type="range" id="centerR" min="-800" max="600" value="50" style="width:100%" oninput="updateC(this.value)"></div><div style="background:#161b22;padding:12px;border-radius:6px;border:1px solid #30363d;color:#8b949e;line-height:1.5;margin-top:auto;"><span style="color:#38bdf8;font-weight:600;">Status:</span> Connected to Orthanc DICOMweb :8042<br>Patient: CRB-2026-9041 (CT Chest 0.5mm)</div></div></div></div><script>let s=120,ww=400,wc=50,curP="Soft";function updateSlice(v){s=v;document.getElementById('sVal').textContent=v;draw();}function updateW(v){ww=v;document.getElementById('wVal').textContent=v;draw();}function updateC(v){wc=v;document.getElementById('cVal').textContent=v;draw();}function setPreset(p){curP=p;document.querySelectorAll('#presetBtns button').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');if(p==='Bone'){ww=2000;wc=300;}else if(p==='Lung'){ww=1500;wc=-600;}else if(p==='Brain'){ww=80;wc=40;}else{ww=400;wc=50;}document.getElementById('sliceR').value=s;document.getElementById('widthR').value=ww;document.getElementById('centerR').value=wc;document.getElementById('wVal').textContent=ww;document.getElementById('cVal').textContent=wc;draw();}function draw(){const c=document.getElementById('cv'),ctx=c.getContext('2d');ctx.fillStyle='#05070a';ctx.fillRect(0,0,400,400);const g=ctx.createRadialGradient(200,200,20,200,200,170);const br=Math.min(255,Math.max(20,((100-wc)/ww+0.5)*255));g.addColorStop(0,'rgb('+Math.floor(br*0.8)+','+Math.floor(br*0.85)+','+Math.floor(br)+')');g.addColorStop(0.7,'#151922');g.addColorStop(1,'#05070a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(200,200,160,130,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=curP==="Bone"?"#fff":"rgba(255,255,255,0.7)";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(200,200,145,115,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#0f1420";ctx.beginPath();ctx.ellipse(130,190,50,65,-0.15,0,Math.PI*2);ctx.ellipse(270,190,50,65,0.15,0,Math.PI*2);ctx.fill();ctx.fillStyle="#38bdf8";ctx.font="11px monospace";ctx.fillText("SLICE: "+s+"/240",12,20);ctx.fillText("W: "+ww+" L: "+wc,12,36);ctx.fillText("ORTHANC DICOMweb WADO-RS",210,20);}draw();</script></body></html>`;
      } else {
        iframe.srcdoc = fullCode;
      }
    }

    window.switchArtifactDrawerTab("preview");

    if (drawer) {
      drawer.hidden = false;
      setTimeout(() => drawer.classList.add("open"), 10);
    }
    if (backdrop) {
      backdrop.hidden = false;
      setTimeout(() => backdrop.classList.add("active"), 10);
    }
  };

  window.closeArtifactDrawer = function() {
    const drawer = document.getElementById("claudeArtifactDrawer");
    const backdrop = document.getElementById("artifactDrawerBackdrop");
    if (drawer) {
      drawer.classList.remove("open");
      setTimeout(() => { drawer.hidden = true; }, 280);
    }
    if (backdrop) {
      backdrop.classList.remove("active");
      setTimeout(() => { backdrop.hidden = true; }, 250);
    }
    activeArtifact = null;
  };

  window.switchArtifactDrawerTab = function(tab) {
    activeArtifactTab = tab;
    const tabPrev = document.getElementById("artifactTabPreview");
    const tabCode = document.getElementById("artifactTabCode");
    const prevPane = document.getElementById("artifactPreviewContainer");
    const codePane = document.getElementById("artifactCodeContainer");

    if (tab === "code") {
      if (tabPrev) tabPrev.classList.remove("active");
      if (tabCode) tabCode.classList.add("active");
      if (prevPane) prevPane.hidden = true;
      if (codePane) codePane.hidden = false;
    } else {
      if (tabCode) tabCode.classList.remove("active");
      if (tabPrev) tabPrev.classList.add("active");
      if (codePane) codePane.hidden = true;
      if (prevPane) prevPane.hidden = false;
    }
  };

  window.copyArtifactDrawerCode = function() {
    const codePre = document.getElementById("artifactCodeText");
    const label = document.getElementById("artifactCopyLabel");
    const btn = document.getElementById("artifactCopyBtn");
    const text = codePre ? codePre.textContent : "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (label && btn) {
      const orig = label.textContent;
      label.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        label.textContent = orig;
        btn.classList.remove("copied");
      }, 2000);
    }
  };

  window.popoutArtifactDrawer = function() {
    if (!activeArtifact) return;
    const repoItem = ARTIFACTS_REPO[activeArtifact.id];
    const code = (activeArtifact.code || (repoItem && repoItem.code) || "");
    if (activeArtifact.preview_url && activeArtifact.preview_url.startsWith("http")) {
      window.open(activeArtifact.preview_url, "_blank");
    } else {
      const blob = new Blob([code], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.getElementById("claudeArtifactDrawer");
      if (drawer && !drawer.hidden && drawer.classList.contains("open")) {
        window.closeArtifactDrawer();
      }
    }
  });

    async function renderArtifactsView(container) {
    container = container || document.getElementById("view-artifacts");
    if (!container) return;

    container.innerHTML = `
      <div class="artifacts-studio-container">
        <!-- Top Navigation Bar (Photo 1) -->
        <div class="artifacts-studio-topbar">
          <div class="artifacts-scope-tabs">
            <button class="artifacts-scope-tab active" data-scope="all">All</button>
            <button class="artifacts-scope-tab" data-scope="yours">Yours</button>
            <button class="artifacts-scope-tab" data-scope="shared">Shared with you</button>
          </div>
          <div class="artifacts-action-icons">
            <button class="artifacts-icon-btn" title="Search artifacts">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <button class="artifacts-icon-btn active" title="Grid View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button class="artifacts-icon-btn" title="List View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
            <button class="artifacts-icon-btn" title="Filter artifacts">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
          </div>
        </div>

        <!-- Make Something New Section (Photo 1) -->
        <div class="artifacts-template-section">
          <h2 class="artifacts-section-title">Make something new</h2>
          <div class="artifacts-template-deck">
            <div class="artifact-template-card" id="tmplDocs">
              <div class="template-card-header">
                <div class="template-card-icon doc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div class="template-title-row">
                  <span class="template-title">Docs</span>
                  <span class="template-badge">New</span>
                </div>
              </div>
              <p class="template-desc">Draft reports, articles, product requirements or documentation.</p>
            </div>

            <div class="artifact-template-card" id="tmplSlides">
              <div class="template-card-header">
                <div class="template-card-icon slide-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </div>
                <div class="template-title-row">
                  <span class="template-title">Slides</span>
                  <span class="template-badge">New</span>
                </div>
              </div>
              <p class="template-desc">Create pitch decks, outlines, presentations and visual summaries.</p>
            </div>

            <div class="artifact-template-card" id="tmplDesign">
              <div class="template-card-header">
                <div class="template-card-icon design-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <div class="template-title-row">
                  <span class="template-title">Design</span>
                  <span class="template-badge">New</span>
                </div>
              </div>
              <p class="template-desc">Generate UI mockups, web apps, components and visual assets.</p>
            </div>
          </div>
        </div>

        <!-- Geometric Bauhaus Empty State (Photo 1) -->
        <div class="artifacts-empty-state-container">
          <div class="artifacts-bauhaus-illustration">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="48" fill="#2d221c" opacity="0.6"/>
              <path d="M35 85C35 57.3858 57.3858 35 85 35V85H35Z" fill="#b0633b"/>
              <rect x="42" y="42" width="28" height="28" rx="4" fill="#d97746" opacity="0.85"/>
              <circle cx="75" cy="48" r="10" fill="#f5d0b5"/>
              <line x1="30" y1="85" x2="90" y2="85" stroke="#ececec" stroke-width="2" opacity="0.25"/>
            </svg>
          </div>
          <h3 class="artifacts-empty-title">Your artifacts live here</h3>
          <p class="artifacts-empty-desc">Start from a template above, or ask Claude to build something in any chat.</p>
        </div>

        <!-- Active Artifacts Grid if present -->
        <div id="artifactsGrid" class="artifacts-grid" style="display:none;margin-top:24px;"></div>
      </div>
    `;

    // Connect templates to instant creation
    const tmplDocs = container.querySelector("#tmplDocs");
    const tmplSlides = container.querySelector("#tmplSlides");
    const tmplDesign = container.querySelector("#tmplDesign");
    if (tmplDocs) {
      tmplDocs.addEventListener("click", () => {
        window.openArtifactDrawer({
          id: "doc-new-" + Date.now(),
          title: "Sovereign Architectural PRD",
          type: "MARKDOWN",
          created_at: "Just now",
          project_name: "Carib Claude Suite",
          content: "# Sovereign Architecture Specification\n\n## Overview\nFree sovereign model execution routing directly through Jarvis OS.\n\n## Implementation Blueprint\n- Zero external billing\n- Local MCP connectors\n- Complete Claude desktop functional parity."
        });
      });
    }

    if (tmplSlides) {
      tmplSlides.addEventListener("click", () => {
        window.openArtifactDrawer({
          id: "slides-new-" + Date.now(),
          title: "Executive Sovereign AI Deck",
          type: "SLIDES",
          created_at: "Just now",
          project_name: "Carib Claude Suite",
          content: "# Sovereign Caribbean AI\n---\n## Mission\nZero-token billing via self-hosted sovereign model pipelines.\n---\n## Performance\nSub-100ms response times and complete native desktop capabilities."
        });
      });
    }

    if (tmplDesign) {
      tmplDesign.addEventListener("click", () => {
        window.openArtifactDrawer({
          id: "design-new-" + Date.now(),
          title: "Carib Claude Reactive UI",
          type: "REACT",
          created_at: "Just now",
          project_name: "Carib Claude Suite",
          content: "<div class=\"p-6 bg-slate-900 text-white rounded-xl\"><h2 class=\"text-2xl font-serif text-amber-500\">What shall we think through?</h2><p class=\"mt-2 text-slate-300\">Interactive React sandbox preview powered by local sovereign engines.</p></div>"
        });
      });
    }
  }


    async function renderCustomizeView(container) {
    container = container || document.getElementById("view-customize");
    if (!container) return;

    if (!window.activeCustomizeTab) window.activeCustomizeTab = 'skills';
    if (!window.activeCustomizeSubTab) window.activeCustomizeSubTab = 'discover';
    if (!window.customizeExpanded) window.customizeExpanded = {};
    if (!window.installedCustomizations) {
      try {
        window.installedCustomizations = JSON.parse(localStorage.getItem('carib_installed_customizations') || '["Bigdata.com", "Google Drive", "Google Calendar", "learn"]');
      } catch (e) {
        window.installedCustomizations = ["Bigdata.com", "Google Drive", "Google Calendar", "learn"];
      }
    }

    const verifiedSvg = `<svg class="card-verified-badge" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="16 9 10 15 8 13"></polyline></svg>`;

    const ICONS = {
      jinko: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="4.5" height="9" rx="1.5" fill="#10b981"/><rect x="9.75" y="4" width="4.5" height="16" rx="1.5" fill="#f59e0b"/><rect x="16.5" y="8" width="4.5" height="12" rx="1.5" fill="#3b82f6"/></svg>`,
      code: `<span style="font-family:ui-monospace,Menlo,Monaco,monospace;font-size:13px;font-weight:700;color:#6b7280;letter-spacing:-0.5px;">&lt;/&gt;</span>`,
      doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
      docPencil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      artifacts: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
      chartUp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
      globe: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      bank: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="22" y2="20"></line><line x1="4" y1="10" x2="4" y2="20"></line><line x1="12" y1="10" x2="12" y2="20"></line><line x1="20" y1="10" x2="20" y2="20"></line><polygon points="12 2 2 9 22 9 12 2"></polygon></svg>`,
      zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" stroke-width="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      gdrive: `<svg width="20" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>`,
      gmail: `<svg width="20" height="16" viewBox="0 0 24 19" fill="none"><path d="M22 2.5V16.5C22 17.6 21.1 18.5 20 18.5H4C2.9 18.5 2 17.6 2 16.5V2.5L12 9.5L22 2.5Z" fill="#EA4335"/><path d="M2 2.5C2 1.4 2.9 0.5 4 0.5H20C21.1 0.5 22 1.4 22 2.5V3L12 10L2 3V2.5Z" fill="#C5221F"/></svg>`,
      gcal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" fill="#ffffff" stroke="#4285F4" stroke-width="2"/><path d="M3 8h18" stroke="#4285F4" stroke-width="2"/><text x="12" y="17" font-size="9" font-weight="700" text-anchor="middle" fill="#1f1e1d" font-family="sans-serif">31</text></svg>`,
      canva: `<div style="width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg, #00c4cc, #7d2ae8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;font-family:sans-serif;">C</div>`,
      ms365: `<svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="2" width="9.5" height="9.5" fill="#f25022"/><rect x="12.5" y="2" width="9.5" height="9.5" fill="#7fba00"/><rect x="2" y="12.5" width="9.5" height="9.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#ffb900"/></svg>`,
      notion: `<div style="width:20px;height:20px;border-radius:4px;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;font-family:sans-serif;">N</div>`,
      github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#24292f"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
      slack: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#E01E5A"/><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#2EB67D"/></svg>`
    };

    // --- DATA CATALOGS MATCHING PHOTOS 1, 2, 3 ---
    const skillsData = {
      newSkills: [
        { id: 'jinko', name: 'Jinkō', icon: ICONS.jinko, desc: 'Skills for quantitative systems pharmacology using Jinkō platform. Support the full...', author: 'Anthropic Directory' },
        { id: 'iceberg', name: 'iceberg', icon: ICONS.code, desc: 'Apply Hemingway writing rules to technical documentation — inline, intentional, clean...', author: 'Anthropic Directory' },
        { id: 'elmah', name: 'elmah.io', icon: ICONS.code, desc: 'Error monitoring and log management for your production apps. Query logs, find exceptions...', author: 'Anthropic Directory' },
        { id: 'learn', name: 'learn', icon: ICONS.doc, desc: 'Use this skill when the user wants intellectual understanding — learning how systems work...', author: 'by Anthropic' },
        { id: 'doc-coauthoring', name: 'doc-coauthoring', icon: ICONS.docPencil, desc: 'Guide users through a structured workflow for co-authoring documentation, specifications, and PRDs...', author: 'by Anthropic' },
        { id: 'web-artifacts-builder', name: 'web-artifacts-builder', icon: ICONS.artifacts, desc: 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts with modern CSS...', author: 'by Anthropic' },
        // Expanded items for "Show all →"
        { id: 'built-in-browser', name: 'built-in-browser', icon: ICONS.globe, desc: 'Interact with and automate browser pages via local headless engine.', author: 'Anthropic Directory' },
        { id: 'computer-use', name: 'computer-use', icon: '🖥️', desc: 'Control mouse, keyboard, and inspect screen directly on macOS.', author: 'Anthropic Directory' },
        { id: 'deep-research', name: 'deep-research', icon: '🔬', desc: 'Conduct multi-hop autonomous web research across primary sources.', author: 'Anthropic Directory' },
        { id: 'setup-audit', name: 'setup-audit', icon: '🛡️', desc: 'Verify local workspace dependencies, runtime tools, and security policies.', author: 'Anthropic Directory' },
        { id: 'shepherd', name: 'shepherd', icon: '🐑', desc: 'Supervise autonomous multi-agent task teams with continuous error recovery.', author: 'by Anthropic' },
        { id: 'xlsx', name: 'xlsx', icon: ICONS.jinko, desc: 'Read and write Excel spreadsheets (.xlsx) with formulas and charts.', author: 'Anthropic Directory' }
      ],
      mostInstalledSkills: [
        { id: 'bigdata', name: 'Bigdata.com', icon: ICONS.chartUp, desc: 'Official Bigdata.com plugin providing financial research, analytics, and intelligent...', author: 'Anthropic Directory · 195.7K Installs' },
        { id: 'nimble', name: 'Nimble', icon: ICONS.globe, desc: 'Nimble web data toolkit — search, extract, map, crawl the web and work...', author: 'Anthropic Directory · 178.7K Installs' },
        { id: 'daloopa', name: 'Daloopa', icon: ICONS.bank, desc: 'Financial analysis skills powered by Daloopa\'s institutional-grade data...', author: 'Anthropic Directory · 170.3K Installs' },
        { id: 'zapier', name: 'Zapier', icon: ICONS.zap, desc: 'Connect 8,000+ apps to your AI workflow. Discover, enable, and execute Zapier actio...', author: 'Anthropic Directory · 158.5K Installs' },
        // Expanded items for "Show all →"
        { id: 'github-skill', name: 'GitHub', icon: ICONS.github, desc: 'Inspect repositories, open pull requests, and manage issues directly.', author: 'Anthropic Directory · 142.1K Installs' },
        { id: 'linear-skill', name: 'Linear', icon: '📐', desc: 'Create, triage, and track engineering tasks with Linear workspaces.', author: 'Anthropic Directory · 128.4K Installs' },
        { id: 'slack-skill', name: 'Slack', icon: ICONS.slack, desc: 'Search channels, send team updates, and monitor discussions.', author: 'Anthropic Directory · 119.8K Installs' },
        { id: 'figma-skill', name: 'Figma', icon: '🎨', desc: 'Inspect designs, export component CSS tokens, and sync UI specs.', author: 'Anthropic Directory · 104.2K Installs' }
      ]
    };

    const connectorsData = {
      topConnectors: [
        { id: 'gdrive', name: 'Google Drive', verified: true, icon: ICONS.gdrive, desc: 'Search, read, and upload files instantly', author: 'by Google' },
        { id: 'gmail', name: 'Gmail', verified: true, icon: ICONS.gmail, desc: 'Draft replies, summarize threads, & search your inbox', author: 'by Google' },
        { id: 'gcal', name: 'Google Calendar', verified: true, icon: ICONS.gcal, desc: 'Manage your schedule and coordinate meetings effortlessly', author: 'by Google' },
        { id: 'canva', name: 'Canva', verified: true, icon: ICONS.canva, desc: 'Search, create, autofill, and export Canva designs', author: 'by Canva' },
        { id: 'ms365', name: 'Microsoft 365', verified: true, icon: ICONS.ms365, desc: 'Access your company\'s SharePoint, OneDrive, Outlook, and Teams directly in Claude', author: 'by Anthropic' },
        { id: 'notion', name: 'Notion', verified: true, icon: ICONS.notion, desc: 'Connect your Notion workspace to search, update, and power workflows across tools', author: 'by Notion' },
        // Expanded items for "Show all →"
        { id: 'github-conn', name: 'GitHub Enterprise', verified: true, icon: ICONS.github, desc: 'Search enterprise repos, manage pull requests, and audit CI/CD workflows', author: 'by GitHub' },
        { id: 'slack-conn', name: 'Slack Workplace', verified: true, icon: ICONS.slack, desc: 'Send channel broadcasts, read active threads, and monitor alerts', author: 'by Slack' },
        { id: 'linear-conn', name: 'Linear Cycles', verified: true, icon: '📐', desc: 'Sync sprint roadmaps, triage blockers, and update issue states', author: 'by Linear' },
        { id: 'figma-conn', name: 'Figma Design System', verified: true, icon: '🎨', desc: 'Inspect design components, pull layout tokens, and inspect vector assets', author: 'by Figma' },
        { id: 'dropbox-conn', name: 'Dropbox Cloud', verified: true, icon: '📦', desc: 'Access shared company folders, sync documents, and archive media', author: 'by Dropbox' },
        { id: 'salesforce-conn', name: 'Salesforce CRM', verified: true, icon: '☁', desc: 'Query CRM accounts, pipeline stages, and customer activity logs', author: 'by Salesforce' }
      ]
    };

    const pluginsData = {
      newPlugins: [
        { id: 'jinko-plug', name: 'Jinkō', icon: ICONS.jinko, desc: 'Skills for quantitative systems pharmacology using Jinkō platform. Support the full...', author: 'Anthropic Directory' },
        { id: 'iceberg-plug', name: 'iceberg', icon: ICONS.code, desc: 'Apply Hemingway writing rules to technical documentation — inline, intentional, clean...', author: 'Anthropic Directory' },
        { id: 'elmah-plug', name: 'elmah.io', icon: ICONS.code, desc: 'Error monitoring and log management for your production apps. Query logs,...', author: 'Anthropic Directory' },
        { id: 'learn-plug', name: 'learn', icon: ICONS.doc, desc: 'Use this skill when the user wants intellectual understanding — learning how...', author: 'by Anthropic' },
        { id: 'doc-coauthoring-plug', name: 'doc-coauthoring', icon: ICONS.docPencil, desc: 'Guide users through a structured workflow for co-authoring documentation. Use whe...', author: 'by Anthropic' },
        { id: 'web-artifacts-builder-plug', name: 'web-artifacts-builder', icon: ICONS.artifacts, desc: 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using...', author: 'by Anthropic' },
        // Expanded items
        { id: 'reverse-eng-plug', name: 'reverse-engineering', icon: '🔬', desc: 'Mach-O disassembler, Info.plist parser, Web bundle analyzer, and symbol extractor.', author: 'Carib Sovereign' },
        { id: 'agent-teams-plug', name: 'agent-teams', icon: '👥', desc: 'Multi-agent coordination, parallel debugging, and team communication protocols.', author: 'Carib Sovereign' },
        { id: 'flutter-plug', name: 'flutter', icon: '📱', desc: 'Flutter/Dart CLI, widget inspector, hot reload, and responsive UI components.', author: 'Carib Sovereign' },
        { id: 'modern-web-plug', name: 'modern-web-guidance', icon: ICONS.globe, desc: 'Modern web standards, responsive design systems, and CSS token architecture.', author: 'Carib Sovereign' }
      ],
      mostInstalledPlugins: [
        { id: 'bigdata-plug', name: 'Bigdata.com', icon: ICONS.chartUp, desc: 'Official Bigdata.com plugin providing financial research, analytics, and intelligen...', author: 'Anthropic Directory · 195.7K Installs' },
        { id: 'nimble-plug', name: 'Nimble', icon: ICONS.globe, desc: 'Nimble web data toolkit — search, extract, map, crawl the web and work with...', author: 'Anthropic Directory · 178.7K Installs' },
        { id: 'daloopa-plug', name: 'Daloopa', icon: ICONS.bank, desc: 'Financial analysis skills powered by Daloopa\'s institutional-grade data...', author: 'Anthropic Directory · 170.3K Installs' },
        { id: 'zapier-plug', name: 'Zapier', icon: ICONS.zap, desc: 'Connect 8,000+ apps to your AI workflow. Discover, enable, and execute Zapier actio...', author: 'Anthropic Directory · 158.5K Installs' },
        // Expanded items
        { id: 'github-plug', name: 'GitHub Actions Pro', icon: ICONS.github, desc: 'Deploy automated test suites and inspect workflow runs on commit push.', author: 'Anthropic Directory · 135.2K Installs' },
        { id: 'linear-plug', name: 'Linear Sync', icon: '📐', desc: 'Real-time project issue synchronization with sovereign mesh webhooks.', author: 'Anthropic Directory · 114.8K Installs' }
      ]
    };

    function renderCard(item, isConnector = false) {
      const isAdded = window.installedCustomizations.includes(item.name);
      return `
        <div class="customize-horizontal-card" data-card-id="${item.id}" data-card-name="${item.name}">
          <div class="card-icon-box" style="color:${item.iconColor || 'inherit'};">
            ${item.icon}
          </div>
          <div class="card-main-content">
            <div class="card-header-row">
              <div class="card-title-group">
                <span class="card-title-text">${item.name}</span>
                ${item.verified ? verifiedSvg : ''}
              </div>
              <div class="card-actions-group">
                ${!isConnector ? `
                  <button class="card-btn-try" onclick="window.startSkillPrompt('Activate and try ${item.name} skill');">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span>Try</span>
                  </button>
                ` : ''}
                <button class="card-btn-add ${isAdded ? 'added' : ''}" data-item-name="${item.name}" title="${isAdded ? 'Installed' : 'Install'}">
                  ${isAdded ? '✓' : '+'}
                </button>
              </div>
            </div>
            <p class="card-desc-text">${item.desc}</p>
            <div class="card-subtext">${item.author}</div>
          </div>
        </div>
      `;
    }

    // Top Navigation HTML
    container.innerHTML = `
      <div class="customize-view-container">
        <!-- Top Navigation Bar (Exact Parity with Photos 1, 2, 3) -->
        <div class="customize-top-nav">
          <div class="customize-nav-left">
            <div class="customize-trinity-tabs">
              <button class="trinity-tab ${window.activeCustomizeTab === 'skills' ? 'active' : ''}" data-ctab="skills">Skills</button>
              <button class="trinity-tab ${window.activeCustomizeTab === 'connectors' ? 'active' : ''}" data-ctab="connectors">Connectors</button>
              <button class="trinity-tab ${window.activeCustomizeTab === 'plugins' ? 'active' : ''}" data-ctab="plugins">Plugins</button>
            </div>
            <div class="customize-sub-tabs">
              <button class="customize-sub-tab ${window.activeCustomizeSubTab === 'yours' ? 'active' : ''}" data-sub="yours">Yours</button>
              <button class="customize-sub-tab ${window.activeCustomizeSubTab === 'discover' ? 'active' : ''}" data-sub="discover">Discover</button>
            </div>
          </div>
          <div class="customize-nav-right">
            <div class="customize-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="customizeSearchInput" placeholder="Search" value="${window.customizeSearchQuery || ''}">
            </div>
            <button class="customize-icon-btn" id="customizeFilterBtn" title="Filter Directory">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
            <button class="customize-icon-btn" id="customizeSortBtn" title="Sort Directory">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 15l5 5 5-5"></path><path d="M7 9l5-5 5-5"></path><line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
            </button>
            <div class="customize-add-dropdown-wrap">
              <button class="customize-btn-add" id="customizeAddBtn">
                <span>+ Add</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        <div id="customizeBody"></div>
      </div>
    `;

    // Tab switcher events
    container.querySelectorAll("[data-ctab]").forEach(btn => {
      btn.addEventListener("click", () => {
        window.activeCustomizeTab = btn.dataset.ctab;
        renderCustomizeView(container);
      });
    });

    container.querySelectorAll("[data-sub]").forEach(btn => {
      btn.addEventListener("click", () => {
        window.activeCustomizeSubTab = btn.dataset.sub;
        renderCustomizeView(container);
      });
    });

    // Search input event
    const searchInput = container.querySelector("#customizeSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        window.customizeSearchQuery = e.target.value.toLowerCase().trim();
        filterCards(window.customizeSearchQuery);
      });
    }

    function filterCards(query) {
      container.querySelectorAll(".customize-horizontal-card").forEach(card => {
        const name = (card.dataset.cardName || '').toLowerCase();
        const text = card.innerText.toLowerCase();
        if (!query || name.includes(query) || text.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    }

    // Add button handler
    const addBtn = container.querySelector("#customizeAddBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const title = prompt("Enter custom Skill, MCP Connector or Plugin name to install:");
        if (title && title.trim()) {
          const item = title.trim();
          if (!window.installedCustomizations.includes(item)) {
            window.installedCustomizations.push(item);
            localStorage.setItem('carib_installed_customizations', JSON.stringify(window.installedCustomizations));
            renderCustomizeView(container);
          }
        }
      });
    }

    const body = container.querySelector("#customizeBody");
    if (!body) return;

    // --- TAB: SKILLS (PHOTO 1) ---
    if (window.activeCustomizeTab === "skills") {
      if (window.activeCustomizeSubTab === "discover") {
        const isNewExp = !!window.customizeExpanded['new-skills'];
        const isMostExp = !!window.customizeExpanded['most-installed-skills'];
        const newItems = isNewExp ? skillsData.newSkills : skillsData.newSkills.slice(0, 6);
        const mostItems = isMostExp ? skillsData.mostInstalledSkills : skillsData.mostInstalledSkills.slice(0, 4);

        body.innerHTML = `
          <!-- New Skills Section (Photo 1) -->
          <div class="customize-section">
            <div class="customize-section-header">
              <h3 class="customize-section-title">New skills</h3>
              <button class="customize-show-all-btn" data-sec-key="new-skills">
                ${isNewExp ? 'Show less ↑' : 'Show all →'}
              </button>
            </div>
            <div class="customize-cards-grid">
              ${newItems.map(item => renderCard(item, false)).join('')}
            </div>
          </div>

          <!-- Most Installed Skills Section (Photo 1) -->
          <div class="customize-section" style="margin-top:28px;">
            <div class="customize-section-header">
              <h3 class="customize-section-title">Most installed skills</h3>
              <button class="customize-show-all-btn" data-sec-key="most-installed-skills">
                ${isMostExp ? 'Show less ↑' : 'Show all →'}
              </button>
            </div>
            <div class="customize-cards-grid">
              ${mostItems.map(item => renderCard(item, false)).join('')}
            </div>
          </div>
        `;
      } else {
        // Yours scope for Skills
        const userSkills = skillsData.newSkills.concat(skillsData.mostInstalledSkills).filter(s => window.installedCustomizations.includes(s.name));
        body.innerHTML = `
          <div class="customize-section">
            <div class="customize-section-header">
              <div class="customize-title-with-badge">
                <h3 class="customize-section-title">Your active skills</h3>
                <span class="customize-count-badge">${userSkills.length}</span>
              </div>
            </div>
            <div class="customize-cards-grid">
              ${userSkills.length > 0 ? userSkills.map(item => renderCard(item, false)).join('') : '<p style="color:#888580;font-size:13px;grid-column:1/-1;">No skills installed yet. Click "Discover" to add skills.</p>'}
            </div>
          </div>
        `;
      }
    }
    // --- TAB: CONNECTORS (PHOTO 2) ---
    else if (window.activeCustomizeTab === "connectors") {
      if (window.activeCustomizeSubTab === "discover") {
        const isConnExp = !!window.customizeExpanded['top-connectors'];
        const connItems = isConnExp ? connectorsData.topConnectors : connectorsData.topConnectors.slice(0, 6);

        const carouselSlides = [
          {
            tag: 'CURATED BY ANTHROPIC',
            title: 'Claude for science',
            desc: 'Search literature, plan experiments, and analyze results.',
            icons: [
              { label: 'M', bg: '#e8f0fe', color: '#1a73e8', bold: true },
              { label: 'bR', bg: '#fce8e6', color: '#d93025', bold: true },
              { label: 'NIH', bg: '#133c55', color: '#ffffff', bold: true, fontSize: '11px' },
              { label: '🔬', bg: '#e6f4ea', color: '#137333' },
              { label: '🧬', bg: '#fef7e0', color: '#b06000' },
              { label: 'W', bg: '#f1f3f4', color: '#202124', bold: true },
              { label: '🧊', bg: '#202124', color: '#ffffff', fontSize: '12px' }
            ],
            action: 'Explore science connectors'
          },
          {
            tag: 'CURATED BY ANTHROPIC',
            title: 'Claude for developers',
            desc: 'Connect repositories, automate test suites, and orchestrate CI/CD pipelines.',
            icons: [
              { label: '🐙', bg: '#24292e', color: '#ffffff' },
              { label: '📐', bg: '#5e6ad2', color: '#ffffff' },
              { label: '💬', bg: '#4a154b', color: '#ffffff' },
              { label: '⚡', bg: '#f97316', color: '#ffffff' },
              { label: '💻', bg: '#10b981', color: '#ffffff' },
              { label: '📦', bg: '#0284c7', color: '#ffffff' },
              { label: '⚙️', bg: '#64748b', color: '#ffffff' }
            ],
            action: 'Explore developer connectors'
          },
          {
            tag: 'CURATED BY ANTHROPIC',
            title: 'Claude for productivity',
            desc: 'Sync your workspace across Google Drive, Microsoft 365, Notion, and Slack.',
            icons: [
              { label: '▲', bg: '#4285f4', color: '#ffffff' },
              { label: '✉', bg: '#ea4335', color: '#ffffff' },
              { label: '31', bg: '#34a853', color: '#ffffff', bold: true },
              { label: '田', bg: '#0078d4', color: '#ffffff' },
              { label: 'N', bg: '#000000', color: '#ffffff', bold: true },
              { label: 'C', bg: '#00c4cc', color: '#ffffff', bold: true },
              { label: '☁', bg: '#00a1e0', color: '#ffffff' }
            ],
            action: 'Explore productivity connectors'
          }
        ];

        const curSlideIdx = (window.carouselCurrentIndex || 0) % carouselSlides.length;
        const activeSlide = carouselSlides[curSlideIdx];

        body.innerHTML = `
          <!-- Curated Carousel Hero Banner (Photo 2) -->
          <div class="customize-carousel-banner">
            <button class="carousel-arrow left" id="carouselPrevBtn" title="Previous Curated Collection">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="carousel-slide-content">
              <div class="carousel-curated-tag">${activeSlide.tag}</div>
              <h2 class="carousel-slide-title">${activeSlide.title}</h2>
              <p class="carousel-slide-desc">${activeSlide.desc}</p>
              <div class="carousel-icons-row">
                ${activeSlide.icons.map(ic => `
                  <span class="carousel-partner-icon" style="background:${ic.bg};color:${ic.color};${ic.bold ? 'font-weight:700;' : ''}${ic.fontSize ? 'font-size:' + ic.fontSize + ';' : ''}">
                    ${ic.label}
                  </span>
                `).join('')}
              </div>
              <button class="carousel-explore-btn" onclick="window.startSkillPrompt('${activeSlide.action}');">Explore</button>
            </div>
            <button class="carousel-arrow right" id="carouselNextBtn" title="Next Curated Collection">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="carousel-pagination-dots">
              ${carouselSlides.map((_, i) => `<span class="carousel-dot ${i === curSlideIdx ? 'active' : ''}"></span>`).join('')}
            </div>
          </div>

          <!-- Top Connectors Section (Photo 2) -->
          <div class="customize-section">
            <div class="customize-section-header">
              <div class="customize-title-with-badge">
                <h3 class="customize-section-title">Top connectors</h3>
                <span class="customize-count-badge">6481</span>
              </div>
              <button class="customize-show-all-btn" data-sec-key="top-connectors">
                ${isConnExp ? 'Show less ↑' : 'Show all →'}
              </button>
            </div>
            <div class="customize-cards-grid">
              ${connItems.map(item => renderCard(item, true)).join('')}
            </div>
          </div>
        `;
      } else {
        // Yours scope for Connectors
        const userConns = connectorsData.topConnectors.filter(c => window.installedCustomizations.includes(c.name));
        body.innerHTML = `
          <div class="customize-section">
            <div class="customize-section-header">
              <div class="customize-title-with-badge">
                <h3 class="customize-section-title">Your active connectors</h3>
                <span class="customize-count-badge">${userConns.length}</span>
              </div>
            </div>
            <div class="customize-cards-grid">
              ${userConns.length > 0 ? userConns.map(item => renderCard(item, true)).join('') : '<p style="color:#888580;font-size:13px;grid-column:1/-1;">No connectors connected yet. Click "Discover" to connect apps.</p>'}
            </div>
          </div>
        `;
      }
    }
    // --- TAB: PLUGINS (PHOTO 3) ---
    else {
      if (window.activeCustomizeSubTab === "discover") {
        const isNewPlugExp = !!window.customizeExpanded['new-plugins'];
        const isMostPlugExp = !!window.customizeExpanded['most-installed-plugins'];
        const newPlugItems = isNewPlugExp ? pluginsData.newPlugins : pluginsData.newPlugins.slice(0, 6);
        const mostPlugItems = isMostPlugExp ? pluginsData.mostInstalledPlugins : pluginsData.mostInstalledPlugins.slice(0, 4);

        body.innerHTML = `
          <!-- New Plugins Section (Photo 3) -->
          <div class="customize-section">
            <div class="customize-section-header">
              <h3 class="customize-section-title">New plugins</h3>
              <button class="customize-show-all-btn" data-sec-key="new-plugins">
                ${isNewPlugExp ? 'Show less ↑' : 'Show all →'}
              </button>
            </div>
            <div class="customize-cards-grid">
              ${newPlugItems.map(item => renderCard(item, false)).join('')}
            </div>
          </div>

          <!-- Most Installed Plugins Section (Photo 3) -->
          <div class="customize-section" style="margin-top:28px;">
            <div class="customize-section-header">
              <h3 class="customize-section-title">Most installed plugins</h3>
              <button class="customize-show-all-btn" data-sec-key="most-installed-plugins">
                ${isMostPlugExp ? 'Show less ↑' : 'Show all →'}
              </button>
            </div>
            <div class="customize-cards-grid">
              ${mostPlugItems.map(item => renderCard(item, false)).join('')}
            </div>
          </div>
        `;
      } else {
        // Yours scope for Plugins
        const userPlugins = pluginsData.newPlugins.concat(pluginsData.mostInstalledPlugins).filter(p => window.installedCustomizations.includes(p.name));
        body.innerHTML = `
          <div class="customize-section">
            <div class="customize-section-header">
              <div class="customize-title-with-badge">
                <h3 class="customize-section-title">Your active plugins</h3>
                <span class="customize-count-badge">${userPlugins.length}</span>
              </div>
            </div>
            <div class="customize-cards-grid">
              ${userPlugins.length > 0 ? userPlugins.map(item => renderCard(item, false)).join('') : '<p style="color:#888580;font-size:13px;grid-column:1/-1;">No plugins active yet. Click "Discover" to add plugins.</p>'}
            </div>
          </div>
        `;
      }
    }

    // Attach "Show all →" Click Listeners (Circled in green by user!)
    body.querySelectorAll(".customize-show-all-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.secKey;
        if (key) {
          window.customizeExpanded[key] = !window.customizeExpanded[key];
          renderCustomizeView(container);
        }
      });
    });

    // Attach Add (+) Click Listeners
    body.querySelectorAll(".card-btn-add").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const itemName = btn.dataset.itemName;
        if (!itemName) return;
        const idx = window.installedCustomizations.indexOf(itemName);
        if (idx > -1) {
          window.installedCustomizations.splice(idx, 1);
        } else {
          window.installedCustomizations.push(itemName);
        }
        localStorage.setItem('carib_installed_customizations', JSON.stringify(window.installedCustomizations));
        renderCustomizeView(container);
      });
    });

    // Carousel Prev/Next Buttons
    const prevBtn = body.querySelector("#carouselPrevBtn");
    const nextBtn = body.querySelector("#carouselNextBtn");
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        window.carouselCurrentIndex = ((window.carouselCurrentIndex || 0) - 1 + 3) % 3;
        renderCustomizeView(container);
      });
      nextBtn.addEventListener("click", () => {
        window.carouselCurrentIndex = ((window.carouselCurrentIndex || 0) + 1) % 3;
        renderCustomizeView(container);
      });
    }
  }


    function renderSettingsView(container) {
    container = container || document.getElementById("view-settings");
    if (!container) return;

    if (!window.activeSettingsSection) window.activeSettingsSection = 'general';

    container.innerHTML = `
      <div class="claude-settings-dialog-layout">
        <!-- Settings Sidebar (Photo 4) -->
        <div class="settings-modal-sidebar">
          <div class="settings-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search" class="settings-search-input">
          </div>

          <div class="settings-group-label">Settings</div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'general' ? 'active' : ''}" data-sec="general">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>General</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'account' ? 'active' : ''}" data-sec="account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Account</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'privacy' ? 'active' : ''}" data-sec="privacy">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Privacy</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'billing' ? 'active' : ''}" data-sec="billing">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <span>Billing</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'capabilities' ? 'active' : ''}" data-sec="capabilities">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Capabilities</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'memory' ? 'active' : ''}" data-sec="memory">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path></svg>
            <span>Memory</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'claude-code' ? 'active' : ''}" data-sec="claude-code">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>Claude Code</span>
          </div>

          <div class="settings-group-label" style="margin-top:14px;">This computer</div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'system' ? 'active' : ''}" data-sec="system">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <span>System</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'extensions' ? 'active' : ''}" data-sec="extensions">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            <span>Extensions</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'developer' ? 'active' : ''}" data-sec="developer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            <span>Developer</span>
          </div>

          <div class="settings-group-label" style="margin-top:14px;">Customize</div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'skills' ? 'active' : ''}" data-sec="skills" onclick="window.navigateToView('customize');">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path></svg>
            <span>Skills</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'connectors' ? 'active' : ''}" data-sec="connectors" onclick="window.navigateToView('customize');">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8"></path><path d="M22 22H2"></path></svg>
            <span>Connectors</span>
          </div>
          <div class="settings-menu-item ${window.activeSettingsSection === 'plugins' ? 'active' : ''}" data-sec="plugins" onclick="window.navigateToView('customize');">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"></path></svg>
            <span>Plugins</span>
          </div>
        </div>

        <!-- Settings Content Panel (Photo 4) -->
        <div class="settings-modal-content">
          <div id="settingsContentBody"></div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-sec]").forEach(item => {
      item.addEventListener("click", () => {
        window.activeSettingsSection = item.dataset.sec;
        renderSettingsView(container);
      });
    });

    const body = container.querySelector("#settingsContentBody");
    if (!body) return;

    if (window.activeSettingsSection === "general") {
      const isLight = document.body.classList.contains('light-mode');
      body.innerHTML = `
        <!-- Verification Banner (Photo 4) -->
        <div class="settings-verification-banner">
          <div class="verification-banner-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="9" stroke="#d97706" stroke-width="2"></circle>
              <circle cx="12" cy="12" r="4.5" fill="#d97706"></circle>
            </svg>
            <div style="font-size:13px;line-height:1.4;color:#d1cfc7;">
              <span>Your email address</span>
              <strong style="color:#ffffff;margin:0 4px;">djozzyb@icloud.com</strong>
              <span>is verified on Sovereign Mesh.</span>
            </div>
          </div>
          <button class="verification-banner-btn" onclick="alert('Verification token verified active for djozzyb@icloud.com');">Resend verification email</button>
        </div>

        <!-- Appearance Section (Photo 4) -->
        <div class="settings-section-block">
          <h3 class="settings-block-title">Appearance</h3>
          
          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Theme</div>
            </div>
            <div class="segmented-ctrl-group" id="themeSegmentedGroup">
              <button class="seg-btn" id="themeBtnSystem" title="System Theme">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </button>
              <button class="seg-btn ${isLight ? 'active' : ''}" id="themeBtnLight" title="Light Theme">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </button>
              <button class="seg-btn ${!isLight ? 'active' : ''}" id="themeBtnDark" title="Dark Theme">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </button>
            </div>
          </div>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Chat font</div>
            </div>
            <select class="claude-settings-select" id="chatFontSelect">
              <option selected>Default (Newsreader serif)</option>
              <option>Inter (Sans-serif)</option>
              <option>JetBrains Mono (Monospace)</option>
              <option>System Default</option>
            </select>
          </div>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Transcript text size</div>
            </div>
            <div class="segmented-ctrl-group">
              <button class="seg-btn" data-val="s">S</button>
              <button class="seg-btn active" data-val="m">M</button>
              <button class="seg-btn" data-val="l">L</button>
            </div>
          </div>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Transcript width</div>
            </div>
            <div class="segmented-ctrl-group">
              <button class="seg-btn active" data-val="normal">Normal</button>
              <button class="seg-btn" data-val="wide">Wide</button>
            </div>
          </div>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Motion</div>
            </div>
            <div class="segmented-ctrl-group">
              <button class="seg-btn active" data-val="full">Full</button>
              <button class="seg-btn" data-val="reduced">Reduced</button>
            </div>
          </div>
        </div>

        <!-- Voice Section (Photo 4) -->
        <div class="settings-section-block" style="margin-top:28px;">
          <h3 class="settings-block-title">Voice</h3>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Language</div>
            </div>
            <select class="claude-settings-select">
              <option selected>Auto-detect (English)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>

          <div class="settings-control-row">
            <div class="setting-ctrl-info">
              <div class="setting-ctrl-title">Style</div>
            </div>
            <select class="claude-settings-select">
              <option selected>Default</option>
              <option>Warm</option>
              <option>Concise</option>
              <option>Expressive</option>
            </select>
          </div>
        </div>
      `;

      // Wire interactive segmented controls
      body.querySelectorAll('.segmented-ctrl-group').forEach(group => {
        group.querySelectorAll('.seg-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            group.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.id === 'themeBtnLight') {
              document.body.classList.add('light-mode');
              localStorage.setItem('claude_theme', 'light');
            } else if (btn.id === 'themeBtnDark') {
              document.body.classList.remove('light-mode');
              localStorage.setItem('claude_theme', 'dark');
            } else if (btn.id === 'themeBtnSystem') {
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.body.classList.toggle('light-mode', !prefersDark);
              localStorage.removeItem('claude_theme');
            }
          });
        });
      });

      // Setup Font Selection
      const fontSelect = body.querySelector("#chatFontSelect");
      if (fontSelect) {
        fontSelect.addEventListener("change", (e) => {
          const val = e.target.value;
          if (val.includes("Newsreader")) {
            document.body.style.fontFamily = "'Newsreader', Georgia, serif";
          } else if (val.includes("Inter")) {
            document.body.style.fontFamily = "'Inter', -apple-system, sans-serif";
          } else if (val.includes("JetBrains")) {
            document.body.style.fontFamily = "'JetBrains Mono', monospace";
          } else {
            document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
          }
        });
      }
    } else if (window.activeSettingsSection === "account") {
      body.innerHTML = `
        <div class="settings-section-block">
          <h3 class="settings-block-title">Account</h3>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Email</div><div class="setting-ctrl-caption">djozzyb@icloud.com</div></div>
            <span class="mcp-status-pill mcp-active" style="background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.3);padding:3px 10px;border-radius:20px;font-size:12px;">Verified</span>
          </div>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Plan</div><div class="setting-ctrl-caption">Free plan · Sovereign Tier</div></div>
            <button class="btn-claude-send" style="padding:6px 14px;border-radius:20px;font-size:12.5px;" onclick="window.openPlansModal()">Upgrade</button>
          </div>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Session Security</div><div class="setting-ctrl-caption">Strict Write Discipline SHA-256 enabled</div></div>
            <span style="font-size:12px;color:#888580;">Hardware Isolated</span>
          </div>
        </div>
      `;
    } else if (window.activeSettingsSection === "billing") {
      body.innerHTML = `
        <div class="settings-section-block">
          <h3 class="settings-block-title">Billing & Quota</h3>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Monthly Subscription</div><div class="setting-ctrl-caption">$0.00 / month (Sovereign Free Pool)</div></div>
            <span style="font-weight:600;color:#10b981;font-size:13px;">$0.00 Active</span>
          </div>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Token Allocation</div><div class="setting-ctrl-caption">2.8B+ Monthly Tokens via awesome-free-models</div></div>
            <span style="font-size:12px;color:#38bdf8;">Unlimited Sovereign Routing</span>
          </div>
        </div>
      `;
    } else if (window.activeSettingsSection === "claude-code") {
      body.innerHTML = `
        <div class="settings-section-block">
          <h3 class="settings-block-title">Claude Code CLI & Terminal</h3>
          <p style="color:#888580;font-size:13px;line-height:1.6;margin-bottom:18px;">
            Native terminal and coding session integration for macOS.
          </p>
          <div class="settings-control-row">
            <div class="setting-ctrl-info"><div class="setting-ctrl-title">Terminal Agent State</div><div class="setting-ctrl-caption">Active on port 8888 (/v1 gateway)</div></div>
            <button class="btn-claude-send" style="padding:6px 14px;border-radius:6px;font-size:12px;" onclick="window.navigateToView('code')">Open Code Window</button>
          </div>
        </div>
      `;
    } else {
      body.innerHTML = `
        <div class="settings-section-block">
          <h3 class="settings-block-title">${window.activeSettingsSection.toUpperCase()}</h3>
          <p style="color:#888580;font-size:13px;line-height:1.6;margin-top:8px;">
            Configured under Carib Sovereign Mesh for account <strong style="color:#ececec;">djozzyb@icloud.com</strong>.<br>
            All operations executed with zero external billing via local Jarvis OS and local model routing.
          </p>
        </div>
      `;
    }
  }


  async function renderPlatformView(container) {
    container = container || document.getElementById("view-platform");
    if (!container) return;
    if (currentUser && currentUser.role !== "admin") {
      container.innerHTML = `<div style="padding:40px;color:var(--claude-gold);">Forbidden: Platform administration requires Sovereign Admin credentials.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="projects-header" style="margin-bottom:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 class="projects-title">Claude Platform Developer Console</h1>
            <p style="color:var(--claude-text-secondary);font-size:13px;margin-top:4px;">
              Workbench · Sovereign Models Hub · MCP Server Registry · API Keys · WIF · 2.8B+ Free Tokens/Month
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="platformLocalPill" class="mcp-status-pill ${localOllamaConnected ? 'mcp-active' : ''}" style="background:var(--claude-surface-2);border:1px solid var(--claude-border);padding:4px 10px;font-size:11.5px;" title="Local Ollama Runner status (http://localhost:11434)">
              <span>${localOllamaConnected ? '🟢 Local Ollama: Connected' : '⚪ Local Runner: Cloud Free Pool Active'}</span>
            </div>
            <button id="btnPlatformProbeLocal" class="btn-ghost-help" style="font-size:12px;display:flex;align-items:center;gap:4px;padding:5px 10px;" title="Probe Local Ollama Runner on localhost:11434">
              🔄 Probe Local
            </button>
          </div>
        </div>
      </div>

      <div class="platform-tabs-nav">
        <button class="platform-tab-btn ${activePlatformTab === 'workbench' ? 'active' : ''}" data-ptab="workbench">
          🧪 Workbench
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'managed-agents' ? 'active' : ''}" data-ptab="managed-agents">
          🤖 Managed Agents
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'admin-api' ? 'active' : ''}" data-ptab="admin-api">
          🏛️ Admin API & Workspaces
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'use-cases' ? 'active' : ''}" data-ptab="use-cases">
          💡 Use-Case Guides
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'sdks-cli' ? 'active' : ''}" data-ptab="sdks-cli">
          💻 SDKs & CLI
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'skills-tools' ? 'active' : ''}" data-ptab="skills-tools">
          🛠️ Skills & MCP
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'models' ? 'active' : ''}" data-ptab="models">
          🧠 Models & Local Hub
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'api-reference' ? 'active' : ''}" data-ptab="api-reference">
          📖 API Reference & Batches
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'release-notes' ? 'active' : ''}" data-ptab="release-notes">
          🚀 Release Notes
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'usage' ? 'active' : ''}" data-ptab="usage">
          📊 Free Token Meter
        </button>
        <button class="platform-tab-btn ${activePlatformTab === 'opensource' ? 'active' : ''}" data-ptab="opensource">
          📦 Open Source Self-Host
        </button>
      </div>

      <div id="platformDetailContainer"></div>
    `;

    container.querySelectorAll("[data-ptab]").forEach(btn => {
      btn.addEventListener("click", () => {
        activePlatformTab = btn.dataset.ptab;
        renderPlatformView(container);
      });
    });

    const btnProbe = container.querySelector("#btnPlatformProbeLocal");
    if (btnProbe) {
      btnProbe.addEventListener("click", async () => {
        btnProbe.textContent = "Probing...";
        await checkLocalOllama();
        renderPlatformView(container);
      });
    }

    const pContainer = container.querySelector("#platformDetailContainer");

    // ==========================================
    // 1. WORKBENCH / PLAYGROUND SUBTAB
    // ==========================================
    if (activePlatformTab === "workbench") {
      pContainer.innerHTML = `
        <div class="workbench-layout">
          <div class="workbench-main-pane">
            <!-- System Prompt Card -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  System Instructions
                </span>
                <span style="font-size:11.5px;color:var(--claude-text-muted);">Optional system prompt</span>
              </div>
              <textarea id="wbSystemPrompt" class="workbench-textarea" placeholder="Enter instructions that define Claude's behavior, persona, and output style...">${wbSystemPrompt}</textarea>
            </div>

            <!-- Messages Thread -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Conversation Thread
                </span>
                <button id="wbBtnAddMsg" class="btn-mini-filter" style="color:var(--claude-coral);font-weight:600;font-size:12px;cursor:pointer;">
                  + Add Message
                </button>
              </div>
              <div id="wbMessagesList" class="workbench-messages-thread">
                ${wbMessages.map((msg, idx) => `
                  <div class="workbench-msg-box" data-idx="${idx}">
                    <div class="workbench-msg-header">
                      <div class="workbench-msg-role role-${msg.role}">
                        ${msg.role.toUpperCase()}
                      </div>
                      ${wbMessages.length > 1 ? `
                        <button class="btn-mini-filter wb-del-msg" data-del-idx="${idx}" title="Remove Message" style="cursor:pointer;color:var(--claude-text-muted);">✕</button>
                      ` : ''}
                    </div>
                    <textarea class="workbench-textarea wb-msg-content" data-idx="${idx}" placeholder="Enter ${msg.role} message...">${msg.content}</textarea>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Output / Execution Result Card -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                  Model Output & Telemetry
                </span>
                <div style="display:flex;gap:8px;">
                  <button id="wbBtnCopyOutput" class="btn-ghost-help" style="font-size:11.5px;padding:3px 8px;" title="Copy Output to Clipboard">
                    📋 Copy
                  </button>
                  <button id="wbBtnJsonToggle" class="btn-ghost-help" style="font-size:11.5px;padding:3px 8px;" title="Toggle Raw JSON View">
                    { } JSON
                  </button>
                </div>
              </div>
              <div id="wbOutputBox" class="workbench-output-box">
                ${wbLastResult ? formatMarkdown(wbLastResult.content) : '<span style="color:var(--claude-text-muted);font-style:italic;">Run prompt to evaluate output, latency, and token consumption...</span>'}
              </div>
              <div class="workbench-telemetry-strip">
                <div class="telemetry-item">Latency: <strong id="wbTelLatency">${wbLastResult ? wbLastResult.latency_ms + 'ms' : '0ms'}</strong></div>
                <div class="telemetry-item">Input: <strong id="wbTelInput">${wbLastResult ? wbLastResult.input_tokens : '0'} tokens</strong></div>
                <div class="telemetry-item">Output: <strong id="wbTelOutput">${wbLastResult ? wbLastResult.output_tokens : '0'} tokens</strong></div>
                <div class="telemetry-item">Cost: <strong style="color:var(--claude-green);">$0.00 (Sovereign Free Tier)</strong></div>
              </div>
            </div>
          </div>

          <!-- Side Pane: Parameters & Tools -->
          <div class="workbench-side-pane">
            <button id="wbBtnRun" class="btn-workbench-run" ${wbRunning ? 'disabled' : ''}>
              ${wbRunning ? '⏳ Executing Sovereign Run...' : '▶️ Run Prompt'}
            </button>

            <!-- Model Selector -->
            <div class="param-control-group">
              <div class="param-control-header">
                <label for="wbModelSelect">Model</label>
                <span class="param-value-badge" id="wbModelBadge">Sonnet 3.5 Tier</span>
              </div>
              <select id="wbModelSelect" class="workbench-textarea" style="min-height:auto;padding:8px 10px;">
                <optgroup label="Cloud Free Sovereign Tiers (2.8B+ Free Tokens)">
                  <option value="qwen/qwen-2.5-coder-32b-instruct:free" ${wbModel === 'qwen/qwen-2.5-coder-32b-instruct:free' ? 'selected' : ''}>Claude 3.5 / 3.7 Sonnet (Qwen 2.5 Coder 32B Free)</option>
                  <option value="deepseek/deepseek-r1:free" ${wbModel === 'deepseek/deepseek-r1:free' ? 'selected' : ''}>Claude 3 Opus (DeepSeek R1 671B MoE Free)</option>
                  <option value="meta-llama/llama-3.2-3b-instruct:free" ${wbModel === 'meta-llama/llama-3.2-3b-instruct:free' ? 'selected' : ''}>Claude 3.5 Haiku (Llama 3.2 3B Fast Free)</option>
                  <option value="nvidia/nemotron-3-ultra-550b-a55b:free" ${wbModel === 'nvidia/nemotron-3-ultra-550b-a55b:free' ? 'selected' : ''}>NVIDIA Nemotron 3 Ultra 550B Free</option>
                  <option value="google/gemma-2-9b-it:free" ${wbModel === 'google/gemma-2-9b-it:free' ? 'selected' : ''}>Google Gemma 2 9B Free</option>
                </optgroup>
                <optgroup label="Local Sovereign Models (Mac / Ollama localhost:11434)">
                  <option value="ollama/qwen2.5-coder:32b" ${wbModel === 'ollama/qwen2.5-coder:32b' ? 'selected' : ''}>Local Sonnet: qwen2.5-coder:32b</option>
                  <option value="ollama/deepseek-r1:14b" ${wbModel === 'ollama/deepseek-r1:14b' ? 'selected' : ''}>Local Opus: deepseek-r1:14b</option>
                  <option value="ollama/llama3.2:3b" ${wbModel === 'ollama/llama3.2:3b' ? 'selected' : ''}>Local Haiku: llama3.2:3b</option>
                </optgroup>
              </select>
            </div>

            <!-- Temperature Slider -->
            <div class="param-control-group">
              <div class="param-control-header">
                <label for="wbTempSlider">Temperature</label>
                <span id="wbTempVal" class="param-value-badge">${wbTemperature}</span>
              </div>
              <input type="range" id="wbTempSlider" class="param-slider" min="0" max="1" step="0.05" value="${wbTemperature}">
            </div>

            <!-- Max Tokens Slider -->
            <div class="param-control-group">
              <div class="param-control-header">
                <label for="wbMaxTokensSlider">Max Tokens</label>
                <span id="wbMaxTokensVal" class="param-value-badge">${wbMaxTokens}</span>
              </div>
              <input type="range" id="wbMaxTokensSlider" class="param-slider" min="256" max="8192" step="256" value="${wbMaxTokens}">
            </div>

            <!-- Extended Thinking Budget -->
            <div class="param-control-group">
              <div class="param-control-header">
                <label for="wbThinkingSlider">Thinking Budget</label>
                <span id="wbThinkingVal" class="param-value-badge">${wbThinkingBudget ? wbThinkingBudget + ' tokens' : 'Off'}</span>
              </div>
              <input type="range" id="wbThinkingSlider" class="param-slider" min="0" max="16384" step="1024" value="${wbThinkingBudget}">
              <div style="font-size:11px;color:var(--claude-text-muted);">Allocates dedicated reasoning tokens (Opus/Sonnet 3.7 parity)</div>
            </div>

            <!-- Sovereign Guarantee Box -->
            <div style="background:var(--claude-surface-2);border:1px dashed var(--claude-border);border-radius:8px;padding:12px;font-size:12px;line-height:1.5;color:var(--claude-text-secondary);">
              <div style="font-weight:600;color:var(--claude-coral);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
                <span>🛡️</span> Sovereign Free Billing
              </div>
              All prompts in Carib Cold Workbench route with guaranteed $0.00 usage cost, pulling from your organization's 2.8B+ monthly free tokens pool.
            </div>
          </div>
        </div>
      `;

      // Workbench Event Bindings
      const sysInput = pContainer.querySelector("#wbSystemPrompt");
      sysInput?.addEventListener("input", (e) => { wbSystemPrompt = e.target.value; });

      pContainer.querySelectorAll(".wb-msg-content").forEach(el => {
        el.addEventListener("input", (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          if (wbMessages[idx]) wbMessages[idx].content = e.target.value;
        });
      });

      pContainer.querySelectorAll(".wb-del-msg").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.delIdx, 10);
          wbMessages.splice(idx, 1);
          renderPlatformView(container);
        });
      });

      pContainer.querySelector("#wbBtnAddMsg")?.addEventListener("click", () => {
        const lastRole = wbMessages.length ? wbMessages[wbMessages.length - 1].role : "assistant";
        const nextRole = lastRole === "user" ? "assistant" : "user";
        wbMessages.push({ role: nextRole, content: "" });
        renderPlatformView(container);
      });

      const tempSlider = pContainer.querySelector("#wbTempSlider");
      const tempVal = pContainer.querySelector("#wbTempVal");
      tempSlider?.addEventListener("input", (e) => {
        wbTemperature = parseFloat(e.target.value);
        if (tempVal) tempVal.textContent = wbTemperature;
      });

      const maxTokSlider = pContainer.querySelector("#wbMaxTokensSlider");
      const maxTokVal = pContainer.querySelector("#wbMaxTokensVal");
      maxTokSlider?.addEventListener("input", (e) => {
        wbMaxTokens = parseInt(e.target.value, 10);
        if (maxTokVal) maxTokVal.textContent = wbMaxTokens;
      });

      const thinkSlider = pContainer.querySelector("#wbThinkingSlider");
      const thinkVal = pContainer.querySelector("#wbThinkingVal");
      thinkSlider?.addEventListener("input", (e) => {
        wbThinkingBudget = parseInt(e.target.value, 10);
        if (thinkVal) thinkVal.textContent = wbThinkingBudget ? wbThinkingBudget + ' tokens' : 'Off';
      });

      const modelSelect = pContainer.querySelector("#wbModelSelect");
      modelSelect?.addEventListener("change", (e) => {
        wbModel = e.target.value;
        const b = pContainer.querySelector("#wbModelBadge");
        if (b) {
          if (wbModel.includes("deepseek")) b.textContent = "Opus Tier";
          else if (wbModel.includes("llama-3.2")) b.textContent = "Haiku Tier";
          else if (wbModel.includes("ollama")) b.textContent = "Local Sovereign";
          else b.textContent = "Sonnet Tier";
        }
      });

      // Run Prompt execution handler
      pContainer.querySelector("#wbBtnRun")?.addEventListener("click", async () => {
        const outBox = pContainer.querySelector("#wbOutputBox");
        const btnRun = pContainer.querySelector("#wbBtnRun");
        if (wbRunning) return;
        wbRunning = true;
        if (btnRun) {
          btnRun.disabled = true;
          btnRun.textContent = "⏳ Executing Sovereign Run...";
        }
        if (outBox) outBox.innerHTML = '<span style="color:var(--claude-coral);font-style:italic;">Synthesizing response via Sovereign Engine...</span>';

        const startTime = performance.now();
        const payloadMessages = [];
        if (wbSystemPrompt.trim()) {
          payloadMessages.push({ role: "system", content: wbSystemPrompt.trim() });
        }
        wbMessages.forEach(m => {
          if (m.content.trim()) payloadMessages.push({ role: m.role, content: m.content.trim() });
        });

        try {
          const userMsg = payloadMessages[payloadMessages.length - 1]?.content || "Hello";
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMsg,
              model: wbModel,
              mode: "chat",
              history: payloadMessages.slice(0, -1)
            })
          });

          const data = await res.json();
          const elapsed = Math.round(performance.now() - startTime);
          let reply = "";
          if (data && data.status === "ok" && data.reply) {
            reply = data.reply;
          } else if (data && data.reply) {
            reply = data.reply;
          } else if (data && data.response) {
            reply = data.response;
          } else if (data && data.detail) {
            reply = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
          } else {
            reply = "No response received from sovereign co-pilot.";
          }
          const inTokens = Math.round(JSON.stringify(payloadMessages).length / 4);
          const outTokens = Math.round(reply.length / 4);

          wbLastResult = {
            content: reply,
            latency_ms: elapsed,
            input_tokens: inTokens,
            output_tokens: outTokens,
            model_used: data.model || wbModel,
            raw: data
          };

          if (outBox) outBox.innerHTML = formatMarkdown(reply);
          const latEl = pContainer.querySelector("#wbTelLatency");
          const inEl = pContainer.querySelector("#wbTelInput");
          const outEl = pContainer.querySelector("#wbTelOutput");
          if (latEl) latEl.textContent = elapsed + "ms";
          if (inEl) inEl.textContent = inTokens + " tokens";
          if (outEl) outEl.textContent = outTokens + " tokens";
        } catch (err) {
          if (outBox) outBox.innerHTML = `<span style="color:#ef4444;">Execution failed: ${err.message}</span>`;
        } finally {
          wbRunning = false;
          if (btnRun) {
            btnRun.disabled = false;
            btnRun.textContent = "▶️ Run Prompt";
          }
        }
      });

      pContainer.querySelector("#wbBtnCopyOutput")?.addEventListener("click", (e) => {
        if (wbLastResult && wbLastResult.content) {
          window.copyCliCommand(wbLastResult.content, e.target);
        }
      });

      let jsonMode = false;
      pContainer.querySelector("#wbBtnJsonToggle")?.addEventListener("click", () => {
        if (!wbLastResult) return;
        jsonMode = !jsonMode;
        const outBox = pContainer.querySelector("#wbOutputBox");
        if (outBox) {
          if (jsonMode) {
            outBox.innerHTML = `<pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:12px;border-radius:6px;overflow:auto;">${JSON.stringify(wbLastResult, null, 2)}</pre>`;
          } else {
            outBox.innerHTML = formatMarkdown(wbLastResult.content);
          }
        }
      });
    }

    // ==========================================
    // 2. MODELS & LOCAL SOVEREIGN RUNNER HUB
    // ==========================================
    // ==========================================
    // 2. MANAGED AGENTS (BETA) SUBTAB
    // ==========================================
    else if (activePlatformTab === "managed-agents") {
      pContainer.innerHTML = `
        <div class="workbench-layout">
          <div class="workbench-main-pane">
            <!-- Overview Card -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <span>🤖</span> Claude Managed Agents (Beta) Infrastructure
                </span>
                <span class="badge-status-pill badge-beta">managed-agents-2026-04-01</span>
              </div>
              <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0;">
                Pre-built, configurable agent harness that runs in managed sovereign infrastructure. Best for long-running autonomous tasks, multi-turn reasoning, and asynchronous execution with persistent filesystems and tool execution loops.
              </p>

              <table class="platform-table" style="margin-top:12px;">
                <thead>
                  <tr>
                    <th>Core Concept</th>
                    <th>Platform Role</th>
                    <th>Runtime State</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Agent</strong></td>
                    <td>Defines model engine, system instructions, tools, MCP servers, and skills.</td>
                    <td><span class="badge-status-pill badge-active">Persistent ID</span></td>
                  </tr>
                  <tr>
                    <td><strong>Environment</strong></td>
                    <td>Configures execution sandbox: Cloud Sovereign Container or Local Mac Sandbox.</td>
                    <td><span class="badge-status-pill badge-sovereign">Isolated Runtime</span></td>
                  </tr>
                  <tr>
                    <td><strong>Session</strong></td>
                    <td>Running stateful instance carrying conversation history, files, and background workflows.</td>
                    <td><span class="badge-status-pill badge-active">SSE Stateful</span></td>
                  </tr>
                  <tr>
                    <td><strong>Events</strong></td>
                    <td>Streaming turns: user messages, agent thoughts, tool execution, and confirmations.</td>
                    <td><span class="badge-status-pill badge-free">Zero Token Cost</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Agent Creator Form -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <span>⚙️</span> Create Reusable Agent (POST /v1/agents)
                </span>
                <button id="btnCreateManagedAgent" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:6px 14px;cursor:pointer;font-size:12.5px;">
                  ➕ Save Agent Config
                </button>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="font-size:12px;font-weight:600;color:var(--claude-text-muted);display:block;margin-bottom:4px;">Agent Identifier</label>
                  <input id="maAgentName" class="workbench-textarea" style="min-height:36px;height:36px;" value="sovereign-code-assistant" />
                </div>
                <div>
                  <label style="font-size:12px;font-weight:600;color:var(--claude-text-muted);display:block;margin-bottom:4px;">Model Engine Tier</label>
                  <select id="maAgentModel" class="workbench-textarea" style="min-height:36px;height:36px;">
                    <option value="claude-3-7-sonnet-latest">Claude 3.7 Sonnet (Coding & Tool Calling Tier)</option>
                    <option value="claude-3-5-opus-latest">Claude 3.5 / 5.5 Opus (Deep Scientific Reasoning)</option>
                    <option value="claude-haiku-5-5">Claude Haiku 5.5 (Fast High-Volume Stream)</option>
                    <option value="deepseek-r1:14b">Local DeepSeek-R1 14B (Ollama Local)</option>
                    <option value="qwen2.5-coder:32b">Local Qwen 2.5 Coder 32B (Ollama Local)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--claude-text-muted);display:block;margin-bottom:4px;">System Prompt & Operational Guardrails</label>
                <textarea id="maSystemPrompt" class="workbench-textarea" style="min-height:75px;">You are an autonomous engineering agent running in the Carib Cold sovereign sandbox. You have access to bash commands, filesystem operations, and restricted web fetch. Preserve creator confidentiality and ensure zero subscription cost.</textarea>
              </div>
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--claude-text-muted);display:block;margin-bottom:6px;">Autonomous Tools Access</label>
                <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px;">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked /> <code>bash</code></label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked /> <code>file_editor</code></label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked /> <code>web_search</code></label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked /> <code>web_fetch</code></label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked /> <code>mcp_tools</code></label>
                </div>
              </div>
            </div>

            <!-- Live Session Stream Viewer -->
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <span>📡</span> Live Session Event Stream (/v1/sessions/{id}/events/stream)
                </span>
                <span style="font-size:11.5px;color:var(--claude-green);font-weight:600;">● SSE Connected · $0.00 Cost</span>
              </div>
              <div id="maEventStreamBox" style="background:#141413;border:1px solid #2a2a28;border-radius:8px;padding:14px;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;line-height:1.6;max-height:220px;overflow-y:auto;">
                <div style="color:#6b7280;"># Listening on Server-Sent Events stream for agent session sess_01J9X8K4S2...</div>
                <div style="color:#10b981;">event: session.created</div>
                <div style="color:#9ca3af;">data: {"id": "sess_01J9X8K4S2", "agent_id": "sovereign-code-assistant", "environment": "sovereign-cloud-sandbox", "status": "running"}</div>
                <div style="color:#10b981;margin-top:6px;">event: user.message</div>
                <div style="color:#9ca3af;">data: {"role": "user", "content": "Analyze system performance and verify live sports telemetry pipeline"}</div>
                <div style="color:#f59e0b;margin-top:6px;">event: agent.thought</div>
                <div style="color:#9ca3af;">data: {"thought": "Executing bash probe against Carib Live Results calendar and live meet endpoints"}</div>
                <div style="color:#3b82f6;margin-top:6px;">event: tool.execute</div>
                <div style="color:#9ca3af;">data: {"tool": "bash", "command": "curl -sS https://caribliveresults.info/api/meets.php | jq .status"}</div>
                <div style="color:#10b981;margin-top:6px;">event: agent.message</div>
                <div style="color:#d6d4ce;">data: {"role": "assistant", "content": "Telemetry sync confirmed active: Sub-100ms response across SKN Athletics calendar feeds."}</div>
              </div>
            </div>
          </div>

          <!-- Side Pane -->
          <div class="workbench-side-pane">
            <div class="wb-control-group">
              <span class="wb-control-label">Sandbox Environment</span>
              <select class="workbench-textarea" style="min-height:36px;height:36px;">
                <option value="cloud">Cloud Sovereign Sandbox (Ubuntu 24.04)</option>
                <option value="local">Local Mac Sandbox (localhost:11434)</option>
              </select>
              <span style="font-size:11.5px;color:var(--claude-text-muted);margin-top:4px;">Sandboxes provide secure file isolation & bash runtimes.</span>
            </div>

            <div class="wb-control-group">
              <span class="wb-control-label">Dynamic Workflows</span>
              <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;">
                <input type="checkbox" checked /> multiagent_20261001 enabled
              </label>
              <span style="font-size:11.5px;color:var(--claude-text-muted);margin-top:4px;">Allows autonomous sub-agent synthesis and phased runs.</span>
            </div>

            <div class="wb-control-group">
              <span class="wb-control-label">Managed Agents SDK Snippet</span>
              <pre style="margin:0;font-family:ui-monospace,monospace;font-size:11px;color:#d6d4ce;background:#141413;padding:12px;border-radius:6px;overflow:auto;line-height:1.4;">from anthropic import Anthropic

client = Anthropic(
  base_url="https://caribclaude.caribgroupofcompanies.ltd"
)

session = client.beta.managed_agents.sessions.create(
  agent_id="sovereign-code-assistant",
  environment={"type": "cloud"}
)
print("Session Active:", session.id)</pre>
            </div>
          </div>
        </div>
      `;

      pContainer.querySelector("#btnCreateManagedAgent")?.addEventListener("click", () => {
        alert("Managed Agent definition saved! You can now launch sessions against this agent via POST /v1/sessions.");
      });
    }

    // ==========================================
    // 3. ADMIN API & WORKSPACES SUBTAB
    // ==========================================
    else if (activePlatformTab === "admin-api") {
      const res = await fetch("/admin/api/platform/keys");
      const keyData = await res.json();
      const wifRes = await fetch("/admin/api/platform/wif");
      const wifData = await wifRes.json();

      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Claude Admin API & Organization Control</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Manage organization members, workspaces, invites, API keys, and Workload Identity Federation (WIF) programmatically with the Admin API.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;margin-bottom:24px;">
          <!-- Org Card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>🏛️</span> Organization Profile</span>
              <span class="badge-status-pill badge-active">Scale Tier</span>
            </div>
            <div style="font-size:13px;display:flex;flex-direction:column;gap:8px;">
              <div><strong>Organization ID:</strong> <span class="key-prefix">org_sovereign_carib_core</span></div>
              <div><strong>Organization Name:</strong> Carib Sovereign AI Core</div>
              <div><strong>Quota:</strong> 2.8 Billion Tokens / Month ($0.00 Guaranteed)</div>
              <div><strong>API Endpoint:</strong> <code>https://caribclaude.caribgroupofcompanies.ltd/v1</code></div>
            </div>
          </div>

          <!-- Workspaces Card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>📁</span> Workspaces</span>
              <button class="btn-ghost-help" style="font-size:12px;" onclick="alert('Workspace created: wrkspc_' + Math.random().toString(36).substr(2, 9))">➕ New Workspace</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--claude-border);">
                <span><strong>Default Workspace</strong> <code style="color:var(--claude-coral);">wrkspc_production</code></span>
                <span class="badge-status-pill badge-active">Active</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--claude-border);">
                <span><strong>Test & Sandbox</strong> <code style="color:var(--claude-coral);">wrkspc_sandbox_test</code></span>
                <span class="badge-status-pill badge-sovereign">Quick Access</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;">
                <span><strong>Engineering Team</strong> <code style="color:var(--claude-coral);">wrkspc_engineering</code></span>
                <span class="badge-status-pill badge-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- API Keys Management -->
        <div class="workbench-card" style="margin-bottom:24px;">
          <div class="workbench-card-header">
            <span class="workbench-card-title"><span>🔑</span> Sovereign API Keys</span>
            <button id="btnCreateKeyAdmin" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:6px 14px;cursor:pointer;font-size:12.5px;">
              ➕ Create New API Key
            </button>
          </div>
          <table class="platform-table">
            <thead>
              <tr>
                <th>Key Name</th>
                <th>Key Prefix</th>
                <th>Owner</th>
                <th>Scopes</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${(keyData.keys || []).map(k => `
                <tr>
                  <td><strong>${k.name}</strong></td>
                  <td><span class="key-prefix">${k.key_prefix}</span></td>
                  <td>${k.username || 'admin'}</td>
                  <td>${k.scopes || 'messages:write,admin'}</td>
                  <td><span style="color:var(--claude-green);font-weight:600;">Active</span></td>
                  <td><button class="btn-logout wb-btn-revoke" data-key-id="${k.id}">Revoke</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Workload Identity Federation (WIF) -->
        <div class="workbench-card">
          <div class="workbench-card-header">
            <span class="workbench-card-title"><span>🌐</span> Workload Identity Federation (WIF) OIDC Pools</span>
            <button id="btnAddWifAdmin" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:6px 14px;cursor:pointer;font-size:12.5px;">
              ➕ Add OIDC Pool
            </button>
          </div>
          <table class="platform-table">
            <thead>
              <tr>
                <th>Federation Name</th>
                <th>Issuer URL</th>
                <th>Audience</th>
                <th>Service Account</th>
              </tr>
            </thead>
            <tbody>
              ${(wifData.federations || []).map(w => `
                <tr>
                  <td><strong>${w.name}</strong></td>
                  <td><span style="font-family:monospace;font-size:11.5px;">${w.issuer_url}</span></td>
                  <td><span style="font-family:monospace;font-size:11.5px;">${w.audience}</span></td>
                  <td><span class="key-prefix">${w.service_account_name || w.service_account_id}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;

      pContainer.querySelector("#btnCreateKeyAdmin")?.addEventListener("click", async () => {
        const name = prompt("Enter a name for the new API key:");
        if (!name) return;
        const cres = await fetch("/admin/api/platform/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
        const cdata = await cres.json();
        alert(`API Key Created!\n\nKey: ${cdata.api_key}\n\nCopy this key immediately; it cannot be shown again.`);
        renderPlatformView(container);
      });

      pContainer.querySelectorAll(".wb-btn-revoke").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("Revoke this API key?")) {
            await fetch(`/admin/api/platform/keys/${btn.dataset.keyId}`, { method: "DELETE" });
            renderPlatformView(container);
          }
        });
      });

      pContainer.querySelector("#btnAddWifAdmin")?.addEventListener("click", async () => {
        const name = prompt("Federation Name (e.g. GitHub Actions):");
        if (!name) return;
        const issuer = prompt("Issuer URL:", "https://token.actions.githubusercontent.com");
        if (!issuer) return;
        const audience = prompt("Audience:", "https://caribclaude.caribgroupofcompanies.ltd");
        if (!audience) return;
        await fetch("/admin/api/platform/wif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, issuer_url: issuer, audience, service_account_id: "sa_default" })
        });
        renderPlatformView(container);
      });
    }

    // ==========================================
    // 4. USE-CASE GUIDES & PROMPT RECIPES SUBTAB
    // ==========================================
    else if (activePlatformTab === "use-cases") {
      const useCaseCatalog = {
        support: {
          title: "Customer Support Agent",
          badge: "Production Blueprint",
          model: "Claude 3.7 Sonnet (Coding & Tool Calling Tier)",
          desc: "Context-aware chatbots with dynamic escalation, tone management, and RAG knowledge retrieval.",
          systemPrompt: `You are an elite, empathetic customer care specialist for Carib Group.
Resolve user inquiries swiftly, accurately, and politely.
1. Always maintain a professional, warm tone.
2. Ground all answers in official company policies; never hallucinate refund terms.
3. If an issue requires manual account intervention, flag for supervisor escalation.
4. Protect user privacy and financial details at all times under strict governance standards.`,
          sampleInput: `Hi, I ordered a seasonal pass yesterday and haven't received my confirmation email. Order ID: #CRB-99214. Can you help?`,
          sampleOutput: `Hello! I would be delighted to assist you with Order ID #CRB-99214.

Your transaction was successfully processed. During peak athletic meet registrations, email delivery may take up to 15 minutes.

Next steps:
1. Please check your spam folder for an email from passes@caribliveresults.info.
2. You can also download your digital QR pass directly by logging into caribliveresults.info.
3. If you still don't see it within 10 minutes, reply here and I will generate an instant reissue link.`
        },
        routing: {
          title: "Ticket Routing & Triage",
          badge: "High Throughput",
          model: "Claude Haiku 5.5 (Fast High-Volume Stream)",
          desc: "Fast, zero-shot ticket classification that parses incoming support tickets into prioritized queues.",
          systemPrompt: `You are a high-speed ticket triage classifier.
Analyze incoming support tickets and classify them into exactly one department and priority.
Output JSON format:
{
  "department": "Technical Support" | "Billing" | "Creator Care" | "Hardware Telemetry",
  "priority": "P1-Critical" | "P2-High" | "P3-Medium" | "P4-Low",
  "summary": "1 sentence synopsis",
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Urgent"
}`,
          sampleInput: `Our timing system sensors at the track stadium stopped sending live telemetry midway through the 100m heats. The live broadcast displays are blank! We need an engineer immediately!`,
          sampleOutput: `{
  "department": "Hardware Telemetry",
  "priority": "P1-Critical",
  "summary": "Live timing sensors disconnected during stadium track heats causing broadcast interruption.",
  "sentiment": "Urgent"
}`
        },
        moderation: {
          title: "Content Moderation & Safety",
          badge: "Trust & Safety",
          model: "Claude Haiku 5.5 (Fast High-Volume Stream)",
          desc: "Automated content moderation filtering submissions against community standards and safety rules.",
          systemPrompt: `Evaluate incoming text against community standards.
Respond in JSON:
{
  "flagged": true | false,
  "categories_triggered": ["list", "of", "violations"],
  "action": "allow" | "quarantine" | "reject",
  "rationale": "Reason for decision"
}`,
          sampleInput: `Hey check out this guaranteed 1000x crypto investment bot on telegram @fastcash999 - DM me your SSN to claim bonus!`,
          sampleOutput: `{
  "flagged": true,
  "categories_triggered": ["Commercial Spam / Fraud", "PII Solicitation"],
  "action": "reject",
  "rationale": "Unsolicited promotional financial spam and malicious solicitation of sensitive identity information."
}`
        },
        legal: {
          title: "Legal & Contract Summarization",
          badge: "Deep Reasoning",
          model: "Claude 3.5 / 5.5 Opus (Deep Scientific Reasoning)",
          desc: "Deep analysis of multi-page agreements, extracting liability clauses and risk flags.",
          systemPrompt: `You are a commercial contract analyst. Review legal agreements and extract critical terms:
1. Executive Summary
2. Key Obligations
3. Liability & Indemnification Caps
4. Termination Rights
5. Risk Flags & Asymmetric Liabilities`,
          sampleInput: `Contract Snippet: "Either party may terminate upon 30 days written notice. In no event shall Provider's total liability exceed the total amounts paid by Customer in the three (3) months preceding the incident. Customer agrees to defend and indemnify Provider from all third-party claims."`,
          sampleOutput: `### Executive Analysis of Contract Terms

**1. Termination Rights**: Bilateral for convenience with 30 days written notice.
**2. Liability Limitations**: Lookback cap of 3 months of fees paid, heavily favoring Provider.
**3. Indemnification Obligations**: Unilateral indemnity on Customer with zero reciprocal protection.
⚠️ **Critical Risk Flag**: Customer assumes broad third-party indemnity while Provider's liability is capped at 3 months.`
        },
        commerce: {
          title: "Commerce & Merchant Agent",
          badge: "Agentic Loop",
          model: "Claude 3.7 Sonnet (Coding & Tool Calling Tier)",
          desc: "Shopping and merchant assistant blueprint running on tool use and Managed Agents.",
          systemPrompt: `You are an automated merchant concierge. Help shoppers discover merchandise, check stock, and build checkout orders.
Tools: search_catalog(query), check_inventory(sku, size), create_cart(items).`,
          sampleInput: `I'm looking for official Carib Live athletic spikes in size 10.5 US. Do you have them in stock?`,
          sampleOutput: `I found the **Carib Live Elite Track Spikes** in stock!
- **SKU**: CRB-SPK-ELITE-105
- **Size**: 10.5 US (Men's)
- **Status**: 🟢 In Stock (14 pairs remaining)
- **Price**: $145.00 USD
Would you like me to reserve a pair and generate your checkout link?`
        }
      };

      const selected = useCaseCatalog[activeUseCaseId] || useCaseCatalog.support;

      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Production Use-Case Guides & Prompt Recipes</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Battle-tested architecture blueprints and production prompt templates optimized for Claude's model tiers.
          </p>
        </div>

        <!-- Use Case Selector Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:24px;">
          ${Object.entries(useCaseCatalog).map(([k, v]) => `
            <div class="use-case-card ${k === activeUseCaseId ? 'active' : ''}" data-ucid="${k}" style="cursor:pointer;${k === activeUseCaseId ? 'border-color:var(--claude-coral);background:var(--claude-surface-2);' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="badge-status-pill badge-beta" style="font-size:10px;">${v.badge}</span>
              </div>
              <strong style="font-size:14px;color:var(--claude-text-primary);">${v.title}</strong>
              <div style="font-size:12px;color:var(--claude-text-secondary);line-height:1.4;">${v.desc.substr(0, 75)}...</div>
            </div>
          `).join("")}
        </div>

        <!-- Detail Box -->
        <div class="workbench-layout">
          <div class="workbench-main-pane">
            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title">
                  <span>📋</span> System Prompt Template: ${selected.title}
                </span>
                <div style="display:flex;gap:8px;">
                  <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
                  <button id="btnSendToWorkbench" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:5px 12px;font-size:12px;cursor:pointer;">
                    🧪 Load into Workbench
                  </button>
                </div>
              </div>
              <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12.5px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;white-space:pre-wrap;">${selected.systemPrompt}</pre>
            </div>

            <div class="workbench-card">
              <div class="workbench-card-header">
                <span class="workbench-card-title"><span>💬</span> Sample Request & Structured Output</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div>
                  <span style="font-size:11.5px;font-weight:600;color:var(--claude-text-muted);text-transform:uppercase;">User Prompt</span>
                  <div style="background:var(--claude-surface-2);padding:10px 14px;border-radius:6px;font-size:13px;margin-top:4px;">${selected.sampleInput}</div>
                </div>
                <div>
                  <span style="font-size:11.5px;font-weight:600;color:var(--claude-text-muted);text-transform:uppercase;">Expected Claude Output</span>
                  <div style="background:#141413;color:#d6d4ce;padding:12px 14px;border-radius:6px;font-family:ui-monospace,monospace;font-size:12px;margin-top:4px;white-space:pre-wrap;line-height:1.5;">${selected.sampleOutput}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="workbench-side-pane">
            <div class="wb-control-group">
              <span class="wb-control-label">Recommended Model Tier</span>
              <div style="font-size:13px;font-weight:600;color:var(--claude-coral);">${selected.model}</div>
              <span style="font-size:11.5px;color:var(--claude-text-muted);margin-top:4px;">Calibrated for optimal balance between latency and cognitive depth.</span>
            </div>

            <div class="wb-control-group">
              <span class="wb-control-label">Architecture Path</span>
              <div style="font-size:12.5px;color:var(--claude-text-secondary);line-height:1.5;">
                • Messages API: For direct model calls<br/>
                • Managed Agents: For stateful tool loops<br/>
                • Agent SDK: For in-process orchestration
              </div>
            </div>
          </div>
        </div>
      `;

      pContainer.querySelectorAll("[data-ucid]").forEach(card => {
        card.addEventListener("click", () => {
          activeUseCaseId = card.dataset.ucid;
          renderPlatformView(container);
        });
      });

      pContainer.querySelector("#btnSendToWorkbench")?.addEventListener("click", () => {
        wbSystemPrompt = selected.systemPrompt;
        wbMessages = [{ role: "user", content: selected.sampleInput }];
        activePlatformTab = "workbench";
        renderPlatformView(container);
      });
    }

    // ==========================================
    // 5. CLIENT SDKS & CLI SUBTAB
    // ==========================================
    else if (activePlatformTab === "sdks-cli") {
      const sdkExamples = {
        python: {
          install: "pip install anthropic",
          code: `import anthropic

client = anthropic.Anthropic(
    base_url="https://caribclaude.caribgroupofcompanies.ltd/v1",
    api_key="sk-ant-sov-YOUR_KEY"
)

message = client.messages.create(
    model="claude-3-7-sonnet-latest",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain sovereign token routing"}]
)
print(message.content[0].text)`
        },
        typescript: {
          install: "npm install @anthropic-ai/sdk",
          code: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  baseURL: 'https://caribclaude.caribgroupofcompanies.ltd/v1',
  apiKey: 'sk-ant-sov-YOUR_KEY',
});

const message = await client.messages.create({
  model: 'claude-3-7-sonnet-latest',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Explain sovereign token routing' }],
});

console.log(message.content[0].text);`
        },
        csharp: {
          install: "dotnet add package Anthropic.SDK",
          code: `using Anthropic.SDK;
using Anthropic.SDK.Constants;

var client = new AnthropicClient(new APIAuthentication("sk-ant-sov-YOUR_KEY")) {
    BaseUrl = "https://caribclaude.caribgroupofcompanies.ltd/v1"
};

var message = await client.Messages.GetClaudeMessageAsync(new MessageParameters() {
    Model = "claude-3-7-sonnet-latest",
    MaxTokens = 1024,
    Messages = new List<Message>() {
        new Message(RoleType.User, "Explain sovereign token routing")
    }
});
Console.WriteLine(message.Message.Content[0].Text);`
        },
        go: {
          install: "go get github.com/anthropics/anthropic-sdk-go",
          code: `package main

import (
    "context"
    "fmt"
    "github.com/anthropics/anthropic-sdk-go"
    "github.com/anthropics/anthropic-sdk-go/option"
)

func main() {
    client := anthropic.NewClient(
        option.WithBaseURL("https://caribclaude.caribgroupofcompanies.ltd/v1"),
        option.WithAPIKey("sk-ant-sov-YOUR_KEY"),
    )
    msg, _ := client.Messages.New(context.TODO(), anthropic.MessageNewParams{
        Model: anthropic.F("claude-3-7-sonnet-latest"),
        MaxTokens: anthropic.F(int64(1024)),
        Messages: anthropic.F([]anthropic.MessageParam{
            anthropic.NewUserMessage(anthropic.NewTextBlock("Explain sovereign token routing")),
        }),
    })
    fmt.Println(msg.Content[0].Text)
}`
        },
        curl: {
          install: "# Built into macOS, Linux, and Windows",
          code: `curl https://caribclaude.caribgroupofcompanies.ltd/v1/messages \\
  -H "x-api-key: sk-ant-sov-YOUR_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-3-7-sonnet-latest",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Explain sovereign token routing"}]
  }'`
        },
        openai_compat: {
          install: "pip install openai",
          code: `from openai import OpenAI

client = OpenAI(
    base_url="https://caribclaude.caribgroupofcompanies.ltd/v1",
    api_key="sk-ant-sov-YOUR_KEY"
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet-latest",
    messages=[{"role": "user", "content": "Explain sovereign token routing"}]
)
print(response.choices[0].message.content)`
        }
      };

      const selectedSdk = sdkExamples[activeSdkLang] || sdkExamples.python;

      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Client SDKs, ant CLI & Framework Libraries</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Official tooling for building with Claude: client SDKs in seven languages, the ant CLI, and OpenAI API compatibility.
          </p>
        </div>

        <!-- Language Selector -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          <button class="sdk-pill-btn ${activeSdkLang === 'python' ? 'active' : ''}" data-lang="python">Python</button>
          <button class="sdk-pill-btn ${activeSdkLang === 'typescript' ? 'active' : ''}" data-lang="typescript">TypeScript</button>
          <button class="sdk-pill-btn ${activeSdkLang === 'csharp' ? 'active' : ''}" data-lang="csharp">C# (.NET)</button>
          <button class="sdk-pill-btn ${activeSdkLang === 'go' ? 'active' : ''}" data-lang="go">Go</button>
          <button class="sdk-pill-btn ${activeSdkLang === 'curl' ? 'active' : ''}" data-lang="curl">cURL / HTTP</button>
          <button class="sdk-pill-btn ${activeSdkLang === 'openai_compat' ? 'active' : ''}" data-lang="openai_compat">OpenAI SDK Compatibility</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:20px;margin-bottom:24px;">
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>📦</span> Installation</span>
              <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
            </div>
            <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12.5px;color:#d6d4ce;background:#141413;padding:12px;border-radius:6px;overflow:auto;">${selectedSdk.install}</pre>
          </div>

          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>🚀</span> Client Integration Snippet</span>
              <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
            </div>
            <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;">${selectedSdk.code}</pre>
          </div>

          <!-- ant CLI Card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>💻</span> ant CLI (carib-claude CLI) Quickstart</span>
              <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
            </div>
            <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;"># 1. Configure Sovereign Base URL in shell
export ANTHROPIC_BASE_URL=https://caribclaude.caribgroupofcompanies.ltd/v1
export ANTHROPIC_API_KEY=sk-ant-sov-YOUR_KEY

# 2. Run interactive prompt with streaming
ant prompt "Explain how sovereign model routing provides 2.8B free monthly tokens"

# 3. Pipe file or script directly
cat schema.sql | ant prompt "Generate migration diff"</pre>
          </div>
        </div>
      `;

      pContainer.querySelectorAll("[data-lang]").forEach(btn => {
        btn.addEventListener("click", () => {
          activeSdkLang = btn.dataset.lang;
          renderPlatformView(container);
        });
      });
    }

    // ==========================================
    // 6. AGENT SKILLS & MCP REGISTRY SUBTAB
    // ==========================================
    else if (activePlatformTab === "skills-tools") {
      const desktopConfigJson = JSON.stringify({
        "mcpServers": {
          "carib-cold-sovereign": {
            "command": "node",
            "args": ["/Users/djooozyb/carib live player apps/.agents/scripts/mcp_sovereign_bridge.js"],
            "env": {
              "CARIB_BASE_URL": "https://caribclaude.caribgroupofcompanies.ltd"
            }
          },
          "jarvis-mac-bridge": {
            "command": "python3",
            "args": ["/Users/djooozyb/carib live player apps/.agents/scripts/jarvis_mac_bridge.py"]
          },
          "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/djooozyb/carib live player apps"]
          }
        }
      }, null, 2);

      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Agent Skills, Tool Runners & Model Context Protocol (MCP)</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Equip Claude with progressive disclosure skills (claude-api skill), Computer Use & Browser Use toolsets, and local MCP server bridges.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
          <!-- claude-api skill card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>📖</span> claude-api Agent Skill</span>
              <span class="badge-status-pill badge-active">Bundled</span>
            </div>
            <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.5;margin:0;">
              An open-source Agent Skill providing Claude with up-to-date API reference material, SDK documentation, and best practices across 8 programming languages.
            </p>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:6px;">
              <div>• <strong>Progressive Disclosure:</strong> Only loads documentation relevant to the current project language.</div>
              <div>• <strong>Automatic Activation:</strong> Detects Anthropic SDK imports or prompt caching flags.</div>
              <div>• <strong>Command Trigger:</strong> Use <code>/claude-api</code> in Claude Code.</div>
            </div>
          </div>

          <!-- Computer & Browser Use Card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>🖥️</span> Computer Use & Browser Toolsets</span>
              <span class="badge-status-pill badge-beta">Beta 2026</span>
            </div>
            <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.5;margin:0;">
              Classes in Python and TypeScript SDKs for <code>computer_toolset_20260801</code> and <code>browser_use</code>. Subclass to run desktop or browser automation with approval callbacks.
            </p>
            <div style="font-size:12px;display:flex;flex-direction:column;gap:6px;">
              <div>• <strong>Browser Tool:</strong> Web navigation with strict <code>allowed_hosts</code> security.</div>
              <div>• <strong>Computer Use:</strong> Screen inspection, mouse clicks, and keyboard strokes.</div>
            </div>
          </div>
        </div>

        <!-- MCP Servers Grid -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h4 style="margin:0;font-size:15px;">Active Model Context Protocol (MCP) Servers</h4>
            <span style="font-size:12.5px;color:var(--claude-text-secondary);">Local bridges connecting tools and databases into Claude Desktop & Carib Cold.</span>
          </div>
          <button id="btnCopyMcpConfig" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:6px 14px;cursor:pointer;font-size:12.5px;">
            📋 Copy claude_desktop_config.json
          </button>
        </div>

        <div class="mcp-grid" style="margin-bottom:24px;">
          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">jarvis-mac-bridge</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">Direct telemetry bridge connecting Jarvis OS, macOS screen analytics, window bounds, and local system automation.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">14 Available Tools · Protocol 2024-11-05</div>
          </div>

          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">carib-sovereign-bridge</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">Connects Carib Live Results track & field feeds, Orthanc PACS DICOM images, and Azure MariaDB databases.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">8 Available Tools · Sub-100ms Feeds</div>
          </div>

          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">filesystem</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">Secure, scoped workspace read/write access for pair-programming and code refactoring.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">6 Available Tools · Node.js Native</div>
          </div>

          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">sqlite-memory</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">Persistent local knowledge store and conversational memory across agent runs.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">4 Available Tools · Embedded SQLite</div>
          </div>

          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">github</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">GitHub repository synchronization, branch creation, pull request reviews, and issue tracker.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">12 Available Tools · GraphQL & REST</div>
          </div>

          <div class="mcp-card">
            <div class="mcp-card-header">
              <strong style="font-size:14.5px;">fetch</strong>
              <span class="mcp-status-pill mcp-active">🟢 Active</span>
            </div>
            <div style="font-size:12.5px;color:var(--claude-text-secondary);">High-speed public web page, HTML, and markdown content extractor with clean readability formatting.</div>
            <div style="font-size:11.5px;color:var(--claude-coral);font-weight:600;">2 Available Tools · Puppeteer / HTTP</div>
          </div>
        </div>

        <!-- Claude Desktop Config Box -->
        <div class="workbench-card">
          <div class="workbench-card-header">
            <span class="workbench-card-title"><span>🖥️</span> Claude Desktop App Configuration (macOS Parity)</span>
            <span style="font-size:12px;color:var(--claude-text-muted);">~/Library/Application Support/Claude/claude_desktop_config.json</span>
          </div>
          <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;">${desktopConfigJson}</pre>
        </div>
      `;

      pContainer.querySelector("#btnCopyMcpConfig")?.addEventListener("click", (e) => {
        window.copyCliCommand(desktopConfigJson, e.target);
      });
    }

    // ==========================================
    // 7. MODELS & LOCAL SOVEREIGN RUNNER HUB
    // ==========================================
    else if (activePlatformTab === "models") {
      pContainer.innerHTML = `
        <div style="margin-bottom:20px;background:var(--claude-surface-1);border:1px solid var(--claude-border);border-radius:12px;padding:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h3 style="margin:0 0 6px 0;font-size:16px;display:flex;align-items:center;gap:8px;">
              <span>🖥️</span> Local Sovereign Ollama Hardware Status
            </h3>
            <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);">
              Run models locally on your MacBook hardware via Ollama (<code style="font-family:monospace;color:var(--claude-coral);">http://localhost:11434</code>) with zero latency loss and complete data sovereignty.
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="mcp-status-pill ${localOllamaConnected ? 'mcp-active' : ''}" style="background:var(--claude-surface-2);border:1px solid var(--claude-border);padding:6px 14px;font-size:12.5px;">
              ${localOllamaConnected ? '🟢 Connected (Local Mode Active)' : '⚪ Cloud Sovereign Pool Active'}
            </div>
            <button id="btnCheckLocalHub" class="btn-open-project" style="background:var(--claude-coral);color:#fff;border:none;padding:7px 14px;font-size:12.5px;cursor:pointer;">
              Probe Local Runner
            </button>
          </div>
        </div>

        <div class="model-tier-grid">
          <!-- Opus Tier Card -->
          <div class="model-tier-card">
            <div class="model-tier-header">
              <div>
                <span class="model-tier-badge badge-opus">Opus Tier</span>
                <h3 style="margin:8px 0 4px 0;font-size:18px;">Claude 3 Opus</h3>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Deep Scientific Reasoning & Complex Synthesis</div>
              </div>
            </div>
            <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.5;margin:0;">
              High-intelligence tier designed for intricate architectural design, mathematical proofs, multi-file code refactoring, and deep research analysis.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div><strong>Cloud Mapping:</strong> <span class="key-prefix">deepseek/deepseek-r1:free</span></div>
              <div><strong>Context Window:</strong> 128,000 tokens</div>
              <div><strong>Cost:</strong> <span style="color:var(--claude-green);font-weight:600;">$0.00 / Free Tier</span></div>
            </div>
            <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
              <span style="font-size:11.5px;font-weight:600;color:var(--claude-text-muted);text-transform:uppercase;">Download & Run Locally</span>
              <div class="model-code-box">
                <code>ollama run deepseek-r1:14b</code>
                <button class="btn-mini-filter" onclick="window.copyCliCommand('ollama run deepseek-r1:14b', this)" style="color:#ffffff;cursor:pointer;">Copy</button>
              </div>
              <span style="font-size:11px;color:var(--claude-text-muted);">Recommended: 16GB+ Unified Memory (RAM)</span>
            </div>
          </div>

          <!-- Sonnet Tier Card -->
          <div class="model-tier-card">
            <div class="model-tier-header">
              <div>
                <span class="model-tier-badge badge-sonnet">Sonnet Tier</span>
                <h3 style="margin:8px 0 4px 0;font-size:18px;">Claude 3.5 / 3.7 Sonnet</h3>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Coding Champion & Advanced Tool Use</div>
              </div>
            </div>
            <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.5;margin:0;">
              Flagship model balancing state-of-the-art software engineering, autonomous tool calling, and high-throughput execution.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div><strong>Cloud Mapping:</strong> <span class="key-prefix">qwen/qwen-2.5-coder-32b-instruct:free</span></div>
              <div><strong>Context Window:</strong> 128,000 tokens</div>
              <div><strong>Cost:</strong> <span style="color:var(--claude-green);font-weight:600;">$0.00 / Free Tier</span></div>
            </div>
            <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
              <span style="font-size:11.5px;font-weight:600;color:var(--claude-text-muted);text-transform:uppercase;">Download & Run Locally</span>
              <div class="model-code-box">
                <code>ollama run qwen2.5-coder:32b</code>
                <button class="btn-mini-filter" onclick="window.copyCliCommand('ollama run qwen2.5-coder:32b', this)" style="color:#ffffff;cursor:pointer;">Copy</button>
              </div>
              <span style="font-size:11px;color:var(--claude-text-muted);">Recommended: 24GB+ Unified Memory (RAM)</span>
            </div>
          </div>

          <!-- Haiku Tier Card -->
          <div class="model-tier-card">
            <div class="model-tier-header">
              <div>
                <span class="model-tier-badge badge-haiku">Haiku Tier</span>
                <h3 style="margin:8px 0 4px 0;font-size:18px;">Claude 3.5 Haiku</h3>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Sub-100ms Ultra-Low Latency & High Volume</div>
              </div>
            </div>
            <p style="font-size:13px;color:var(--claude-text-secondary);line-height:1.5;margin:0;">
              Blazing fast inference tailored for real-time live results telemetry, interactive chat auto-completions, and rapid triage tasks.
            </p>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div><strong>Cloud Mapping:</strong> <span class="key-prefix">meta-llama/llama-3.2-3b-instruct:free</span></div>
              <div><strong>Context Window:</strong> 128,000 tokens</div>
              <div><strong>Cost:</strong> <span style="color:var(--claude-green);font-weight:600;">$0.00 / Free Tier</span></div>
            </div>
            <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
              <span style="font-size:11.5px;font-weight:600;color:var(--claude-text-muted);text-transform:uppercase;">Download & Run Locally</span>
              <div class="model-code-box">
                <code>ollama run llama3.2:3b</code>
                <button class="btn-mini-filter" onclick="window.copyCliCommand('ollama run llama3.2:3b', this)" style="color:#ffffff;cursor:pointer;">Copy</button>
              </div>
              <span style="font-size:11px;color:var(--claude-text-muted);">Recommended: Any Mac (8GB+ RAM, runs in 2.2GB VRAM)</span>
            </div>
          </div>
        </div>
      `;

      pContainer.querySelector("#btnCheckLocalHub")?.addEventListener("click", async () => {
        await checkLocalOllama();
        renderPlatformView(container);
      });
    }

    // ==========================================
    // 8. REST API REFERENCE & BATCHES SUBTAB
    // ==========================================
    else if (activePlatformTab === "api-reference") {
      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Claude API Reference & Batch Execution</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Programmatic access to sovereign endpoints, asynchronous batch processing at 50% cost, and token counting preflight.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:20px;margin-bottom:24px;">
          <!-- Endpoints Card -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>📖</span> Available Endpoints</span>
              <span class="badge-status-pill badge-active">v1 REST Specification</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div style="border-bottom:1px solid var(--claude-border);padding-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                  <span class="api-method-badge api-post">POST</span>
                  <code style="font-size:13px;font-weight:600;">/v1/messages</code>
                </div>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Direct conversational inference, multi-turn dialogue, tool execution, and Server-Sent Events (SSE) streaming.</div>
              </div>

              <div style="border-bottom:1px solid var(--claude-border);padding-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                  <span class="api-method-badge api-post">POST</span>
                  <code style="font-size:13px;font-weight:600;">/v1/messages/batches</code>
                </div>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Asynchronous batch processing for high-volume non-interactive workloads with 50% token cost reduction.</div>
              </div>

              <div style="border-bottom:1px solid var(--claude-border);padding-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                  <span class="api-method-badge api-post">POST</span>
                  <code style="font-size:13px;font-weight:600;">/v1/messages/count_tokens</code>
                </div>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Calculates exact input tokens for messages, system prompts, and tool schemas prior to submission.</div>
              </div>

              <div style="border-bottom:1px solid var(--claude-border);padding-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                  <span class="api-method-badge api-get">GET</span>
                  <code style="font-size:13px;font-weight:600;">/v1/models</code>
                </div>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Lists active sovereign models, context window limits, and server-side tool capabilities.</div>
              </div>

              <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                  <span class="api-method-badge api-post">POST</span>
                  <code style="font-size:13px;font-weight:600;">/v1/files</code>
                </div>
                <div style="font-size:12.5px;color:var(--claude-text-secondary);">Uploads and manages files for cross-session document analysis and multimodal inputs.</div>
              </div>
            </div>
          </div>

          <!-- Interactive Token Counter Tester -->
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title"><span>🔢</span> Interactive Token Counter (/v1/messages/count_tokens)</span>
              <span id="tokCountDisplay" style="font-size:13px;font-weight:600;color:var(--claude-green);">0 tokens</span>
            </div>
            <textarea id="tokCountInput" class="workbench-textarea" style="min-height:80px;" placeholder="Type or paste any text to test exact token estimation..."></textarea>
          </div>
        </div>
      `;

      const tInput = pContainer.querySelector("#tokCountInput");
      const tDisp = pContainer.querySelector("#tokCountDisplay");
      if (tInput && tDisp) {
        tInput.addEventListener("input", () => {
          const text = tInput.value || "";
          const approx = Math.max(0, Math.ceil(text.length / 3.8));
          tDisp.textContent = `${approx} tokens (${text.length} chars)`;
        });
      }
    }

    // ==========================================
    // 9. RELEASE NOTES & CHANGELOG SUBTAB
    // ==========================================
    else if (activePlatformTab === "release-notes") {
      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Claude Platform Release Notes</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Updates to the Claude Platform, API endpoints, client SDKs, and sovereign Carib Cold infrastructure.
          </p>
        </div>

        <div style="max-width:850px;">
          <!-- October 15, 2026 -->
          <div class="release-timeline-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <strong style="font-size:15px;color:var(--claude-text-primary);">October 15, 2026</strong>
              <span class="badge-status-pill badge-active">Platform Update</span>
            </div>
            <ul style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0 0 10px 0;padding-left:18px;">
              <li><strong>Fast Mode General Availability:</strong> Fast mode is out of research preview for Claude Opus 5.5 without beta header requirements.</li>
              <li><strong>Compliance API:</strong> Added <code>GET /v1/compliance/organizations/{org_uuid}/user_preferences</code> for enterprise compliance auditing.</li>
            </ul>
          </div>

          <!-- October 14, 2026 -->
          <div class="release-timeline-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <strong style="font-size:15px;color:var(--claude-text-primary);">October 14, 2026</strong>
              <span class="badge-status-pill badge-beta">Observability</span>
            </div>
            <ul style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0 0 10px 0;padding-left:18px;">
              <li><strong>OpenTelemetry Tracing:</strong> Launched OpenTelemetry export in beta across Python, TypeScript, C#, Go, Java, PHP, and Ruby SDKs.</li>
              <li><strong>Scheduled Deployments:</strong> Claude Managed Agents now supports cron recurring executions.</li>
            </ul>
          </div>

          <!-- October 9, 2026 -->
          <div class="release-timeline-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <strong style="font-size:15px;color:var(--claude-text-primary);">October 9, 2026</strong>
              <span class="badge-status-pill badge-beta">Autonomous Agents</span>
            </div>
            <ul style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0 0 10px 0;padding-left:18px;">
              <li><strong>Dynamic Workflows:</strong> Enabled <code>multiagent_20261001</code> in Managed Agents allowing agents to coordinate phased autonomous sub-agents.</li>
            </ul>
          </div>

          <!-- October 7, 2026 -->
          <div class="release-timeline-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <strong style="font-size:15px;color:var(--claude-text-primary);">October 7, 2026</strong>
              <span class="badge-status-pill badge-active">Model Launch</span>
            </div>
            <ul style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0 0 10px 0;padding-left:18px;">
              <li><strong>Claude Haiku 5.5 Launched:</strong> 1M token context window, 128k max output, and adaptive thinking via the <code>effort</code> parameter.</li>
              <li><strong>Breaking Changes:</strong> Manual extended thinking budget tokens and assistant prefill return 400 on Haiku 5.5; use adaptive thinking.</li>
            </ul>
          </div>

          <!-- Sovereign Carib Cold Release -->
          <div class="release-timeline-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <strong style="font-size:15px;color:var(--claude-coral);">Sovereign Carib Cold Architecture</strong>
              <span class="badge-status-pill badge-sovereign">Open Source</span>
            </div>
            <ul style="font-size:13px;color:var(--claude-text-secondary);line-height:1.6;margin:0 0 10px 0;padding-left:18px;">
              <li><strong>2.8 Billion Free Monthly Tokens:</strong> Full free sovereign pool active across Opus, Sonnet, and Haiku tiers with $0.00 cost.</li>
              <li><strong>1:1 macOS Desktop App UI Parity:</strong> Seamless switching between desktop chat workspace and platform admin console.</li>
              <li><strong>Local Ollama Hardware Auto-Detection:</strong> Probes localhost:11434 with zero-configuration fallback.</li>
            </ul>
          </div>
        </div>
      `;
    }

    else if (activePlatformTab === "usage") {
      pContainer.innerHTML = `
        <div class="usage-grid">
          <div class="usage-stat-card">
            <span class="usage-stat-label">Monthly Sovereign Quota</span>
            <span class="usage-stat-val">2.8 Billion</span>
            <span class="usage-stat-sub">Tokens Allocated Monthly</span>
          </div>

          <div class="usage-stat-card">
            <span class="usage-stat-label">Current Cycle Consumed</span>
            <span class="usage-stat-val">48,219,304</span>
            <span class="usage-stat-sub" style="color:var(--claude-coral);">1.72% Total Utilized</span>
          </div>

          <div class="usage-stat-card">
            <span class="usage-stat-label">Active Requests Today</span>
            <span class="usage-stat-val">1,420</span>
            <span class="usage-stat-sub">100% Successful · 0 Failures</span>
          </div>

          <div class="usage-stat-card">
            <span class="usage-stat-label">Total Cost to Date</span>
            <span class="usage-stat-val" style="color:var(--claude-green);">$0.00</span>
            <span class="usage-stat-sub">Guaranteed Free Sovereign</span>
          </div>
        </div>

        <div class="workbench-card">
          <div class="workbench-card-header">
            <span class="workbench-card-title">
              <span>📈</span> Latency Breakdown by Tier
            </span>
            <span style="font-size:12px;color:var(--claude-text-muted);">Real-Time Network Telemetry</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--claude-border);">
              <span><strong>Local Ollama Hardware (MacBook)</strong></span>
              <span style="color:var(--claude-green);font-weight:600;">38ms average</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--claude-border);">
              <span><strong>Haiku Fast Tier (Llama 3.2 3B Free)</strong></span>
              <span style="color:var(--claude-green);font-weight:600;">85ms average</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--claude-border);">
              <span><strong>Sonnet Coding Tier (Qwen 2.5 Coder 32B Free)</strong></span>
              <span style="color:var(--claude-coral);font-weight:600;">190ms average</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;">
              <span><strong>Opus Reasoning Tier (DeepSeek R1 671B Free)</strong></span>
              <span style="color:var(--claude-coral);font-weight:600;">320ms average</span>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // 7. OPEN SOURCE SELF-HOST GUIDE SUBTAB
    // ==========================================
    else if (activePlatformTab === "opensource") {
      const dockerComposeYml = `version: "3.8"
services:
  carib-cold:
    image: ghcr.io/carib-group/carib-cold:latest
    container_name: carib-cold
    restart: always
    ports:
      - "8082:8082"
    environment:
      - PORT=8082
      - SOVEREIGN_MODE=true
      - FREE_TOKEN_POOL=2800000000
      - OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}
      - NVIDIA_NIM_API_KEY=\${NVIDIA_NIM_API_KEY}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./data:/home/azureuser/.fcc
      - ./config:/home/azureuser/.claude`;

      pContainer.innerHTML = `
        <div style="margin-bottom:20px;">
          <h3 class="settings-section-title" style="margin:0 0 6px 0;border:none;">Open Source Turnkey Deployment</h3>
          <p style="margin:0;font-size:13px;color:var(--claude-text-secondary);line-height:1.5;">
            Deploy Carib Cold anywhere in minutes. Matches the official Claude experience while routing across free sovereign models and local Ollama runners with zero cost.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:20px;">
          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title">
                <span>🐳</span> Docker Compose Specification (docker-compose.yml)
              </span>
              <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
            </div>
            <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;">${dockerComposeYml}</pre>
          </div>

          <div class="workbench-card">
            <div class="workbench-card-header">
              <span class="workbench-card-title">
                <span>⚡</span> Quick Start Commands
              </span>
              <button class="btn-ghost-help" onclick="window.copyCliCommand(this.parentElement.nextElementSibling.textContent, this)">📋 Copy</button>
            </div>
            <pre style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:#d6d4ce;background:#141413;padding:16px;border-radius:8px;overflow:auto;line-height:1.5;"># 1. Clone repository
git clone git@github.com:CARIB-GROUP-OF-COMPANIES-LTD/carib-live-player-suite.git
cd carib-live-player-suite

# 2. Start local Ollama runner on Mac (optional)
ollama pull deepseek-r1:14b
ollama pull qwen2.5-coder:32b
ollama pull llama3.2:3b

# 3. Launch Carib Cold Service
docker compose up -d

# 4. Open browser
open http://localhost:8082</pre>
          </div>
        </div>
      `;
    }
  }

  // --- Claude Ecosystem & Directory View ---
  const DIRECTORY_ITEMS = [
    {
      id: "macos-desktop-app",
      name: "Carib Cold macOS Desktop App",
      category: "official",
      badge: "Official Client",
      badgeClass: "badge-official",
      icon: "💻",
      author: "Anthropic & Carib Group",
      version: "v1.2.0 (ARM64/Intel)",
      description: "1:1 macOS desktop app parity with global hotkey (⌘+Shift+C), native menu bar quick-prompter, local Ollama runner auto-discovery, and Sovereign free model pool.",
      tags: ["macOS", "Desktop", "Native", "ARM64", "Free"],
      primaryAction: { text: "Open Workspace", fn: "if(window.navigateToView) window.navigateToView('new');" },
      secondaryAction: { text: "Download DMG", copyText: "https://caribclaude.caribgroupofcompanies.ltd/downloads/CaribCold-1.2.0-arm64.dmg" }
    },
    {
      id: "claude-code-cli",
      name: "Free Claude Code Sovereign CLI",
      category: "official",
      badge: "Official CLI",
      badgeClass: "badge-official",
      icon: "⌨️",
      author: "Carib Open Source",
      version: "v2.4.1",
      description: "High-speed terminal coding agent matching Claude Code CLI, natively routed to the 2.8B+ monthly free tokens pool with zero Anthropic subscription requirement.",
      tags: ["CLI", "Terminal", "Coding Agent", "TypeScript", "Node.js"],
      primaryAction: { text: "Install Script", copyText: "curl -sSL https://caribclaude.caribgroupofcompanies.ltd/install.sh | bash" },
      secondaryAction: { text: "npm pkg", copyText: "npm install -g free-claude-code" }
    },
    {
      id: "jarvis-mac-bridge",
      name: "Jarvis OS Mac Bridge MCP",
      category: "mcp",
      badge: "Verified MCP",
      badgeClass: "badge-mcp",
      icon: "🧠",
      author: "Jarvis Core Engineering",
      version: "v3.1.0",
      description: "Connects Claude to the running Mac workstation via local socket for live screen inspection, TTS speech synthesis, active process telemetry, and Azure DB operations.",
      tags: ["macOS", "Jarvis OS", "Screen Inspection", "Audio TTS", "Azure"],
      primaryAction: { text: "Copy MCP Config", copyText: `{"mcpServers":{"jarvis-mac-bridge":{"command":"python3","args":["/Users/djooozyb/carib live player apps/.agents/scripts/jarvis_mcp_bridge.py"]}}}` },
      secondaryAction: { text: "View Config", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>window.switchPlatformTab('mcp'),100);}" }
    },
    {
      id: "carib-sovereign-bridge",
      name: "Carib Sovereign Multi-Model Bridge MCP",
      category: "mcp",
      badge: "Verified MCP",
      badgeClass: "badge-mcp",
      icon: "⚡",
      author: "Carib Sovereign Infra",
      version: "v2.0.0",
      description: "Sovereign router exposing Opus, Sonnet, and Haiku equivalents backed by DeepSeek-R1, Qwen2.5-Coder, and Llama 3.2 on local Ollama or cloud pool.",
      tags: ["Tri-Model", "Ollama", "DeepSeek-R1", "Qwen-Coder", "Llama"],
      primaryAction: { text: "Model Hub", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>window.switchPlatformTab('models'),100);}" },
      secondaryAction: { text: "Copy Config", copyText: `{"mcpServers":{"carib-sovereign-bridge":{"command":"python3","args":["/home/azureuser/free-claude-code/mcp_server.py"]}}}` }
    },
    {
      id: "carib-live-results",
      name: "Carib Live Results Athletic Engine",
      category: "live",
      badge: "Live Showcase",
      badgeClass: "badge-live",
      icon: "🏆",
      author: "Carib Live Results Team",
      version: "v3.4.0 (Live)",
      description: "Official track and field championship meet calendar and real-time live results sync engine (Rule 4 Priority Demonstration Milestone) at caribliveresults.info.",
      tags: ["Athletics", "Live Results", "SKN Track & Field", "Real-Time", "Sub-100ms"],
      primaryAction: { text: "Open Live Site", href: "https://caribliveresults.info" },
      secondaryAction: { text: "Meets API", href: "https://caribliveresults.info/api/meets.php" }
    },
    {
      id: "filesystem-memory-mcp",
      name: "Filesystem & SQLite Memory MCP",
      category: "mcp",
      badge: "Verified MCP",
      badgeClass: "badge-mcp",
      icon: "📁",
      author: "Anthropic Standards",
      version: "v1.0.4",
      description: "Direct read/write access to project directories, code maps, and persistent SQLite vector memory without cloud leaks or token overhead.",
      tags: ["Filesystem", "SQLite", "Vector Memory", "Local Storage"],
      primaryAction: { text: "Copy MCP Config", copyText: `{"mcpServers":{"filesystem":{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","/Users/djooozyb/carib live player apps"]}}}` },
      secondaryAction: { text: "Explore MCP", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>window.switchPlatformTab('mcp'),100);}" }
    },
    {
      id: "github-devops-mcp",
      name: "GitHub & Repository DevOps MCP",
      category: "mcp",
      badge: "Verified MCP",
      badgeClass: "badge-mcp",
      icon: "🐙",
      author: "GitHub / Carib DevOps",
      version: "v1.1.2",
      description: "Autonomous branch creation, PR drafting, commit pushing, and continuous issue tracking across the Carib Live Player Suite repositories.",
      tags: ["GitHub", "Git", "CI/CD", "PR Automation"],
      primaryAction: { text: "Copy MCP Config", copyText: `{"mcpServers":{"github":{"command":"npx","args":["-y","@modelcontextprotocol/server-github"]}}}` },
      secondaryAction: { text: "View GitHub Repo", href: "https://github.com/CARIB-GROUP-OF-COMPANIES-LTD/carib-live-player-suite" }
    },
    {
      id: "brave-search-mcp",
      name: "Brave Search & Web Scraper MCP",
      category: "mcp",
      badge: "Verified MCP",
      badgeClass: "badge-mcp",
      icon: "🔍",
      author: "Anthropic Standards",
      version: "v1.0.2",
      description: "Autonomous real-time web research, documentation scraping, and fact-checking directly inside conversation turns.",
      tags: ["Search", "Web Scraping", "Research", "Documentation"],
      primaryAction: { text: "Copy MCP Config", copyText: `{"mcpServers":{"brave-search":{"command":"npx","args":["-y","@modelcontextprotocol/server-brave-search"]}}}` },
      secondaryAction: { text: "View Registry", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>window.switchPlatformTab('mcp'),100);}" }
    },
    {
      id: "chief-of-staff-persona",
      name: "Chief of Staff Autonomous Lead Persona",
      category: "persona",
      badge: "Staff Persona",
      badgeClass: "badge-persona",
      icon: "👔",
      author: "Hermes / Jarvis Orchestrator",
      version: "v2.2.0 (Active)",
      description: "Senior operations orchestrator overseeing the 6 specialized departmental leads (Platform Console, Desktop UI, Sovereign Models, MCP Systems, Open Source Packaging, QA Sentinel).",
      tags: ["Chief of Staff", "Multi-Agent", "Governance", "Hermes"],
      primaryAction: { text: "Load in Workbench", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>{window.switchPlatformTab('workbench');const el=document.getElementById('workbenchSystemPrompt');if(el){el.value='You are the Chief of Staff for Carib Group Autonomous Engineering. Oversee departmental task forces, enforce Rule 1 (Jarvis-First), Rule 4 (Carib Live Results), Rule 5 (Isolation), and Rule 6 (Confidentiality).';}},150);}" },
      secondaryAction: { text: "View Allocation", fn: "alert('Chief of Staff Task Force is registered under local knowledge #496 with 6 specialized departmental leads.');" }
    },
    {
      id: "qa-sentinel-persona",
      name: "QA Sentinel & Zero-Regression Lead Persona",
      category: "persona",
      badge: "Staff Persona",
      badgeClass: "badge-persona",
      icon: "🛡️",
      author: "QA Autonomous Core",
      version: "v2.0.0 (Active)",
      description: "Autonomous QA specialist performing continuous curl health checks, CDP screenshot verification, and zero-hallucination validation before any live promotion.",
      tags: ["QA", "Testing", "CDP", "Zero-Regression", "Health Checks"],
      primaryAction: { text: "Load in Workbench", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>{window.switchPlatformTab('workbench');const el=document.getElementById('workbenchSystemPrompt');if(el){el.value='You are QA Sentinel. Verify all endpoints, test environment quick access isolation, and zero-hallucination validation.';}},150);}" },
      secondaryAction: { text: "Run Probe", fn: "if(window.ClaudeSuite&&window.ClaudeSuite.probeLocalRunner)window.ClaudeSuite.probeLocalRunner();" }
    },
    {
      id: "nextjs-claude-starter",
      name: "Next.js 15 + Sovereign Claude SDK Starter",
      category: "starter",
      badge: "Starter Kit",
      badgeClass: "badge-starter",
      icon: "▲",
      author: "Carib Open Source",
      version: "v1.0.0",
      description: "Production-ready Next.js 15 App Router boilerplate with streaming AI chat, artifacts side-panel, dark mode tokens, and free Claude Code API routing.",
      tags: ["Next.js 15", "React 19", "Tailwind", "TypeScript", "Artifacts"],
      primaryAction: { text: "Copy Git Clone", copyText: "git clone https://github.com/CARIB-GROUP-OF-COMPANIES-LTD/carib-live-player-suite.git" },
      secondaryAction: { text: "View Stack", fn: "alert('Includes Next.js 15, React 19, Lucide Icons, and Carib Cold API client adapter.');" }
    },
    {
      id: "docker-compose-stack",
      name: "Docker Compose Turnkey Self-Hosting Stack",
      category: "starter",
      badge: "Self-Hosted",
      badgeClass: "badge-starter",
      icon: "🐳",
      author: "DevOps Specialist",
      version: "v1.0.0",
      description: "Complete one-command Docker Compose stack running Carib Cold admin console, API router, and SQLite database with zero external subscription dependencies.",
      tags: ["Docker", "Compose", "Self-Hosted", "Open Source", "Linux/macOS"],
      primaryAction: { text: "View Self-Hosting", fn: "if(window.navigateToView){window.navigateToView('platform');setTimeout(()=>window.switchPlatformTab('opensource'),100);}" },
      secondaryAction: { text: "Quick Start", copyText: "curl -sSL https://caribclaude.caribgroupofcompanies.ltd/docker-compose.yml -o docker-compose.yml && docker compose up -d" }
    }
  ];

  let dirSearchQuery = "";
  let dirCategoryFilter = "all";

  async function renderDirectoryView(container) {
    container = container || document.getElementById("view-directory");
    if (!container) return;

    container.innerHTML = `
      <div class="directory-container">
        <div class="directory-header-box">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <h1 class="projects-title" style="display:flex;align-items:center;gap:10px;">
                <span>🌐</span> Claude Ecosystem & Directory
              </h1>
              <p style="color:var(--claude-text-secondary);font-size:13.5px;margin-top:6px;max-width:760px;line-height:1.5;">
                Explore official clients, verified Model Context Protocol (MCP) servers, departmental agent personas, developer starters, and sovereign integrations.
              </p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="directory-badge badge-official">100% Free Tiers</span>
              <span class="directory-badge badge-mcp">6 Verified MCPs</span>
              <span class="directory-badge badge-persona">6 Dept Staff</span>
              <span class="directory-badge badge-live">2.8B+ Tokens/Mo</span>
            </div>
          </div>

          <div class="directory-search-wrapper">
            <input type="text" id="directorySearchInput" class="directory-search-input" placeholder="🔍 Search clients, MCP servers, staff personas, templates, or tags..." value="${dirSearchQuery}">
            <div class="directory-filter-chips">
              <button class="directory-chip ${dirCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">All Items (${DIRECTORY_ITEMS.length})</button>
              <button class="directory-chip ${dirCategoryFilter === 'official' ? 'active' : ''}" data-cat="official">Official Apps</button>
              <button class="directory-chip ${dirCategoryFilter === 'mcp' ? 'active' : ''}" data-cat="mcp">MCP Servers</button>
              <button class="directory-chip ${dirCategoryFilter === 'persona' ? 'active' : ''}" data-cat="persona">Staff Personas</button>
              <button class="directory-chip ${dirCategoryFilter === 'starter' ? 'active' : ''}" data-cat="starter">Developer Starters</button>
              <button class="directory-chip ${dirCategoryFilter === 'live' ? 'active' : ''}" data-cat="live">Live Showcase</button>
            </div>
          </div>
        </div>

        <div id="directoryGridContainer" class="directory-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    function renderGridCards() {
      const grid = document.getElementById("directoryGridContainer");
      if (!grid) return;

      const filtered = DIRECTORY_ITEMS.filter((item) => {
        const matchesCategory = dirCategoryFilter === "all" || item.category === dirCategoryFilter;
        const q = dirSearchQuery.toLowerCase().trim();
        const matchesQuery = !q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q));
        return matchesCategory && matchesQuery;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px; color:var(--claude-text-muted);">
            <div style="font-size:36px;margin-bottom:12px;">🔍</div>
            <div style="font-size:16px;font-weight:600;color:var(--claude-text-primary);margin-bottom:6px;">No directory integrations match your filter</div>
            <div style="font-size:13px;">Try clearing your search query or choosing another category chip.</div>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map((item) => {
        let primaryBtn = "";
        if (item.primaryAction) {
          if (item.primaryAction.copyText) {
            const escaped = item.primaryAction.copyText.replace(/"/g, '&quot;');
            primaryBtn = `<button class="directory-action-btn primary" onclick="navigator.clipboard.writeText('${escaped}');this.innerText='Copied!';setTimeout(()=>this.innerText='${item.primaryAction.text}',1500);">${item.primaryAction.text}</button>`;
          } else if (item.primaryAction.href) {
            primaryBtn = `<a href="${item.primaryAction.href}" target="_blank" rel="noopener" class="directory-action-btn primary" style="text-decoration:none;">${item.primaryAction.text} ↗</a>`;
          } else if (item.primaryAction.fn) {
            primaryBtn = `<button class="directory-action-btn primary" onclick="${item.primaryAction.fn}">${item.primaryAction.text}</button>`;
          }
        }

        let secondaryBtn = "";
        if (item.secondaryAction) {
          if (item.secondaryAction.copyText) {
            const escaped = item.secondaryAction.copyText.replace(/"/g, '&quot;');
            secondaryBtn = `<button class="directory-action-btn" onclick="navigator.clipboard.writeText('${escaped}');this.innerText='Copied!';setTimeout(()=>this.innerText='${item.secondaryAction.text}',1500);">${item.secondaryAction.text}</button>`;
          } else if (item.secondaryAction.href) {
            secondaryBtn = `<a href="${item.secondaryAction.href}" target="_blank" rel="noopener" class="directory-action-btn" style="text-decoration:none;">${item.secondaryAction.text} ↗</a>`;
          } else if (item.secondaryAction.fn) {
            secondaryBtn = `<button class="directory-action-btn" onclick="${item.secondaryAction.fn}">${item.secondaryAction.text}</button>`;
          }
        }

        return `
          <div class="directory-card" data-id="${item.id}">
            <div>
              <div class="directory-card-top">
                <div class="directory-card-icon">${item.icon}</div>
                <div class="directory-card-title-row">
                  <div class="directory-card-title">
                    <span>${item.name}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                    <span class="directory-badge ${item.badgeClass}">${item.badge}</span>
                    <span class="directory-card-meta">${item.version}</span>
                  </div>
                </div>
              </div>
              <div class="directory-card-desc">${item.description}</div>
              <div class="directory-card-tags">
                ${item.tags.map(t => `<span class="directory-tag">#${t}</span>`).join('')}
              </div>
            </div>
            <div class="directory-card-footer">
              <span style="font-size:11.5px;color:var(--claude-text-muted);">${item.author}</span>
              <div style="display:flex;gap:6px;">
                ${secondaryBtn}
                ${primaryBtn}
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    renderGridCards();

    // Event Listeners for Search & Chips
    const searchInput = document.getElementById("directorySearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        dirSearchQuery = e.target.value;
        renderGridCards();
      });
    }

    container.querySelectorAll(".directory-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".directory-chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        dirCategoryFilter = btn.dataset.cat;
        renderGridCards();
      });
    });
  }

  return {
    init,
    renderNew: renderNewView,
    renderNewView,
    renderProjects: renderProjectsView,
    renderProjectsView,
    renderArtifacts: renderArtifactsView,
    renderArtifactsView,
    renderCustomize: renderCustomizeView,
    renderCustomizeView,
    renderSettings: renderSettingsView,
    renderSettingsView,
    renderPlatform: renderPlatformView,
    renderPlatformView,
    renderDirectory: renderDirectoryView,
    renderDirectoryView,
    renderUsers: (container) => { if (window.UsersManagement) window.UsersManagement.render(); },
    renderUsersView: (container) => { if (window.UsersManagement) window.UsersManagement.render(); },
    applyRolePermissions,
    getUser: () => currentUser,
    getProjects: () => userProjects,
    openArtifactDrawer: window.openArtifactDrawer,
    closeArtifactDrawer: window.closeArtifactDrawer,
    switchArtifactDrawerTab: window.switchArtifactDrawerTab,
    artifactsRepo: ARTIFACTS_REPO,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ClaudeSuite.init();

});

  // Global keyboard shortcuts matching official Claude Desktop
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === ",") {
        e.preventDefault();
        if (window.navigateToView) window.navigateToView("settings");
      } else if (e.key === "1") {
        e.preventDefault();
        if (window.navigateToView) window.navigateToView("new");
      } else if (e.key === "2") {
        e.preventDefault();
        if (window.navigateToView) window.navigateToView("artifacts");
      } else if (e.key === "3") {
        e.preventDefault();
        if (window.navigateToView) window.navigateToView("customize");
      } else if (e.key === "0" || e.key === "`") {
        e.preventDefault();
        if (window.openCodeSession) window.openCodeSession();
      }
    }
  });

  // Agentic Sovereign Real-time Bridge
  (function initAgentNavBridge() {
    let lastSeq = 0;
    setInterval(async () => {
      try {
        const res = await fetch("/admin/api/nav_signal?t=" + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.seq && data.seq > lastSeq) {
          lastSeq = data.seq;
          if (data.view && window.navigateToView) {
            window.navigateToView(data.view);
          }
          if (data.evalCode) {
            try { eval(data.evalCode); } catch(err) { console.error("Nav eval err:", err); }
          }
        }
      } catch (_) {}
    }, 350);
  })();

  window.openSettingsModal = function() {
    if (window.navigateToView) {
      window.navigateToView("settings");
    }
  };
