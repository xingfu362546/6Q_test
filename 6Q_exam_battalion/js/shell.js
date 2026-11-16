/**
 * 测评管理复刻 · Shell
 * 顶栏 / 侧栏 / 面包屑 / 抽屉 / 弹窗 / Toast / 注释面板。
 */
(function () {
  "use strict";

  var qs = new URLSearchParams(location.search);
  var PAGE = document.body.getAttribute("data-ex-page") || qs.get("p") || "template-list";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pageTitle() {
    var notes = (window.EXAM_NOTES || {})[PAGE];
    if (notes) return notes.title;
    var menu = (window.EXAM_CONST.sideMenu || []).filter(function (m) { return m.id === PAGE; })[0];
    return menu ? menu.label : "测评管理";
  }

  function topHref(item) {
    if (item.id === "exam") return "replica.html?p=template-list";
    return "placeholder.html?m=" + encodeURIComponent(item.id) + "&label=" + encodeURIComponent(item.label);
  }

  function renderTop() {
    var el = document.getElementById("ex-header");
    if (!el) return;
    var nav = window.EXAM_CONST.topNav.map(function (item) {
      var cls = item.current ? ' class="is-current"' : "";
      return "<a" + cls + ' href="' + topHref(item) + '">' + esc(item.label) + "</a>";
    }).join("");
    el.innerHTML =
      '<a class="ex-brand" href="index.html"><span class="ex-brand__mark"></span>6Q后台管理系统<span class="ex-brand__ver">v2.0.0</span></a>' +
      '<nav class="ex-topnav">' + nav + "</nav>" +
      '<div class="ex-header__user">' +
      '<a class="ex-header__link" href="index.html">功能清单</a>' +
      '<a class="ex-header__link" href="../6Q_exam_h5/index.html">H5 端</a>' +
      '<span class="ex-avatar">余</span><span>余炜烽</span></div>';
  }

  function renderSide() {
    var el = document.getElementById("ex-side");
    if (!el) return;
    var menu = window.EXAM_CONST.sideMenu.map(function (item) {
      var active = item.id === PAGE ||
        (PAGE.indexOf("template-") === 0 && item.id === "template-list") ||
        (PAGE.indexOf("goods-") === 0 && item.id === "goods-list");
      return '<a class="' + (active ? "is-active" : "") + '" href="replica.html?p=' + item.id + '"><i class="ex-menu__dot"></i>' + esc(item.label) + "</a>";
    }).join("");
    el.innerHTML =
      '<div class="ex-side__title">测评管理</div>' +
      '<nav class="ex-menu">' + menu + "</nav>" +
      '<div class="ex-side__note">当前复刻范围：测评管理 9 个模块。其余业务线保留占位，不改变整体后台框架。' +
      '<button class="ex-btn ex-btn--sm ex-mt8" type="button" id="ex-reset-admin" style="width:100%">重置演示数据</button></div>';
  }

  function renderCrumb() {
    var el = document.getElementById("ex-crumb");
    if (!el) return;
    el.innerHTML = '<a href="index.html">原型导航</a><span>/</span><span>测评管理</span><span>/</span><strong>' +
      esc(pageTitle()) + "</strong>";
  }

  function ensureToast() {
    var el = document.getElementById("ex-toast");
    if (el) return el;
    el = document.createElement("div");
    el.id = "ex-toast";
    el.className = "ex-toast";
    document.body.appendChild(el);
    return el;
  }

  function toast(text) {
    var el = ensureToast();
    el.textContent = text;
    el.classList.add("is-on");
    clearTimeout(window.EXAM_SHELL._toast);
    window.EXAM_SHELL._toast = setTimeout(function () { el.classList.remove("is-on"); }, 2000);
  }

  function paintDots() {
    var page = (window.EXAM_NOTES || {})[PAGE];
    if (!page) return;
    document.querySelectorAll("[data-note-key]").forEach(function (el) {
      var key = el.getAttribute("data-note-key");
      var found = page.markers.filter(function (m) { return m.key === key; })[0];
      if (!found) { el.style.display = "none"; return; }
      el.setAttribute("data-note-req", found.req);
      el.textContent = found.req.replace("EX-", "");
      el.title = found.req + " · " + found.name;
    });
  }

  function drawer(opts) {
    opts = opts || {};
    var mask = document.getElementById("ex-mask");
    var drawerEl = document.getElementById("ex-drawer");
    if (!mask || !drawerEl) return;
    document.getElementById("ex-drawer-title").innerHTML = opts.title || "详情";
    document.getElementById("ex-drawer-sub").textContent = opts.subtitle || "";
    document.getElementById("ex-drawer-body").innerHTML = opts.body || "";
    document.getElementById("ex-drawer-foot").innerHTML = opts.foot || "";
    drawerEl.className = "ex-drawer" + (opts.wide ? " ex-drawer--wide" : "") + (opts.mid ? " ex-drawer--mid" : "");
    mask.classList.add("is-open");
    drawerEl.classList.add("is-open");
    drawerEl.style.width = opts.width || "";
    paintDots();
  }

  function closeDrawer() {
    var mask = document.getElementById("ex-mask");
    var drawerEl = document.getElementById("ex-drawer");
    if (mask) mask.classList.remove("is-open");
    if (drawerEl) drawerEl.classList.remove("is-open");
  }

  function modal(opts) {
    opts = opts || {};
    var el = document.getElementById("ex-modal");
    if (!el) {
      el = document.createElement("div");
      el.id = "ex-modal";
      el.className = "ex-modal";
      el.innerHTML =
        '<div class="ex-modal__card"><div class="ex-modal__head"></div><div class="ex-modal__body"></div>' +
        '<div class="ex-modal__foot"><button class="ex-btn" data-modal-cancel>取消</button>' +
        '<button class="ex-btn ex-btn--primary" data-modal-ok>确定</button></div></div>';
      document.body.appendChild(el);
    }
    el.querySelector(".ex-modal__head").textContent = opts.title || "提示";
    el.querySelector(".ex-modal__body").innerHTML = opts.body || "";
    var cancel = el.querySelector("[data-modal-cancel]");
    var ok = el.querySelector("[data-modal-ok]");
    cancel.textContent = opts.cancelText || "取消";
    ok.textContent = opts.okText || "确定";
    cancel.style.display = opts.hideCancel ? "none" : "";
    el.classList.add("is-open");
    cancel.onclick = function () { el.classList.remove("is-open"); if (opts.onCancel) opts.onCancel(); };
    ok.onclick = function () { el.classList.remove("is-open"); if (opts.onOk) opts.onOk(); };
    paintDots();
  }

  function confirm(text, onOk, title) {
    modal({
      title: title || "操作确认",
      body: '<p style="margin:0;line-height:1.8">' + text + "</p>",
      okText: "确定",
      onOk: onOk
    });
  }

  function statusTag(text, tone) {
    return '<span class="ex-tag' + (tone ? " ex-tag--" + tone : "") + '"><i class="ex-tag__dot"></i>' + esc(text) + "</span>";
  }

  function statusDot(on, onText, offText) {
    return on
      ? '<span class="ex-status ex-status--on">' + esc(onText || "启用") + "</span>"
      : '<span class="ex-status ex-status--off">' + esc(offText || "禁用") + "</span>";
  }

  function thumb(src, cls) {
    if (!src) return '<span class="ex-thumb ' + (cls || "") + '"></span>';
    return '<img class="ex-thumb ' + (cls || "") + '" src="' + esc(src) + '" alt="" loading="lazy" />';
  }

  function money(n) {
    var v = Number(n || 0);
    return "￥" + v.toFixed(2).replace(/\.00$/, "");
  }

  function dot(key, n) {
    return '<button class="ex-dot" type="button" data-note-key="' + esc(key) + '">' + (n || "") + "</button>";
  }

  /* ---------- 注释面板 ---------- */
  function notesHtml(markers) {
    return markers.map(function (m) {
      var rows = (m.rows || []).map(function (r) {
        return "<tr><td>" + esc(r.name) +
          (r.kind ? ' <span class="ex-kind ex-kind--' + r.kind + '">' + r.kind + "</span>" : "") +
          "</td><td>" + esc(r.control) + "</td><td>" + esc(r.required) + "</td><td>" + esc(r.notes) + "</td></tr>";
      }).join("");
      return '<article class="ex-note-block" id="note-' + esc(m.req) + '" data-note-req="' + esc(m.req) + '">' +
        '<h3><span class="ex-num">' + esc(m.req.replace("EX-", "")) + "</span>" + esc(m.name) +
        '<span class="ex-ver">' + esc(m.req) + "</span></h3>" +
        '<div class="ex-logic"><h4>' + esc(m.pastLabel || "过往逻辑 · v2.0.0") + '</h4><p>' + esc(m.past) + "</p></div>" +
        '<div class="ex-logic"><h4>' + esc(m.nowLabel || "现在的逻辑 · v2.1.0") + '</h4><p>' + esc(m.now) + "</p></div>" +
        '<table><thead><tr><th>元素名称</th><th>元素类型</th><th>是否必填</th><th>说明</th></tr></thead><tbody>' + rows + "</tbody></table>" +
        '<div class="ex-logic"><h4>接口</h4><p>' + esc(m.api) + "</p></div>" +
        '<div class="ex-logic"><h4>数据流</h4><p>' + esc(m.flow) + "</p></div>" +
        "</article>";
    }).join("");
  }

  function openNotes(req) {
    var panel = document.getElementById("ex-notes-panel");
    if (!panel) return;
    panel.classList.add("is-open");
    panel.querySelectorAll(".ex-note-block").forEach(function (el) {
      el.classList.toggle("is-focus", req && el.getAttribute("data-note-req") === req);
    });
    var target = req ? document.getElementById("note-" + req) : null;
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
    else panel.scrollTop = 0;
  }

  function mountNotes() {
    var page = (window.EXAM_NOTES || {})[PAGE];
    if (!page || !page.markers || !page.markers.length) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ex-notes-btn";
    btn.textContent = "全部注释 · " + page.markers.length;
    var panel = document.createElement("aside");
    panel.id = "ex-notes-panel";
    panel.className = "ex-notes-panel";
    panel.innerHTML =
      "<h2>" + esc(page.title) + "</h2>" +
      '<p class="ex-note-rule">一个红色序号对应一条功能。点开后列出本页全部功能点。注释固定五段：过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流。</p>' +
      notesHtml(page.markers) +
      '<button class="ex-btn ex-note-close" type="button" id="ex-notes-close">关闭</button>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    btn.addEventListener("click", function () { openNotes(""); });
    document.getElementById("ex-notes-close").addEventListener("click", function () {
      panel.classList.remove("is-open");
    });

    document.addEventListener("click", function (e) {
      var dotEl = e.target.closest("[data-note-req]");
      if (!dotEl) return;
      e.preventDefault();
      e.stopPropagation();
      openNotes(dotEl.getAttribute("data-note-req"));
    }, true);

    paintDots();
    var want = qs.get("note");
    if (want) {
      var hit = page.markers.filter(function (m) { return m.req === want || m.key === want; })[0];
      if (hit) setTimeout(function () { openNotes(hit.req); }, 120);
    }
  }

  function bindGlobal() {
    var reset = document.getElementById("ex-reset-admin");
    if (reset) {
      reset.addEventListener("click", function () {
        try { localStorage.removeItem("exam_admin_data"); } catch (err) {}
        location.reload();
      });
    }
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "ex-mask") closeDrawer();
      if (e.target && e.target.getAttribute("data-close-drawer") === "1") closeDrawer();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDrawer();
        var panel = document.getElementById("ex-notes-panel");
        if (panel) panel.classList.remove("is-open");
      }
    });
  }

  window.EXAM_SHELL = {
    page: PAGE,
    esc: esc,
    toast: toast,
    drawer: drawer,
    closeDrawer: closeDrawer,
    modal: modal,
    confirm: confirm,
    statusTag: statusTag,
    statusDot: statusDot,
    thumb: thumb,
    money: money,
    dot: dot,
    paintDots: paintDots,
    openNotes: openNotes
  };

  renderTop();
  renderSide();
  renderCrumb();
  bindGlobal();
  mountNotes();
})();
