"use strict";

// Each pending record has its own key so simultaneous tabs cannot overwrite each other's scores.
const runLog = (() => {
  const endpoint = document.querySelector('meta[name="practice-run-endpoint"]').content;
  const prefix = "calculus1-2026-pending-run:";
  const sending = new Set();

  async function send(record) {
    if (sending.has(record.id)) return;
    sending.add(record.id);
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(record), credentials: "omit", referrerPolicy: "no-referrer", keepalive: true
      });
      if (response.ok) localStorage.removeItem(prefix + record.id);
    } catch { /* Undelivered records can be sent on a later visit. */ }
    finally { sending.delete(record.id); }
  }

  function flush() {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) {
          const record = JSON.parse(localStorage.getItem(key));
          if (record) void send(record);
        }
      }
    } catch { /* Browsers can disable persistent storage. */ }
  }

  if (endpoint) {
    document.getElementById("run-notice").hidden = false;
    window.addEventListener("online", flush);
    flush();
  }

  return {
    record(record) {
      if (!endpoint || !record.id) return;
      try { localStorage.setItem(prefix + record.id, JSON.stringify(record)); } catch { /* Try delivery anyway. */ }
      void send(record);
    }
  };
})();
