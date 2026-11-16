/**
 * 心画测评 H5 · 核心工具
 * 本地存储、结果计算、图表、Toast、弹窗、底部导航、注释面板。
 */
(function () {
  "use strict";

  var D = window.H5_DATA;
  var K = {
    user: "exam_user",
    records: "exam_records",
    favorites: "exam_favorites",
    feedback: "exam_feedbacks",
    appointments: "exam_appointments"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function uid(p) { return (p || "id") + "-" + Date.now().toString(36) + Math.floor(Math.random() * 90 + 10); }
  function now() {
    var d = new Date();
    function two(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()) + " " + two(d.getHours()) + ":" + two(d.getMinutes());
  }
  function dateShort(s) { return String(s || "").slice(0, 10); }

  var DEFAULT_USER = {
    name: "余炜烽", serialNo: "S6MULM1", mobile: "134****2552", avatar: "余", isGuest: false
  };

  function user() { return read(K.user, DEFAULT_USER); }
  function saveUser(u) { write(K.user, u); }
  function records() { return read(K.records, []); }
  function saveRecords(list) { write(K.records, list.slice(0, 50)); }
  function addRecord(record) {
    var list = records().filter(function (r) { return r.id !== record.id; });
    list.unshift(record);
    saveRecords(list);
  }
  function recordById(id) {
    return records().filter(function (r) { return r.id === id; })[0] || null;
  }
  function favorites() { return read(K.favorites, []); }
  function toggleFavorite(id) {
    var list = favorites();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.unshift(id);
    write(K.favorites, list);
    return i < 0;
  }
  function isFavorite(id) { return favorites().indexOf(id) >= 0; }

  function progress(goodsId) { return read("exam_progress_" + goodsId, null); }
  function saveProgress(goodsId, data) { write("exam_progress_" + goodsId, data); }
  function clearProgress(goodsId) { try { localStorage.removeItem("exam_progress_" + goodsId); } catch (e) {} }

  function addFeedback(item) {
    var list = read(K.feedback, []);
    list.unshift(item);
    write(K.feedback, list);
  }
  function addAppointment(item) {
    var list = read(K.appointments, []);
    list.unshift(item);
    write(K.appointments, list);
  }

  function calcResult(goods, answers) {
    var questions = goods.questions;
    var total = 0;
    var answered = 0;
    var byDim = {};
    goods.dims.forEach(function (d) { byDim[d.key] = { score: 0, max: 0 }; });
    questions.forEach(function (q) {
      var pick = answers[q.id];
      if (pick === undefined || pick === null) return;
      var opt = q.options[pick];
      if (!opt) return;
      total += opt.score;
      answered++;
      var bucket = byDim[q.dim];
      if (bucket) {
        bucket.score += opt.score;
        bucket.max += Math.max.apply(null, q.options.map(function (o) { return o.score; }));
      }
    });
    var dims = goods.dims.map(function (d) {
      var b = byDim[d.key];
      return { key: d.key, name: d.name, full: d.full, color: d.color, value: b.max ? Math.round(b.score / b.max * 100) : 0 };
    });
    var range = goods.results.filter(function (r) { return total >= r.min && total <= r.max; })[0] || goods.results[goods.results.length - 1];
    var harmony = Math.round(total / goods.scoreTotal * 100);
    var percentile = Math.max(5, Math.min(99, Math.round(50 + (total / goods.scoreTotal - 0.5) * 72)));
    return {
      total: total, answered: answered, dims: dims, range: range,
      harmony: harmony, percentile: percentile
    };
  }

  function ringSvg(pct, size) {
    size = size || 112;
    var r = size / 2 - 8, c = 2 * Math.PI * r;
    var dash = c * Math.max(0, Math.min(100, pct)) / 100;
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="9" />' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#7dd3fc" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + c + '" />' +
      '</svg>';
  }

  function radarSvg(dims, values, opts) {
    opts = opts || {};
    var size = opts.size || 260;
    var cx = size / 2, cy = size / 2;
    var r = size * 0.31;
    var n = dims.length;
    var light = !!opts.light;
    function point(i, pct) {
      var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(angle) * r * pct / 100, cy + Math.sin(angle) * r * pct / 100];
    }
    var grid = "";
    [25, 50, 75, 100].forEach(function (level) {
      var pts = dims.map(function (_, i) { return point(i, level).join(","); }).join(" ");
      grid += '<polygon points="' + pts + '" fill="none" stroke="' + (light ? "rgba(255,255,255,.18)" : "#FEE3D4") + '" stroke-width="1" />';
    });
    var axes = dims.map(function (_, i) {
      var p = point(i, 100);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="' + (light ? "rgba(255,255,255,.16)" : "#F0DACF") + '" stroke-width="1" stroke-dasharray="3 3" />';
    }).join("");
    var dataPts = values.map(function (v, i) { return point(i, Math.max(5, v)).join(","); }).join(" ");
    var data = '<polygon points="' + dataPts + '" fill="' + (light ? "rgba(125,211,252,.28)" : "rgba(255,177,153,.6)") + '" stroke="' + (light ? "#7dd3fc" : "#FF8E79") + '" stroke-width="2" stroke-linejoin="round" />';
    var dots = values.map(function (v, i) {
      var p = point(i, Math.max(5, v));
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + (light ? "#fff" : "#FF8E79") + '" />';
    }).join("");
    var labels = dims.map(function (d, i) {
      var p = point(i, 128);
      var anchor = Math.abs(p[0] - cx) < 12 ? "middle" : p[0] > cx ? "start" : "end";
      var value = values[i];
      var scoreText = value < 0
        ? '<tspan x="' + p[0] + '" dy="12" font-size="9" fill="' + (light ? "rgba(255,255,255,.55)" : "#A3A0A0") + '">(未点亮)</tspan>'
        : '<tspan x="' + p[0] + '" dy="12" font-size="10" font-weight="700" fill="' + (light ? "#FFD6C1" : "#FF8E79") + '">' + Math.round(value) + "</tspan>";
      return '<text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="' + anchor + '" font-size="' + (size > 300 ? 12 : 10) + '" fill="' + (light ? "rgba(255,255,255,.82)" : "#847C7E") + '" font-family="-apple-system,BlinkMacSystemFont,PingFang SC,sans-serif">' + esc(d.name) + scoreText + "</text>";
    }).join("");
    return '<svg class="h5-chart" viewBox="0 0 ' + size + ' ' + size + '" aria-label="维度雷达图">' + grid + axes + data + dots + labels + "</svg>";
  }

  function distSvg(score, opts) {
    opts = opts || {};
    var w = opts.width || 320, h = opts.height || 96;
    var mean = 50, sd = 17, base = h - 10, amp = h - 26;
    var pts = [];
    for (var x = 0; x <= 100; x += 2) {
      var y = base - amp * Math.exp(-Math.pow(x - mean, 2) / (2 * sd * sd));
      pts.push((x / 100 * w).toFixed(1) + "," + y.toFixed(1));
    }
    var markerX = score / 100 * w;
    var markerY = base - amp * Math.exp(-Math.pow(score - mean, 2) / (2 * sd * sd));
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto" aria-label="同龄分布图">' +
      '<line x1="0" y1="' + base + '" x2="' + w + '" y2="' + base + '" stroke="#e9eef6" stroke-width="1" />' +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#a9c8ff" stroke-width="2" />' +
      '<line x1="' + markerX + '" y1="' + (markerY - 4) + '" x2="' + markerX + '" y2="' + base + '" stroke="#1677ff" stroke-width="1.5" stroke-dasharray="3 3" />' +
      '<circle cx="' + markerX + '" cy="' + markerY + '" r="4" fill="#1677ff" stroke="#fff" stroke-width="2" />' +
      '<text x="' + Math.min(w - 34, Math.max(4, markerX - 16)) + '" y="' + (markerY - 10) + '" font-size="9" fill="#1677ff" font-family="-apple-system,sans-serif">你在这里</text>' +
      '</svg>';
  }

  function toast(text) {
    var el = document.getElementById("h5-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "h5-toast";
      el.className = "h5-toast";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("is-on");
    el.style.opacity = "1";
    el.style.top = "42%";
    el.style.bottom = "auto";
    el.style.zIndex = "200";
    el.style.transform = "translate(-50%, -50%)";
    clearTimeout(window._h5toast);
    window._h5toast = setTimeout(function () {
      el.classList.remove("is-on");
      el.style.opacity = "0";
    }, 1900);
  }

  function modal(opts) {
    opts = opts || {};
    var el = document.getElementById("h5-modal");
    if (!el) {
      el = document.createElement("div");
      el.id = "h5-modal";
      el.className = "h5-modal";
      el.innerHTML = '<div class="h5-modal__card"><div class="h5-modal__body"><b></b><p></p></div>' +
        '<div class="h5-modal__foot"><button class="h5-btn h5-btn--ghost" data-cancel>取消</button>' +
        '<button class="h5-btn" data-ok>确定</button></div></div>';
      document.body.appendChild(el);
    }
    el.querySelector(".h5-modal__body b").textContent = opts.title || "提示";
    el.querySelector(".h5-modal__body p").textContent = opts.text || "";
    var cancel = el.querySelector("[data-cancel]");
    var ok = el.querySelector("[data-ok]");
    cancel.textContent = opts.cancelText || "取消";
    ok.textContent = opts.okText || "确定";
    cancel.style.display = opts.hideCancel ? "none" : "";
    el.classList.add("is-open");
    cancel.onclick = function () { el.classList.remove("is-open"); if (opts.onCancel) opts.onCancel(); };
    ok.onclick = function () { el.classList.remove("is-open"); if (opts.onOk) opts.onOk(); };
  }

  function confirm(text, onOk, title) {
    modal({ title: title || "确认操作", text: text, onOk: onOk });
  }

  function share(title, text, url) {
    var link = url || location.href;
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: link }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(function () { toast("链接已复制，可粘贴分享"); });
    } else {
      toast("请复制浏览器地址分享");
    }
  }

  function bindCommon() {
    document.addEventListener("click", function (e) {
      var back = e.target.closest("[data-back]");
      if (back) {
        if (history.length > 1) history.back();
        else location.href = "index.html";
      }
    });
  }

  function refreshNotes(pageKey) {
    var page = (window.H5_NOTES || {})[pageKey];
    if (!page || !page.markers) return;
    document.querySelectorAll("[data-note-key]").forEach(function (el) {
      var key = el.getAttribute("data-note-key");
      var hit = page.markers.filter(function (m) { return m.key === key; })[0];
      if (!hit) { el.style.display = "none"; return; }
      el.style.display = "";
      el.setAttribute("data-req", hit.req);
      el.textContent = hit.req.replace("EX-", "");
      el.title = hit.req + " · " + hit.name;
    });
  }

  /* 注释 */
  function mountNotes(pageKey) {
    var page = (window.H5_NOTES || {})[pageKey];
    if (!page || !page.markers || !page.markers.length) return;
    var old = document.getElementById("h5-notes-panel");
    if (old) old.remove();
    var btn = document.getElementById("h5-notes-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "h5-notes-btn";
      btn.type = "button";
      btn.className = "h5-notes-btn";
      document.body.appendChild(btn);
    }
    btn.textContent = "注释 " + page.markers.length;
    var panel = document.createElement("aside");
    panel.id = "h5-notes-panel";
    panel.className = "h5-notes-panel";
    panel.innerHTML = "<h2>" + esc(page.title) + "</h2><p class=\"h5-note-rule\">红点对应功能编号。注释五段：过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流。</p>" +
      page.markers.map(function (m) {
        var rows = (m.rows || []).map(function (r) {
          return "<tr><td>" + esc(r.name) + "</td><td>" + esc(r.control) + "</td><td>" + esc(r.required) + "</td><td>" + esc(r.notes) + "</td></tr>";
        }).join("");
        return '<article class="h5-note-block" id="h5-note-' + esc(m.req) + '" data-req="' + esc(m.req) + '"><h3><span class="h5-num">' + esc(m.req.replace("EX-", "")) + "</span>" + esc(m.name) + '<span class="h5-ver">' + esc(m.req) + "</span></h3>" +
          '<h4>' + esc(m.pastLabel || "过往逻辑 · v2.0.0") + '</h4><p>' + esc(m.past) + "</p>" +
          '<h4>' + esc(m.nowLabel || "现在的逻辑 · v2.1.0") + '</h4><p>' + esc(m.now) + "</p>" +
          '<table><thead><tr><th>元素</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody>' + rows + "</tbody></table>" +
          '<h4>接口</h4><p>' + esc(m.api) + "</p>" +
          '<h4>数据流</h4><p>' + esc(m.flow) + "</p></article>";
      }).join("") +
      '<button class="h5-btn h5-btn--ghost h5-note-close" type="button" data-notes-close>关闭</button>';
    document.body.appendChild(panel);

    function open(req) {
      panel.classList.add("is-open");
      panel.querySelectorAll(".h5-note-block").forEach(function (el) {
        el.style.borderColor = req && el.getAttribute("data-req") === req ? "#ffb4a8" : "";
      });
      var target = req ? document.getElementById("h5-note-" + req) : null;
      if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
      else panel.scrollTop = 0;
    }

    btn.addEventListener("click", function () { open(""); });
    panel.querySelector("[data-notes-close]").addEventListener("click", function () { panel.classList.remove("is-open"); });
    refreshNotes(pageKey);
    document.addEventListener("click", function (e) {
      var dot = e.target.closest(".h5-dot[data-req]");
      if (!dot || dot.closest("#h5-notes-panel")) return;
      e.preventDefault();
      e.stopPropagation();
      open(dot.getAttribute("data-req"));
    }, true);
    var q = new URLSearchParams(location.search).get("note");
    if (q) {
      var m = page.markers.filter(function (x) { return x.req === q || x.key === q; })[0];
      if (m) setTimeout(function () { open(m.req); }, 150);
    }
  }

  window.EXAM = {
    D: D,
    K: K,
    read: read, write: write, esc: esc, uid: uid, now: now, dateShort: dateShort,
    user: user, saveUser: saveUser,
    records: records, saveRecords: saveRecords, addRecord: addRecord, recordById: recordById,
    favorites: favorites, toggleFavorite: toggleFavorite, isFavorite: isFavorite,
    progress: progress, saveProgress: saveProgress, clearProgress: clearProgress,
    addFeedback: addFeedback, addAppointment: addAppointment,
    calcResult: calcResult,
    ringSvg: ringSvg, radarSvg: radarSvg, distSvg: distSvg,
    toast: toast, modal: modal, confirm: confirm, share: share,
    bindCommon: bindCommon,
    mountNotes: mountNotes,
    refreshNotes: refreshNotes
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindCommon();
  });
})();
