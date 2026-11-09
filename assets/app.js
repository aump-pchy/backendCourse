/* Backend Learning Hub · ใช้ JavaScript ล้วน ไม่มี dependency */
(function () {
  "use strict";

  const PREFIX = "ltc-backend:";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(PREFIX + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- มาสคอต เฉาก๊วย ลาบราดอร์สีดำ ----------
  const CHAOKUAY = `<svg class="mascot" viewBox="0 0 200 200" role="img" aria-label="เฉาก๊วย ลาบราดอร์สีดำ มาสคอตประจำวิชา">
    <g stroke="var(--mascot-line)" stroke-width="2">
      <path d="M50 60C20 68 16 128 38 142c13 8 24-12 26-38z" fill="#1E2422"/>
      <path d="M150 60c30 8 34 68 12 82-13 8-24-12-26-38z" fill="#1E2422"/>
      <path d="M100 38c42 0 58 32 56 68-2 36-26 58-56 58s-54-22-56-58c-2-36 14-68 56-68z" fill="#2D3432"/>
    </g>
    <ellipse cx="100" cy="128" rx="35" ry="27" fill="#3B4442"/>
    <path d="M80 78q-8-6-15 0M120 78q8-6 15 0" stroke="#55605D" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="78" cy="94" r="8.5" fill="#0B0E0D"/><circle cx="122" cy="94" r="8.5" fill="#0B0E0D"/>
    <circle cx="80.5" cy="91" r="2.8" fill="#fff"/><circle cx="124.5" cy="91" r="2.8" fill="#fff"/>
    <path d="M87 113q13-9 26 0 0 12-13 14-13-2-13-14z" fill="#0F1312"/>
    <path d="M100 127v7m0 0q-9 8-16 2m16-2q9 8 16 2" stroke="#0F1312" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M93 139q7 17 14 0z" fill="#FF8FA3"/>
    <path d="M60 158q40 22 80 0l-2 12q-38 20-76 0z" fill="#2FB386"/>
    <circle cx="100" cy="181" r="11" fill="#F4D58D"/>
    <text x="100" y="185.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#5C4300">{ }</text>
  </svg>`;
  $$("[data-mascot]").forEach(el => { el.outerHTML = CHAOKUAY; });

  // ---------- โหมดมืด ----------
  const root = document.documentElement;
  const savedTheme = store.get("theme", null);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  $$("[data-theme-toggle]").forEach(btn => {
    const isDark = () => root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const label = () => { btn.textContent = isDark() ? "โหมดสว่าง" : "โหมดมืด"; };
    label();
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("theme", next);
      label();
    });
  });

  // ---------- แถบความคืบหน้าการอ่าน ----------
  const readbar = $(".readbar");
  if (readbar) {
    const upd = () => {
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      readbar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  // ---------- ปุ่มคัดลอกโค้ด ----------
  $$(".code").forEach(box => {
    const pre = $("pre", box);
    if (!pre || box.hasAttribute("data-nocopy")) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "copy-btn"; b.textContent = "คัดลอก";
    b.addEventListener("click", async () => {
      const text = pre.innerText.replace(/\n$/, "");
      try { await navigator.clipboard.writeText(text); b.textContent = "คัดลอกแล้ว"; }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents(pre);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "กด Ctrl/Cmd + C";
      }
      setTimeout(() => (b.textContent = "คัดลอก"), 1600);
    });
    box.appendChild(b);
  });

  // ---------- แท็บ Windows / macOS (จำค่าที่เลือก) ----------
  $$(".tabs").forEach(t => {
    const tabs = $$('[role="tab"]', t);
    const key = t.dataset.remember ? "tab:" + t.dataset.remember : null;
    const show = id => {
      tabs.forEach(b => {
        const on = b.dataset.tab === id;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
        const p = $("#" + b.getAttribute("aria-controls"), t); if (p) p.hidden = !on;
      });
      if (key) store.set(key, id);
    };
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => {
        show(b.dataset.tab);
        if (key) $$(`.tabs[data-remember="${t.dataset.remember}"]`).forEach(o => { if (o !== t) { const ob = $(`[data-tab="${b.dataset.tab}"]`, o); if (ob) ob.click(); } });
      });
      b.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); show(n.dataset.tab);
      });
    });
    let initial = key && store.get(key, null);
    if (!initial && t.dataset.remember === "os") initial = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "mac" : "win";
    show(initial && tabs.some(b => b.dataset.tab === initial) ? initial : tabs[0].dataset.tab);
  });

  // ---------- เช็กความเข้าใจระหว่างบท ----------
  $$(".qc>li").forEach(li => {
    const fb = document.createElement("div"); fb.className = "fb"; fb.setAttribute("aria-live", "polite");
    li.appendChild(fb);
    $$("button[data-a]", li).forEach(b => b.addEventListener("click", () => {
      const ok = b.dataset.a === li.dataset.correct;
      fb.innerHTML = `<span class="${ok ? "verdict-ok" : "verdict-bad"}">${ok ? "ถูกต้อง" : "ยังไม่ใช่"}</span> ${ok ? (li.dataset.why || "") : "ลองอ่านหัวข้อด้านบนอีกครั้ง"}`;
    }));
  });

  // ---------- เช็กลิสต์ตรวจผล + ความคืบหน้า ----------
  const units = [...new Set($$("[data-checklist]").map(l => l.dataset.checklist))];
  units.forEach(unit => {
    const key = unit + ":checks";
    const saved = store.get(key, {});
    const boxes = $$(`[data-checklist="${unit}"] input[type=checkbox]`);
    const bar = $(`[data-progress="${unit}"] > span`);
    const update = () => {
      const st = {}; boxes.forEach(b => (st[b.id] = b.checked)); store.set(key, st);
      if (bar) bar.style.width = Math.round(100 * boxes.filter(b => b.checked).length / boxes.length) + "%";
    };
    boxes.forEach(b => { b.checked = !!saved[b.id]; b.addEventListener("change", update); });
    update();
  });
  $$("[data-unit-progress]").forEach(el => {
    const unit = el.dataset.unitProgress, total = +el.dataset.total || 1;
    const st = store.get(unit + ":checks", {});
    const done = Object.values(st).filter(Boolean).length;
    const ticket = store.get(unit + ":exit", null);
    const bar = $(".progress>span", el); if (bar) bar.style.width = Math.round(100 * done / total) + "%";
    const meta = $(".meta", el);
    if (meta) meta.innerHTML = `<span>ตรวจผลแล้ว ${done}/${total}</span><span>${ticket ? "ส่ง Exit Ticket แล้ว" : "ยังไม่ทำ Exit Ticket"}</span>`;
  });

  // ---------- สารบัญ ----------
  if (matchMedia("(max-width: 900px)").matches) $$(".toc details").forEach(d => d.removeAttribute("open"));
  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { tocLinks.forEach(a => a.classList.remove("active")); const a = map.get(e.target.id); if (a) a.classList.add("active"); }
    }), { rootMargin: "-10% 0px -80% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---------- Exit Ticket (คำถามปลายเปิด) ----------
  $$("form[data-exit]").forEach(form => {
    const unit = form.dataset.exit, result = $(".exit-result", form), err = $(".form-error", form);
    form.addEventListener("submit", e => {
      e.preventDefault();
      err.textContent = "";
      const name = form.elements.name.value.trim(), sid = form.elements.sid.value.trim(), room = form.elements.room.value.trim();
      if (!name || !sid) { err.textContent = "ใส่ชื่อและรหัสนักศึกษาก่อน"; return; }
      const qs = $$("fieldset[data-q]", form);
      const empty = qs.filter(fs => !$("textarea", fs).value.trim());
      if (empty.length) { err.textContent = `ยังไม่ได้ตอบ ${empty.length} ข้อ`; $("textarea", empty[0]).focus(); return; }
      const fist = $("input[name=fist]:checked", form);
      if (!fist) { err.textContent = "เลือกระดับความมั่นใจ 1 ถึง 5 ก่อน"; return; }
      const lines = qs.map((fs, i) => `${i + 1}. ${$("legend", fs).textContent.replace(/^\d+\.\s*/, "")}\n   ตอบ: ${$("textarea", fs).value.trim()}`);
      const summary = [
        `Exit Ticket ${form.dataset.title || unit}`,
        `ชื่อ: ${name}  รหัส: ${sid}  ห้อง: ${room || "-"}`,
        ...lines,
        `ความมั่นใจ: ${fist.value}/5`,
        `ส่งเมื่อ: ${new Date().toLocaleString("th-TH")}`
      ].join("\n");
      store.set(unit + ":exit", { at: Date.now() });
      const formUrl = form.dataset.formUrl;
      result.hidden = false;
      result.innerHTML = `<p>คัดลอกข้อความนี้ส่งครูตามช่องทางที่ครูกำหนด แล้วเทียบคำตอบกับแนวคำตอบด้านล่าง</p>
        <div class="code" data-nocopy><pre>${esc(summary)}</pre></div>
        <div class="row"><button type="button" class="btn" data-copy-summary>คัดลอกผลส่งครู</button>
        ${formUrl ? `<a class="btn ghost" href="${esc(formUrl)}" target="_blank" rel="noopener">เปิดฟอร์มส่งงาน</a>` : ""}</div>`;
      $("[data-copy-summary]", result).addEventListener("click", async ev => {
        try { await navigator.clipboard.writeText(summary); ev.target.textContent = "คัดลอกแล้ว"; }
        catch (x) { ev.target.textContent = "คัดลอกจากกล่องด้านบนแทน"; }
      });
      $$(".hint", form).forEach(h => (h.hidden = false));
      result.scrollIntoView({ block: "nearest" });
    });
  });

  // ---------- Week 1: Client → Request → Server → Response ----------
  const flow = $("#flow-lab");
  if (flow) {
    const steps = [
      "Client คือโปรแกรมที่ขอข้อมูล เช่น เบราว์เซอร์ หน้าเว็บ Vue หรือ Thunder Client ผู้ใช้กดปุ่มดูรายการอุปกรณ์",
      "Client ส่ง Request ไปบอก Server ว่าต้องการอะไร: Method GET ที่ URL http://localhost:3000/api/equipment",
      "Server (Express) ตรวจว่ามี Route ไหนตรงกับ GET /api/equipment แล้วรันโค้ดของ Route นั้น",
      "Server ส่ง Response กลับ: Status 200 OK พร้อม Body เป็น JSON รายการอุปกรณ์ Client จึงนำไปแสดงผลได้"
    ];
    let i = 0;
    const boxes = $$(".flow>div", flow), text = $("#flow-text"), prev = $("#flow-prev"), next = $("#flow-next");
    const render = () => {
      boxes.forEach((b, j) => b.classList.toggle("on", j === i));
      text.textContent = `ขั้นที่ ${i + 1}: ${steps[i]}`;
      prev.disabled = i === 0; next.disabled = i === steps.length - 1;
    };
    prev.addEventListener("click", () => { if (i > 0) { i--; render(); } });
    next.addEventListener("click", () => { if (i < steps.length - 1) { i++; render(); } });
    render();
  }

  // ---------- Week 3: findIndex + splice ----------
  const sp = $("#splice-lab");
  if (sp) {
    const seed = () => [{ id: 101, name: "Notebook" }, { id: 102, name: "Projector" }, { id: 103, name: "PC" }];
    let arr = seed();
    const view = $(".arr", sp), out = $(".out", sp), input = $("input", sp);
    const draw = (mark, gone) => {
      view.innerHTML = arr.map((e, i) => `<div class="${i === mark ? "hit" : ""} ${gone === i ? "gone" : ""}"><small>index ${i}</small>id ${e.id} · ${esc(e.name)}</div>`).join("") || "<p>Array ว่างแล้ว</p>";
    };
    const run = safe => {
      const id = Number(input.value);
      const index = arr.findIndex(e => e.id === id);
      let msg = `findIndex(e => e.id === ${id}) ได้ ${index}\n`;
      if (safe && index === -1) { out.textContent = msg + "ตรวจพบ index === -1 จึงตอบ 404 และไม่ลบอะไร"; draw(-1); return; }
      const target = index === -1 ? arr.length - 1 : index;
      draw(target, target);
      const [removed] = arr.splice(index, 1);
      msg += `splice(${index}, 1) ลบ id ${removed ? removed.id : "-"} ออก`;
      if (index === -1 && removed) msg += `\nไม่ใช่ id ${id} ที่ต้องการ แต่เป็นตัวสุดท้ายของ Array`;
      out.textContent = msg;
      setTimeout(() => draw(-1), 900);
    };
    $("[data-run=safe]", sp).addEventListener("click", () => run(true));
    $("[data-run=unsafe]", sp).addEventListener("click", () => run(false));
    $("[data-run=reset]", sp).addEventListener("click", () => { arr = seed(); draw(-1); out.textContent = "คืนข้อมูลเริ่มต้นแล้ว"; });
    draw(-1);
  }

  // ---------- API จำลอง (ทำงานตามโค้ดในบทเรียน) ----------
  $$("[data-sim]").forEach(sim => {
    const level = +sim.dataset.sim;
    const seed = () => [
      { id: 101, name: "Notebook", category: "computer", quantity: 5 },
      { id: 102, name: "Projector", category: "display", quantity: 2 },
      { id: 103, name: "PC", category: "computer", quantity: 10 }
    ];
    let equipment = seed(), nextId = 104;
    const mEl = $("select", sim), uEl = $(".url", sim), bEl = $("textarea", sim), resEl = $(".res", sim), dataEl = $(".data", sim);
    const NAMES = { 200: "OK", 201: "Created", 400: "Bad Request", 404: "Not Found", 500: "Internal Server Error" };

    const parseId = v => { if (!/^\d+$/.test(v)) return null; const n = Number(v); return Number.isSafeInteger(n) && n > 0 ? n : null; };
    const str = v => typeof v === "string" && v.trim() !== "";
    const qty = v => Number.isSafeInteger(v) && v >= 0;
    const plain = v => v !== null && typeof v === "object" && !Array.isArray(v);
    const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const json = (status, body) => ({ status, type: "application/json; charset=utf-8", body: JSON.stringify(body, null, 2) });
    const text = (status, body, note) => ({ status, type: "text/html; charset=utf-8", body, note });

    const showData = () => { dataEl.textContent = `const equipment = ${JSON.stringify(equipment, null, 2)}` + (level >= 2 ? `\nnextId = ${nextId}` : ""); };

    const handle = (method, raw, rawBody) => {
      let u;
      try { u = new URL(raw.trim().startsWith("/") ? raw.trim() : "/" + raw.trim(), "http://localhost:3000"); }
      catch (e) { return text(400, "URL ไม่ถูกต้อง"); }
      let path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : u.pathname;
      const query = {};
      [...new Set(u.searchParams.keys())].forEach(k => { const all = u.searchParams.getAll(k); query[k] = all.length > 1 ? all : all[0]; });

      let body;
      if (level >= 2 && method !== "GET" && method !== "DELETE" && rawBody.trim() !== "") {
        const t = rawBody.trim();
        let ok = t[0] === "{" || t[0] === "[";
        if (ok) { try { body = JSON.parse(t); } catch (e) { ok = false; } }
        if (!ok) return json(400, { message: "รูปแบบ JSON ไม่ถูกต้อง" });
      }
      const notFound = () => text(404, `Cannot ${method} ${path}`, "Express ตอบหน้า HTML สั้น ๆ เมื่อไม่มี Route ที่ตรง");

      if (method === "GET" && path === "/") return text(200, "Hello, Backend!");
      if (method === "GET" && path === "/api/health") return json(200, { status: "ok" });
      if (method === "GET" && path === "/api/equipment") {
        if (level >= 2 && query.category !== undefined) {
          if (!str(query.category)) return json(400, { message: "category ต้องเป็นข้อความที่ไม่ว่าง" });
          const c = query.category.trim().toLowerCase();
          return json(200, equipment.filter(e => e.category.toLowerCase() === c));
        }
        return json(200, equipment);
      }
      if (method === "GET" && path === "/api/equipment/count") return json(200, { total: equipment.length });

      const m = path.match(/^\/api\/equipment\/([^/]+)$/);
      if (level >= 2 && m && (method === "GET" || (level >= 3 && (method === "PATCH" || method === "DELETE")))) {
        const id = parseId(decodeURIComponent(m[1]));
        if (id === null) return json(400, { message: "ID ต้องเป็นจำนวนเต็มบวก" });
        const index = equipment.findIndex(e => e.id === id);
        if (index === -1) return json(404, { message: `ไม่พบอุปกรณ์ ID ${id}` });
        const item = equipment[index];
        if (method === "GET") return json(200, item);
        if (method === "DELETE") {
          const [deleted] = equipment.splice(index, 1);
          return json(200, { message: `ลบอุปกรณ์ ID ${id} แล้ว`, deleted });
        }
        // PATCH
        if (!plain(body)) return json(400, { message: "Body ต้องเป็น JSON Object" });
        const keys = Object.keys(body);
        if (keys.length === 0) return json(400, { message: "ต้องส่งอย่างน้อย 1 ฟิลด์: name, category หรือ quantity" });
        const bad = keys.filter(k => !["name", "category", "quantity"].includes(k));
        if (bad.length) return json(400, { message: `ไม่อนุญาตให้แก้ฟิลด์: ${bad.join(", ")}` });
        if (has(body, "name") && !str(body.name)) return json(400, { message: "name ต้องเป็นข้อความที่ไม่ว่าง" });
        if (has(body, "category") && !str(body.category)) return json(400, { message: "category ต้องเป็นข้อความที่ไม่ว่าง" });
        if (has(body, "quantity") && !qty(body.quantity)) return json(400, { message: "quantity ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" });
        if (has(body, "name")) item.name = body.name.trim();
        if (has(body, "category")) item.category = body.category.trim();
        if (has(body, "quantity")) item.quantity = body.quantity;
        return json(200, item);
      }
      if (level >= 2 && method === "POST" && path === "/api/equipment") {
        if (!plain(body)) return json(400, { message: "Body ต้องเป็น JSON Object" });
        const { name, category, quantity } = body;
        if (!str(name)) return json(400, { message: "name ต้องเป็นข้อความที่ไม่ว่าง" });
        if (!str(category)) return json(400, { message: "category ต้องเป็นข้อความที่ไม่ว่าง" });
        if (!qty(quantity)) return json(400, { message: "quantity ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" });
        const created = { id: nextId++, name: name.trim(), category: category.trim(), quantity };
        equipment.push(created);
        return json(201, created);
      }
      return notFound();
    };

    $(".send", sim).addEventListener("click", () => {
      const method = mEl.value, url = uEl.value || "/";
      const r = handle(method, url, bEl ? bEl.value : "");
      const cls = r.status < 300 ? "st-ok" : "st-bad";
      resEl.innerHTML = `<span class="${cls}">${r.status} ${NAMES[r.status] || ""}</span>\n<span class="dim">Content-Type: ${r.type}</span>\n\n${esc(r.body)}` + (r.note ? `\n\n<span class="dim">(${esc(r.note)})</span>` : "");
      showData();
    });
    $(".restart", sim).addEventListener("click", () => {
      equipment = seed(); nextId = 104; showData();
      resEl.innerHTML = '<span class="dim">รีสตาร์ต Server แล้ว ข้อมูลกลับเป็น 3 รายการตั้งต้น</span>';
    });
    $$(".presets button", sim).forEach(p => p.addEventListener("click", () => {
      mEl.value = p.dataset.m; uEl.value = p.dataset.u; if (bEl) bEl.value = p.dataset.b || "";
    }));
    showData();
  });
})();
