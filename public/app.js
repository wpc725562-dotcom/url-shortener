/* ============================================
   URL Shortener - Front-end logic
   Talks to the Express API:
   - POST /api/shorten  -> create short link
   - GET  /api/stats    -> list recent links
   ============================================ */

(() => {
  "use strict";

  // ---------- DOM references ----------
  const form = document.getElementById("shorten-form");
  const input = document.getElementById("url-input");
  const submitBtn = document.getElementById("submit-btn");
  const result = document.getElementById("result");
  const resultLink = document.getElementById("result-link");
  const copyBtn = document.getElementById("copy-btn");
  const resultHint = document.getElementById("result-hint");
  const errorBox = document.getElementById("error");
  const historyList = document.getElementById("history-list");

  // ---------- Helpers ----------
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
    result.classList.add("hidden");
  }

  function hideError() {
    errorBox.classList.add("hidden");
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      const items = await res.json();
      renderHistory(items);
    } catch (err) {
      // Stats are optional; silently ignore on failure
    }
  }

  function renderHistory(items) {
    historyList.innerHTML = "";

    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.className = "history__empty";
      li.textContent = "No links yet. Create your first one!";
      historyList.appendChild(li);
      return;
    }

    items
      .slice()
      .reverse()
      .slice(0, 8) // show the 8 most recent
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "history__item";

        const short = document.createElement("a");
        short.className = "history__short";
        short.href = `/${item.code}`;
        short.textContent = `/${item.code}`;

        const original = document.createElement("span");
        original.className = "history__original";
        original.textContent = item.url;
        original.title = item.url;

        const clicks = document.createElement("span");
        clicks.className = "history__clicks";
        clicks.textContent = `${item.clicks} clicks`;

        li.appendChild(short);
        li.appendChild(original);
        li.appendChild(clicks);
        historyList.appendChild(li);
      });
  }

  // ---------- Events ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const url = input.value.trim();
    if (!url) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Working...";

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Something went wrong. Try again.");
        return;
      }

      resultLink.href = data.shortUrl;
      resultLink.textContent = data.shortUrl;
      resultHint.textContent = "This link works now. Share it anywhere!";
      result.classList.remove("hidden");

      // Refresh the recent list
      loadStats();
    } catch (err) {
      showError("Network error. Is the server running?");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Shorten";
    }
  });

  copyBtn.addEventListener("click", async () => {
    const url = resultLink.textContent;
    try {
      await navigator.clipboard.writeText(url);
      resultHint.textContent = "✅ Copied to clipboard!";
    } catch (err) {
      resultHint.textContent = "Copy failed - please copy manually.";
    }
  });

  // ---------- Init ----------
  loadStats();
})();
