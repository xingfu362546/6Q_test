/**
 * 测评管理复刻 · 页面引擎
 * 列表页通用渲染 + 模板表单 / 详情 / 商品 / 测评数据等特殊页。
 */
(function () {
  "use strict";

  var D = window.EXAM_DATA;
  var C = window.EXAM_CONST;
  var S = window.EXAM_SHELL;
  var P = window.EXAM_PAGES;
  var esc = S.esc;
  var mount = document.getElementById("ex-page");
  var state = { pageNo: 1, pageSize: 10, query: {}, selected: {}, expanded: false, rows: [] };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function saveAdmin() {
    try {
      localStorage.setItem("exam_admin_data", JSON.stringify({
        templates: D.templates, goods: D.goods, subjects: D.subjects,
        dimensions: D.dimensions, categories: D.categories, overall: D.overall
      }));
    } catch (e) {}
  }
  function now() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function uid(prefix) { return prefix + "-" + Date.now().toString(36) + Math.floor(Math.random() * 90 + 10); }

  function pageHead(title, desc, extra) {
    return '<div class="ex-page-head"><div><h1>' + esc(title) + '</h1><p>' + esc(desc) + '</p></div>' +
      '<div class="ex-page-head__actions"><a class="ex-btn" href="index.html">功能清单</a>' +
      '<a class="ex-btn" href="../6Q_exam_h5/index.html">H5 端</a>' + (extra || "") + '</div></div>';
  }

  function field(label, control, required, hint) {
    return '<div class="ex-form-item"><label>' + (required ? "<em>*</em>" : "") + esc(label) + '</label>' + control +
      (hint ? '<span class="ex-form-item__hint">' + esc(hint) + "</span>" : "") + "</div>";
  }
  function input(name, value, placeholder, opts) {
    opts = opts || {};
    return '<input class="ex-input" data-field="' + name + '" value="' + esc(value == null ? "" : value) +
      '" placeholder="' + esc(placeholder || "") + '" ' + (opts.readonly ? "readonly" : "") + " />";
  }
  function textarea(name, value, placeholder, rows) {
    return '<textarea class="ex-textarea" data-field="' + name + '" rows="' + (rows || 3) + '" placeholder="' +
      esc(placeholder || "") + '">' + esc(value || "") + "</textarea>";
  }
  function select(name, value, options, placeholder) {
    var opts = (options || []).map(function (o) {
      var v = typeof o === "object" ? o.value : o;
      var l = typeof o === "object" ? o.label : o;
      return '<option value="' + esc(v) + '"' + (String(v) === String(value) ? " selected" : "") + ">" + esc(l) + "</option>";
    }).join("");
    return '<select class="ex-select" data-field="' + name + '"><option value="">' + esc(placeholder || "请选择") + "</option>" + opts + "</select>";
  }
  function dot(key) { return S.dot(key); }

  function statusOf(row, col) {
    var on = String(row[col.key]) === "1";
    return S.statusDot(on, col.onText || "启用", col.offText || "禁用");
  }

  function cell(row, col) {
    var v = row[col.key];
    switch (col.type) {
      case "code": return '<span class="ex-code">' + esc(v || "-") + "</span>";
      case "link":
        if (col.href) return '<a href="' + esc(col.href(row)) + '">' + esc(v || "-") + "</a>";
        return '<button class="ex-link" type="button" data-action="detail" data-id="' + esc(row.id) + '">' + esc(v || "-") + "</button>";
      case "image":
        return S.thumb(v, col.small ? "ex-thumb--round" : "");
      case "status":
        return statusOf(row, col);
      case "switch":
        var on = String(v) === String(col.on);
        return '<button class="ex-switch' + (on ? " is-on" : "") + '" type="button" data-switch="' + esc(col.key) +
          '" data-id="' + esc(row.id) + '" aria-label="切换"></button>';
      case "price":
        return '<div><div>IOS：<b class="ex-price">' + S.money(row.priceIos) + "</b></div>" +
          '<div>Android：<b class="ex-price">' + S.money(row.price) + "</b></div></div>";
      case "member":
        return '<div class="ex-member-cell"><div>ID：' + esc(row.user.serialNo) + "</div><div>姓名：<b>" +
          esc(row.user.name) + "</b></div><div>手机：" + esc(row.user.mobile) + "</div></div>";
      case "stars":
        return '<span class="ex-stars">' + "★".repeat(row.score) + '<span class="ex-muted">' + "★".repeat(5 - row.score) + "</span></span>";
      case "feedback":
        return '<div class="ex-feedback-cell">' + esc(row.content) + "</div>";
      case "tag":
        var tone = typeof col.tone === "function" ? col.tone(v) : col.tone;
        return S.statusTag(v, tone);
      case "ellipsis":
        return '<div class="ex-td-ellipsis" title="' + esc(v || "") + '">' + esc(v || "-") + "</div>";
      case "sort":
        return '<input class="ex-input" style="width:88px;height:28px" type="number" min="0" value="' + esc(v || 0) +
          '" data-sort="' + esc(col.key) + '" data-id="' + esc(row.id) + '" />';
      default:
        return esc(v == null || v === "" ? "-" : v);
    }
  }

  function getRowBy(spec, id) {
    return (D[spec.dataKey] || []).filter(function (r) { return r.id === id; })[0];
  }

  /* ---------------- 列表页 ---------------- */
  function initList(spec) {
    state = { pageNo: 1, pageSize: 10, query: {}, selected: {}, expanded: false, rows: [] };
    var filterFields = spec.filters.map(function (f) {
      var control;
      if (f.type === "select") {
        var opts = (typeof f.options === "function" ? f.options() : f.options || []);
        control = select(f.k, "", opts, "全部");
      } else if (f.type === "dateRange") {
        control = '<div class="ex-field__range"><input class="ex-input" data-query="' + f.k + 'A" placeholder="开始" />' +
          "<span>~</span><input class=\"ex-input\" data-query=\"" + f.k + 'B" placeholder="结束" /></div>';
      } else {
        control = '<input class="ex-input" data-query="' + f.k + '" placeholder="' + esc(f.placeholder || "请输入") + '" />';
      }
      return '<div class="ex-field" data-filter-field="' + f.k + '"><label>' + esc(f.label) + '</label><div class="ex-field__control">' + control + "</div></div>";
    }).join("");

    var toolbar = spec.toolbar.map(function (b) {
      return '<button class="ex-btn' + (b.primary ? " ex-btn--primary" : "") + '" type="button" data-toolbar="' + b.id + '">' + esc(b.label) + "</button>";
    }).join("");

    var colDots = {
      "template-list": { status: "template-status" },
      "goods-list": { heartFlag: "goods-list" },
      "appraise": { score: "appraise" },
      "mental": { status: "mental" },
      "subject": { name: "subject" },
      "dimension": { name: "dimension" },
      "category": { showFlag: "category" },
      "overall": { detail: "overall" }
    };
    var headCols = "";
    var selectable = ["template-list", "goods-list", "subject", "dimension", "category"].indexOf(S.page) >= 0;
    if (selectable) headCols += '<th style="width:38px"><input type="checkbox" data-check-all /></th>';
    headCols += spec.columns.map(function (c) {
      var dk = (colDots[S.page] || {})[c.key];
      return "<th>" + esc(c.title) + (dk ? dot(dk) : "") + "</th>";
    }).join("");
    if (spec.ops && spec.ops.length) headCols += "<th>操作</th>";

    mount.innerHTML =
      pageHead(spec.title, spec.desc) +
      '<section class="ex-panel"><div class="ex-filter" data-filter-panel><div class="ex-filter__row">' + filterFields + '</div>' +
      '<div class="ex-filter__actions"><button class="ex-btn" type="button" data-filter-reset>重置</button>' +
      '<button class="ex-btn ex-btn--primary" type="button" data-filter-search>查询</button>' +
      (spec.filters.length > 4 ? '<button class="ex-filter__more" type="button" data-filter-toggle>展开筛选</button>' : "") +
      "</div></div></section>" +
      '<section class="ex-panel ex-mt12"><div class="ex-toolbar">' + toolbar +
      '<span class="ex-toolbar__right" data-total></span></div>' +
      '<div class="ex-table-wrap"><table class="ex-table"><thead><tr>' + headCols + "</tr></thead><tbody data-tbody></tbody></table></div>" +
      '<div class="ex-pager" data-pager></div></section>';

    var titleDots = {
      "template-list": "template-list", "goods-list": "goods-list", "appraise": "appraise",
      "mental": "mental", "subject": "subject", "dimension": "dimension",
      "category": "category", "overall": "overall"
    };
    if (titleDots[S.page]) {
      mount.querySelector(".ex-page-head h1").insertAdjacentHTML("beforeend", dot(titleDots[S.page]));
    }
    bindList(spec, selectable);
    renderRows(spec);
    if (spec.filters.length > 4) {
      var panel = mount.querySelector("[data-filter-panel]");
      panel.querySelectorAll("[data-filter-field]").forEach(function (el, i) {
        if (i >= 4) el.style.display = "none";
      });
    }
    S.paintDots && S.paintDots();
  }

  function filteredRows(spec) {
    var rows = D[spec.dataKey] || [];
    return rows.filter(function (row) {
      return spec.filters.every(function (f) {
        if (f.type === "dateRange") {
          var a = state.query[f.k + "A"], b = state.query[f.k + "B"];
          if (!a && !b) return true;
          var date = String(row[f.k] || "").slice(0, 10);
          if (a && date < a) return false;
          if (b && date > b) return false;
          return true;
        }
        var v = state.query[f.k];
        if (v === undefined || v === "") return true;
        var value = f.get ? f.get(row) : row[f.k];
        if (f.type === "select") return String(value) === String(v);
        return String(value == null ? "" : value).toLowerCase().indexOf(String(v).toLowerCase()) >= 0;
      });
    });
  }

  function renderRows(spec) {
    var rows = filteredRows(spec);
    state.rows = rows;
    var maxPage = Math.max(1, Math.ceil(rows.length / state.pageSize));
    if (state.pageNo > maxPage) state.pageNo = maxPage;
    var start = (state.pageNo - 1) * state.pageSize;
    var pageRows = rows.slice(start, start + state.pageSize);
    var tbody = mount.querySelector("[data-tbody]");
    var selectable = tbody.closest("table").querySelector("[data-check-all]");
    if (selectable) selectable.checked = pageRows.length > 0 && pageRows.every(function (r) { return state.selected[r.id]; });

    var colspan = spec.columns.length + (spec.ops && spec.ops.length ? 1 : 0) + (selectable ? 1 : 0);
    if (!pageRows.length) {
      tbody.innerHTML = '<tr><td class="ex-table__empty" colspan="' + colspan + '">没有符合条件的数据</td></tr>';
    } else {
      tbody.innerHTML = pageRows.map(function (row) {
        var tds = "";
        if (selectable) {
          tds += '<td><input type="checkbox" data-check="' + esc(row.id) + '"' + (state.selected[row.id] ? " checked" : "") + " /></td>";
        }
        tds += spec.columns.map(function (c) { return "<td>" + cell(row, c) + "</td>"; }).join("");
        if (spec.ops && spec.ops.length) {
          tds += '<td><div class="ex-ops">' + spec.ops.filter(function (op) {
            return !op.visible || op.visible(row);
          }).map(function (op) {
            if (op.href) return '<a class="ex-link" href="' + esc(op.href(row)) + '">' + esc(op.label) + "</a>";
            return '<button class="ex-link' + (op.danger ? " ex-link--danger" : "") + '" type="button" data-op="' + op.id +
              '" data-id="' + esc(row.id) + '">' + esc(op.label) + "</button>";
          }).join("") + "</div></td>";
        }
        return "<tr" + (state.selected[row.id] ? ' class="is-selected"' : "") + ">" + tds + "</tr>";
      }).join("");
    }

    mount.querySelector("[data-total]").textContent = "共 " + rows.length + " 条";
    var pager = mount.querySelector("[data-pager]");
    var totalText = '<span class="ex-pager__total">第 ' + state.pageNo + " / " + maxPage + " 页，每页 " + state.pageSize + " 条</span>";
    var btns = '<button type="button" data-page="' + (state.pageNo - 1) + '"' + (state.pageNo <= 1 ? " disabled" : "") + ">上一页</button>";
    for (var i = 1; i <= maxPage; i++) {
      if (maxPage <= 7 || Math.abs(i - state.pageNo) <= 1 || i === 1 || i === maxPage) {
        btns += '<button type="button" data-page="' + i + '" class="' + (i === state.pageNo ? "is-on" : "") + '">' + i + "</button>";
      } else if (i === 2 || i === maxPage - 1) {
        btns += "<span>…</span>";
      }
    }
    btns += '<button type="button" data-page="' + (state.pageNo + 1) + '"' + (state.pageNo >= maxPage ? " disabled" : "") + ">下一页</button>";
    pager.innerHTML = totalText + btns;
  }

  function bindList(spec, selectable) {
    mount.addEventListener("input", function (e) {
      var el = e.target;
      if (el.getAttribute("data-query")) state.query[el.getAttribute("data-query")] = el.value;
    });
    mount.addEventListener("change", function (e) {
      var el = e.target;
      if (el.getAttribute("data-query")) state.query[el.getAttribute("data-query")] = el.value;
      if (el.getAttribute("data-check-all") !== null) {
        state.rows.slice((state.pageNo - 1) * state.pageSize, state.pageNo * state.pageSize).forEach(function (r) {
          if (el.checked) state.selected[r.id] = true; else delete state.selected[r.id];
        });
        renderRows(spec);
      }
      if (el.getAttribute("data-check")) {
        var id = el.getAttribute("data-check");
        if (el.checked) state.selected[id] = true; else delete state.selected[id];
        renderRows(spec);
      }
      if (el.getAttribute("data-switch")) {
        var row = getRowBy(spec, el.getAttribute("data-id"));
        var key = el.getAttribute("data-switch");
        if (row) {
          var col = spec.columns.filter(function (c) { return c.key === key; })[0] || {};
          row[key] = String(el.checked ? col.on : (col.on === 1 ? 0 : 2));
          if (key === "heartFlag") row[key] = el.checked ? 1 : 2;
          saveAdmin();
          S.toast(key === "heartFlag" ? (el.checked ? "已展示到心画" : "已从心画隐藏") :
            key === "showFlag" ? (el.checked ? "已展示在金刚区" : "已从金刚区移除") : (el.checked ? "已启用" : "已禁用"));
          renderRows(spec);
        }
      }
      if (el.getAttribute("data-sort")) {
        var row2 = getRowBy(spec, el.getAttribute("data-id"));
        if (row2) row2[el.getAttribute("data-sort")] = Number(el.value || 0);
        saveAdmin();
        S.toast("排序值已更新");
      }
    });
    mount.addEventListener("click", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-filter-search")) { state.pageNo = 1; renderRows(spec); return; }
      if (t.hasAttribute("data-filter-reset")) {
        state.query = {};
        mount.querySelectorAll("[data-query]").forEach(function (i) { i.value = ""; });
        state.pageNo = 1; renderRows(spec); return;
      }
      if (t.hasAttribute("data-filter-toggle")) {
        state.expanded = !state.expanded;
        mount.querySelectorAll("[data-filter-field]").forEach(function (el, i) {
          if (i >= 4) el.style.display = state.expanded ? "" : "none";
        });
        t.textContent = state.expanded ? "收起筛选" : "展开筛选";
        return;
      }
      if (t.getAttribute("data-page")) {
        state.pageNo = Number(t.getAttribute("data-page"));
        renderRows(spec);
        return;
      }
      if (t.getAttribute("data-toolbar")) {
        handleToolbar(t.getAttribute("data-toolbar"), spec);
        return;
      }
      if (t.getAttribute("data-op")) {
        handleOp(t.getAttribute("data-op"), getRowBy(spec, t.getAttribute("data-id")), spec);
        return;
      }
      if (t.getAttribute("data-action") === "detail") {
        var row = getRowBy(spec, t.getAttribute("data-id"));
        if (row) openRecordDetail(spec, row);
      }
    });
  }

  function selectedRows(spec) {
    return (D[spec.dataKey] || []).filter(function (r) { return state.selected[r.id]; });
  }

  function handleToolbar(id, spec) {
    if (id === "add") {
      var addBtn = (spec.toolbar || []).filter(function (b) { return b.id === "add"; })[0];
      if (addBtn && addBtn.href) { location.href = addBtn.href; return; }
      if (spec.dataKey === "subjects") return openSubject(null, spec);
      if (spec.dataKey === "dimensions") return openDimension(null, spec);
      if (spec.dataKey === "categories") return openCategory(null, spec);
      return;
    }
    if (id === "export") { S.toast("导出已提交，原型不产生真实文件"); return; }
    var rows = selectedRows(spec);
    if (!rows.length) { S.toast("请先勾选要操作的数据"); return; }
    if (id === "disable") {
      var text = S.page === "template-list" ? "禁用模板会级联下架关联的测评商品，确认继续？" :
        S.page === "category" ? "禁用分类会级联下架该分类下的模板和商品，确认继续？" :
          "确认禁用选中的 " + rows.length + " 条数据？";
      S.confirm(text, function () {
        rows.forEach(function (r) {
          r.status = 2;
          if (S.page === "template-list") {
            D.goods.forEach(function (g) { if (g.templeteIds.indexOf(r.id) >= 0) g.status = 2; });
          }
          if (S.page === "category") {
            D.templates.forEach(function (t) { if (t.categoryId === r.id) t.status = 2; });
            D.goods.forEach(function (g) { if (g.categoryId === r.id) g.status = 2; });
          }
        });
        state.selected = {};
        saveAdmin();
        S.toast("已禁用");
        renderRows(spec);
      });
      return;
    }
    rows.forEach(function (r) { r.status = 1; });
    state.selected = {};
    saveAdmin();
    S.toast("已启用");
    renderRows(spec);
  }

  function handleOp(op, row, spec) {
    if (!row) return;
    if (op === "import") return openImport(row);
    if (op === "qrcode") return openQr(row);
    if (op === "follow") return openFollow(row, spec);
    if (op === "delete") {
      S.confirm("确认删除「" + esc(row.name || row.title) + "」？删除后不可恢复。", function () {
        var arr = D[spec.dataKey];
        var i = arr.indexOf(row);
        if (i >= 0) arr.splice(i, 1);
        saveAdmin();
        S.toast("已删除");
        renderRows(spec);
      });
      return;
    }
    if (op === "edit") {
      if (spec.dataKey === "subjects") return openSubject(row, spec);
      if (spec.dataKey === "dimensions") return openDimension(row, spec);
      if (spec.dataKey === "categories") return openCategory(row, spec);
      if (spec.dataKey === "overall") return openOverall(row, spec);
    }
  }

  function openRecordDetail(spec, row) {
    if (spec.dataKey === "subjects") return openSubject(row, spec, true);
    if (spec.dataKey === "dimensions") return openDimension(row, spec, true);
    if (spec.dataKey === "categories") return openCategory(row, spec, true);
  }

  /* ---------------- 主题 ---------------- */
  function openSubject(row, spec, readonly) {
    var isNew = !row;
    var draft = row ? clone(row) : { id: uid("s"), name: "", detail: "", faceImg: "../assets/covers/v3/6q.svg", idx: 0, status: 0, goodsIds: [] };
    function render() {
      var goodsOptions = D.goods.filter(function (g) { return draft.goodsIds.indexOf(g.id) >= 0; });
      S.drawer({
        title: (isNew ? "新增主题" : readonly ? "查看主题" : "编辑主题") + dot("subject"),
        subtitle: "主题关联商品后，H5 首页按主题分组展示",
        wide: true,
        body:
          '<div class="ex-form-grid">' +
          field("主题名称", '<input class="ex-input" data-field="name" maxlength="10" value="' + esc(draft.name) + '" placeholder="最多 10 字" />', true) +
          field("排序值", '<input class="ex-input" type="number" min="0" data-field="idx" value="' + draft.idx + '" />', true) +
          field("主题描述", '<textarea class="ex-textarea" data-field="detail" rows="3" maxlength="50" placeholder="最多 50 字">' + esc(draft.detail) + "</textarea>", false) +
          field("封面图", '<div class="ex-image-card"><img src="' + esc(draft.faceImg) + '" alt="" /><span>建议 336×213</span></div>', true) +
          "</div>" +
          '<div class="ex-section">关联测评商品 <span class="ex-sub">至少一个</span></div>' +
          '<div class="ex-flex ex-mb8"><button class="ex-btn ex-btn--sm" type="button" data-subject-add-goods>添加测评商品</button></div>' +
          '<table class="ex-table"><thead><tr><th>商品ID</th><th>商品名称</th><th>市场价格</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
          (goodsOptions.length ? goodsOptions.map(function (g) {
            return '<tr><td><span class="ex-code">' + esc(g.code) + "</span></td><td>" + esc(g.name) + "</td><td>" +
              S.money(g.price) + "</td><td>" + S.statusDot(g.status === 1, "上架", "下架") +
              '</td><td><button class="ex-link ex-link--danger" type="button" data-subject-del-goods="' + esc(g.id) + '">移除</button></td></tr>';
          }).join("") : '<tr><td colspan="5" class="ex-table__empty">还没有关联商品</td></tr>') +
          "</tbody></table>",
        foot: readonly ? '<button class="ex-btn" data-close-drawer="1">关闭</button>' :
          '<button class="ex-btn" data-close-drawer="1">取消</button><button class="ex-btn ex-btn--primary" data-subject-save>确定</button>'
      });
      bind();
    }
    function bind() {
      var body = document.getElementById("ex-drawer-body");
      body.querySelectorAll("[data-field]").forEach(function (el) {
        el.addEventListener("input", function () { draft[el.getAttribute("data-field")] = el.value; });
      });
      var add = body.querySelector("[data-subject-add-goods]");
      if (add) add.addEventListener("click", function () { pickGoods(draft, render); });
      body.querySelectorAll("[data-subject-del-goods]").forEach(function (el) {
        el.addEventListener("click", function () {
          draft.goodsIds = draft.goodsIds.filter(function (id) { return id !== el.getAttribute("data-subject-del-goods"); });
          render();
        });
      });
      var save = document.querySelector("[data-subject-save]");
      if (save) save.addEventListener("click", function () {
        if (!draft.name) return S.toast("请输入主题名称");
        if (!draft.goodsIds.length) return S.toast("请至少关联一个测评商品");
        if (isNew) D.subjects.unshift(draft);
        else Object.assign(row, draft);
        saveAdmin();
        S.closeDrawer();
        S.toast("保存成功");
        renderRows(spec);
      });
    }
    render();
  }

  function pickGoods(draft, after) {
    var tmp = draft.goodsIds.slice();
    S.modal({
      title: "选择测评商品",
      body: '<div style="max-height:360px;overflow:auto"><table class="ex-table"><thead><tr><th></th><th>商品ID</th><th>商品名称</th><th>价格</th></tr></thead><tbody>' +
        D.goods.map(function (g) {
          return '<tr><td><input type="checkbox" data-pick="' + esc(g.id) + '"' + (tmp.indexOf(g.id) >= 0 ? " checked" : "") +
            " /></td><td>" + esc(g.code) + "</td><td>" + esc(g.name) + "</td><td>" + S.money(g.price) + "</td></tr>";
        }).join("") + "</tbody></table></div>",
      okText: "确定",
      onOk: function () { draft.goodsIds = tmp; after(); }
    });
    setTimeout(function () {
      document.querySelectorAll("[data-pick]").forEach(function (el) {
        el.addEventListener("change", function () {
          var id = el.getAttribute("data-pick");
          if (el.checked) { if (tmp.indexOf(id) < 0) tmp.push(id); } else tmp = tmp.filter(function (x) { return x !== id; });
        });
      });
    }, 0);
  }

  /* ---------------- 维度 ---------------- */
  function openDimension(row, spec, readonly) {
    var isNew = !row;
    var draft = row ? clone(row) : { id: uid("dt"), name: "", memo: "", rows: [{ key: uid("d"), name: "", memo: "" }], sonNum: 1, status: 2, createTime: now(), createUser: "余炜烽" };
    function render() {
      var rowsHtml = draft.rows.map(function (r, i) {
        return '<div class="ex-dim-row"><div class="ex-dim-row__head"><b>维度指标 ' + (i + 1) + "</b>" +
          (readonly ? "" : '<span class="ex-right"><button class="ex-link" type="button" data-dim-up="' + i + '"' + (i === 0 ? " disabled" : "") + ">上移</button> " +
            '<button class="ex-link" type="button" data-dim-down="' + i + '"' + (i === draft.rows.length - 1 ? " disabled" : "") + ">下移</button> " +
            '<button class="ex-link ex-link--danger" type="button" data-dim-del="' + i + '"' + (i === 0 ? " disabled" : "") + ">删除</button></span>") +
          "</div>" +
          '<div class="ex-form-grid">' +
          field("指标名称", '<input class="ex-input" data-dim-row="' + i + '" data-dim-field="name" value="' + esc(r.name) + '" maxlength="4" />', true) +
          field("指标备注", '<input class="ex-input" data-dim-row="' + i + '" data-dim-field="memo" value="' + esc(r.memo) + '" />', false) +
          "</div></div>";
      }).join("");
      S.drawer({
        title: (isNew ? "新增维度模板" : readonly ? "查看维度模板" : "编辑维度模板") + dot("dimension"),
        subtitle: "维度指标会被题目关联，并用于结果页解读",
        wide: true,
        body:
          '<div class="ex-form-grid">' +
          '<div class="ex-form-item"><label><em>*</em>维度模板名称</label><input class="ex-input" data-field="name" value="' + esc(draft.name) + '" placeholder="最多 20 字" maxlength="20" /></div>' +
          '<div class="ex-form-item"><label>描述</label><textarea class="ex-textarea" data-field="memo" rows="2" maxlength="50" placeholder="最多 50 字">' + esc(draft.memo) + "</textarea></div>" +
          "</div>" +
          '<div class="ex-section">维度指标 <span class="ex-sub">第一行不能上移、不能删除</span></div>' +
          '<div data-dim-list>' + rowsHtml + "</div>" +
          (readonly ? "" : '<button class="ex-btn ex-btn--sm" type="button" data-dim-add>添加指标 +</button>'),
        foot: readonly ? '<button class="ex-btn" data-close-drawer="1">关闭</button>' :
          '<button class="ex-btn" data-close-drawer="1">取消</button><button class="ex-btn ex-btn--primary" data-dim-save>确定</button>'
      });
      bind();
    }
    function bind() {
      var body = document.getElementById("ex-drawer-body");
      body.querySelectorAll("[data-field]").forEach(function (el) {
        el.addEventListener("input", function () { draft[el.getAttribute("data-field")] = el.value; });
      });
      body.querySelectorAll("[data-dim-row]").forEach(function (el) {
        el.addEventListener("input", function () {
          draft.rows[Number(el.getAttribute("data-dim-row"))][el.getAttribute("data-dim-field")] = el.value;
        });
      });
      body.querySelectorAll("[data-dim-del]").forEach(function (el) {
        el.addEventListener("click", function () {
          if (draft.rows.length <= 1) return S.toast("至少保留一个指标");
          draft.rows.splice(Number(el.getAttribute("data-dim-del")), 1);
          render();
        });
      });
      body.querySelectorAll("[data-dim-up]").forEach(function (el) {
        el.addEventListener("click", function () {
          var i = Number(el.getAttribute("data-dim-up"));
          if (i <= 0) return;
          var t = draft.rows[i - 1]; draft.rows[i - 1] = draft.rows[i]; draft.rows[i] = t;
          render();
        });
      });
      body.querySelectorAll("[data-dim-down]").forEach(function (el) {
        el.addEventListener("click", function () {
          var i = Number(el.getAttribute("data-dim-down"));
          if (i >= draft.rows.length - 1) return;
          var t = draft.rows[i + 1]; draft.rows[i + 1] = draft.rows[i]; draft.rows[i] = t;
          render();
        });
      });
      var add = body.querySelector("[data-dim-add]");
      if (add) add.addEventListener("click", function () {
        draft.rows.push({ key: uid("d"), name: "", memo: "" });
        render();
      });
      var save = document.querySelector("[data-dim-save]");
      if (save) save.addEventListener("click", function () {
        if (!draft.name) return S.toast("请输入维度模板名称");
        if (draft.rows.some(function (r) { return !r.name; })) return S.toast("请填写指标名称");
        draft.sonNum = draft.rows.length;
        if (isNew) D.dimensions.unshift(draft);
        else Object.assign(row, draft);
        saveAdmin();
        S.closeDrawer();
        S.toast("保存成功");
        renderRows(spec);
      });
    }
    render();
  }

  /* ---------------- 分类 ---------------- */
  function openCategory(row, spec, readonly) {
    var isNew = !row;
    var draft = row ? clone(row) : { id: uid("c"), name: "", image: "../assets/covers/v3/6q.svg", idx: 0, status: 2, showFlag: 0, createTime: now(), createUser: "余炜烽" };
    S.drawer({
      title: (isNew ? "新增测评分类" : readonly ? "查看测评分类" : "编辑测评分类") + dot("category"),
      subtitle: "分类禁用会级联下架模板和商品",
      mid: true,
      body:
        '<div class="ex-form-grid">' +
        field("图标", '<div class="ex-image-card"><img src="' + esc(draft.image) + '" alt="" /><span>建议 120×120</span></div>', true) +
        field("分类名称", '<input class="ex-input" data-field="name" maxlength="6" value="' + esc(draft.name) + '" placeholder="最多 6 字" />', true) +
        field("排序值", '<input class="ex-input" type="number" min="0" data-field="idx" value="' + draft.idx + '" />', true) +
        field("展示在金刚区", '<label class="ex-check"><input type="checkbox" data-field="showFlag" ' + (draft.showFlag === 1 ? "checked" : "") + " /> 展示</label>", false) +
        "</div>" +
        (readonly ? '<div class="ex-mt16"><div class="ex-desc"><div class="ex-desc__item"><div class="ex-desc__label">分类ID</div><div class="ex-desc__value">' + esc(draft.id) + '</div></div><div class="ex-desc__item"><div class="ex-desc__label">创建人</div><div class="ex-desc__value">' + esc(draft.createUser) + '</div></div><div class="ex-desc__item ex-desc__item--full"><div class="ex-desc__label">创建时间</div><div class="ex-desc__value">' + esc(draft.createTime) + "</div></div></div></div>" : ""),
      foot: readonly ? '<button class="ex-btn" data-close-drawer="1">关闭</button>' :
        '<button class="ex-btn" data-close-drawer="1">取消</button><button class="ex-btn ex-btn--primary" data-cat-save>确定</button>'
    });
    var body = document.getElementById("ex-drawer-body");
    body.querySelectorAll("[data-field]").forEach(function (el) {
      function update() {
        if (el.type === "checkbox") draft[el.getAttribute("data-field")] = el.checked ? 1 : 0;
        else draft[el.getAttribute("data-field")] = el.value;
      }
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    var save = document.querySelector("[data-cat-save]");
    if (save) save.addEventListener("click", function () {
      if (!draft.name) return S.toast("请输入分类名称");
      if (isNew) D.categories.unshift(draft);
      else Object.assign(row, draft);
      saveAdmin();
      S.closeDrawer();
      S.toast("保存成功");
      renderRows(spec);
    });
  }

  /* ---------------- 测评介绍 ---------------- */
  function openOverall(row, spec) {
    S.drawer({
      title: "编辑测评介绍" + dot("overall"),
      subtitle: "H5 测评介绍页会读取这段正文",
      mid: true,
      body: '<div class="ex-form-grid"><div class="ex-form-item ex-form-item--full"><label>测评总介绍</label><div class="ex-input" style="height:auto;padding:8px 10px;background:#f7f8fa">测评整体介绍</div></div>' +
        '<div class="ex-form-item ex-form-item--full"><label><em>*</em>测评介绍</label><textarea class="ex-textarea" data-field="detail" rows="8" placeholder="请输入测评介绍">' + esc(row.detail) + "</textarea></div></div>",
      foot: '<button class="ex-btn" data-close-drawer="1">取消</button><button class="ex-btn ex-btn--primary" data-overall-save>确定</button>'
    });
    var body = document.getElementById("ex-drawer-body");
    var area = body.querySelector("[data-field=detail]");
    document.querySelector("[data-overall-save]").addEventListener("click", function () {
      if (!area.value.trim()) return S.toast("请填写测评介绍");
      row.detail = area.value;
      row.modifyTime = now();
      saveAdmin();
      S.closeDrawer();
      S.toast("编辑成功");
      renderRows(spec);
    });
  }

  /* ---------------- 跟进 ---------------- */
  function openFollow(row, spec) {
    var status = row.status, memo = row.memo;
    S.modal({
      title: "跟进 · " + row.nickName,
      body: '<div class="ex-form-item"><label>跟进状态</label><select class="ex-select" id="follow-status">' +
        ["待跟进", "已联系", "已完成"].map(function (s) { return '<option' + (s === status ? " selected" : "") + ">" + s + "</option>"; }).join("") +
        '</select></div><div class="ex-form-item ex-mt12"><label>备注</label><textarea class="ex-textarea" id="follow-memo" rows="4" maxlength="500" placeholder="请输入跟进说明">' + esc(memo || "") + "</textarea></div>",
      okText: "提交",
      onOk: function () {
        row.status = document.getElementById("follow-status").value;
        row.memo = document.getElementById("follow-memo").value;
        saveAdmin();
        S.toast("跟进成功");
        renderRows(spec);
      }
    });
  }

  /* ---------------- 导入 / 二维码 ---------------- */
  function openImport(row) {
    S.modal({
      title: "导入分数 · " + row.title,
      body: '<div class="ex-alert ex-mb12">下载模板后按表头填写；原型只演示交互，不上传真实文件。</div>' +
        '<div class="ex-flex ex-mb12"><button class="ex-btn" id="import-tpl">下载导入模板</button>' +
        '<input type="file" id="import-file" accept=".xlsx,.xls" /></div>' +
        '<div class="ex-muted" id="import-name">尚未选择文件</div>',
      okText: "开始导入",
      onOk: function () {
        var f = document.getElementById("import-file");
        if (!f || !f.files || !f.files.length) return S.toast("请先选择文件");
        S.toast("导入任务已提交（原型演示）");
      }
    });
    setTimeout(function () {
      document.getElementById("import-tpl").addEventListener("click", function () { S.toast("已下载模板：题目导入模板.xlsx"); });
      document.getElementById("import-file").addEventListener("change", function (e) {
        document.getElementById("import-name").textContent = e.target.files[0] ? e.target.files[0].name : "尚未选择文件";
      });
    }, 0);
  }

  function openQr(row) {
    S.modal({
      title: "商品二维码",
      body: '<div style="text-align:center"><img src="' + esc(row.qrCode) + '" alt="二维码" style="width:200px;height:200px;border:1px solid #e5e6eb;border-radius:10px" />' +
        '<p class="ex-muted ex-mt8">' + esc(row.name) + "</p></div>",
      okText: "下载二维码",
      onOk: function () {
        var a = document.createElement("a");
        a.href = row.qrCode;
        a.download = row.name + "-二维码.svg";
        a.click();
        S.toast("已开始下载");
      }
    });
  }

  /* ---------------- 测评数据 ---------------- */
  /* 答题数据导出预览：题目与选项必须是可读内容，不能只回「问题N / A、B、C、D」
     题目、选项、分值三者的明细统一由卷王答题明细返回（见 EX-053 注释）。 */
  function exportAnswerRows(tpl) {
    var picks = [3, 3, 2, 3, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2];
    return (tpl.questions || []).map(function (q, i) {
      var oi = Math.min(picks[i] !== undefined ? picks[i] : 2, q.options.length - 1);
      var opt = q.options[oi] || {};
      return {
        no: i + 1,
        title: q.title,
        dimName: (tpl.dimensionExplains || []).filter(function (d) { return d.dimensionId === q.dimensionalityId; })[0],
        dim: q.dimensionalityId,
        optionIdx: oi,
        optionContent: opt.content || "",
        score: opt.score,
        maxScore: Math.max.apply(null, (q.options || []).map(function (o) { return Number(o.score || 0); }).concat([0]))
      };
    });
  }

  function openExportPreview(kind) {
    var tpl = D.templates.filter(function (t) { return t.id === "tpl-parent"; })[0] || D.templates[0];
    var dimMap = {};
    var dt = D.dimensions.filter(function (d) { return d.id === tpl.dimensionalityId; })[0];
    if (dt && dt.rows) {
      dt.rows.forEach(function (r) { dimMap[r.key] = r.name; });
    }
    (tpl.dimensionExplains || []).forEach(function (d) {
      var k = d.key || d.dimensionId;
      if (k && !dimMap[k]) dimMap[k] = d.name;
    });

    var rows = exportAnswerRows(tpl);
    var body = '<div class="ex-alert ex-mb12"><b>本次改动</b>：导出的题目列不再写「问题1 / 问题2」，选项列不再写「A / B / C / D」，' +
      '统一输出<b>题目原文</b>与<b>选项原文</b>。题目、选项、分值的明细数据<b>来自卷王答题明细返回</b>，' +
      '若接口不返回这两个字段，导出只能拿到序号与字母。</div>' +

      '<div class="ex-section">导出表头对照</div>' +
      '<table class="ex-result-table"><thead><tr><th style="width:150px">列</th><th style="width:240px">旧导出</th><th>新导出</th></tr></thead><tbody>' +
      '<tr><td>题目列</td><td><span class="ex-code">问题1</span> <span class="ex-code">问题2</span> …</td><td>题号 + 题目原文，如 <span class="ex-code">Q1 孩子连续几次考试退步…</span></td></tr>' +
      '<tr><td>选项值</td><td><span class="ex-code">A</span> <span class="ex-code">B</span> <span class="ex-code">C</span> <span class="ex-code">D</span></td><td>所选选项原文，如 <span class="ex-code">先拥抱孩子接住情绪…</span></td></tr>' +
      '<tr><td>选项集</td><td>不导出</td><td>该题全部选项原文按序号拼接，便于对表</td></tr>' +
      '<tr><td>分值</td><td>不导出</td><td>所选选项得分 / 该题最高分</td></tr>' +
      "</tbody></table>" +

      '<div class="ex-section">导出明细预览 · ' + esc(tpl.title) + " · " + rows.length + " 题</div>" +
      '<div class="ex-muted ex-mb8">模拟学员：赵欣然 / S6MULM1 · 提交时间 2026-11-03 17:13:32 · 总分 ' + totalScore(tpl) + " 分制</div>" +
      '<table class="ex-result-table"><thead><tr>' +
      '<th style="width:52px">题号</th><th style="width:104px">所属维度</th><th>题目原文</th><th style="width:230px">所选选项原文</th><th style="width:96px">选项序号</th><th style="width:88px">得分</th>' +
      "</tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr><td>Q" + r.no + "</td><td>" + esc(dimMap[r.dim] || r.dim) + '</td><td>' + esc(r.title) +
          '</td><td class="ex-td-strong">' + esc(r.optionContent) + "</td><td>" + String.fromCharCode(65 + r.optionIdx) +
          "</td><td>" + r.score + " / " + r.maxScore + "</td></tr>";
      }).join("") +
      "</tbody></table>" +

      '<div class="ex-section">数据来源与接口</div>' +
      '<table class="ex-result-table"><thead><tr><th style="width:210px">数据</th><th style="width:270px">来源</th><th>说明</th></tr></thead><tbody>' +
      '<tr><td>题目原文</td><td><span class="ex-code">卷王答题明细返回</span></td><td>字段 <span class="ex-code">questionTitle</span>（待接口确认命名）；不返回时导出退回「问题N」</td></tr>' +
      '<tr><td>选项原文</td><td><span class="ex-code">卷王答题明细返回</span></td><td>字段 <span class="ex-code">optionContent</span>（待接口确认命名）；不返回时导出退回 A/B/C/D</td></tr>' +
      '<tr><td>所选选项序号</td><td><span class="ex-code">卷王答题明细返回</span></td><td>字段 <span class="ex-code">optionSort</span>，用于定位选项原文</td></tr>' +
      '<tr><td>选项得分 / 最高分</td><td><span class="ex-code">卷王答题明细返回</span></td><td>字段 <span class="ex-code">optionScore</span> / <span class="ex-code">maxScore</span></td></tr>' +
      '<tr><td>学员与提交时间</td><td><span class="ex-code">exam/exam/user/check/findUserCheckStatistic</span></td><td>既有，不改</td></tr>' +
      "</tbody></table>" +
      '<div class="ex-alert ex-mt12">导出接口：<span class="ex-code">GET exam/exam/user/check/exportCheckStatistic</span>（明细）、' +
      '<span class="ex-code">GET exam/exam/user/favourite/exportTempleteUserAnswer</span>（汇总下载）。' +
      "两个接口需把卷王返回的题目与选项原文透传到导出文件，具体字段以卷王实际契约为准。</div>";

    S.drawer({
      title: "答题数据导出预览",
      subtitle: tpl.title + " · " + rows.length + " 题",
      wide: true,
      body: body,
      foot: '<button class="ex-btn" type="button" data-close-drawer="1">关闭</button>' +
        '<button class="ex-btn ex-btn--primary" type="button" data-close-drawer="1">知道了</button>'
    });
  }

  function renderDataPage(spec) {
    var details = D.checkDetails, summary = D.checkSummary;
    var kpi = [
      ["累计测试人数", "28,640", "+12.6%"],
      ["今日填写", "386", "+8.2%"],
      ["平均得分", "58.6", ""],
      ["平均填写时长", "8分12秒", ""]
    ];
    mount.innerHTML = pageHead(spec.title, spec.desc) +
      '<div class="ex-kpis">' + kpi.map(function (k, i) {
        return '<div class="ex-kpi ' + (i === 0 ? "ex-kpi--blue" : i === 1 ? "ex-kpi--orange" : "") + '"><span>' + k[0] + "</span><strong>" + k[1] +
          (k[2] ? "<em>" + k[2] + "</em>" : "") + "</strong></div>";
      }).join("") + "</div>" +
      '<section class="ex-panel"><div class="ex-data-tabs"><button class="is-on" data-data-tab="detail">测评模板填写情况明细' + dot("data-detail") + '</button><button data-data-tab="summary">测评模板填写情况汇总' + dot("data-summary") + "</button></div>" +
      '<div class="ex-data-pane" data-pane="detail">' +
      '<div class="ex-toolbar"><button class="ex-btn" data-export="detail">导出</button><button class="ex-btn" data-export-preview="detail">导出内容预览' + dot("data-export") + '</button><span class="ex-toolbar__right">按当前筛选导出</span></div>' +
      '<div class="ex-filter" style="padding-bottom:12px"><div class="ex-filter__row">' +
      '<div class="ex-field"><label>模板标题</label><div class="ex-field__control"><input class="ex-input" data-dfilter="title" placeholder="请输入模板标题" /></div></div>' +
      '<div class="ex-field"><label>填写人</label><div class="ex-field__control"><input class="ex-input" data-dfilter="name" placeholder="姓名 / 会员ID" /></div></div>' +
      '<div class="ex-field"><label>测评类型</label><div class="ex-field__control">' + select("examType", "", ["6Q 全维", "AQ 逆商", "EQ 情商", "亲子关系", "IQ 学习力", "RQ 关系力"], "全部") + "</div></div>" +
      '<div class="ex-field"><label>填写时间</label><div class="ex-field__control"><input class="ex-input" data-dfilter="createTime" placeholder="YYYY-MM-DD" /></div></div>' +
      "</div></div>" +
      '<div class="ex-table-wrap"><table class="ex-table"><thead><tr><th>测评类型</th><th>分类</th><th>模板标题</th><th>状态</th><th>填写人ID</th><th>填写人</th><th>年龄</th><th>性别</th><th>电话</th><th>会员类型</th><th>6Q身份</th><th>总分</th><th>得分</th><th>分数区间</th><th>填写时长</th><th>填写时间</th></tr></thead><tbody data-detail-body></tbody></table></div></div>' +
      '<div class="ex-data-pane" data-pane="summary" hidden>' +
      '<div class="ex-toolbar"><button class="ex-btn" data-export="summary">导出</button><button class="ex-btn" data-export-preview="summary">导出内容预览</button><span class="ex-toolbar__right">按模板汇总收藏、查看、分享与测试人数</span></div>' +
      '<div class="ex-filter" style="padding-bottom:12px"><div class="ex-filter__row">' +
      '<div class="ex-field"><label>模板标题</label><div class="ex-field__control"><input class="ex-input" data-sfilter="title" placeholder="请输入模板标题" /></div></div>' +
      '<div class="ex-field"><label>测评类型</label><div class="ex-field__control">' + select("examType", "", ["6Q 全维", "AQ 逆商", "EQ 情商", "亲子关系", "IQ 学习力", "RQ 关系力"], "全部") + "</div></div>" +
      '<div class="ex-field"><label>状态</label><div class="ex-field__control">' + select("status", "", [{ value: 1, label: "启用" }, { value: 2, label: "禁用" }], "全部") + "</div></div>" +
      "</div></div>" +
      '<div class="ex-table-wrap"><table class="ex-table"><thead><tr><th>测评类型</th><th>模板标题</th><th>状态</th><th>收藏人数</th><th>查看人数</th><th>分享题目人数</th><th>分享结果人数</th><th>测试人数</th><th>测评答题数据</th></tr></thead><tbody data-summary-body></tbody></table></div></div></section>';

    function renderDetail() {
      var q = {};
      mount.querySelectorAll("[data-dfilter]").forEach(function (el) { q[el.getAttribute("data-dfilter")] = el.value; });
      var type = mount.querySelector('[data-pane="detail"] [data-field="examType"]').value;
      var rows = details.filter(function (r) {
        if (q.title && r.title.indexOf(q.title) < 0) return false;
        if (q.name && r.name.indexOf(q.name) < 0 && r.serialNo.indexOf(q.name) < 0) return false;
        if (type && r.examType !== type) return false;
        if (q.createTime && String(r.createTime).slice(0, 10) !== q.createTime) return false;
        return true;
      });
      mount.querySelector("[data-detail-body]").innerHTML = rows.length ? rows.map(function (r) {
        return "<tr><td>" + esc(r.examType) + "</td><td>" + esc(r.categoryText) + "</td><td>" + esc(r.title) + "</td><td>" +
          S.statusDot(r.status === 1) + '</td><td><span class="ex-code">' + esc(r.serialNo) + '</span></td><td class="ex-td-strong">' + esc(r.name) +
          "</td><td>" + esc(r.age) + "</td><td>" + esc(r.sexText) + "</td><td>" + esc(r.mobile) + "</td><td>" + esc(r.memberTypeText) +
          "</td><td>" + esc(r.memberPosition) + "</td><td>" + esc(r.scoreTotal) + '</td><td class="ex-td-strong">' + esc(r.exchangeScore) +
          "</td><td>" + S.statusTag(r.explainMsg, "blue") + "</td><td>" + esc(r.examTime) + "</td><td>" + esc(r.createTime) + "</td></tr>";
      }).join("") : '<tr><td colspan="16" class="ex-table__empty">没有符合条件的数据</td></tr>';
    }
    function renderSummary() {
      var q = {};
      mount.querySelectorAll("[data-sfilter]").forEach(function (el) { q[el.getAttribute("data-sfilter")] = el.value; });
      var pane = mount.querySelector('[data-pane="summary"]');
      var type = pane.querySelector('[data-field="examType"]').value;
      var status = pane.querySelector('[data-field="status"]').value;
      var rows = summary.filter(function (r) {
        if (q.title && r.title.indexOf(q.title) < 0) return false;
        if (type && r.examType !== type) return false;
        if (status && String(r.status) !== String(status)) return false;
        return true;
      });
      mount.querySelector("[data-summary-body]").innerHTML = rows.length ? rows.map(function (r) {
        return "<tr><td>" + esc(r.examType) + "</td><td class=\"ex-td-strong\">" + esc(r.title) + "</td><td>" + S.statusDot(r.status === 1) +
          "</td><td>" + r.scNum + "</td><td>" + r.viewNum + "</td><td>" + r.fxtmNum + "</td><td>" + r.fxjgNum + "</td><td>" + r.testNum +
          '</td><td><button class="ex-btn ex-btn--sm" data-export="answer" data-id="' + esc(r.templeteId) + '">下载</button></td></tr>';
      }).join("") : '<tr><td colspan="9" class="ex-table__empty">没有符合条件的数据</td></tr>';
    }
    renderDetail(); renderSummary();

    mount.addEventListener("click", function (e) {
      var t = e.target;
      if (t.getAttribute("data-data-tab")) {
        var tab = t.getAttribute("data-data-tab");
        mount.querySelectorAll("[data-data-tab]").forEach(function (b) { b.classList.toggle("is-on", b === t); });
        mount.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== tab; });
        return;
      }
      if (t.getAttribute("data-export") === "answer") { openExportPreview("answer"); return; }
      if (t.getAttribute("data-export-preview")) { openExportPreview(t.getAttribute("data-export-preview")); return; }
      if (t.getAttribute("data-export")) {
        S.toast("导出已提交，原型不产生真实文件；题目与选项原文见「导出内容预览」");
      }
    });
    mount.addEventListener("input", function (e) {
      if (e.target.getAttribute("data-dfilter")) renderDetail();
      if (e.target.getAttribute("data-sfilter")) renderSummary();
    });
    mount.addEventListener("change", function (e) {
      if (e.target.getAttribute("data-field")) {
        if (e.target.closest('[data-pane="detail"]')) renderDetail();
        if (e.target.closest('[data-pane="summary"]')) renderSummary();
      }
    });
    S.paintDots && S.paintDots();
  }

  /* ---------------- 模板表单 ---------------- */
  function blankTemplate() {
    var q = clone(D.questions[0]);
    q.id = "q-" + Date.now();
    return {
      id: uid("tpl"), title: "", subTitle: "", categoryId: "", categoryName: "",
      dimensionalityId: "", dimensionName: "", questionCount: 1, resultCount: 3,
      scoreTotal: 0, totalTime: 10, totalTimeUnit: 1, status: 2, createUser: "余炜烽",
      createTime: now(), virtualTesters: 0, agedTag: true,
      faceImg: "../assets/covers/v3/6q.svg", examImg: "../assets/covers/v3/6q-wide.svg",
      titleImg: "../assets/covers/v3/poster-6q.svg", reportImg: "../assets/covers/v3/poster-6q.svg",
      examDescription: "", resultTitle: "", resultDemo: "", answerSummary: "",
      resultLayout: 1, riskTip: "", ctaText: "", ctaSubText: "", ctaQrCode: "",
      showTotalScore: true, showDimensionalityImage: true, showDistributionImage: true, showHarmonyImage: true,
      questions: [q], results: clone(D.results), dimensionExplains: clone(D.dimExplains)
    };
  }

  function totalScore(draft) {
    return (draft.questions || []).reduce(function (sum, q) {
      var max = Math.max.apply(null, (q.options || []).map(function (o) { return Number(o.score || 0); }).concat([0]));
      return sum + max;
    }, 0);
  }

  /* 新版结果页前置校验：档位必须连续覆盖 0~总分；每维上限必须等于该维题目数 × 最高分 */
  function validatePowerLayout(draft, dimRows) {
    var total = totalScore(draft);
    var bands = (draft.results || []).map(function (r) {
      return { min: Number(r.scoreMin), max: Number(r.scoreMax), name: r.name };
    }).sort(function (a, b) { return a.min - b.min; });
    if (!bands.length) return "新版结果页至少需要 1 个档位";
    if (bands[0].min !== 0) return "档位必须从 0 分开始";
    if (bands[bands.length - 1].max !== total) return "最高档位必须覆盖到测评总分 " + total + " 分";
    for (var i = 1; i < bands.length; i++) {
      if (bands[i].min !== bands[i - 1].max + 1) {
        return "档位之间必须连续且不重叠：" + bands[i - 1].name + " 与 " + bands[i].name + " 之间有空档或重叠";
      }
    }
    var perDim = {};
    (draft.questions || []).forEach(function (q) {
      var max = Math.max.apply(null, (q.options || []).map(function (o) { return Number(o.score || 0); }).concat([0]));
      perDim[q.dimensionalityId] = (perDim[q.dimensionalityId] || 0) + max;
    });
    var bad = (dimRows || []).filter(function (d) { return (perDim[d.key] || 0) !== total / Math.max(1, (dimRows || []).length); });
    if (bad.length) {
      return "各维度分值需均衡：" + bad.map(function (d) { return d.name + "=" + (perDim[d.key] || 0); }).join("，") +
        "，当前应为每维 " + (total / Math.max(1, (dimRows || []).length)) + " 分";
    }
    return "";
  }

  function renderTemplateForm(spec) {
    var id = new URLSearchParams(location.search).get("id");
    var row = id ? D.templates.filter(function (t) { return t.id === id; })[0] : null;
    var draft = row ? clone(row) : blankTemplate();
    var active = Number(new URLSearchParams(location.search).get("tab") || 1);
    if (active < 1 || active > 3) active = 1;

    function imageUpload(src, hint) {
      return '<div class="ex-upload" data-upload><b>+</b><span>点击上传</span><span class="ex-small">' + esc(hint) + "</span></div>" +
        '<div class="ex-flex ex-mt8">' + S.thumb(src, "ex-thumb--lg") + '<span class="ex-small ex-muted">当前图片</span></div>';
    }

    function tab1() {
      var cats = D.categories.filter(function (c) { return c.status === 1; }).map(function (c) { return { value: c.id, label: c.name }; });
      var dims = D.dimensions.filter(function (d) { return d.status === 1; }).map(function (d) { return { value: d.id, label: d.name }; });
      return '<div class="ex-tab-body" data-tab="1">' +
        '<div class="ex-section">测评基础信息 ' + dot("template-basic") + "</div>" +
        '<div class="ex-form-grid ex-form-grid--3">' +
        field("测评模板标题", '<input class="ex-input" data-draft="title" maxlength="15" value="' + esc(draft.title) + '" placeholder="请输入测评模板标题" />', true) +
        field("测评模板副标题", '<input class="ex-input" data-draft="subTitle" value="' + esc(draft.subTitle) + '" placeholder="请输入测评模板副标题" />', true) +
        field("虚拟测试人数", '<input class="ex-input" type="number" min="0" data-draft="virtualTesters" value="' + draft.virtualTesters + '" />', false) +
        field("分类", select("categoryId", draft.categoryId, cats, "请选择分类"), true) +
        field("用户是否需填年龄", '<div class="ex-radio-row"><label class="ex-radio"><input type="radio" name="agedTag" value="1" ' + (draft.agedTag ? "checked" : "") + ' /> 是</label><label class="ex-radio"><input type="radio" name="agedTag" value="0" ' + (!draft.agedTag ? "checked" : "") + ' /> 否</label></div>', true) +
        field("测评总分", '<input class="ex-input js-total" readonly value="' + totalScore(draft) + '" />', false, "由题目选项最高分累加") +
        field("测评建议时长", '<div class="ex-flex"><input class="ex-input" type="number" min="0" data-draft="totalTime" value="' + draft.totalTime + '" style="width:120px" /><select class="ex-select" data-draft="totalTimeUnit" style="width:96px"><option value="1">分钟</option></select></div>', true) +
        field("维度模板", select("dimensionalityId", draft.dimensionalityId, dims, "请选择维度模板"), true) +
        "</div>" +
        '<div class="ex-section">测评介绍图片</div>' +
        '<div class="ex-form-grid ex-form-grid--3">' +
        field("封面图", imageUpload(draft.faceImg, "750×562"), true) +
        field("测评图片", imageUpload(draft.examImg, "750×422"), true) +
        field("测评海报", imageUpload(draft.titleImg, "550×956，固定区域 510×176"), true) +
        field("报告海报", imageUpload(draft.reportImg, "550×956，固定区域 510×176"), true) +
        "</div>" +
        '<div class="ex-section">测评详情</div>' +
        '<div class="ex-form-grid"><div class="ex-form-item ex-form-item--full"><label><em>*</em>测评详情</label><textarea class="ex-textarea" data-draft="examDescription" rows="5" placeholder="请输入测评详情">' + esc(draft.examDescription) + "</textarea></div></div>" +
        '<div class="ex-section">结果页版式 ' + dot("template-layout") + "</div>" +
        '<div class="ex-form-grid">' +
        '<div class="ex-form-item ex-form-item--full"><label><em>*</em>报告版式</label><div class="ex-radio-row">' +
        '<label class="ex-radio"><input type="radio" name="resultLayout" data-layout-field="resultLayout" value="1" ' + (Number(draft.resultLayout || 1) === 1 ? "checked" : "") + " /> 旧版结果页（总分 + 雷达 / 正态分布 + 六维和谐）</label>" +
        '<label class="ex-radio"><input type="radio" name="resultLayout" data-layout-field="resultLayout" value="2" ' + (Number(draft.resultLayout || 1) === 2 ? "checked" : "") + " /> 新版结果页（档位勋章 + 核心卡点 + 风险提示 + 预约解读）</label></div>" +
        '<div class="ex-muted ex-mt8">版式挂在模板上，模板赋给测评商品后，H5 结果页按该开关渲染。新版式下正态分布与 6Q 和谐指数不再展示。</div></div>' +
        "</div>" +
        '<div class="ex-section">结果页介绍</div>' +
        '<div class="ex-form-grid"><div class="ex-form-item"><label><em>*</em>介绍标题</label><input class="ex-input" data-draft="resultTitle" value="' + esc(draft.resultTitle) + '" placeholder="请输入介绍标题" /></div>' +
        '<div class="ex-form-item ex-form-item--full"><label><em>*</em>介绍内容</label><textarea class="ex-textarea" data-draft="resultDemo" rows="4" placeholder="请输入介绍内容">' + esc(draft.resultDemo) + "</textarea></div></div>" +
        "</div>";
    }

    function tab2() {
      var dimOpts = (D.dimensions.filter(function (d) { return d.status === 1; })[0] || { rows: [] }).rows;
      if (draft.dimensionalityId) {
        var dt = D.dimensions.filter(function (d) { return d.id === draft.dimensionalityId; })[0];
        if (dt) dimOpts = dt.rows;
      }
      var qHtml = draft.questions.map(function (q, qi) {
        var opts = q.options.map(function (o, oi) {
          return '<div class="ex-option-row"><div class="ex-option-row__letter">' + String.fromCharCode(65 + oi) + "</div>" +
            '<input class="ex-input" data-opt="' + qi + "-" + oi + '" data-opt-field="content" value="' + esc(o.content) + '" placeholder="选项内容" />' +
            '<input class="ex-input" type="number" min="0" data-opt="' + qi + "-" + oi + '" data-opt-field="score" value="' + o.score + '" placeholder="分值" />' +
            '<button class="ex-option-row__del" type="button" data-opt-del="' + qi + "-" + oi + '"' + (q.options.length <= 1 ? " disabled" : "") + ">移除</button></div>";
        }).join("");
        return '<div class="ex-question-card"><div class="ex-question-card__head"><b>问题 ' + (qi + 1) + "</b>" +
          '<span class="ex-tag ex-tag--blue">单选题</span><span class="ex-right"><button class="ex-link ex-link--danger" type="button" data-q-del="' + qi + '"' + (draft.questions.length <= 1 ? " disabled" : "") + ">移除</button></span></div>" +
          '<div class="ex-question-card__body"><div class="ex-form-grid">' +
          field("题型", '<select class="ex-select" disabled><option>单选题</option></select>', true) +
          field("关联维度", '<select class="ex-select" data-q="' + qi + '" data-q-field="dimensionalityId">' +
            dimOpts.map(function (d) { return '<option value="' + esc(d.key) + '"' + (q.dimensionalityId === d.key ? " selected" : "") + ">" + esc(d.name) + "</option>"; }).join("") + "</select>", true) +
          '<div class="ex-form-item ex-form-item--full"><label><em>*</em>题目</label><input class="ex-input" data-q="' + qi + '" data-q-field="title" value="' + esc(q.title) + '" placeholder="请输入题目" /></div>' +
          "</div>" + opts +
          '<button class="ex-btn ex-btn--sm ex-mt8" type="button" data-opt-add="' + qi + '">添加选项 +</button></div></div>';
      }).join("");
      return '<div class="ex-tab-body" data-tab="2"><div class="ex-section">测评模板题目 ' + dot("template-questions") + "</div>" +
        '<div class="ex-form-grid"><div class="ex-form-item"><label>测评总分</label><input class="ex-input js-total" readonly value="' + totalScore(draft) + '" /></div>' +
        '<div class="ex-form-item"><label><em>*</em>答题摘要</label><input class="ex-input" data-draft="answerSummary" value="' + esc(draft.answerSummary) + '" placeholder="请输入答题摘要" /></div></div>' +
        '<div class="ex-alert ex-mt16">现网只支持单选题。选项最多 26 个，至少 1 个；题目至少 1 题。题目分值取该题选项最高分。</div>' + qHtml +
        '<div class="ex-flex ex-mt12"><button class="ex-btn ex-btn--primary" type="button" data-q-add>添加题目</button>' +
        '<button class="ex-btn" type="button" data-q-import>导入题目</button></div></div>';
    }

    /* 版式与展示开关联动：新版固定不展示正态分布与 6Q 和谐指数，维度图固定展示 */
    function applyLayoutSwitches(layout) {
      draft.resultLayout = layout;
      if (layout === 2) {
        draft.showDimensionalityImage = true;
        draft.showDistributionImage = false;
        draft.showHarmonyImage = false;
      }
    }

    function isV2() { return Number(draft.resultLayout || 1) === 2; }

    function switchRow(key, label, hint, locked) {
      return '<div class="ex-form-item"><label>' + label +
        (locked ? ' <span class="ex-tag ex-tag--blue">新版固定</span>' : "") + "</label>" +
        '<div class="ex-radio-row">' +
        '<label class="ex-radio' + (locked ? " ex-radio--locked" : "") + '"><input type="radio" name="' + key + '" data-switch-field="' + key + '" value="1" ' + (draft[key] ? "checked" : "") + (locked ? " disabled" : "") + " /> 是</label>" +
        '<label class="ex-radio' + (locked ? " ex-radio--locked" : "") + '"><input type="radio" name="' + key + '" data-switch-field="' + key + '" value="0" ' + (!draft[key] ? "checked" : "") + (locked ? " disabled" : "") + " /> 否</label>" +
        "</div>" + (hint ? '<div class="ex-muted ex-mt8" style="font-size:12px">' + hint + "</div>" : "") + "</div>";
    }

    function tab3() {
      var v2 = isV2();
      var switches = v2
        ? switchRow("showTotalScore", "是否展示总分", "新版报告「测评结果」卡内固定展示总分，可关闭。", false) +
          switchRow("showDimensionalityImage", "维度图表展示", "新版固定展示五维雷达（维度名下方带该维得分），不可关闭。", true)
        : switchRow("showTotalScore", "是否展示总分", "", false) +
          switchRow("showDimensionalityImage", "维度图表展示", "", false) +
          switchRow("showDistributionImage", "正态分布图表展示", "", false) +
          switchRow("showHarmonyImage", "6Q和谐指数展示", "", false);
      var resultRows = draft.results.map(function (r, i) {
        return "<tr><td>" + (i + 1) + '</td><td><input class="ex-input" data-result="' + i + '" data-result-field="name" value="' + esc(r.name) + '" /></td>' +
          '<td><div class="ex-flex"><input class="ex-input" type="number" data-result="' + i + '" data-result-field="scoreMin" value="' + r.scoreMin + '" style="width:70px" /><span>—</span><input class="ex-input" type="number" data-result="' + i + '" data-result-field="scoreMax" value="' + r.scoreMax + '" style="width:70px" /></div></td>' +
          (v2
            ? '<td><input class="ex-input" data-result="' + i + '" data-result-field="badge" value="' + esc(r.badge || "") + '" placeholder="如 ✨ 温柔笃定的觉醒妈妈" /></td>' +
              '<td><textarea class="ex-textarea" data-result="' + i + '" data-result-field="quote" rows="2" placeholder="觉醒金句">' + esc(r.quote || "") + "</textarea></td>" +
              '<td><input class="ex-input" data-result="' + i + '" data-result-field="percentile" value="' + esc(r.percentile || "") + '" placeholder="如 超越 95% 的家长" style="width:130px" /></td>'
            : "") +
          '<td><textarea class="ex-textarea" data-result="' + i + '" data-result-field="base" rows="2">' + esc(r.base) + "</textarea></td>" +
          '<td><button class="ex-link ex-link--danger" type="button" data-result-del="' + i + '">删除</button></td></tr>';
      }).join("");
      var dimRows = draft.dimensionExplains.map(function (d, i) {
        return "<tr><td>" + esc(d.name) + '</td><td><div class="ex-flex"><input class="ex-input" type="number" data-dimx="' + i + '" data-dimx-field="scoreMin" value="' + d.scoreMin + '" style="width:66px" /><span>—</span><input class="ex-input" type="number" data-dimx="' + i + '" data-dimx-field="scoreMax" value="' + d.scoreMax + '" style="width:66px" /></div></td>' +
          '<td><textarea class="ex-textarea" data-dimx="' + i + '" data-dimx-field="painText" rows="2" placeholder="卡点文案">' + esc(d.painText || d.detail || "") + "</textarea></td>" +
          '<td><textarea class="ex-textarea" data-dimx="' + i + '" data-dimx-field="riskText" rows="2" placeholder="风险文案">' + esc(d.riskText || "") + "</textarea></td>" +
          '<td><textarea class="ex-textarea" data-dimx="' + i + '" data-dimx-field="appreciate" rows="2" placeholder="欣赏文案（欣赏你…）">' + esc(d.appreciate || "") + "</textarea></td>" +
          '<td><textarea class="ex-textarea" data-dimx="' + i + '" data-dimx-field="appreciateAlt" rows="2" placeholder="相对优势版（兜底用）">' + esc(d.appreciateAlt || "") + "</textarea></td></tr>";
      }).join("");
      var ctaBlock = v2
        ? '<div class="ex-section">新风控与转化文案 ' + dot("template-cta") + "</div>" +
          '<div class="ex-form-grid">' +
          '<div class="ex-form-item ex-form-item--full"><label>风险提示（「孩子正在经历什么」）</label><textarea class="ex-textarea" data-draft="riskTip" rows="3" placeholder="仅新版结果页展示">' + esc(draft.riskTip || "") + "</textarea></div>" +
          '<div class="ex-form-item ex-form-item--full"><label>转化文案（「深度了解」）</label><textarea class="ex-textarea" data-draft="ctaText" rows="4" placeholder="仅新版结果页展示">' + esc(draft.ctaText || "") + "</textarea></div>" +
          '<div class="ex-form-item"><label>转化引导语</label><input class="ex-input" data-draft="ctaSubText" value="' + esc(draft.ctaSubText || "") + '" placeholder="如 添加导师微信" /></div>' +
          '<div class="ex-form-item"><label>导师二维码</label><input class="ex-input" data-draft="ctaQrCode" value="' + esc(draft.ctaQrCode || "") + '" placeholder="图片地址，原型用占位图" /></div>' +
          "</div>"
        : '<div class="ex-section">新风控与转化文案 ' + dot("template-cta") + "</div>" +
          '<div class="ex-alert">这组字段只在新版结果页渲染。当前模板是旧版结果页，填写后不会展示；切到新版后再配置。</div>';
      var resultHead = v2
        ? '<tr><th style="width:48px">序号</th><th style="width:110px">档位名称</th><th style="width:150px">分数区间</th><th style="width:170px">觉醒勋章</th><th>觉醒金句</th><th style="width:140px">超越百分比</th><th>基础解读</th><th style="width:60px">操作</th></tr>'
        : '<tr><th style="width:48px">序号</th><th style="width:130px">指数名称</th><th style="width:160px">指数范围</th><th>基础解读</th><th style="width:60px">操作</th></tr>';
      var layoutHint = v2
        ? '<div class="ex-alert">当前为<b>新版结果页</b>：固定展示档位勋章、五维雷达、核心卡点、风险提示、深度了解与底部预约 CTA；<b>不含正态分布图与 6Q 和谐指数</b>，两个旧开关已从本页移除。</div>'
        : '<div class="ex-alert">当前为<b>旧版结果页</b>：展示总分、维度雷达 / 正态分布、整体解读、各类详解与课程商城；不使用档位勋章、核心卡点与转化 CTA。';
      return '<div class="ex-tab-body" data-tab="3"><div class="ex-section">结果页配置 ' + dot("template-report") + "</div>" +
        layoutHint +
        '<div class="ex-form-grid">' + switches + "</div>" +
        ctaBlock +
        '<div class="ex-section">测评模板结果</div>' +
        '<div class="ex-flex ex-mb8"><span class="ex-muted">测评总分</span><input class="ex-input js-total" readonly value="' + totalScore(draft) + '" style="width:110px" /></div>' +
        '<table class="ex-result-table"><thead>' + resultHead + "</thead><tbody>" + resultRows + "</tbody></table>" +
        '<button class="ex-btn ex-btn--sm ex-mt8" type="button" data-result-add>新增一个</button>' +
        '<div class="ex-section">各维度指标结果 ' + dot("template-dimcopy") + "</div>" +
        '<div class="ex-alert">卡点、风险、欣赏三段文案都按维度配置，取该维度<b>索引为 0</b> 的那一行。欣赏文案只展示<b>一条</b>（分数最高、同分取索引更小），不展示小建议；再写一版「相对优势版」，用于该维度分数低于 8 分时的兜底措辞。</div>' +
        '<table class="ex-result-table"><thead><tr><th style="width:110px">维度指标名称</th><th style="width:130px">指标范围</th><th>卡点文案</th><th>风险文案</th><th>欣赏文案</th><th>相对优势版</th></tr></thead><tbody>' + dimRows + "</tbody></table>" +
        "</div>";
    }

    mount.innerHTML = pageHead(spec.title, spec.desc) +
      '<div class="ex-panel"><div class="ex-tabs">' +
      '<button type="button" class="' + (active === 1 ? "is-on" : "") + '" data-tab-btn="1">① 测评基础信息</button>' +
      '<button type="button" class="' + (active === 2 ? "is-on" : "") + '" data-tab-btn="2">② 测评题目信息</button>' +
      '<button type="button" class="' + (active === 3 ? "is-on" : "") + '" data-tab-btn="3">③ 报告结果设置</button>' +
      '</div><div data-tab-wrap>' + tab1() + tab2() + tab3() + "</div>" +
      '<div class="ex-form-actions"><button class="ex-btn" type="button" data-form-back>返回</button>' +
      '<button class="ex-btn ex-btn--primary" type="button" data-form-save>确定</button></div></div>';

    var wrap = mount.querySelector("[data-tab-wrap]");
    wrap.querySelectorAll("[data-tab]").forEach(function (el) { if (Number(el.getAttribute("data-tab")) !== active) el.hidden = true; });

    function syncDraft() {
      mount.querySelectorAll("[data-draft]").forEach(function (el) { draft[el.getAttribute("data-draft")] = el.value; });
      mount.querySelectorAll('input[name="agedTag"]').forEach(function (el) { if (el.checked) draft.agedTag = el.value === "1"; });
      mount.querySelectorAll("[data-layout-field]").forEach(function (el) { if (el.checked) draft.resultLayout = Number(el.value); });
      mount.querySelectorAll("[data-switch-field]").forEach(function (el) { if (el.checked) draft[el.getAttribute("data-switch-field")] = el.value === "1"; });
    }
    function refreshTotals() {
      var v = totalScore(draft);
      mount.querySelectorAll(".js-total").forEach(function (el) { if (el.tagName === "INPUT") el.value = v; });
    }
    function rerenderTab() {
      wrap.innerHTML = tab1() + tab2() + tab3();
      wrap.querySelectorAll("[data-tab]").forEach(function (el) { el.hidden = Number(el.getAttribute("data-tab")) !== active; });
      bindTab();
    }

    function bindTab() {
      wrap.querySelectorAll("[data-draft]").forEach(function (el) {
        el.addEventListener("input", function () { draft[el.getAttribute("data-draft")] = el.value; });
      });
      wrap.querySelectorAll("[data-field]").forEach(function (el) {
        el.addEventListener("change", function () { draft[el.getAttribute("data-field")] = el.value; });
      });
      wrap.querySelectorAll('input[name="agedTag"]').forEach(function (el) {
        el.addEventListener("change", function () { draft.agedTag = el.value === "1"; });
      });
      wrap.querySelectorAll("[data-layout-field]").forEach(function (el) {
        el.addEventListener("change", function () {
          syncDraft();
          applyLayoutSwitches(Number(el.value));
          rerenderTab();
        });
      });
      wrap.querySelectorAll("[data-switch-field]").forEach(function (el) {
        el.addEventListener("change", function () { draft[el.getAttribute("data-switch-field")] = el.value === "1"; });
      });
      wrap.querySelectorAll("[data-q]").forEach(function (el) {
        el.addEventListener("input", function () {
          draft.questions[Number(el.getAttribute("data-q"))][el.getAttribute("data-q-field")] = el.value;
        });
      });
      wrap.querySelectorAll("[data-opt]").forEach(function (el) {
        el.addEventListener("input", function () {
          var parts = el.getAttribute("data-opt").split("-");
          var q = draft.questions[Number(parts[0])], o = q.options[Number(parts[1])];
          var f = el.getAttribute("data-opt-field");
          o[f] = f === "score" ? Number(el.value || 0) : el.value;
          refreshTotals();
        });
      });
      wrap.querySelectorAll("[data-result]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-result-field");
          draft.results[Number(el.getAttribute("data-result"))][f] = f.indexOf("score") === 0 ? Number(el.value || 0) : el.value;
        });
      });
      wrap.querySelectorAll("[data-dimx]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-dimx-field");
          draft.dimensionExplains[Number(el.getAttribute("data-dimx"))][f] = f.indexOf("score") === 0 ? Number(el.value || 0) : el.value;
        });
      });
      wrap.querySelectorAll("[data-q-add]").forEach(function (el) { el.addEventListener("click", function () {
        syncDraft();
        var q = clone(D.questions[0]); q.id = uid("q"); q.title = ""; q.options.forEach(function (o, i) { o.id = q.id + "-o" + i; o.content = ""; o.score = 0; });
        draft.questions.push(q); rerenderTab();
      }); });
      wrap.querySelectorAll("[data-q-del]").forEach(function (el) { el.addEventListener("click", function () {
        if (draft.questions.length <= 1) return S.toast("至少保留 1 题");
        draft.questions.splice(Number(el.getAttribute("data-q-del")), 1); rerenderTab();
      }); });
      wrap.querySelectorAll("[data-opt-add]").forEach(function (el) { el.addEventListener("click", function () {
        var q = draft.questions[Number(el.getAttribute("data-opt-add"))];
        if (q.options.length >= 26) return S.toast("选项太多了");
        q.options.push({ id: uid("o"), content: "", score: 0, idx: q.options.length }); rerenderTab();
      }); });
      wrap.querySelectorAll("[data-opt-del]").forEach(function (el) { el.addEventListener("click", function () {
        var parts = el.getAttribute("data-opt-del").split("-");
        var q = draft.questions[Number(parts[0])];
        if (q.options.length <= 1) return S.toast("至少保留 1 个选项");
        q.options.splice(Number(parts[1]), 1); rerenderTab();
      }); });
      wrap.querySelectorAll("[data-result-add]").forEach(function (el) { el.addEventListener("click", function () {
        draft.results.push({ id: uid("r"), name: "新结果", scoreMin: 0, scoreMax: 0, base: "", detail: "", suggest: "" });
        rerenderTab();
      }); });
      wrap.querySelectorAll("[data-result-del]").forEach(function (el) { el.addEventListener("click", function () {
        draft.results.splice(Number(el.getAttribute("data-result-del")), 1); rerenderTab();
      }); });
      wrap.querySelectorAll("[data-q-import]").forEach(function (el) { el.addEventListener("click", function () { openImport({ title: draft.title || "当前模板" }); }); });
      wrap.querySelectorAll("[data-upload]").forEach(function (el) { el.addEventListener("click", function () { S.toast("图片上传为原型占位，不产生真实文件"); }); });
    }

    mount.querySelectorAll("[data-tab-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        active = Number(btn.getAttribute("data-tab-btn"));
        mount.querySelectorAll("[data-tab-btn]").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        wrap.querySelectorAll("[data-tab]").forEach(function (el) { el.hidden = Number(el.getAttribute("data-tab")) !== active; });
      });
    });
    mount.querySelector("[data-form-back]").addEventListener("click", function () { location.href = "replica.html?p=template-list"; });
    mount.querySelector("[data-form-save]").addEventListener("click", function () {
      syncDraft();
      if (!draft.title) return S.toast("请输入测评模板标题");
      if (!draft.subTitle) return S.toast("请输入测评模板副标题");
      if (!draft.categoryId) return S.toast("请选择分类");
      if (!draft.dimensionalityId) return S.toast("请选择维度模板");
      var cat = D.categories.filter(function (c) { return c.id === draft.categoryId; })[0];
      var dim = D.dimensions.filter(function (d) { return d.id === draft.dimensionalityId; })[0];
      if (Number(draft.resultLayout || 1) === 2) {
        var msg = validatePowerLayout(draft, dim ? dim.rows : []);
        if (msg) { S.toast(msg); return; }
      }
      draft.categoryName = cat ? cat.name : "";
      draft.dimensionName = dim ? dim.name : "";
      draft.questionCount = draft.questions.length;
      draft.resultCount = draft.results.length;
      draft.scoreTotal = totalScore(draft);
      if (row) Object.assign(row, draft); else D.templates.unshift(draft);
      saveAdmin();
      S.toast("保存成功");
      setTimeout(function () { location.href = "replica.html?p=template-list"; }, 450);
    });
    bindTab();
    S.paintDots && S.paintDots();
  }

  /* ---------------- 模板详情 ---------------- */
  function renderTemplateDetail(spec) {
    var id = new URLSearchParams(location.search).get("id");
    var row = D.templates.filter(function (t) { return t.id === id; })[0] || D.templates[0];
    var tab = new URLSearchParams(location.search).get("tab") || "base";
    function descItem(label, value, full) {
      return '<div class="ex-desc__item' + (full ? " ex-desc__item--full" : "") + '"><div class="ex-desc__label">' + esc(label) + '</div><div class="ex-desc__value">' + (value == null || value === "" ? "-" : value) + "</div></div>";
    }
    function content() {
      if (tab === "base") {
        return '<div class="ex-section">测评基础信息</div><div class="ex-desc">' +
          descItem("测评模板标题", row.title) + descItem("测评模板副标题", row.subTitle) +
          descItem("测评类型", row.categoryName) + descItem("测评总分", row.scoreTotal) +
          descItem("测评建议时长", row.totalTime + " 分钟") + descItem("维度模板", row.dimensionName) +
          descItem("虚拟测试人数", row.virtualTesters) + descItem("用户是否需填年龄", row.agedTag ? "是" : "否") +
          descItem("封面图", '<img class="ex-thumb ex-thumb--lg" src="' + esc(row.faceImg) + '" />', true) +
          descItem("测评图片", '<img class="ex-thumb ex-thumb--lg" src="' + esc(row.examImg) + '" />', true) +
          descItem("测评详情", row.examDescription, true) +
          descItem("结果页介绍标题", row.resultTitle, true) + descItem("结果页介绍内容", row.resultDemo, true) +
          descItem("报告版式", Number(row.resultLayout || 1) === 2 ? "新版结果页（档位勋章 + 核心卡点 + 风险提示 + 预约解读）" : "旧版结果页（总分 + 雷达 / 正态分布 + 六维和谐）", true) +
          "</div>";
      }
      if (tab === "question") {
        return '<div class="ex-section">测评题目信息</div><div class="ex-flex ex-mb12"><span class="ex-muted">测评总分</span><b>' + totalScore(row) + "</b>" +
          '<span class="ex-muted" style="margin-left:18px">答题摘要</span><span>' + esc(row.answerSummary) + "</span></div>" +
          '<table class="ex-table"><thead><tr><th style="width:52px">题号</th><th>题目</th><th>关联维度</th><th>选项与分值</th></tr></thead><tbody>' +
          row.questions.map(function (q, i) {
            var dim = (row.dimensionExplains || []).filter(function (d) { return d.dimensionId === q.dimensionalityId; })[0];
            return '<tr><td>' + (i + 1) + "</td><td>" + esc(q.title) + "</td><td>" + esc(dim ? dim.name : q.dimensionalityId) +
              "</td><td>" + q.options.map(function (o) { return esc(o.content) + ' <span class="ex-code">' + o.score + "</span>"; }).join("　") + "</td></tr>";
          }).join("") + "</tbody></table>";
      }
      var isNew = Number(row.resultLayout || 1) === 2;
      var switchTags = '<div class="ex-flex ex-flex-wrap ex-mb12">' +
        '<span class="ex-tag ' + (isNew ? "ex-tag--blue" : "") + '">版式 ' + (isNew ? "新版" : "旧版") + "</span>" +
        '<span class="ex-tag ' + (row.showTotalScore ? "ex-tag--green" : "") + '">总分 ' + (row.showTotalScore ? "展示" : "不展示") + "</span>" +
        '<span class="ex-tag ' + (row.showDimensionalityImage ? "ex-tag--green" : "") + '">维度图 ' + (row.showDimensionalityImage ? "展示" : "不展示") + "</span>" +
        (isNew ? "" :
          '<span class="ex-tag ' + (row.showDistributionImage ? "ex-tag--green" : "") + '">正态分布 ' + (row.showDistributionImage ? "展示" : "不展示") + "</span>" +
          '<span class="ex-tag ' + (row.showHarmonyImage ? "ex-tag--green" : "") + '">和谐指数 ' + (row.showHarmonyImage ? "展示" : "不展示") + "</span>") +
        "</div>";
      var resultHead = isNew
        ? "<tr><th>档位名称</th><th>分数区间</th><th>觉醒勋章</th><th>觉醒金句</th><th>超越百分比</th><th>基础解读</th></tr>"
        : "<tr><th>指数名称</th><th>指数范围</th><th>基础解读</th></tr>";
      var resultBody = row.results.map(function (r) {
        return "<tr><td>" + esc(r.name) + "</td><td>" + r.scoreMin + " — " + r.scoreMax + " 分</td>" +
          (isNew ? "<td>" + esc(r.badge || "-") + "</td><td>" + esc(r.quote || "-") + "</td><td>" + esc(r.percentile || "-") + "</td>" : "") +
          "<td>" + esc(r.base) + "</td></tr>";
      }).join("");
      var ctaDesc = isNew
        ? '<div class="ex-section">新风控与转化文案</div><div class="ex-desc">' +
          descItem("风险提示", row.riskTip || "-", true) + descItem("转化文案", row.ctaText || "-", true) +
          descItem("转化引导语", row.ctaSubText || "-") +
          descItem("导师二维码", row.ctaQrCode ? '<img class="ex-thumb" src="' + esc(row.ctaQrCode) + '" />' : "-") + "</div>"
        : '<div class="ex-section">新风控与转化文案</div><div class="ex-alert">旧版结果页不渲染这组字段。切到新版后再配置。</div>';
      return '<div class="ex-section">报告结果信息</div>' +
        switchTags +
        (isNew ? '<div class="ex-alert">新版结果页不含正态分布图与 6Q 和谐指数。</div>' : "") +
        '<table class="ex-result-table"><thead>' + resultHead + "</thead><tbody>" + resultBody + "</tbody></table>" +
        ctaDesc +
        '<div class="ex-section">各维度指标结果</div><table class="ex-result-table"><thead><tr><th>维度指标</th><th>指标范围</th><th>卡点文案</th><th>风险文案</th><th>欣赏文案</th><th>相对优势版</th></tr></thead><tbody>' +
        row.dimensionExplains.map(function (d) {
          return "<tr><td>" + esc(d.name) + "</td><td>" + d.scoreMin + " — " + d.scoreMax + " 分</td><td>" + esc(d.painText || d.detail || "-") +
            "</td><td>" + esc(d.riskText || "-") + "</td><td>" + esc(d.appreciate || "-") +
            "</td><td>" + esc(d.appreciateAlt || "-") + "</td></tr>";
        }).join("") + "</tbody></table>";
    }
    mount.innerHTML = pageHead(row.title, row.subTitle + " · " + row.categoryName + " · " + row.questionCount + " 题 · 约 " + row.totalTime + " 分钟") +
      '<div class="ex-detail-layout"><aside class="ex-detail-nav">' +
      '<button type="button" data-dtab="base" class="' + (tab === "base" ? "is-on" : "") + '">测评基础信息</button>' +
      '<button type="button" data-dtab="question" class="' + (tab === "question" ? "is-on" : "") + '">测评题目信息</button>' +
      '<button type="button" data-dtab="report" class="' + (tab === "report" ? "is-on" : "") + '">报告结果信息</button>' +
      '<div style="margin-top:18px"><a class="ex-btn ex-btn--sm" href="replica.html?p=template-list">返回列表</a></div></aside>' +
      '<div class="ex-detail-main" data-detail-main>' + content() + "</div></div>";
    mount.querySelectorAll("[data-dtab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tab = btn.getAttribute("data-dtab");
        mount.querySelectorAll("[data-dtab]").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        mount.querySelector("[data-detail-main]").innerHTML = content();
      });
    });
    mount.querySelector(".ex-page-head h1").insertAdjacentHTML("beforeend", dot("template-detail"));
    S.paintDots && S.paintDots();
  }

  /* ---------------- 商品表单 ---------------- */
  function renderGoodsForm(spec) {
    var id = new URLSearchParams(location.search).get("id");
    var row = id ? D.goods.filter(function (g) { return g.id === id; })[0] : null;
    var draft = row ? clone(row) : {
      id: uid("g"), code: "自动生成", name: "", categoryId: "", categoryName: "",
      coverImage: "../assets/covers/v3/6q.svg", qrCode: "../assets/covers/v3/qr.svg", price: 0, priceIos: 0,
      idx: 99, oaProductName: "", templeteIds: [], templeteTitle: "", thirdParty: "", status: 2,
      heartFlag: 2, displayStatus: false, createUser: "余炜烽", createTime: now(), testCount: 0, intro: ""
    };
    function render() {
      var cats = D.categories.filter(function (c) { return c.status === 1; }).map(function (c) { return { value: c.id, label: c.name }; });
      var selected = D.templates.filter(function (t) { return draft.templeteIds.indexOf(t.id) >= 0; });
      mount.innerHTML = pageHead(spec.title, spec.desc) +
        '<div class="ex-panel"><div class="ex-tab-body">' +
        '<div class="ex-section">商品信息</div>' +
        '<div class="ex-form-grid ex-form-grid--3">' +
        field("商品编号", '<input class="ex-input" readonly value="' + esc(draft.code) + '" />', false, "自动生成，无需填写") +
        field("商品名称", '<input class="ex-input" data-g="name" value="' + esc(draft.name) + '" placeholder="请填写商品名称" />', true) +
        field("分类", select("categoryId", draft.categoryId, cats, "请选择分类"), true) +
        field("市场 Android 价", '<input class="ex-input" type="number" min="0" step="0.01" data-g="price" value="' + draft.price + '" />', true) +
        field("市场 IOS 价", '<input class="ex-input" type="number" min="0" step="0.01" data-g="priceIos" value="' + draft.priceIos + '" />', true) +
        field("排序值", '<input class="ex-input" type="number" min="0" data-g="idx" value="' + draft.idx + '" />', true) +
        field("所属OA产品", '<input class="ex-input" data-g="oaProductName" value="' + esc(draft.oaProductName) + '" placeholder="请选择/填写 OA 产品" />', true) +
        "</div>" +
        '<div class="ex-section">关联测评模板 ' + dot("goods-form") + "</div>" +
        '<div class="ex-flex ex-mb8"><button class="ex-btn ex-btn--sm" type="button" data-goods-add-tpl>添加测评模板</button></div>' +
        '<table class="ex-table"><thead><tr><th>分类</th><th>测评模板名称</th><th>题目数</th><th>操作</th></tr></thead><tbody>' +
        (selected.length ? selected.map(function (t) {
          return "<tr><td>" + esc(t.categoryName) + "</td><td>" + esc(t.title) + "</td><td>" + t.questionCount +
            '</td><td><button class="ex-link ex-link--danger" type="button" data-goods-del-tpl="' + esc(t.id) + '">移除</button></td></tr>';
        }).join("") : '<tr><td colspan="4" class="ex-table__empty">请至少关联一个测评模板</td></tr>') +
        "</tbody></table>" +
        '<div class="ex-section">商品介绍</div>' +
        '<div class="ex-form-grid ex-form-grid--3">' +
        field("封面图", '<div class="ex-image-card"><img src="' + esc(draft.coverImage) + '" /><span>建议 540×450</span></div>', true) +
        field("是否展示到第三方", '<label class="ex-check"><input type="checkbox" data-g-check="thirdParty" ' + (draft.thirdParty ? "checked" : "") + " /> 农行</label>", false) +
        field("商品简介", '<input class="ex-input" data-g="intro" value="' + esc(draft.intro) + '" placeholder="H5 列表一句话简介" />', false) +
        "</div></div>" +
        '<div class="ex-form-actions"><button class="ex-btn" type="button" data-goods-back>返回</button>' +
        '<button class="ex-btn ex-btn--primary" type="button" data-goods-save>确定</button></div></div>';
      bind();
    }
    function bind() {
      mount.querySelectorAll("[data-g]").forEach(function (el) {
        el.addEventListener("input", function () {
          var k = el.getAttribute("data-g");
          draft[k] = el.type === "number" ? Number(el.value || 0) : el.value;
        });
      });
      mount.querySelectorAll("[data-g-check]").forEach(function (el) {
        el.addEventListener("change", function () { draft[el.getAttribute("data-g-check")] = el.checked ? "nh" : ""; });
      });
      var catSel = mount.querySelector('[data-field="categoryId"]');
      if (catSel) catSel.addEventListener("change", function () { draft.categoryId = catSel.value; });
      mount.querySelector("[data-goods-add-tpl]").addEventListener("click", function () {
        var tmp = draft.templeteIds.slice();
        S.modal({
          title: "选择测评模板",
          body: '<div style="max-height:360px;overflow:auto"><table class="ex-table"><thead><tr><th></th><th>分类</th><th>模板名称</th><th>题目数</th></tr></thead><tbody>' +
            D.templates.map(function (t) {
              return '<tr><td><input type="checkbox" data-pick-tpl="' + esc(t.id) + '"' + (tmp.indexOf(t.id) >= 0 ? " checked" : "") +
                " /></td><td>" + esc(t.categoryName) + "</td><td>" + esc(t.title) + "</td><td>" + t.questionCount + "</td></tr>";
            }).join("") + "</tbody></table></div>",
          okText: "确定",
          onOk: function () { draft.templeteIds = tmp; render(); }
        });
        setTimeout(function () {
          document.querySelectorAll("[data-pick-tpl]").forEach(function (el) {
            el.addEventListener("change", function () {
              var tid = el.getAttribute("data-pick-tpl");
              if (el.checked) { if (tmp.indexOf(tid) < 0) tmp.push(tid); } else tmp = tmp.filter(function (x) { return x !== tid; });
            });
          });
        }, 0);
      });
      mount.querySelectorAll("[data-goods-del-tpl]").forEach(function (el) {
        el.addEventListener("click", function () {
          draft.templeteIds = draft.templeteIds.filter(function (x) { return x !== el.getAttribute("data-goods-del-tpl"); });
          render();
        });
      });
      mount.querySelector("[data-goods-back]").addEventListener("click", function () { location.href = "replica.html?p=goods-list"; });
      mount.querySelector("[data-goods-save]").addEventListener("click", function () {
        if (!draft.name) return S.toast("请输入商品名称");
        if (!draft.templeteIds.length) return S.toast("请至少关联一个测评模板");
        var cat = D.categories.filter(function (c) { return c.id === draft.categoryId; })[0];
        draft.categoryName = cat ? cat.name : draft.categoryName;
        var tpl = D.templates.filter(function (t) { return t.id === draft.templeteIds[0]; })[0];
        draft.templeteTitle = tpl ? tpl.title : "";
        draft.displayStatus = draft.status === 1;
        if (row) Object.assign(row, draft); else D.goods.unshift(draft);
        saveAdmin();
        S.toast("保存成功");
        setTimeout(function () { location.href = "replica.html?p=goods-list"; }, 450);
      });
    }
    render();
    S.paintDots && S.paintDots();
  }

  /* ---------------- 商品详情 ---------------- */
  function renderGoodsDetail(spec) {
    var id = new URLSearchParams(location.search).get("id");
    var row = D.goods.filter(function (g) { return g.id === id; })[0] || D.goods[0];
    var tpls = D.templates.filter(function (t) { return row.templeteIds.indexOf(t.id) >= 0; });
    mount.innerHTML = pageHead("测评商品详情", "商品信息、关联模板与二维码") +
      '<div class="ex-panel"><div class="ex-panel__pad">' +
      '<div class="ex-goods-hero"><img src="' + esc(row.coverImage) + '" alt="" /><div class="ex-goods-hero__meta">' +
      "<h3>" + esc(row.name) + dot("goods-detail") + "</h3><p>" + esc(row.intro) + "</p>" +
      '<div class="ex-split-price"><span>IOS：<b>' + S.money(row.priceIos) + "</b></span><span>Android：<b>" + S.money(row.price) + "</b></span>" +
      "<span>" + S.statusDot(row.displayStatus, "前端显示", "前端隐藏") + "</span><span>" + S.statusDot(row.status === 1, "上架中", "已下架") + "</span></div></div>" +
      '<div class="ex-right"><button class="ex-btn" type="button" data-goods-qr>下载二维码</button></div></div>' +
      '<div class="ex-section">商品信息</div><div class="ex-desc">' +
      '<div class="ex-desc__item"><div class="ex-desc__label">商品编号</div><div class="ex-desc__value"><span class="ex-code">' + esc(row.code) + "</span></div></div>" +
      '<div class="ex-desc__item"><div class="ex-desc__label">商品名称</div><div class="ex-desc__value">' + esc(row.name) + "</div></div>" +
      '<div class="ex-desc__item"><div class="ex-desc__label">分类</div><div class="ex-desc__value">' + esc(row.categoryName) + "</div></div>" +
      '<div class="ex-desc__item"><div class="ex-desc__label">所属OA产品</div><div class="ex-desc__value">' + esc(row.oaProductName) + "</div></div>" +
      '<div class="ex-desc__item"><div class="ex-desc__label">展示到心画</div><div class="ex-desc__value">' + (row.heartFlag === 1 ? "展示" : "隐藏") + "</div></div>" +
      '<div class="ex-desc__item"><div class="ex-desc__label">创建时间</div><div class="ex-desc__value">' + esc(row.createTime) + "</div></div>" +
      "</div>" +
      '<div class="ex-section">关联测评模板</div><table class="ex-table"><thead><tr><th>测评类型</th><th>测评模板名称</th><th>题目数</th><th>总分</th></tr></thead><tbody>' +
      tpls.map(function (t) { return "<tr><td>" + esc(t.categoryName) + "</td><td>" + esc(t.title) + "</td><td>" + t.questionCount + "</td><td>" + t.scoreTotal + "</td></tr>"; }).join("") +
      "</tbody></table>" +
      '<div class="ex-section">图片</div><div class="ex-flex"><img class="ex-thumb ex-thumb--lg" src="' + esc(row.coverImage) + '" /><img class="ex-thumb" src="' + esc(row.qrCode) + '" /></div>' +
      '<div class="ex-mt16"><a class="ex-btn" href="replica.html?p=goods-list">返回列表</a></div>' +
      "</div></div>";
    mount.querySelector("[data-goods-qr]").addEventListener("click", function () { openQr(row); });
    S.paintDots && S.paintDots();
  }

  /* ---------------- 占位 ---------------- */
  function renderPlaceholder(spec) {
    mount.innerHTML = pageHead(spec.title, spec.desc) +
      '<div class="ex-panel ex-placeholder"><div class="ex-placeholder__mark">6Q</div>' +
      "<h2>" + esc(spec.title) + "</h2><p>该页面在本次 v2.0.0 复刻范围之外，保留入口与占位，不影响测评管理主链路。</p>" +
      '<a class="ex-btn ex-btn--primary" href="replica.html?p=template-list">返回测评模板</a></div>';
  }

  /* ---------------- 路由 ---------------- */
  function init() {
    var spec = P[S.page];
    if (!spec) {
      renderPlaceholder({ title: "页面不存在", desc: "请从功能清单进入测评管理页面。" });
      return;
    }
    document.title = spec.title + " · 6Q后台管理系统 v2.0.0";
    if (spec.special === "template-form") return renderTemplateForm(spec);
    if (spec.special === "template-detail") return renderTemplateDetail(spec);
    if (spec.special === "goods-form") return renderGoodsForm(spec);
    if (spec.special === "goods-detail") return renderGoodsDetail(spec);
    if (spec.special === "data") return renderDataPage(spec);
    initList(spec);
  }

  init();
})();
