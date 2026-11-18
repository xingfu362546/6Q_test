/**
 * 6Q 测评 H5 · 按 exam2.0 源码页面复刻
 * 首页 / 登录 / 详情 / 须知 / 年龄 / 答题 / 结果 / 我的测评 / 确认订单 / 支付
 */
(function () {
  "use strict";

  var E = window.EXAM;
  var D = E.D;
  var esc = E.esc;
  var root = document.getElementById("h5-page");
  var PAGE = document.body.getAttribute("data-page") || "menu";

  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function go(url) { location.href = url; }
  function money(n) { return Number(n || 0) ? "￥" + Number(n).toFixed(2).replace(/\.00$/, "") : "限时免费"; }
  function nowStr() { return E.now(); }
  function cover(g) { return imgPath(g.cover || "../assets/covers/v3/6q.svg"); }
  function imgPath(u) {
    return String(u || "").replace(/assets\/covers\/(?!v3\/)/g, "assets/covers/v3/");
  }
  function dot(key) { return '<button class="h5-dot" type="button" data-note-key="' + esc(key) + '"></button>'; }

  function G(g) {
    if (!g) return null;
    return {
      id: g.id,
      goodsId: g.id,
      templeteId: g.templeteId || g.id,
      categoryId: g.categoryId,
      idx: g.idx || 0,
      scoreTotal: g.scoreTotal,
      title: g.name,
      name: g.name,
      subTitle: g.subTitle,
      coverImage: imgPath(g.cover),
      cover: g.cover,
      price: g.price,
      priceIos: g.price,
      testerCount: g.testCount || 0,
      questionCount: g.questionCount,
      minutes: g.minutes,
      intro: g.intro,
      forWho: g.forWho,
      dims: g.dims,
      questions: g.questions,
      results: g.results,
      recommend: g.recommend,
      answerSummary: g.answerSummary || "请按最近一个月的真实状态作答，不必选“应该”的答案。测评结果仅用于自我观察，不作为诊断依据。",
      agedTag: g.agedTag !== false,
      resultTitle: g.resultTitle || "你的测评结果",
      resultDemo: g.resultDemo || "你会看到自己的总分、维度雷达与一段针对当前状态的解读。没有好坏，只有此刻的位置。",
      showTotalScore: g.showTotal !== false,
      showDimensionalityImage: g.showRadar !== false,
      showDistributionImage: g.showDist !== false,
      showHarmonyImage: g.showHarmony !== false,
      resultLayout: Number(g.resultLayout || 1),
      riskTip: g.riskTip || "",
      ctaText: g.ctaText || "",
      ctaSubText: g.ctaSubText || "",
      ctaQrCode: g.ctaQrCode || "",
      painCopy: g.painCopy || null,
      dimCopy: g.dimCopy || null
    };
  }

  function goodsList() { return D.goods.map(G); }

  function getRecord() {
    var id = qs("record") || qs("checkId");
    if (!id || id.indexOf("demo") === 0) return demoRecord(id);
    return E.recordById(id) || E.records()[0] || demoRecord();
  }

  /* 固定演示数据：demo-low / demo-mid / demo-high 三档各一份，答案、日期、单号都写死，
     用于功能清单跳转与验收复现，不读写 localStorage。 */
  var DEMO_PRESETS = {
    "demo-low": {
      picks: [1, 1, 0, 1, 1],
      createTime: "2026-11-05 10:24:08",
      orderNo: "EX20261105001"
    },
    "demo-mid": {
      picks: [2, 2, 2, 2, 2],
      createTime: "2026-11-03 17:13:32",
      orderNo: "EX20261103002"
    },
    "demo-high": {
      picks: [3, 3, 2, 3, 3],
      createTime: "2026-11-07 21:40:15",
      orderNo: "EX20261107003"
    }
  };

  function demoRecord(recordId) {
    var wantId = qs("goodsId") || qs("id");
    var g = (wantId && D.byId(wantId)) || D.byId("g-6q");
    var answers = {};
    if (Number(g.resultLayout || 1) === 2) {
      var presetKey = DEMO_PRESETS[recordId] ? recordId : "demo-mid";
      var preset = DEMO_PRESETS[presetKey];
      var dimOrder = [];
      g.questions.forEach(function (q) {
        if (dimOrder.indexOf(q.dim) < 0) dimOrder.push(q.dim);
      });
      g.questions.forEach(function (q) {
        var dimIndex = dimOrder.indexOf(q.dim);
        var pick = preset.picks[dimIndex];
        answers[q.id] = Math.min(pick, q.options.length - 1);
      });
      var r = E.calcResult(g, answers);
      return makeRecord(g, r, answers, { id: "rec-" + presetKey, createTime: preset.createTime, orderNo: preset.orderNo });
    }
    g.questions.forEach(function (q, i) { answers[q.id] = i % 4 === 0 ? 0 : i % 7 === 0 ? 3 : 1; });
    var r0 = E.calcResult(g, answers);
    return makeRecord(g, r0, answers, { id: "rec-demo", createTime: "2026-11-03 17:13:32", orderNo: "EX20261103001" });
  }

  function makeRecord(g, r, answers, overrides) {
    var id = E.uid("rec");
    var rec = {
      id: id, checkId: id, goodsId: g.id, templeteId: g.templeteId || g.id,
      title: g.name, coverImage: imgPath(g.cover), price: g.price, priceIos: g.price,
      score: r.total, total: g.scoreTotal, rangeName: r.range.name,
      harmony: r.harmony, percentile: r.percentile, dims: r.dims,
      answers: answers, createTime: nowStr(), payTime: nowStr(),
      orderNo: "EX" + Date.now(), status: "finished"
    };
    if (overrides) {
      Object.keys(overrides).forEach(function (k) {
        rec[k] = overrides[k];
        if (k === "id") rec.checkId = overrides[k];
        if (k === "createTime") rec.payTime = overrides[k];
      });
    }
    return rec;
  }

  /* ---------------- 首页 ---------------- */
  function renderMenu() {
    var state = { tab: 0, sort: 1 };
    var cats = D.categories;
    function list() {
      var cat = cats[state.tab];
      var arr = goodsList().filter(function (g) { return g.categoryId === cat.id; });
      if (!arr.length) arr = [];
      if (state.sort === 1) arr.sort(function (a, b) { return (a.idx || 0) - (b.idx || 0); });
      if (state.sort === 2) arr.sort(function (a, b) { return (b.testerCount || 0) - (a.testerCount || 0); });
      if (state.sort === 3) arr.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
      return arr;
    }
    function paint() {
      var arr = list();
      root.querySelector("[data-total]").textContent = "共" + arr.length + "个测评";
      root.querySelectorAll("[data-sort]").forEach(function (b) { b.classList.toggle("is-on", Number(b.getAttribute("data-sort")) === state.sort); });
      root.querySelector("[data-list]").innerHTML = arr.length ? arr.map(function (g) {
        return '<div class="menu-goods" data-goods="' + esc(g.goodsId) + '">' +
          '<div class="menu-goods-info"><div class="menu-goods-title">' + esc(g.title) + dot("menu-card") + '</div>' +
          '<div class="menu-goods-sub">' + esc(g.subTitle) + '</div>' +
          '<div class="menu-goods-footer"><div class="menu-goods-price">' + money(g.price) + '</div>' +
          '<div class="menu-goods-count">' + (g.testerCount || 0) + '人已测</div></div></div>' +
          '<div class="menu-goods-view"><div class="menu-goods-img" style="background-image:url(' + esc(g.coverImage) + ')"></div><div class="menu-goods-btn">立即测试 ></div></div></div>';
      }).join("") : '<div class="menu-empty"><div class="menu-empty-img"></div><div class="menu-empty-str">暂时没有该类测评～</div></div>';
      root.querySelector("[data-list]").querySelectorAll("[data-goods]").forEach(function (el) {
        el.addEventListener("click", function () { go("detail.html?goodsId=" + encodeURIComponent(el.getAttribute("data-goods"))); });
      });
    }
    root.innerHTML =
      '<div class="menu-page"><div class="menu-page-back"></div>' +
      '<div class="menu-header-content"><div class="menu-header-content-title">6Q测评' + dot("menu-main") + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="menu-header-content-subtitle">让画笔诉说你的内心，揭示你的心灵密码</div>' +
      '<div class="src-header-history" id="go-history"><i></i>我的测评</div></div></div>' +
      '<div class="menu-block"><div class="menu-tab" id="menu-tabs"><div class="menu-tab__icon" id="tab-bar"></div></div>' +
      '<div class="menu-content"><div class="menu-content-header"><div class="menu-content-header-total" data-total></div>' +
      '<div class="menu-sort" data-sort="1">最新</div><div class="menu-sort" data-sort="2">热门</div><div class="menu-sort" data-sort="3">价格</div></div>' + dot("menu-sort") +
      '<div class="menu-content-body" data-list></div></div></div></div>';
    var tabs = root.querySelector("#menu-tabs");
    tabs.innerHTML += cats.map(function (c, i) {
      return '<div class="menu-tab-item' + (i === 0 ? " is-on" : "") + '" data-tab="' + i + '"><div class="menu-tab-inner">' + esc(c.name) + "</div></div>";
    }).join("");
    root.querySelector("#go-history").addEventListener("click", function () { go("history.html"); });
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]");
      if (!b) return;
      state.tab = Number(b.getAttribute("data-tab"));
      tabs.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      document.getElementById("tab-bar").style.top = (19 + state.tab * 60) + "px";
      paint();
    });
    root.querySelectorAll("[data-sort]").forEach(function (b) {
      b.addEventListener("click", function () { state.sort = Number(b.getAttribute("data-sort")); paint(); });
    });
    document.getElementById("tab-bar").style.top = "19px";
    paint();
    E.mountNotes("menu");
  }

  /* ---------------- 登录 ---------------- */
  function renderLogin() {
    var redirect = qs("redirect") || "";
    root.innerHTML = '<div class="login-page"><div class="login-logo"><img src="../assets/source/6Qlogo.png" alt="6Q" /><p>欢迎登录，体验更多功能' + dot("login") + '</p></div>' +
      '<div class="login-form"><input id="login-mobile" placeholder="输入手机号码 / 账号" />' +
      '<input id="login-password" type="password" placeholder="输入密码" /></div>' +
      '<div style="width:90%;margin:0 auto"><div class="login-btn" id="login-btn">登 录</div></div></div>';
    document.getElementById("login-btn").addEventListener("click", function () {
      var mobile = document.getElementById("login-mobile").value.trim();
      var password = document.getElementById("login-password").value.trim();
      if (!mobile) { mobile = "13925806313"; document.getElementById("login-mobile").value = mobile; }
      if (!password) { password = "6qiloveyou"; document.getElementById("login-password").value = password; }
      E.saveUser({ name: "余炜烽", serialNo: mobile, mobile: mobile, avatar: "余", isGuest: false });
      E.saveSession({ token: "mock-token-" + Date.now(), userId: mobile, loginAt: E.now(), channel: "h5" });
      E.toast("登录成功");
      setTimeout(function () {
        if (redirect) { location.replace(decodeURIComponent(redirect)); return; }
        if (history.length > 1) history.back(); else go("index.html");
      }, 400);
    });
    E.mountNotes("login");
  }

  /* ---------------- 扫码进入 ----------------
     分流优先级：
     1. 先落推荐关系（未登录也要先存，避免登录后丢失）
     2. 未登录 → 去登录，登录成功后回到本页继续
     3. 商品免费 → 自动生成免费订单 → 无感进入测评须知
     4. 商品收费 → 进商品详情页，由用户自行下单
  */
  function renderEntry() {
    var goodsId = qs("goodsId") || qs("id") || "g-parent";
    var ref = qs("ref") || qs("uid") || "";
    var from = qs("from") || "poster";
    var g = G(D.byId(goodsId)) || goodsList()[0];

    // 1. 推荐关系先落库（含未登录场景）
    var rf = E.saveReferral({ ref: ref, goodsId: g.goodsId, from: from, channel: "share_poster" });

    var selfUrl = "entry.html?goodsId=" + encodeURIComponent(g.goodsId) + (ref ? "&ref=" + encodeURIComponent(ref) : "") + "&from=" + encodeURIComponent(from);

    root.innerHTML = '<div class="entry-page"><div class="entry-card">' +
      '<div class="entry-qr"></div>' +
      '<div class="entry-title">正在为你打开测评' + dot("entry-flow") + '</div>' +
      '<div class="entry-goods">' + esc(g.title) + '</div>' +
      '<div class="entry-price">' + money(g.price) + '</div>' +
      '<div class="entry-step" id="entry-step">校验登录状态…</div>' +
      '<div class="entry-ref">H5 与 APP 内嵌均需登录后测试' + dot("entry-login") + '</div>' +
      (rf ? '<div class="entry-ref">推荐人：' + esc(rf.ref) + dot("entry-referral") + '</div>' : "") +
      '</div></div>';

    function step(text, ms, next) {
      document.getElementById("entry-step").textContent = text;
      setTimeout(next, ms);
    }

    // 2. 登录校验：H5 与 APP 内嵌都要求登录后测试
    if (!E.isLoggedIn()) {
      step("需要登录后继续", 700, function () {
        location.replace("login.html?redirect=" + encodeURIComponent(selfUrl));
      });
      E.mountNotes("entry");
      return;
    }

    // 3/4. 免费直进，收费去商品详情
    var isFree = Number(g.price) === 0;
    if (isFree) {
      var res = E.ensureFreeOrder(g, rf ? rf.ref : "");
      step(res && res.created ? "已为你开通免费测评，正在进入…" : "已检测到有效订单，正在进入…", 750, function () {
        var next = g.agedTag ? "pre-exam.html" : "quiz.html";
        go("notice.html?goodsId=" + encodeURIComponent(g.goodsId) +
          "&templeteId=" + encodeURIComponent(g.templeteId) +
          "&from=scan" + (rf && rf.ref ? "&ref=" + encodeURIComponent(rf.ref) : ""));
      });
    } else {
      step("正在打开商品详情…", 650, function () {
        go("detail.html?goodsId=" + encodeURIComponent(g.goodsId) + (rf && rf.ref ? "&ref=" + encodeURIComponent(rf.ref) : ""));
      });
    }
    E.mountNotes("entry");
  }

  /* ---------------- 详情 ---------------- */
  function renderDetail() {
    var id = qs("goodsId") || qs("id") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    var ref = qs("ref") || "";
    if (ref) E.saveReferral({ ref: ref, goodsId: g.goodsId, from: "detail" });
    var collected = E.isFavorite(g.goodsId);
    root.innerHTML = '<div class="detail-page"><div class="src-header"><div class="src-back" data-back></div><div class="src-header-title">测评详情</div><div class="src-header-other" id="detail-share"><div class="src-share-icon"></div>' + dot("detail-poster") + '</div></div>' +
      '<div class="detail-scroll"><div class="detail-img" style="background-image:url(' + esc(g.coverImage) + ')"></div>' +
      '<div class="detail-info"><div class="detail-price">' + money(g.price) + '</div>' +
      '<div class="detail-title-row"><div class="detail-title">' + esc(g.title) + dot("detail") + '</div><div class="detail-count">' + g.testerCount + '人已测</div></div>' +
      '<div class="detail-sub">' + esc(g.subTitle) + '</div></div>' +
      '<div class="detail-block"><div class="detail-block-title">详情</div><div class="detail-html">' + esc(g.intro) + '</div>' +
      '<div class="detail-block-title" style="margin-top:16px">适合谁</div><div class="detail-html">' + esc(g.forWho) + '</div></div></div>' +
      '<div class="detail-footer"><div class="detail-collect' + (collected ? " is-on" : "") + '" id="collect"><div class="detail-collect-icon"></div><span>' + (collected ? "已收藏" : "收藏") + '</span></div>' +
      '<div class="detail-start" id="start">立即测试</div></div></div>';
    document.getElementById("collect").addEventListener("click", function () {
      var on = E.toggleFavorite(g.goodsId);
      this.classList.toggle("is-on", on);
      this.querySelector("span").textContent = on ? "已收藏" : "收藏";
      E.toast(on ? "已收藏" : "已取消收藏");
    });
    document.getElementById("start").addEventListener("click", function () {
      var enterUrl = "notice.html?goodsId=" + encodeURIComponent(g.goodsId) +
        "&templeteId=" + encodeURIComponent(g.templeteId) +
        (ref ? "&ref=" + encodeURIComponent(ref) : "");
      // 免费测评：直接开通订单并进入，不再走支付
      if (Number(g.price) === 0) {
        var free = E.ensureFreeOrder(g, ref);
        if (free) E.toast(free.created ? "已为你开通免费测评" : "已为你打开测评");
        setTimeout(function () { go(enterUrl); }, 400);
        return;
      }
      var done = E.records().filter(function (r) { return r.goodsId === g.goodsId; })[0];
      if (done) {
        E.modal({
          title: "该测评已购买过", text: "是否再次购买？重复支付不予退款。", okText: "去支付", cancelText: "查看报告",
          onOk: function () { go("order-confirm.html?goodsId=" + encodeURIComponent(g.goodsId)); },
          onCancel: function () { go("result.html?record=" + encodeURIComponent(done.id)); }
        });
        return;
      }
      go(enterUrl);
    });
    document.getElementById("detail-share").addEventListener("click", function () { openPoster("detail", g); });
    E.mountNotes("detail");
  }

  /* ---------------- 须知 ---------------- */
  function renderNotice() {
    var id = qs("goodsId") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    root.innerHTML = '<div class="notice-page"><div class="src-header"><div class="src-back" data-back></div><div class="src-header-title">测试须知' + dot("notice") + '</div><div class="src-header-other"></div></div>' +
      '<div class="notice-body"><div class="notice-content"><div class="notice-card">' + esc(g.answerSummary) + '</div></div>' +
      '<div class="notice-footer"><div class="notice-btn" id="notice-start">我已阅读，开始答题</div></div></div></div>';
    document.getElementById("notice-start").addEventListener("click", function () {
      var next = g.agedTag ? "pre-exam" : "quiz";
      go(next + ".html?goodsId=" + encodeURIComponent(g.goodsId) + "&templeteId=" + encodeURIComponent(g.templeteId));
    });
    E.mountNotes("notice");
  }

  /* ---------------- 年龄 ---------------- */
  function renderPreExam() {
    var id = qs("goodsId") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    root.innerHTML = '<div class="pre-page"><div class="src-header" style="position:fixed;background:transparent"><div class="src-back" data-back></div><div class="src-header-title">测评页' + dot("preExam") + '</div><div class="src-header-other"></div></div>' +
      '<div class="pre-back"></div><div class="pre-content"><div class="pre-card"><div class="pre-question"><div class="pre-title">为了测试结果的准确性，请输入您的年龄: </div>' +
      '<input class="pre-age" id="age" type="number" inputmode="numeric" placeholder="点击输入例如 14" /></div><div class="pre-footer-bar"></div></div></div>' +
      '<div class="pre-footer"><div class="pre-btn" id="age-next">开始答题</div></div></div>';
    document.getElementById("age-next").addEventListener("click", function () {
      var age = Number(document.getElementById("age").value);
      if (!age || age <= 0) return E.toast("请输入您的正确年龄");
      E.write("exam_age", age);
      go("quiz.html?goodsId=" + encodeURIComponent(g.goodsId) + "&templeteId=" + encodeURIComponent(g.templeteId));
    });
    E.mountNotes("preExam");
  }

  /* ---------------- 答题 ---------------- */
  function renderQuiz() {
    var id = qs("goodsId") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    var questions = g.questions;
    var answers = questions.map(function (q) { return { questionId: q.id, optionId: 0 }; });
    var index = 0;
    var start = Date.now();
    var timer = null;
    root.innerHTML = '<div class="pre-page"><div class="src-header" style="position:fixed;background:transparent"><div class="src-back" id="quiz-back"></div><div class="src-header-title">测评页</div><div class="src-header-other"></div></div>' +
      '<div class="pre-back"></div><div class="pre-content"><div class="pre-card"><div class="quiz-content" id="quiz-body"></div><div class="pre-footer-bar"><span id="quiz-time">00 : 00 : 00</span></div></div></div>' +
      '<div class="quiz-footer" id="quiz-footer"></div></div>';
    function format(seconds) {
      var h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      var m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      var s = String(seconds % 60).padStart(2, "0");
      return h + " : " + m + " : " + s;
    }
    function tick() {
      var sec = Math.floor((Date.now() - start) / 1000);
      document.getElementById("quiz-time").textContent = format(sec);
      timer = setTimeout(tick, 500);
    }
    tick();
    function paint() {
      var q = questions[index];
      document.getElementById("quiz-body").innerHTML = '<div class="quiz-num"><div><b>' + (index + 1) + '</b> / ' + questions.length + dot("quiz-question") + '</div></div>' +
        '<div class="quiz-question">' + q.title + '</div>' +
        q.options.map(function (o, i) {
          return '<div class="quiz-option' + (answers[index].optionId === o.id ? " is-on" : "") + '" data-opt="' + esc(o.id) + '">' + esc(o.content) + '</div>';
        }).join("");
      document.querySelectorAll("[data-opt]").forEach(function (el) {
        el.addEventListener("click", function () { select(el.getAttribute("data-opt")); });
      });
      var footer = document.getElementById("quiz-footer");
      var isLast = index === questions.length - 1;
      var prevHtml = index > 0 ? '<button type="button" class="quiz-btn" id="prev">上一题</button>' : "";
      var submitHtml = isLast ? '<button type="button" class="quiz-btn" id="submit">提交</button>' : "";
      var controls = isLast && prevHtml ? '<div class="quiz-btn-row">' + prevHtml + submitHtml + "</div>" : (prevHtml || submitHtml);
      footer.innerHTML = (isLast ? dot("quiz-submit") : "") +
        '<div class="quiz-footer-inner"><div class="quiz-hint" id="quiz-hint"></div>' + controls + "</div>";
      if (E.refreshNotes) E.refreshNotes("quiz");
    }
    var advancing = null;
    var submitting = false;
    function select(optId) {
      if (!optId) return;
      answers[index].optionId = optId;
      if (advancing) { clearTimeout(advancing); advancing = null; }
      paint();
      if (index < questions.length - 1) {
        advancing = setTimeout(function () {
          advancing = null;
          index++;
          paint();
        }, 450);
      }
    }
    function submitQuiz() {
      if (submitting) return;
      if (!answers[index].optionId) {
        var hint = document.getElementById("quiz-hint");
        if (hint) hint.textContent = "请选择答案";
        E.toast("请选择答案");
        return;
      }
      submitting = true;
      var btn = document.getElementById("submit");
      if (btn) btn.textContent = "提交中...";
      doSubmit();
    }
    function doSubmit() {
      try {
        var ans = {};
        questions.forEach(function (q, i) {
          var optId = answers[i].optionId;
          var oi = q.options.map(function (o) { return String(o.id); }).indexOf(String(optId));
          if (oi >= 0) ans[q.id] = oi;
        });
        var r = E.calcResult(g, ans);
        if (!r || !r.range) throw new Error("结果区间缺失");
        var record = makeRecord(g, r, ans);
        E.addRecord(record);
        sessionStorage.setItem("exam_last_record", record.id);
        go("result.html?record=" + encodeURIComponent(record.id) + "&templeteId=" + encodeURIComponent(g.templeteId));
      } catch (err) {
        submitting = false;
        var btn = document.getElementById("submit");
        if (btn) btn.textContent = "提交";
        E.toast("提交失败，请重试");
      }
    }
    document.getElementById("quiz-footer").addEventListener("click", function (e) {
      if (e.target.closest(".h5-dot")) return;
      if (e.target.closest("#prev")) {
        if (advancing) { clearTimeout(advancing); advancing = null; }
        if (index > 0) { index--; paint(); }
      }
      if (e.target.closest("#submit")) submitQuiz();
    });
    document.getElementById("quiz-back").addEventListener("click", function () {
      E.modal({ title: "退出测评", text: "确定要退出测评答题？退出后作答历史将不会保存。", okText: "确定退出", onOk: function () { go("detail.html?goodsId=" + encodeURIComponent(g.goodsId)); } });
    });
    paint();
    E.mountNotes("quiz");
  }

  /* ---------------- 结果 ---------------- */
  var DIM_TEXT = {
    "AQ 逆商": "面对变化时容易先僵住，需要更多“下一步做什么”的小练习。",
    "EQ 情商": "能感受到情绪，但表达还不够具体。把“烦”换成更准确的情绪词，会更容易被理解。",
    "CQ 创造力": "你有想法，但有时会等“想清楚了”再行动。先做一个小样，会带来更多线索。",
    "IQ 学习力": "你愿意学，但复盘节奏还不稳定。把“学过”变成“讲出来”，掌握会更牢。",
    "RQ 关系力": "你重视关系，也愿意表达，但在冲突中容易急着证明自己。先听完，再回应。",
    "SQ 灵性力": "你开始思考长期方向，但还需要更具体的画面。把“想要”写成可描述的场景。",
    "陪伴": "陪伴不在时长，而在那一刻是否真的在一起。",
    "沟通": "你愿意说，但有时说得比听得多。先把对方的话复述一遍，再表达自己。",
    "边界": "边界不是控制，而是让彼此都知道什么可以、什么不可以。",
    "信任": "信任来自一次次被看见、被回应的经验。",
    "觉察": "你开始看见情绪，但还需要更快地认出它。",
    "表达": "你愿意表达，但还可以更具体。",
    "调节": "你知道一些调节方式，但压力大时容易忘记。",
    "共情": "你能理解别人，但有时会把自己放得太低。",
    "复原": "从情绪里回来需要时间，也需要一个固定的出口。",
    "目标": "你知道要学，但目标还不够具体。",
    "专注": "你容易被消息打断，进入状态需要更长的准备。",
    "方法": "你愿意努力，但方法还可以更省力。",
    "坚持": "你能开始，但遇到难点容易停。"
  };

  function barDistSvg(values, labels, userLabel) {
    var w = 330, h = 200, padL = 28, padB = 28, padT = 12;
    var max = Math.max.apply(null, values.concat([1]));
    var barW = 16, gap = (w - padL - 10) / labels.length;
    var bars = values.map(function (v, i) {
      var bh = (h - padB - padT) * v / max;
      var x = padL + gap * i + (gap - barW) / 2;
      return '<rect x="' + x + '" y="' + (h - padB - bh) + '" width="' + barW + '" height="' + bh + '" rx="8" fill="' + (i % 2 ? "#FFDABA" : "#FFC795") + '" />';
    }).join("");
    var line = values.map(function (v, i) {
      var x = padL + gap * i + gap / 2;
      var y = h - padB - (h - padB - padT) * v / max;
      return (i ? "L" : "M") + x + " " + y;
    }).join(" ");
    var xLabels = labels.map(function (l, i) {
      return '<text x="' + (padL + gap * i + gap / 2) + '" y="' + (h - 8) + '" text-anchor="middle" font-size="11" fill="#847C7E">' + esc(l) + "</text>";
    }).join("");
    var userX = padL + gap * Math.max(0, labels.indexOf(userLabel)) + gap / 2;
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:100%">' +
      '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + w + '" y2="' + (h - padB) + '" stroke="#FFB37A" stroke-width="1.5" />' +
      '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="#FFB37A" stroke-width="1.5" />' + bars +
      '<path d="' + line + '" fill="none" stroke="#FF8E79" stroke-width="2" />' + xLabels +
      '<line x1="' + userX + '" y1="' + padT + '" x2="' + userX + '" y2="' + (h - padB) + '" stroke="#FF8E79" stroke-width="1.5" stroke-dasharray="4 3" />' +
      '<text x="' + userX + '" y="' + (padT + 10) + '" text-anchor="middle" font-size="10" fill="#FF8E79">您的位置</text></svg>';
  }

  function harmonyDims(source) {
    var dims = (source && source.dims) || [];
    return dims.map(function (d) {
      return {
        key: d.key,
        name: d.name,
        full: d.full || d.name,
        color: "#FF8E79",
        value: typeof d.value === "number" ? d.value : -1
      };
    });
  }

  /* ---------------- 结果页 · 新版（v2.1.0） ---------------- */
  /* 结论去重：档位 base 与「超越 X% 的家长」由两处渲染，
     历史数据里 base 可能自带「亲爱的，你的测评结果显示：你已经超过了 X% 的家长。」，
     这里统一剥掉重复前缀，避免同一段话说两次。 */
  function stripPctPrefix(text) {
    return String(text || "")
      .replace(/^你?已经?(超越|超过)了?\s*\d+(\.\d+)?%\s*的家长[。，,、\s]*/g, "")
      .replace(/^亲爱的[，,]\s*你的测评结果显示[：:]\s*/g, "")
      .trim();
  }

  /* 雷达：151×144 五边形，同心环 + 五个维度标注（按设计稿布局）
     环：外圈 #FFF0F1，内圈 #FFDCE0，描边 #EDCCDE，轴线 #D8D8D8
     数据多边形：rgba(255,173,187,.45) + #FF577D 描边，节点 8px #FF577D */
  function radarBlock(dims, values, maxScore) {
    var W = 151, H = 144, cx = 75.5, cy = 72, r = 62;
    var n = dims.length || 5;
    function pt(i, pct) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * r * pct / 100, cy + Math.sin(a) * r * pct / 100];
    }
    function poly(level) {
      return dims.map(function (_, i) { return pt(i, level).join(","); }).join(" ");
    }
    var rings = "";
    rings += '<polygon points="' + poly(100) + '" fill="#FFF0F1" stroke="#EDCCDE" stroke-width="1" />';
    [75, 50, 25].forEach(function (lv) {
      rings += '<polygon points="' + poly(lv) + '" fill="#FFDCE0" stroke="#EDCCDE" stroke-width="1" />';
    });
    var axes = dims.map(function (_, i) {
      var p = pt(i, 100);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#D8D8D8" stroke-width="1" />';
    }).join("");
    var dataPts = values.map(function (v, i) { return pt(i, Math.max(8, v / maxScore * 100)).join(","); }).join(" ");
    var data = '<polygon points="' + dataPts + '" fill="rgba(255,173,187,.45)" stroke="#FF577D" stroke-width="2" stroke-linejoin="round" />';
    var dots = values.map(function (v, i) {
      var p = pt(i, Math.max(8, v / maxScore * 100));
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="#FF577D" />';
    }).join("");
    var svg = '<svg class="rb-radar" viewBox="0 0 ' + W + ' ' + H + '" aria-label="五维雷达图">' + rings + axes + data + dots + "</svg>";

    var pos = ["top", "rt", "rb", "lb", "lt"];
    var labels = dims.map(function (d, i) {
      return '<div class="rb-radar-label rb-radar-label--' + pos[i] + '">' +
        "<b>" + esc(d.name) + "</b><i>（" + Math.round(values[i]) + "分）</i></div>";
    }).join("");
    return '<div class="rb-radar-wrap">' + svg + labels + "</div>";
  }

  function powerRadarSvg(dims, values, maxScore, size, theme) {
    var gold = theme === "gold";
    var lineColor = gold ? "rgba(201,162,39,.42)" : "#F7D3D6";
    var fillColor = gold ? "rgba(201,162,39,.30)" : "rgba(244,112,122,.42)";
    var strokeColor = gold ? "#D8B65A" : "#EF6B78";
    var labelColor = gold ? "#EADFB6" : "#4B4548";
    var scoreColor = gold ? "rgba(234,223,182,.75)" : "#8A8285";
    var n = dims.length;
    var cx = size / 2, cy = size / 2, r = size * 0.28;
    function pt(i, pct) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * r * pct / 100, cy + Math.sin(a) * r * pct / 100];
    }
    var grid = "";
    [25, 50, 75, 100].forEach(function (level) {
      var pts = dims.map(function (_, i) { return pt(i, level).join(","); }).join(" ");
      grid += '<polygon points="' + pts + '" fill="none" stroke="' + lineColor + '" stroke-width="1" />';
    });
    var axes = dims.map(function (_, i) {
      var p = pt(i, 100);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="' + lineColor + '" stroke-width="1" />';
    }).join("");
    var dataPts = values.map(function (v, i) { return pt(i, Math.max(6, v / maxScore * 100)).join(","); }).join(" ");
    var data = '<polygon points="' + dataPts + '" fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="2" stroke-linejoin="round" />';
    var dots = values.map(function (v, i) {
      var p = pt(i, Math.max(6, v / maxScore * 100));
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#fff" stroke="' + strokeColor + '" stroke-width="2" />';
    }).join("");
    var labels = dims.map(function (d, i) {
      var p = pt(i, 132);
      var anchor = Math.abs(p[0] - cx) < 14 ? "middle" : p[0] > cx ? "start" : "end";
      return '<text x="' + p[0] + '" y="' + (p[1] - 2) + '" text-anchor="' + anchor + '" font-size="12" fill="' + labelColor + '" font-family="-apple-system,BlinkMacSystemFont,PingFang SC,sans-serif">' + esc(d.name) +
        '<tspan x="' + p[0] + '" dy="15" font-size="11" fill="' + scoreColor + '">(' + Math.round(values[i]) + '分)</tspan></text>';
    }).join("");
    return '<svg class="rb-radar" viewBox="0 0 ' + size + ' ' + size + '" aria-label="五维雷达图">' + grid + axes + data + dots + labels + "</svg>";
  }

  function renderResultV2(record, g, range, existingFeedback, starNum) {
    // 新版式结构固定：忽略 showDistributionImage / showHarmonyImage，两个旧开关在新版式下不参与渲染
    var dims = record.dims || [];
    var values = dims.map(function (d) { return d.value; });
    var maxPer = Math.round(record.total / Math.max(1, dims.length)) || 12;
    // 每维实际得分：value 是百分比，按每维上限还原
    var rawScores = dims.map(function (d) { return Math.round(d.value / 100 * maxPer); });

    // 档位描述：剥掉与「超越百分比」重复的前缀，只留解读本身
    var conclusionBase = stripPctPrefix(range.base);

    // 核心卡点：并列最低分按维度顺序取首个，结果可复现
    var painKey = null, painMin = Infinity;
    rawScores.forEach(function (v, i) {
      if (v < painMin) { painMin = v; painKey = dims[i].key; }
    });
    var painDim = dims.filter(function (d) { return d.key === painKey; })[0] || dims[0] || { name: "" };
    var painCopy = (g.dimCopy && g.dimCopy[painKey]) || null;
    var pain = painCopy
      ? { tip: painCopy.painTip, text: painCopy.painText }
      : ((g.painCopy && g.painCopy[painKey]) || null);
    // 风险文案：维度配置优先，其次模板级 riskTip，最后回退卡点里的 risk
    var riskText = (painCopy && painCopy.riskText) || g.riskTip || "";
    if (!riskText && g.painCopy && g.painCopy[painKey]) riskText = g.painCopy[painKey].risk || "";

    /* 这些力，值得欣赏（v2.2.1）
       只展示 1 条：取排除核心卡点维度后分数最高的那个维度；
       分数相同时取索引更小（维度配置顺序靠前）的那个，保证结果唯一且可复现。
       阈值 8 分（满分 12 的 2/3）只用于判断「要不要换相对优势版措辞」，不影响取哪一条。 */
    var appreciateMin = Math.round(maxPer * 2 / 3);
    var best = null;
    dims.forEach(function (d, i) {
      if (d.key === painKey) return;
      var cur = { key: d.key, name: d.name, score: rawScores[i] };
      if (!best || cur.score > best.score) best = cur;
    });
    var useFallback = !!best && best.score < appreciateMin;
    var appreciate = null;
    if (best) {
      var bestCopy = (g.dimCopy && g.dimCopy[best.key]) || null;
      if (bestCopy) {
        appreciate = {
          key: best.key,
          name: best.name,
          score: best.score,
          text: useFallback ? (bestCopy.appreciateAlt || bestCopy.appreciate || "") : (bestCopy.appreciate || "")
        };
        if (!appreciate.text) appreciate = null;
      }
    }

    var recommend = [
      { name: "助力孩子学习内在动力", price: 2580, image: "../assets/covers/v3/parent-wide.svg", count: 204 },
      { name: "摆脱情绪内耗 做智慧父母", price: 2580, image: "../assets/covers/v3/eq-wide.svg", count: 204 },
      { name: "6Q 心画解读手册", price: 2580, image: "../assets/covers/v3/6q-wide.svg", count: 204 }
    ];

    root.innerHTML = '<div class="result-page rb-page">' +
      '<div class="rb-header"><div class="src-back" data-back></div><div class="rb-header-title">测评报告' + dot("rb-design") + '</div>' +
      '<div class="rb-header-right"><span class="rb-header-share" id="rb-share"></span>' + dot("rb-poster") + dot("rb-poster-data") + '</div></div>' +
      '<div class="rb-hero"><div class="rb-hero-date">测评日期：' + esc(record.createTime || E.now()) + dot("rb-head") + '</div></div>' +

      '<div class="rb-card rb-result">' +
      '<div class="rb-result-head"><span class="rb-card-title rb-card-title--plain">测评结果' + dot("rb-band") + '</span>' +
      (g.showTotalScore ? '<span class="rb-total">总分：' + record.score + '分</span>' : "") + '</div>' +
      radarBlock(dims, rawScores, maxPer) +
      '<div class="rb-conclusion">亲爱的，你的测评结果显示：</div>' +
      '<div class="rb-conclusion-line">你已经' + esc(stripPctPrefix(range.percentile || "超越 45% 的家长")) + '。</div>' +
      (conclusionBase ? '<div class="rb-conclusion-line">' + esc(conclusionBase) + '</div>' : "") +
      '</div>' +

      (pain ? '<div class="rb-pain"><div class="rb-pain-title">您的核心卡点' + dot("rb-pain") + '</div>' +
        '<div class="rb-pain-line">' + esc(pain.tip) + '</div>' +
        '<div class="rb-pain-line">' + esc(pain.text) + '</div></div>' : "") +

      (riskText ? '<div class="rb-card rb-risk"><div class="rb-chip">您的孩子正在经历什么？' + dot("rb-risk") + '</div>' +
        '<div class="rb-risk-text">' + esc(riskText) + '</div></div>' : "") +

      (appreciate ? '<div class="rb-card rb-appreciate"><div class="rb-card-title">这些力，值得欣赏' + dot("rb-appreciate") + '</div>' +
        '<div class="rb-appreciate-sub">' + (useFallback ? "这一次先看看你已经走在前面的一点。" : "除了要练的那一块，你身上也有已经长出来的力量。") + '</div>' +
        '<div class="rb-app-item">' +
        '<div class="rb-app-head">【' + esc(appreciate.name) + '】（' + appreciate.score + '分）</div>' +
        '<div class="rb-app-text">' + esc(appreciate.text) + '</div>' +
        "</div></div>" : "") +

      (g.ctaText ? '<div class="rb-card rb-deep"><div class="rb-card-title">如果您想深度了解' + dot("rb-cta") + '</div>' +
        '<div class="rb-deep-text">' + esc(g.ctaText) + '</div>' +
        '<div class="rb-deep-sub">' + esc(g.ctaSubText || "如有疑问，请咨询您的书童老师或导师老师~") + '</div>' +
        '<div class="rb-goods">' + recommend.map(function (x) {
          return '<div class="rb-goods-row">' +
            '<div class="rb-goods-img" style="background-image:url(' + esc(x.image) + ')"></div>' +
            '<div class="rb-goods-info"><div class="rb-goods-name">' + esc(x.name) + '</div>' +
            '<div class="rb-goods-meta"><span class="rb-goods-price">￥' + x.price + '</span>' +
            '<span class="rb-goods-count">' + x.count + '人已学习</span></div></div></div>';
        }).join("") + '</div></div>' : "") +

      '<div class="rb-card rb-feedback"><div class="rb-card-title">请为这份量表准确度评分：</div>' +
      '<div class="rb-stars" id="rb-stars">' + [1, 2, 3, 4, 5].map(function (i) {
        return '<button type="button" data-rbstar="' + i + '">★</button>';
      }).join("") + '<span class="rb-star-score" id="rb-star-score">0分</span></div>' +
      '<div class="rb-card-title">反馈内容</div>' +
      '<div class="rb-feedback-wrap"><textarea class="rb-feedback-text" id="rb-feedback-text" maxlength="500" placeholder="输入您对于该量表的反馈内容"></textarea>' +
      '<div class="rb-feedback-count" id="rb-feedback-count">0/500</div></div>' +
      '<div class="rb-feedback-btn" id="rb-feedback-btn">提交反馈</div></div></div>' +

      /* 底部：橙色 CTA + 双药丸 */
      '<div class="rb-bottom">' +
      '<button type="button" class="rb-cta" id="rb-cta"><span class="rb-cta-text">预约导师1v1解读</span></button>' +
      '<div class="rb-bottom-row">' +
      '<button type="button" class="rb-btn rb-btn--history" id="rb-history">查看历史测试记录</button>' +
      '<button type="button" class="rb-btn rb-btn--again" id="rb-again">再答一次</button>' +
      '</div></div>' +

      /* 导师二维码抽屉 */
      '<div class="rb-qr-mask" id="rb-qr-mask"><div class="rb-qr">' +
      '<div class="rb-qr-title">' + esc(g.ctaSubText || "添加导师微信，帮您把分数变成方向") + '</div>' +
      '<div class="rb-qr-img"><img src="' + esc(g.ctaQrCode || "../assets/covers/v3/qr.svg") + '" alt="导师二维码" /></div>' +
      '<div class="rb-qr-note">长按识别二维码，获取1对1解读与《家庭育儿改善清单》</div>' +
      '<button type="button" class="rb-qr-close" id="rb-qr-close">关闭</button>' +
      '</div></div>';

    // 反馈
    var starEl = document.getElementById("rb-stars");
    var btn = document.getElementById("rb-feedback-btn");
    var txt = document.getElementById("rb-feedback-text");
    function paintStars(n) {
      starEl.querySelectorAll("[data-rbstar]").forEach(function (b, i) {
        b.classList.toggle("is-on", i < n);
      });
      document.getElementById("rb-star-score").textContent = n + "分";
      btn.classList.toggle("is-on", n > 0);
    }
    paintStars(starNum);
    var countEl = document.getElementById("rb-feedback-count");
    function paintCount() {
      if (countEl) countEl.textContent = txt.value.length + "/500";
    }
    paintCount();
    txt.addEventListener("input", paintCount);
    starEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rbstar]");
      if (!b || existingFeedback) return;
      starNum = Number(b.getAttribute("data-rbstar"));
      paintStars(starNum);
    });
    btn.addEventListener("click", function () {
      if (existingFeedback) return E.toast("已提交过反馈");
      if (!starNum) return E.toast("请先评分");
      E.addFeedback({
        id: E.uid("fb"), recordId: record.id, goodsId: g.goodsId, score: starNum, tags: [],
        content: txt.value.trim(), createTime: E.now()
      });
      E.toast("提交成功");
      btn.textContent = "已提交反馈";
      btn.classList.remove("is-on");
      txt.disabled = true;
      existingFeedback = true;
    });
    if (existingFeedback) {
      txt.value = existingFeedback.content || "";
      txt.disabled = true;
      btn.textContent = "已提交反馈";
      btn.classList.remove("is-on");
    }

    // 底部三层
    document.getElementById("rb-history").addEventListener("click", function () { go("history.html"); });
    document.getElementById("rb-again").addEventListener("click", function () {
      go("notice.html?goodsId=" + encodeURIComponent(g.goodsId) + "&templeteId=" + encodeURIComponent(g.templeteId));
    });
    var qrMask = document.getElementById("rb-qr-mask");
    document.getElementById("rb-cta").addEventListener("click", function () { qrMask.classList.add("is-open"); });
    document.getElementById("rb-qr-close").addEventListener("click", function () { qrMask.classList.remove("is-open"); });
    qrMask.addEventListener("click", function (e) { if (e.target === qrMask) qrMask.classList.remove("is-open"); });
    document.getElementById("rb-share").addEventListener("click", function () { openPoster("result", g, record); });

    E.mountNotes("result");
  }

  function renderResult() {
    var record = getRecord();
    var g = G(D.byId(record.goodsId)) || goodsList()[0];
    var range = g.results.filter(function (r) { return r.name === record.rangeName; })[0] || g.results[g.results.length - 1];
    var starNum0 = 0;
    var existingFeedback0 = E.read(E.K.feedback, []).filter(function (f) { return f.recordId === record.id; })[0] || null;
    if (existingFeedback0) starNum0 = existingFeedback0.score;
    if (g.resultLayout === 2) return renderResultV2(record, g, range, existingFeedback0, starNum0);
    var chartSelect = g.showDimensionalityImage ? 1 : 2;
    var starNum = 0;
    var existingFeedback = E.read(E.K.feedback, []).filter(function (f) { return f.recordId === record.id; })[0] || null;
    if (existingFeedback) starNum = existingFeedback.score;
    var recommend = [
      { name: "高EQ父母·亲子沟通课", image: "../assets/covers/v3/parent.svg", price: 199, type: 1 },
      { name: "青少年6Q领袖营", image: "../assets/covers/v3/6q.svg", price: 5800, type: 1 },
      { name: "6Q心画解读手册", image: "../assets/covers/v3/eq.svg", price: 99, type: 4 },
      { name: "6Q亲子对话卡", image: "../assets/covers/v3/parent.svg", price: 129, type: 4 }
    ];
    var classSelect = 1;
    var harmony = harmonyDims(record);
    var distLabels = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"];
    var distValues = [3, 8, 16, 24, 18, 9, 4];
    var userLabel = distLabels[Math.min(6, Math.floor(record.score / record.total * 6))];
    root.innerHTML = '<div class="result-page"><div class="result-back"></div>' +
      '<div class="src-header" style="background:transparent"><div class="src-back" data-back></div><div class="src-header-title">测评结果</div><div class="src-header-other" id="result-share"><div class="src-share-icon"></div></div></div>' +
      '<div class="result-block"><div class="result-user"><div class="result-avatar"><img src="../assets/source/image/defaultAvatar.png" /></div>' +
      '<div class="result-name">' + esc(E.user().name) + '，' + (g.showTotalScore ? '你的测试总分为<b>' + record.score + '</b>分数' : '你好！') + dot("result-score") + '</div></div>' +
      '<div class="result-card" id="chart-card"><div class="result-chart-tabs">' +
      (g.showDimensionalityImage ? '<div class="result-chart-tab is-on" data-chart="1">维度雷达图</div>' : '') +
      (g.showDistributionImage ? '<div class="result-chart-tab right' + (chartSelect === 2 ? " is-on" : "") + '" data-chart="2">正态分布图</div>' : '') + '</div>' + dot("result-chart") +
      '<div class="result-chart-body" id="chart-body"></div></div>' +
      '<div class="result-card"><div class="result-card-title">' + esc(g.resultTitle) + '</div><div class="result-card-text">' + esc(g.resultDemo) + '</div></div>' +
      '<div class="result-card"><div class="result-card-title">整体解读' + dot("result-detail") + '</div><div class="result-card-text">' + esc(range.base) + '</div></div>' +
      '<div class="result-card"><div class="result-card-title">各类详解</div>' + record.dims.map(function (d) {
        return '<div class="result-card-title" style="font-size:14px;margin-top:8px">' + esc(d.full) + '</div><div class="result-card-text">' + esc(DIM_TEXT[d.full] || DIM_TEXT[d.name] || "这个维度还在发展中，先从小事开始观察。") + '</div>';
      }).join("") +
      '<div class="result-suggest">' + esc(range.suggest) + '</div></div>' +
      '<div class="result-history" id="go-history"><span>历史测评记录</span><i></i></div>' +
      (g.showHarmonyImage ? '<div class="result-harmony"><div class="result-harmony-title">6Q和谐指数</div><div class="result-harmony-chart">' + E.radarSvg(harmony, harmony.map(function (d) { return d.value; }), { size: 300 }) + '</div></div>' : '') +
      '<div class="result-class"><div class="result-class-tabs"><div class="result-class-underline" id="class-bar"></div>' +
      '<div class="result-class-tab is-on" data-class="1">精选课程</div><div class="result-class-tab" data-class="2">6Q商城</div></div><div id="class-list"></div></div>' +
      '<div class="result-feedback"><div class="result-feedback-title">请为这份量表准确度评分:' + dot("result-feedback") + '</div><div class="result-stars" id="stars">' +
      [1,2,3,4,5].map(function (i) { return '<button type="button" data-star="' + i + '">★</button>'; }).join("") + '<div class="result-star-score" id="star-score">0分</div></div>' +
      '<div class="result-feedback-title">反馈内容</div><textarea id="feedback-text" maxlength="500" placeholder="输入您对于该量表的反馈内容"></textarea>' +
      '<div class="result-feedback-btn" id="feedback-btn" style="background:#dde3e9">提交反馈</div></div>' +
      '<div class="result-end">到底咯~</div></div><div class="result-home-btn" id="go-home"></div></div>';

    function paintChart() {
      var body = document.getElementById("chart-body");
      if (chartSelect === 1) {
        body.innerHTML = g.showDimensionalityImage ? E.radarSvg(record.dims, record.dims.map(function (d) { return d.value; }), { size: 270 }) : "";
      } else {
        body.innerHTML = barDistSvg(distValues, distLabels, userLabel);
      }
      document.querySelectorAll("[data-chart]").forEach(function (b) {
        b.classList.toggle("is-on", Number(b.getAttribute("data-chart")) === chartSelect);
      });
    }
    paintChart();
    document.querySelectorAll("[data-chart]").forEach(function (b) {
      b.addEventListener("click", function () { chartSelect = Number(b.getAttribute("data-chart")); paintChart(); });
    });
    document.getElementById("go-history").addEventListener("click", function () { go("history.html"); });
    document.getElementById("result-share").addEventListener("click", function () { openPoster("result", g, record); });
    document.getElementById("go-home").addEventListener("click", function () { go("index.html"); });
    function paintClass() {
      document.getElementById("class-list").innerHTML = recommend.filter(function (x) { return (classSelect === 1 && x.type !== 4) || (classSelect === 2 && x.type === 4); }).map(function (x) {
        return '<div class="result-goods"><div class="result-goods-img" style="background-image:url(' + esc(x.image) + ')"></div><div class="result-goods-info"><div class="result-goods-title">' + esc(x.name) + '</div><div class="result-goods-price">￥' + x.price + '</div></div></div>';
      }).join("");
      document.querySelectorAll("[data-class]").forEach(function (b) { b.classList.toggle("is-on", Number(b.getAttribute("data-class")) === classSelect); });
      document.getElementById("class-bar").style.left = (36 + (classSelect - 1) * 120) + "px";
    }
    document.querySelectorAll("[data-class]").forEach(function (b) {
      b.addEventListener("click", function () { classSelect = Number(b.getAttribute("data-class")); paintClass(); });
    });
    paintClass();
    document.getElementById("stars").addEventListener("click", function (e) {
      var b = e.target.closest("[data-star]");
      if (!b) return;
      starNum = Number(b.getAttribute("data-star"));
      document.querySelectorAll("#stars [data-star]").forEach(function (x, i) { x.classList.toggle("is-on", i < starNum); });
      document.getElementById("star-score").textContent = starNum + "分";
      document.getElementById("feedback-btn").style.background = starNum > 0 ? "#FF9E4D" : "#dde3e9";
    });
    document.getElementById("feedback-btn").addEventListener("click", function () {
      if (existingFeedback) return E.toast("已提交过反馈");
      if (!starNum) return E.toast("请先评分");
      E.addFeedback({ id: E.uid("fb"), recordId: record.id, goodsId: g.goodsId, score: starNum, tags: [], content: document.getElementById("feedback-text").value.trim(), createTime: nowStr() });
      E.toast("提交成功");
      this.textContent = "已提交反馈";
      this.style.background = "#dde3e9";
    });
    if (existingFeedback) {
      document.querySelectorAll("#stars [data-star]").forEach(function (x, i) { x.classList.toggle("is-on", i < starNum); });
      document.getElementById("star-score").textContent = starNum + "分";
      var ta = document.getElementById("feedback-text");
      ta.value = existingFeedback.content || "";
      ta.disabled = true;
      var fb = document.getElementById("feedback-btn");
      fb.textContent = "已提交反馈";
      fb.style.background = "#dde3e9";
    }
    E.mountNotes("result");
  }

  /* ---------------- 我的测评 ---------------- */
  function renderHistory() {
    var showFinished = false;
    var recs = E.records();
    var progress = [];
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf("exam_progress_") === 0) {
          var p = JSON.parse(localStorage.getItem(k));
          var gid = k.replace("exam_progress_", "");
          var g = D.byId(gid);
          if (g) progress.push({ g: G(g), data: p });
        }
      });
    } catch (e) {}
    var latestDims = (recs[0] && recs[0].dims) || demoRecord().dims;
    var harmony = harmonyDims({ dims: latestDims });
    var harmonyTitle = harmony.length === 6 ? "6Q和谐指数" : (harmony.length === 5 ? "五维和谐指数" : "和谐指数");
    root.innerHTML = '<div class="history-page"><div class="history-back"></div><div class="src-header" style="background:transparent"><div class="src-back" data-back></div><div class="src-header-title">我的测评' + dot("history") + '</div><div class="src-header-other"></div></div>' +
      '<div class="history-block"><div class="history-all"><div class="history-all-title">' + harmonyTitle + '</div><div class="history-all-chart">' +
      E.radarSvg(harmony, harmony.map(function (d) { return d.value; }), { size: 300 }) + '</div></div>' +
      '<div class="history-list"><div class="history-select-bg" id="select-bg"></div><div class="history-select"><div class="is-on" data-finish="0">未完成</div><div data-finish="1">已完成</div></div>' +
      '<div class="history-list-block"><div class="history-card" id="history-list"></div></div></div></div></div>';
    function paint() {
      document.getElementById("select-bg").classList.toggle("right", showFinished);
      document.querySelectorAll("[data-finish]").forEach(function (b) { b.classList.toggle("is-on", (b.getAttribute("data-finish") === "1") === showFinished); });
      var box = document.getElementById("history-list");
      if (!showFinished) {
        box.innerHTML = progress.length ? progress.map(function (p) {
          return '<div class="history-item"><div class="history-item-content"><div class="history-img" style="background-image:url(' + esc(p.g.coverImage) + ')"><span>开始测试 ></span></div>' +
            '<div class="history-info"><div class="history-title"><b>' + esc(p.g.title) + '</b><span class="history-tip">未完成</span></div>' +
            '<div class="history-other">开始时间: ' + esc(p.data.updatedAt || "") + '</div><div class="history-price">' + money(p.g.price) + '</div></div></div></div>';
        }).join("") : '<div class="history-empty">暂时没有未完成的测评～</div>';
      } else {
        box.innerHTML = recs.length ? recs.map(function (r) {
          return '<div class="history-item"><div class="history-item-content"><div class="history-img" style="background-image:url(' + esc(imgPath(r.coverImage || (D.byId(r.goodsId) || {}).cover || "../assets/covers/v3/6q.svg")) + ')"></div>' +
            '<div class="history-info"><div class="history-title"><b>' + esc(r.title) + '</b><span class="history-tip">已完成</span></div>' +
            '<div class="history-other">支付时间: ' + esc(r.payTime || r.createTime) + '</div><div class="history-other">订单编号: ' + esc(r.orderNo || "-") + '</div>' +
            '<div class="history-price">' + money(r.price) + '</div></div></div>' +
            '<div class="history-actions"><button data-report="' + esc(r.id) + '">查看报告</button><button class="solid" data-retest="' + esc(r.goodsId) + '">再测一次</button></div></div>';
        }).join("") : '<div class="history-empty">暂时没有已完成的测评～</div>';
      }
      box.querySelectorAll("[data-report]").forEach(function (b) { b.addEventListener("click", function () { go("result.html?record=" + encodeURIComponent(b.getAttribute("data-report"))); }); });
      box.querySelectorAll("[data-retest]").forEach(function (b) { b.addEventListener("click", function () { go("detail.html?goodsId=" + encodeURIComponent(b.getAttribute("data-retest"))); }); });
    }
    document.querySelectorAll("[data-finish]").forEach(function (b) {
      b.addEventListener("click", function () { showFinished = b.getAttribute("data-finish") === "1"; paint(); });
    });
    paint();
    E.mountNotes("history");
  }

  /* ---------------- 订单 ---------------- */
  function renderOrderConfirm() {
    var id = qs("goodsId") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    var ref = qs("ref") || (E.referral() && E.referral().ref) || "";
    root.innerHTML = '<div class="order-page"><div class="order-header"><div class="order-back" data-back></div><div class="order-header-title">确认订单' + dot("orderConfirm") + '</div></div>' +
      '<div class="order-body"><div class="order-card"><div class="order-item"><div class="order-img" style="background-image:url(' + esc(g.coverImage) + ')"></div>' +
      '<div class="order-info"><div class="order-name">' + esc(g.title) + '</div><div class="order-price">' + money(g.price) + '</div></div><div class="order-num">x1</div></div></div>' +
      '<div class="order-card" style="margin-top:10px"><div class="order-row"><div class="order-label">商品价格</div><div class="order-muted">共1件商品</div><div class="order-money">' + money(g.price) + '</div></div>' +
      '<div class="order-row"><div class="order-label">总价</div><div class="order-money">' + money(g.price) + '</div></div></div></div>' +
      (ref ? '<div class="order-ref">推荐人：' + esc(ref) + '（下单后计入推荐关系）</div>' : "") +
      '<div class="order-bottom"><div class="order-total"><span style="font-size:12px">￥</span>' + (g.price || 0).toFixed(2) + '</div><div class="order-submit" id="submit-order">提交订单</div></div></div>';
    document.getElementById("submit-order").addEventListener("click", function () {
      var order = E.addOrder({
        id: E.uid("ord"),
        orderNo: "EX" + Date.now(),
        goodsId: g.goodsId,
        templeteId: g.templeteId,
        title: g.title,
        price: g.price,
        payAmount: g.price,
        status: "unpaid",
        channel: "h5_order",
        referrer: ref,
        createTime: E.now()
      });
      go("order-pay.html?goodsId=" + encodeURIComponent(g.goodsId) + "&orderNo=" + encodeURIComponent(order.orderNo) +
        (ref ? "&ref=" + encodeURIComponent(ref) : ""));
    });
    E.mountNotes("orderConfirm");
  }

  function renderOrderPay() {
    var id = qs("goodsId") || "g-6q";
    var g = G(D.byId(id)) || goodsList()[0];
    var deduction = false;
    var paySelect = 1;
    root.innerHTML = '<div class="order-page"><div class="order-header"><div class="order-back" data-back></div><div class="order-header-title">选择支付方式' + dot("orderPay") + '</div></div>' +
      '<div class="order-body"><div class="order-card"><div class="order-row"><div class="order-label">应付金额</div><div class="order-muted">' + money(g.price) + '</div><div class="order-money" id="deduct-num">-</div></div>' +
      '<div class="order-row" id="deduct-row"><div class="order-label">余额抵扣</div><div class="order-muted">￥20.00</div><div class="order-check" id="deduct-check"></div></div>' +
      '<div class="order-row" style="border-top:2px dashed #F0F0F0;padding-top:12px"><div class="order-label">支付金额</div><div class="order-money" id="pay-money">' + money(g.price) + '</div></div></div>' +
      '<div class="order-card" style="margin-top:10px"><div class="order-label" style="font-weight:600;font-size:16px">请选择支付方式</div>' +
      '<div class="order-row"><div class="order-label">农行支付</div><div class="order-check is-on" id="pay-check"></div></div></div></div>' +
      '<div class="order-bottom"><div class="order-submit" style="width:100%;border-radius:44px;height:44px;line-height:44px" id="pay-submit">提交订单</div></div></div>';
    function paint() {
      document.getElementById("deduct-check").classList.toggle("is-on", deduction);
      document.getElementById("pay-check").classList.toggle("is-on", paySelect === 1);
      var amount = Math.max(0, (g.price || 0) - (deduction ? 20 : 0));
      document.getElementById("pay-money").textContent = "￥" + amount.toFixed(2);
    }
    document.getElementById("deduct-row").addEventListener("click", function () { deduction = !deduction; paint(); });
    document.getElementById("pay-submit").addEventListener("click", function () {
      E.toast("支付成功");
      setTimeout(function () { go("history.html"); }, 700);
    });
    paint();
    E.mountNotes("orderPay");
  }

  /* ---------------- 海报 ---------------- */
  function posterBand(g, record) {
    if (!record) return null;
    return (g.results || []).filter(function (r) { return r.name === record.rangeName; })[0] || null;
  }

  function posterRawValues(dims, record) {
    if (!record) return dims.map(function () { return 8; });
    var maxPer = Math.round(record.total / Math.max(1, dims.length)) || 12;
    return dims.map(function (d) { return Math.round(d.value / 100 * maxPer); });
  }

  /* 海报二维码的扫码落地地址：带商品与推荐人，真实环境由 createShare 生成同结构链接 */
  function posterScanUrl(g) {
    var ref = (E.referral() && E.referral().ref) || (E.user() && E.user().serialNo) || "";
    return "entry.html?goodsId=" + encodeURIComponent(g.goodsId) +
      (ref ? "&ref=" + encodeURIComponent(ref) : "") + "&from=poster";
  }

  function openPoster(kind, g, record) {
    var old = document.getElementById("src-poster");
    if (old) old.remove();
    var useV2 = Number(g.resultLayout || 1) === 2;
    var mask = document.createElement("div");
    mask.id = "src-poster";
    mask.className = "src-poster-mask is-open";
    if (useV2) {
      mask.innerHTML = v2PosterHtml(g, record);
    } else {
      var dims = record ? record.dims : g.dims;
      var values = record ? record.dims.map(function (d) { return d.value; }) : g.dims.map(function () { return 60; });
      mask.innerHTML = '<div class="src-poster-card"><div class="src-poster-img" id="src-poster-img">' +
        '<div style="position:relative;height:100%;background:linear-gradient(160deg,#071e3d,#0b3b78 55%,#1677ff);color:#fff;padding:20px">' +
        '<div style="font-size:10px;opacity:.7">6Q 心画测评 · v2.0.0</div>' +
        '<div style="margin-top:12px;font-size:22px;font-weight:800;line-height:1.3">' + esc(g.title) + '</div>' +
        '<div style="margin-top:4px;font-size:11px;opacity:.75">' + esc(g.subTitle) + '</div>' +
        (record ? '<div style="margin-top:18px;font-size:46px;font-weight:800;line-height:1">' + record.score + '<span style="font-size:13px;font-weight:400;opacity:.7"> / ' + record.total + ' 分</span></div><div style="margin-top:4px;font-size:14px;font-weight:700">' + esc(record.rangeName) + '</div>' : '<div style="margin-top:18px;font-size:24px;font-weight:800">' + money(g.price) + '</div>') +
        '<div style="margin-top:10px;height:170px">' + E.radarSvg(dims, values, { size: 300, light: true }) + '</div>' +
        '<div style="position:absolute;left:20px;right:20px;bottom:18px;display:flex;align-items:flex-end;gap:10px"><img src="../assets/covers/v3/qr.svg" style="width:52px;height:52px;border-radius:6px;background:#fff;padding:4px" /><div style="font-size:9px;line-height:1.6;opacity:.7">扫码测一测你的 6Q<br/>测评不是标签，是看见自己的一个角度。</div></div></div></div>' +
        '<div class="src-poster-save" id="poster-save">点击保存至相册</div><div class="src-poster-close" id="poster-close">关闭</div></div>';
    }
    document.body.appendChild(mask);
    document.getElementById("poster-close").addEventListener("click", function () { mask.remove(); });
    mask.addEventListener("click", function (e) { if (e.target === mask) mask.remove(); });
    document.getElementById("poster-save").addEventListener("click", function () { downloadPoster(kind, g, record); });
  }

  /* v2.1.0 海报：深绿金 9:16，勋章 + 觉醒金句 + 从众背书 + 溯源码 */
  function v2PosterHtml(g, record) {
    var band = posterBand(g, record);
    var user = E.user();
    var dims = record ? record.dims : g.dims;
    var maxPer = record ? Math.round(record.total / Math.max(1, dims.length)) || 12 : 12;
    var values = posterRawValues(dims, record);
    return '<div class="src-poster-card"><div class="src-poster-img v2" id="src-poster-img">' +
      '<div class="v2p">' +
      '<div class="v2p-avatar">' + esc(String(user.avatar || user.name || "6").slice(0, 1)) + '</div>' +
      '<div class="v2p-name">' + esc(user.name || "6Q 家长") + '·完成了他的育儿觉醒体验</div>' +
      (band ? '<div class="v2p-badge">' + esc(band.badge) + '</div>' +
        '<div class="v2p-quote">' + esc(band.quote) + '</div>' : '<div class="v2p-badge">' + esc(g.title) + '</div>') +
      '<div class="v2p-radar">' + radarBlock(dims, values, maxPer) + '</div>' +
      (band ? '<div class="v2p-percent">' + esc(band.percentile) + '</div>' : "") +
      '<div class="v2p-credit">已有 ' + (g.testerCount || 0).toLocaleString("en-US") + ' 位父母完成测评，依托 6Q 20 年专业沉淀</div>' +
      '<div class="v2p-foot"><img class="v2p-qr" src="../assets/covers/v3/qr.svg" alt="二维码" />' +
      '<div class="v2p-foot-text">长按解锁你的亲子觉醒指数<br/><span style="opacity:.75">测评结果仅供参考，不作为诊断依据</span></div></div>' +
      '<div class="v2p-save" id="poster-save">保存至相册</div>' +
      "</div></div>" +
      '<a class="src-poster-scan" id="poster-scan" href="' + esc(posterScanUrl(g)) + '">模拟扫码进入 ›</a>' +
      '<div class="src-poster-close" id="poster-close">关闭</div></div>';
  }

  function downloadPoster(kind, g, record) {
    if (Number(g.resultLayout || 1) === 2) return downloadPosterV2(g, record);
    var w = 550, h = 956;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#071e3d"); grad.addColorStop(.55, "#0b3b78"); grad.addColorStop(1, "#1677ff");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = "14px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
    ctx.fillText("6Q 心画测评 · v2.0.0", 32, 44);
    ctx.fillStyle = "#fff"; ctx.font = "bold 32px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
    ctx.fillText(g.title.slice(0, 12), 32, 96);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = "15px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
    ctx.fillText(g.subTitle || "", 32, 124);
    if (record) {
      ctx.fillStyle = "#fff"; ctx.font = "bold 76px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
      ctx.fillText(String(record.score), 32, 220);
      ctx.font = "18px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.fillText("/ " + record.total + " 分", 140, 216);
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
      ctx.fillText(record.rangeName, 32, 258);
    } else {
      ctx.fillStyle = "#fff"; ctx.font = "bold 40px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
      ctx.fillText(money(g.price), 32, 220);
    }
    drawRadar(ctx, 275, 500, 150, record ? record.dims : g.dims, record ? record.dims.map(function (d) { return d.value; }) : g.dims.map(function () { return 60; }));
    ctx.fillStyle = "#fff"; ctx.fillRect(32, 820, 90, 90);
    ctx.fillStyle = "#0b2b5c"; ctx.font = "bold 18px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif"; ctx.fillText("6Q", 62, 874);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = "13px -apple-system,BlinkMacSystemFont,PingFang SC,sans-serif";
    ctx.fillText("扫码测一测你的 6Q", 140, 848);
    ctx.fillText("测评不是标签，是看见自己的一个角度。", 140, 872);
    var a = document.createElement("a");
    a.download = g.title + "-海报.png";
    a.href = c.toDataURL("image/png");
    a.click();
    E.toast("海报已生成");
  }

  /* v2.1.0 海报导出：810×1440（9:16）深绿金 */
  function downloadPosterV2(g, record) {
    var w = 810, h = 1440;
    var band = posterBand(g, record);
    var user = E.user();
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#0E1F1B");
    grad.addColorStop(.55, "#122A24");
    grad.addColorStop(1, "#0A1714");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    var sans = "-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif";

    ctx.textAlign = "center";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFABF"; ctx.font = "bold 40px " + sans;
    ctx.fillText(String(user.avatar || user.name || "6").slice(0, 1), w / 2, 212);

    ctx.fillStyle = "#FFFFFF"; ctx.font = "26px " + sans;
    ctx.fillText(esc(user.name || "6Q 家长") + "·完成了他的育儿觉醒体验", w / 2, 292);
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = "20px " + sans;
    ctx.fillText("测评完成 · 专属称号已生成", w / 2, 330);

    // 勋章
    ctx.fillStyle = "#FFFABF";
    ctx.font = "bold 48px " + sans;
    wrapCenteredText(ctx, band ? band.badge : g.title, w / 2, 402, w - 120, 58);

    // 金句
    if (band) {
      ctx.fillStyle = "rgba(243,238,223,.86)";
      ctx.font = "26px " + sans;
      wrapCenteredText(ctx, band.quote, w / 2, 486, w - 140, 44);
    }

    // 雷达
    var dims = record ? record.dims : g.dims;
    var maxPer = record ? Math.round(record.total / Math.max(1, dims.length)) || 12 : 12;
    drawGoldRadar(ctx, w / 2, 800, 190, dims, posterRawValues(dims, record), maxPer);

    if (band) {
      ctx.fillStyle = "#EADFB6";
      ctx.font = "bold 40px " + sans;
      ctx.fillText(band.percentile, w / 2, 1090);
    }

    ctx.fillStyle = "rgba(243,238,223,.62)";
    ctx.font = "22px " + sans;
    wrapCenteredText(ctx, "🔥 已有 " + (g.testerCount || 0).toLocaleString("en-US") + " 位父母完成测评，依托 6Q 20 年专业沉淀", w / 2, 1150, w - 140, 38);

    // 二维码
    ctx.fillStyle = "#fff";
    ctx.fillRect(56, 1236, 150, 150);
    ctx.fillStyle = "#0E1F1B";
    ctx.font = "bold 40px " + sans;
    ctx.textAlign = "center";
    ctx.fillText("6Q", 131, 1322);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(243,238,223,.72)";
    ctx.font = "22px " + sans;
    ctx.fillText("长按解锁你的亲子觉醒指数", 236, 1296);
    ctx.fillStyle = "rgba(243,238,223,.45)";
    ctx.font = "18px " + sans;
    ctx.fillText("测评结果仅供参考，不作为诊断依据", 236, 1336);

    var a = document.createElement("a");
    a.download = g.title + "-觉醒海报.png";
    a.href = c.toDataURL("image/png");
    a.click();
    E.toast("海报已生成");
  }

  function wrapCenteredText(ctx, text, cx, y, maxWidth, lineHeight) {
    var line = "";
    var lines = [];
    String(text || "").split("").forEach(function (ch) {
      var test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, 3).forEach(function (l, i) {
      ctx.fillText(l, cx, y + i * lineHeight);
    });
  }

  function drawGoldRadar(ctx, cx, cy, r, dims, values, maxScore) {
    var n = dims.length;
    function pt(i, pct) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * r * pct / 100, cy + Math.sin(a) * r * pct / 100];
    }
    ctx.strokeStyle = "rgba(201,162,39,.42)"; ctx.lineWidth = 1;
    [25, 50, 75, 100].forEach(function (level) {
      ctx.beginPath();
      dims.forEach(function (_, i) { var p = pt(i, level); if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.closePath(); ctx.stroke();
    });
    dims.forEach(function (d, i) {
      var p = pt(i, 100);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); ctx.stroke();
      var lp = pt(i, 132);
      ctx.fillStyle = "#FFE8BE";
      ctx.font = "22px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.name, lp[0], lp[1]);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.font = "20px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif";
      ctx.fillText("(" + Math.round(values[i]) + "分)", lp[0], lp[1] + 26);
    });
    ctx.beginPath();
    dims.forEach(function (d, i) {
      var p = pt(i, Math.max(6, values[i] / maxScore * 100));
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(201,162,39,.30)"; ctx.fill();
    ctx.strokeStyle = "#D8B65A"; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = "left";
  }

  function drawRadar(ctx, cx, cy, r, dims, values) {
    var n = dims.length;
    function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r * v / 100, cy + Math.sin(a) * r * v / 100]; }
    ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.lineWidth = 1;
    [25, 50, 75, 100].forEach(function (level) {
      ctx.beginPath();
      dims.forEach(function (_, i) { var p = pt(i, level); if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.closePath(); ctx.stroke();
    });
    dims.forEach(function (d, i) { var p = pt(i, 100); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); ctx.stroke(); var lp = pt(i, 128); ctx.fillStyle = "rgba(255,255,255,.82)"; ctx.font = "12px -apple-system,sans-serif"; ctx.textAlign = "center"; ctx.fillText(d.name, lp[0], lp[1] + 4); });
    ctx.beginPath();
    dims.forEach(function (d, i) { var p = pt(i, Math.max(5, values[i])); if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.closePath(); ctx.fillStyle = "rgba(125,211,252,.28)"; ctx.fill(); ctx.strokeStyle = "#7dd3fc"; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = "left";
  }

  /* ---------------- 路由 ---------------- */
  function init() {
    if (!root) return;
    switch (PAGE) {
      case "menu": return renderMenu();
      case "login": return renderLogin();
      case "entry": return renderEntry();
      case "detail": return renderDetail();
      case "notice": return renderNotice();
      case "preExam": return renderPreExam();
      case "quiz": return renderQuiz();
      case "result": return renderResult();
      case "history": return renderHistory();
      case "orderConfirm": return renderOrderConfirm();
      case "orderPay": return renderOrderPay();
      default: return renderMenu();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
