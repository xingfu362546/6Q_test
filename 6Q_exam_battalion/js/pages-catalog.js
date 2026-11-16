/**
 * 后台列表页目录：筛选 / 列 / 工具栏 / 行操作。
 * 复杂页面（模板表单、详情、测评数据）由 engine.js 单独渲染。
 */
(function () {
  "use strict";

  function opt(list, value, label) {
    return { value: value, label: label || value };
  }

  function categoryOptions() {
    return (window.EXAM_DATA.categories || []).map(function (c) { return opt(c.id, c.name); });
  }

  window.EXAM_PAGES = {
    "template-list": {
      title: "测评模板管理",
      desc: "维护测评模板的基础信息、题目与报告结果。模板禁用会级联下架关联的测评商品。",
      dataKey: "templates",
      filters: [
        { k: "categoryId", label: "分类", type: "select", options: categoryOptions },
        { k: "title", label: "测评名称", placeholder: "请输入测评名称" },
        { k: "status", label: "状态", type: "select", options: [opt(1, "启用"), opt(2, "禁用")] },
        { k: "createTime", label: "创建时间", type: "dateRange" }
      ],
      toolbar: [
        { id: "add", label: "新增模板", primary: true, href: "replica.html?p=template-form" },
        { id: "enable", label: "启用" },
        { id: "disable", label: "禁用" }
      ],
      columns: [
        { title: "分类", key: "categoryName" },
        { title: "测评模板标题", key: "title", type: "link", href: function (r) { return "replica.html?p=template-detail&id=" + r.id; } },
        { title: "题目总数量", key: "questionCount" },
        { title: "结果总数量", key: "resultCount" },
        { title: "测评总分", key: "scoreTotal" },
        { title: "状态", key: "status", type: "status" },
        { title: "创建人", key: "createUser" },
        { title: "创建时间", key: "createTime" }
      ],
      ops: [
        { id: "detail", label: "详情", href: function (r) { return "replica.html?p=template-detail&id=" + r.id; } },
        { id: "edit", label: "修改", href: function (r) { return "replica.html?p=template-form&id=" + r.id; }, visible: function (r) { return r.status !== 1; } },
        { id: "import", label: "导入分数" }
      ]
    },

    "goods-list": {
      title: "测评商品管理",
      desc: "商品承载 H5 的测评售卖与展示。上架且「展示到心画」的商品会出现在 H5 测评列表。",
      dataKey: "goods",
      filters: [
        { k: "categoryId", label: "分类", type: "select", options: categoryOptions },
        { k: "code", label: "商品ID", placeholder: "请输入商品ID" },
        { k: "name", label: "商品名称", placeholder: "请输入商品名称" },
        { k: "status", label: "上架/下架", type: "select", options: [opt(1, "上架"), opt(2, "下架")] },
        { k: "createTime", label: "创建时间", type: "dateRange" }
      ],
      toolbar: [
        { id: "add", label: "新增商品", primary: true, href: "replica.html?p=goods-form" },
        { id: "enable", label: "上架" },
        { id: "disable", label: "下架" }
      ],
      columns: [
        { title: "商品ID", key: "code", type: "code" },
        { title: "商品封面", key: "coverImage", type: "image" },
        { title: "商品名称", key: "name", type: "link", href: function (r) { return "replica.html?p=goods-detail&id=" + r.id; } },
        { title: "分类", key: "categoryName" },
        { title: "测评模板名称", key: "templeteTitle" },
        { title: "商品二维码", key: "qrCode", type: "image" },
        { title: "市场价格", key: "price", type: "price" },
        { title: "展示到心画", key: "heartFlag", type: "switch", on: 1 },
        { title: "上架/下架", key: "status", type: "status", onText: "上架", offText: "下架" },
        { title: "排序值", key: "idx" },
        { title: "所属OA产品", key: "oaProductName" },
        { title: "创建人", key: "createUser" },
        { title: "创建时间", key: "createTime" }
      ],
      ops: [
        { id: "edit", label: "修改", href: function (r) { return "replica.html?p=goods-form&id=" + r.id; }, visible: function (r) { return r.status === 2; } },
        { id: "qrcode", label: "下载二维码" }
      ]
    },

    "appraise": {
      title: "测评反馈",
      desc: "查看用户对测评的星级与文字反馈。只读列表，无编辑入口。",
      dataKey: "appraises",
      filters: [
        { k: "userName", label: "会员姓名", placeholder: "请输入会员姓名", get: function (r) { return r.user.name; } },
        { k: "userSerialNo", label: "会员ID", placeholder: "请输入会员ID", get: function (r) { return r.user.serialNo; } },
        { k: "userMobile", label: "手机号码", placeholder: "请输入手机号码", get: function (r) { return r.user.mobile; } },
        { k: "createTime", label: "提交时间", type: "dateRange" },
        { k: "score", label: "评分", type: "select", options: [opt(5, "5星"), opt(4, "4星"), opt(3, "3星"), opt(2, "2星"), opt(1, "1星")] },
        { k: "title", label: "测评模板标题", placeholder: "请输入测评模板标题" }
      ],
      toolbar: [],
      columns: [
        { title: "测评模板标题", key: "title" },
        { title: "会员信息", key: "user", type: "member" },
        { title: "评分", key: "score", type: "stars" },
        { title: "反馈内容", key: "content", type: "feedback" },
        { title: "提交时间", key: "createTime" }
      ],
      ops: []
    },

    "mental": {
      title: "预约老师留言",
      desc: "H5 结果页与预约页提交的留言。运营在这里改跟进状态与备注。",
      dataKey: "appointments",
      filters: [
        { k: "nickName", label: "昵称", placeholder: "请输入昵称" },
        { k: "mobile", label: "手机号", placeholder: "请输入手机号" },
        { k: "needType", label: "预约了解类型", type: "select", options: ["课程咨询", "测评解读", "心理陪伴", "合作咨询"] },
        { k: "sourceFrom", label: "来源", type: "select", options: ["H5 结果页", "H5 预约页", "官网"] },
        { k: "status", label: "跟进状态", type: "select", options: ["待跟进", "已联系", "已完成"] },
        { k: "createTime", label: "提交时间", type: "dateRange" }
      ],
      toolbar: [],
      columns: [
        { title: "昵称", key: "nickName" },
        { title: "称呼", key: "nickType" },
        { title: "预约了解类型", key: "needType", type: "tag", tone: "blue" },
        { title: "关心的课程/方向", key: "needContent", type: "ellipsis" },
        { title: "手机号", key: "mobile" },
        { title: "来源", key: "sourceFrom", type: "tag" },
        { title: "跟进状态", key: "status", type: "tag", tone: function (v) { return v === "已完成" ? "green" : v === "已联系" ? "blue" : "orange"; } },
        { title: "备注", key: "memo", type: "ellipsis" },
        { title: "提交时间", key: "createTime" }
      ],
      ops: [{ id: "follow", label: "跟进" }]
    },

    "subject": {
      title: "测评主题",
      desc: "主题用于 H5 首页分组。主题禁用后首页不再展示，关联商品不受影响。",
      dataKey: "subjects",
      filters: [
        { k: "name", label: "主题名称", placeholder: "请输入主题名称" },
        { k: "status", label: "状态", type: "select", options: [opt(1, "启用"), opt(0, "禁用")] },
        { k: "createTime", label: "创建时间", type: "dateRange" }
      ],
      toolbar: [
        { id: "add", label: "新增主题", primary: true },
        { id: "enable", label: "批量启用" },
        { id: "disable", label: "批量禁用" },
        { id: "export", label: "导出" }
      ],
      columns: [
        { title: "主题名称", key: "name", type: "link", action: "detail" },
        { title: "主题描述", key: "detail", type: "ellipsis" },
        { title: "商品封面", key: "faceImg", type: "image" },
        { title: "排序值", key: "idx", type: "sort" },
        { title: "状态", key: "status", type: "switch", on: 1 },
        { title: "创建时间", key: "createTime" }
      ],
      ops: [
        { id: "edit", label: "编辑", visible: function (r) { return +r.status === 0; } },
        { id: "delete", label: "删除", danger: true, visible: function (r) { return +r.status === 0; } }
      ]
    },

    "dimension": {
      title: "维度管理",
      desc: "维度模板决定测评结果页能出哪些指标。题目关联到具体指标，结果按指标区间解读。",
      dataKey: "dimensions",
      filters: [
        { k: "name", label: "模板名称", placeholder: "请输入模板名称" },
        { k: "status", label: "状态", type: "select", options: [opt(1, "启用"), opt(2, "禁用")] }
      ],
      toolbar: [
        { id: "add", label: "新增", primary: true },
        { id: "enable", label: "批量启用" },
        { id: "disable", label: "批量禁用" }
      ],
      columns: [
        { title: "维度模板名称", key: "name", type: "link", action: "detail" },
        { title: "描述", key: "memo", type: "ellipsis" },
        { title: "维度指标数", key: "sonNum" },
        { title: "维度ID", key: "id", type: "code" },
        { title: "创建时间", key: "createTime" },
        { title: "状态", key: "status", type: "switch", on: 1 },
        { title: "创建人", key: "createUser" }
      ],
      ops: [
        { id: "edit", label: "编辑", visible: function (r) { return r.status !== 1; } },
        { id: "delete", label: "删除", danger: true, visible: function (r) { return r.status !== 1; } }
      ]
    },

    "category": {
      title: "分类管理",
      desc: "分类用于模板、商品与 H5 金刚区。禁用会级联下架该分类下的模板和商品。",
      dataKey: "categories",
      filters: [
        { k: "name", label: "分类名称", placeholder: "请输入分类名称" },
        { k: "status", label: "状态", type: "select", options: [opt(1, "启用"), opt(2, "禁用")] }
      ],
      toolbar: [
        { id: "add", label: "新增分类", primary: true },
        { id: "enable", label: "批量启用" },
        { id: "disable", label: "批量禁用" }
      ],
      columns: [
        { title: "图标", key: "image", type: "image", small: true },
        { title: "分类名称", key: "name", type: "link", action: "detail" },
        { title: "分类ID", key: "id", type: "code" },
        { title: "状态", key: "status", type: "switch", on: 1 },
        { title: "排序值", key: "idx", type: "sort" },
        { title: "创建时间", key: "createTime" },
        { title: "展示在金刚区", key: "showFlag", type: "switch", on: 1 },
        { title: "创建人", key: "createUser" }
      ],
      ops: [
        { id: "edit", label: "编辑", visible: function (r) { return r.status === 2; } },
        { id: "delete", label: "删除", danger: true, visible: function (r) { return r.status === 2; } }
      ]
    },

    "overall": {
      title: "测评介绍",
      desc: "H5「测评介绍」页的整体介绍文案。只有一段，编辑后立即影响 H5。",
      dataKey: "overall",
      filters: [],
      toolbar: [],
      columns: [
        { title: "测评总介绍", key: "title" },
        { title: "测评介绍", key: "detail", type: "ellipsis", width: "520px" },
        { title: "编辑时间", key: "modifyTime" }
      ],
      ops: [{ id: "edit", label: "编辑" }]
    },

    "data": {
      title: "测评数据",
      desc: "按填写明细与模板汇总两个视角看测评数据。导出不产生真实文件。",
      special: "data"
    },

    "template-form": {
      title: "测评模板新增 / 编辑",
      desc: "三个页签：基础信息、测评题目、报告结果。测评总分由题目选项最高分自动累加。",
      special: "template-form"
    },

    "template-detail": {
      title: "测评模板详情",
      desc: "左侧切换基础信息、题目信息、报告结果。只读，不写数据。",
      special: "template-detail"
    },

    "goods-form": {
      title: "测评商品新增 / 编辑",
      desc: "商品与测评模板关联后，用户在 H5 购买或进入测评时按模板出题、出结果。",
      special: "goods-form"
    },

    "goods-detail": {
      title: "测评商品详情",
      desc: "商品信息、关联模板与二维码。二维码可下载用于投放。",
      special: "goods-detail"
    }
  };
})();
