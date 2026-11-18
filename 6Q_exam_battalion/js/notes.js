/**
 * 后台页面注释 · 五段式
 * 过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流
 * 编号对应 docs/FEATURES.md。
 */
(function () {
  "use strict";

  function row(name, control, required, notes, kind) {
    return { name: name, control: control, required: required, notes: notes, kind: kind || "" };
  }

  function note(req, key, kind, name, past, now, rows, api, flow, labels) {
    return {
      req: req, key: key, kind: kind, name: name, past: past, now: now, rows: rows, api: api, flow: flow,
      pastLabel: (labels && labels.past) || "过往逻辑 · v2.0.0",
      nowLabel: (labels && labels.now) || "现在的逻辑 · v2.0.0"
    };
  }

  var PAGES = {
    "template-list": {
      title: "测评模板管理",
      markers: [
        note(
          "EX-001", "template-list", "",
          "模板列表与筛选",
          "现网列表接口 exam/exam/templete/list。筛选：分类（exam/exam/gategory/list）、测评名称、状态（启用/禁用）、创建时间。列：分类、测评模板标题、题目总数量、结果总数量、测评总分、状态、创建人、创建时间。",
          "复刻保留全部筛选与列。分页为前端模拟，每页 10 条。分类下拉取分类管理里的启用分类；状态取 1 启用、2 禁用。",
          [
            row("分类", "下拉", "否", "取分类列表，展示分类名称。"),
            row("测评名称", "输入", "否", "按标题模糊匹配。"),
            row("状态", "下拉", "否", "启用 / 禁用。"),
            row("创建时间", "日期范围", "否", "开始、结束日期。"),
            row("列表", "表格", "否", "分类、标题、题目数、结果数、总分、状态、创建人、创建时间。")
          ],
          "GET exam/exam/templete/list",
          "分类管理 → 模板列表：分类下拉读取 gategory/list；模板保存后写入列表。"
        ),
        note(
          "EX-002", "template-status", "iteration",
          "启用 / 禁用 / 导入分数",
          "现网启用 put exam/exam/templete/putaway，禁用 put exam/exam/templete/shelves。禁用会级联下架测评商品。行操作「修改」只在 status !== 1 时出现；「导入分数」始终出现。",
          "复刻保留启用、禁用、导入分数三个动作。禁用弹二次确认，文案明确「将会级联下架测评商品」，确认后把关联商品改为下架。导入分数只开弹窗、选文件、toast，不真正解析。",
          [
            row("启用", "按钮", "否", "批量或单条；状态改为启用。"),
            row("禁用", "按钮", "否", "二次确认；级联把关联商品下架。", "iteration"),
            row("修改", "行操作", "否", "仅禁用态显示。"),
            row("导入分数", "行操作", "否", "弹窗上传，演示用。")
          ],
          "PUT exam/exam/templete/putaway\nPUT exam/exam/templete/shelves\nPOST exam/exam/templete/score/import",
          "模板列表 → 商品列表：模板禁用时，goods.status 同步为 2（下架）。"
        ),
        note(
          "EX-007", "template-import", "",
          "导入分数弹窗",
          "现网 ImportScoreModal：下载模板 exam/exam/templete/score/exportTemplateXlsx，上传 exam/exam/templete/score/import，携带 templeteId。",
          "复刻只做弹窗结构：下载模板按钮、文件选择、导入按钮、结果提示。不上传真实文件，不校验表头。",
          [
            row("下载模板", "按钮", "否", "演示下载，toast 提示模板名。"),
            row("选择文件", "上传", "是", "选择 xlsx 后显示文件名。"),
            row("导入", "按钮", "否", "未选文件时提示；选了只 toast。")
          ],
          "GET exam/exam/templete/score/exportTemplateXlsx\nPOST exam/exam/templete/score/import",
          "模板列表 → 导入弹窗：携带当前行 templeteId。"
        )
      ]
    },

    "template-form": {
      title: "测评模板新增 / 编辑",
      markers: [
        note(
          "EX-003", "template-basic", "",
          "① 测评基础信息",
          "现网 form.vue 第一个页签。字段：标题（必填、最多 15 字）、副标题（必填）、虚拟测试人数、分类（必填）、用户是否需填年龄、测评总分（只读，由题目选项最高分累加）、建议时长 + 单位、维度模板（必填）、封面图 750×562、测评图片 750×422、测评海报 550×956（固定区域 510×176）、报告海报、测评详情（富文本）、结果页介绍标题与内容。",
          "复刻按原字段与顺序铺开。富文本用 textarea 代替；图片用上传占位 + 缩略图；总分只读，由题目页选项分值自动累计。保存只写内存并 toast。",
          [
            row("测评模板标题", "输入", "是", "最多 15 字。"),
            row("测评模板副标题", "输入", "是", "结果页与列表副标题。"),
            row("虚拟测试人数", "数字", "否", "前端展示用的虚拟人数。"),
            row("分类", "下拉", "是", "取启用分类。"),
            row("用户是否需填年龄", "单选", "是", "是 / 否。"),
            row("测评总分", "只读", "否", "题目选项最高分累加。"),
            row("测评建议时长", "数字 + 单位", "是", "目前只有分钟。"),
            row("维度模板", "下拉", "是", "取 typeFlag=1 且启用的维度模板。"),
            row("封面图 / 测评图片 / 测评海报 / 报告海报", "上传", "是", "按现网建议尺寸标注。"),
            row("测评详情", "富文本", "是", "复刻用 textarea。"),
            row("结果页介绍标题 / 内容", "输入 / 富文本", "是", "结果页顶部介绍。")
          ],
          "GET exam/exam/templete/detail\nPOST exam/exam/templete/create\nPUT exam/exam/templete/modify\nGET exam/exam/gategory/list?status=1\nGET exam/dimensionality/dic/list?typeFlag=1&status=1",
          "分类管理 → 模板表单：分类下拉；维度管理 → 模板表单：维度模板下拉；模板保存后回列表。"
        ),
        note(
          "EX-004", "template-questions", "",
          "② 测评题目信息",
          "现网 DynamicQuestionForm：每题单选题（typeFlag=1），关联维度，题目，选项（内容 + 分值），选项最多 26 个，至少 1 个；题目至少 1 题。答题摘要必填。支持导入题目 exam/exam/question/import、下载模板 exportTemplateXlsx。",
          "复刻支持添加/删除题目、选项，实时计算每题最高分与总分。题型固定单选，不给其他题型，和现网一致。导入题目只做按钮与提示。",
          [
            row("答题摘要", "多行文本", "是", "答题页顶部说明。"),
            row("题型", "单选", "是", "现网只做单选题。"),
            row("关联维度", "下拉", "是", "取维度模板下的指标。"),
            row("题目", "输入", "是", "题干。"),
            row("选项内容", "多行文本", "是", "A/B/C/D…"),
            row("选项分值", "数字", "是", "最高分计入题目分。"),
            row("添加题目 / 移除", "按钮", "否", "至少保留 1 题。"),
            row("添加选项 / 移除", "按钮", "否", "至少保留 1 个选项。")
          ],
          "GET exam/exam/question/detaiAndQuestionlList\nPOST exam/exam/question/import\nGET exam/exam/question/exportTemplateXlsx",
          "维度管理 → 题目：关联维度下拉；题目保存后，测评总分回写基础信息与报告结果。"
        ),
        note(
          "EX-005", "template-report", "",
          "③ 报告结果设置",
          "现网 form.vue 第三个页签。开关：是否展示总分、维度图表、正态分布图表、6Q和谐指数。结果表：指数名称、指数范围（scoreMin — scoreMax）、基础解读。各维度指标结果：维度指标名称、指标范围、详细解读、建议；支持子级。",
          "复刻保留四个开关、结果区间表、维度解读表。新增/编辑结果用抽屉，删除即时生效。维度解读按 6Q 六维铺开，可改分数区间、解读和建议。",
          [
            row("是否展示总分", "单选", "是", "控制 H5 结果页总分。"),
            row("维度图表展示", "单选", "是", "控制 H5 雷达图。"),
            row("正态分布图表展示", "单选", "是", "控制 H5 分布曲线。"),
            row("6Q和谐指数展示", "单选", "是", "控制 H5 和谐指数。"),
            row("指数名称", "输入", "是", "如蓄力期、整合期、绽放期。"),
            row("指数范围", "数字区间", "是", "最小值 — 最大值。"),
            row("基础解读", "多行文本", "是", "结果页主解读。"),
            row("维度指标名称", "只读", "否", "来自维度模板。"),
            row("指标范围", "数字区间", "是", "维度分区间。"),
            row("详细解读 / 建议", "多行文本", "是", "H5 结果页展开内容。")
          ],
          "GET exam/exam/templete/detail\nGET exam/exam/explain/detailListExplainSuggets",
          "题目页 → 报告结果：题目总分回写；模板保存 → H5：结果页按开关与区间展示。"
        ),
        note(
          "EX-051", "template-layout", "",
          "结果页版式开关",
          "v2.0.0 及以前：结果页版式由四个展示开关（总分 / 维度图 / 正态分布 / 6Q 和谐指数）隐式决定，没有独立的版式概念。亲子养育测评只能用通用结果页，无法呈现档位勋章、核心卡点与风险提示。",
          "新增模板级字段 resultLayout：1 = 旧版结果页，2 = 新版结果页。默认 1，旧模板零改动。版式挂在模板上，模板赋给商品后由 H5 读取，不在商品上重复配置。选新版后「报告结果设置」页按版式分支：开关组只保留「是否展示总分」，「维度图表展示」固定为是并置灰，正态分布与 6Q 和谐指数两个开关整行移除；档位表改为档位名称 / 分数区间 / 觉醒勋章 / 觉醒金句 / 超越百分比 / 基础解读，并展示新风控与转化文案。切回旧版恢复四个开关与旧表头。H5 新版式不再读取这两个开关。",
          [
            row("报告版式", "单选", "是", "resultLayout：1 旧版 / 2 新版；缺省按 1 处理。", "new"),
            row("旧版结果页", "选项", "否", "四个展示开关全开可配，档位表为指数名称 / 指数范围 / 基础解读。", "new"),
            row("新版结果页", "选项", "否", "只保留总分开关，维度图固定展示，正态分布与 6Q 和谐指数不出现。", "new"),
            row("版式联动", "说明", "否", "切新版自动置「维度图=是、正态分布=否、和谐指数=否」。", "new"),
            row("版式说明", "说明文字", "否", "提示版式挂在模板、赋给商品后生效。", "new")
          ],
          "GET exam/exam/templete/detail\nPOST exam/exam/templete/create\nPUT exam/exam/templete/modify\nGET exam/app/api/viewCheckResult（H5 读取 templete.resultLayout）",
          "模板表单 → 模板 → 商品：模板保存 resultLayout → 商品关联模板 → H5 结果页按 resultLayout 选择渲染器。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-052", "template-cta", "",
          "新风控与转化文案",
          "v2.0.0 及以前：结果页的解读全部来自结果区间表与维度解读表，没有「风险提示」与「转化文案」概念，也没有导师二维码。图 2、图 3、图 6 里的风险预警与预约解读文案在旧数据结构里无处承载。",
          "新增模板级文本字段 riskTip（孩子正在经历什么）、ctaText（深度了解）、ctaSubText（转化引导语）、ctaQrCode（导师二维码）。四个字段只在新版结果页渲染，旧版忽略。文案留空时前端整块隐藏，不出现空卡片。",
          [
            row("风险提示", "多行文本", "否", "riskTip，对应「您的孩子正在经历什么」。", "new"),
            row("转化文案", "多行文本", "否", "ctaText，对应「如果您想深度了解」。", "new"),
            row("转化引导语", "输入", "否", "ctaSubText，底部主 CTA 副标题。", "new"),
            row("导师二维码", "图片", "否", "ctaQrCode，原型用占位图。", "new")
          ],
          "GET exam/exam/templete/detail\nPOST exam/exam/templete/create\nPUT exam/exam/templete/modify\nGET exam/app/api/viewCheckResult（H5 读取 templete.riskTip / ctaText / ctaSubText / ctaQrCode）",
          "模板表单 → 模板 → 商品 → H5 结果页：文案随模板下发；二维码弹窗不新增接口，图片直出。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-054", "template-dimcopy", "",
          "各维度文案配置（卡点 / 风险 / 欣赏）",
          "v2.1.0：卡点、风险、欣赏三段文案没有统一落点。卡点与风险写在前端常量里，欣赏文案是 v2.2 新增，只能硬编码，运营改不了；维度指标结果表也只有「详细解读 / 建议」两列。",
          "v2.2 把三段文案统一挂到「各维度指标结果」上，按维度配置，取该维度<b>索引为 0</b> 的那一行：\n1、卡点文案 painText、风险文案 riskText、欣赏文案 appreciate；\n2、相对优势版 appreciateAlt，用于该维度分数低于 8 分时的兜底措辞；\n3、卡点、风险、欣赏三段都<b>只展示一条</b>：分别取最低分、同维度风险、最高分的那个维度，分数相同时取索引更小的；\n4、前端按维度 key 读取，欣赏只取非卡点维度；\n5、任一字段留空时该段不渲染，不出现空段落；\n6、欣赏不再展示「小建议」，v2.2.1 已移除该列；\n7、模板详情同步展示这四列，便于核对。",
          [
            row("卡点文案", "多行文本", "否", "painText，核心卡点维度的剖析。", "new"),
            row("风险文案", "多行文本", "否", "riskText，与卡点同维度的风险预警。", "new"),
            row("欣赏文案", "多行文本", "否", "appreciate，只展示一条。", "new"),
            row("相对优势版", "多行文本", "否", "appreciateAlt，该维度低于 8 分时改用此措辞。", "new"),
            row("取值行", "规则", "是", "取该维度索引为 0 的配置行。", "new")
          ],
          "GET exam/exam/templete/detail\nPOST exam/exam/templete/create\nPUT exam/exam/templete/modify\nGET exam/app/api/viewCheckResult（weiduExplainList[] 携带五段文案）",
          "维度管理 → 模板表单各维度指标结果 → 模板 → H5 报告：卡点取卡点维度配置，风险同维度，欣赏取非卡点维度配置。",
          { now: "现在的逻辑 · v2.2" }
        )
      ]
    },

    "template-detail": {
      title: "测评模板详情",
      markers: [
        note(
          "EX-006", "template-detail", "",
          "详情三段",
          "现网 detail.vue 左侧菜单：测评基础信息（exam:examTemplete:detail）、测评题目信息（exam:examQuestion:detail）、报告结果信息（exam:examExplain:detail）。右侧组件分别为 TempleteBaseInfo、QuestionInfo、ExplainReport。",
          "复刻保留左侧三段与右侧内容。基础信息用描述列表；题目信息展示题号、题干、选项与分值；报告结果展示四个开关、区间表、维度解读。",
          [
            row("测评基础信息", "菜单", "否", "标题、副标题、分类、总分、时长、图片、详情。"),
            row("测评题目信息", "菜单", "否", "总分、答题摘要、题目列表。"),
            row("报告结果信息", "菜单", "否", "开关、指数区间、维度解读。")
          ],
          "GET exam/exam/templete/detailInfo\nGET exam/exam/question/detaiAndQuestionlList\nGET exam/exam/explain/detailListExplainSuggets",
          "模板列表 → 详情：携带 id；详情只读，不写数据。"
        )
      ]
    },

    "goods-list": {
      title: "测评商品管理",
      markers: [
        note(
          "EX-008", "goods-list", "",
          "商品列表",
          "现网列表 exam/exam/goods/list。筛选：分类、商品ID、商品名称、上架/下架、创建时间。列：商品ID、封面、名称、分类、测评模板名称、二维码、市场价格、展示到心画（heartFlag）、上下架、排序、所属OA产品、创建人、创建时间。",
          "复刻保留全部列与筛选。市场价格拆 IOS / Android 两行。展示到心画用开关，切换只改内存。下载二维码打开弹窗。",
          [
            row("分类", "下拉", "否", "取分类列表。"),
            row("商品ID", "输入", "否", "商品编号 code。"),
            row("商品名称", "输入", "否", "模糊匹配。"),
            row("上架/下架", "下拉", "否", "1 上架、2 下架。"),
            row("展示到心画", "开关", "否", "heartFlag=1 展示。"),
            row("下载二维码", "行操作", "否", "打开二维码弹窗。", "new")
          ],
          "GET exam/exam/goods/list\nPUT exam/exam/goods/putawayHeartFlag\nPUT exam/exam/goods/shelvesHeartFlag",
          "模板管理 → 商品：templeteIds 关联；商品 → H5：heartFlag=1 且 status=1 才在 H5 展示。"
        )
      ]
    },

    "goods-form": {
      title: "测评商品新增 / 编辑",
      markers: [
        note(
          "EX-009", "goods-form", "",
          "商品表单",
          "现网 form.vue。字段：商品编号（自动生成只读）、商品名称、市场 Android 价、市场 IOS 价、排序值、所属OA产品（goods/productOaRelation/productList）、关联测评模板（必填，弹窗选择）、封面图 540×450、是否展示到第三方（农行，thirdParty='nh'）。",
          "复刻按原字段铺开。关联模板用「添加测评模板」打开选择抽屉，可移除。第三方只保留农行一个勾选。提交校验必填项与至少一个模板。",
          [
            row("商品编号", "只读", "否", "自动生成，新增时不填。"),
            row("商品名称", "输入", "是", "H5 展示名称。"),
            row("市场 Android 价", "数字", "是", "保留两位。"),
            row("市场 IOS 价", "数字", "是", "保留两位。"),
            row("排序值", "数字", "是", "H5 列表排序。"),
            row("所属OA产品", "下拉", "是", "OA 产品列表。"),
            row("关联测评模板", "表格 + 选择", "是", "至少一个模板。"),
            row("封面图", "上传", "是", "建议 540×450。"),
            row("是否展示到第三方", "勾选", "否", "农行。")
          ],
          "GET exam/exam/goods/detail\nPOST exam/exam/goods/add\nPUT exam/exam/goods/modify\nGET goods/productOaRelation/productList",
          "模板管理 → 商品表单：选择模板；商品保存 → H5 列表：商品与模板一起下发。"
        )
      ]
    },

    "goods-detail": {
      title: "测评商品详情",
      markers: [
        note(
          "EX-010", "goods-detail", "",
          "商品详情与二维码",
          "现网 detail.vue：商品信息（编号、名称、市场价格、关联测评模板表、封面图），右上角「前端隐藏/前端显示」「上架中/已下架」。二维码弹窗 EwmModal 用 html2canvas 下载。",
          "复刻保留商品信息、关联模板表、状态说明。二维码弹窗展示二维码图与下载按钮；下载用 SVG 直接下载。",
          [
            row("商品编号 / 名称 / 市场价", "描述", "否", "只读。"),
            row("关联测评模板", "表格", "否", "测评类型、模板名称。"),
            row("封面图", "图片", "否", "展示封面。"),
            row("二维码", "图片 + 下载", "否", "弹窗下载。", "new")
          ],
          "GET exam/exam/goods/detail",
          "商品列表 → 详情：携带 id；详情只读。"
        )
      ]
    },

    "overall": {
      title: "测评介绍",
      markers: [
        note(
          "EX-011", "overall", "",
          "测评整体介绍",
          "现网 list.vue：列表字段测评总介绍、测评介绍、编辑时间；只有编辑操作。编辑弹窗内「测评总介绍」为固定文案「测评整体介绍」，「测评介绍」必填，提交 put exam/exam/overall/info/modify。",
          "复刻保留列表与编辑弹窗。总介绍只读展示，测评介绍可改；保存后更新编辑时间并 toast。",
          [
            row("测评总介绍", "只读", "否", "固定「测评整体介绍」。"),
            row("测评介绍", "多行文本", "是", "H5 测评介绍页正文。"),
            row("编辑时间", "列", "否", "保存时更新。")
          ],
          "GET exam/exam/overall/info/list\nPUT exam/exam/overall/info/modify",
          "后台介绍 → H5 介绍页：H5 读取同一段介绍正文。"
        )
      ]
    },

    "appraise": {
      title: "测评反馈",
      markers: [
        note(
          "EX-012", "appraise", "",
          "反馈列表",
          "现网 list.vue：筛选会员姓名、会员ID、手机号码、提交时间、评分（5-1 星）、测评模板标题。列：测评模板标题、会员信息（ID/姓名/手机）、评分、反馈内容、提交时间。",
          "复刻保留筛选与列。会员信息三行展示；反馈内容超长省略；评分用星级。只读，无行操作。",
          [
            row("会员姓名", "输入", "否", "模糊匹配。"),
            row("会员ID", "输入", "否", "serialNo。"),
            row("手机号码", "输入", "否", "mobile。"),
            row("提交时间", "日期范围", "否", "createTime。"),
            row("评分", "下拉", "否", "5/4/3/2/1 星。"),
            row("测评模板标题", "输入", "否", "title。"),
            row("反馈内容", "列", "否", "超长省略。")
          ],
          "GET exam/exam/user/appraise/list",
          "H5 反馈页 → 后台反馈列表：提交后写入 score、content、模板与会员信息。"
        )
      ]
    },

    "mental": {
      title: "预约老师留言",
      markers: [
        note(
          "EX-013", "mental", "",
          "预约留言与跟进",
          "现网 list.vue：筛选昵称、手机号、预约了解类型（needType）、来源（sourceFrom）、跟进状态（status）、提交时间。列：昵称、称呼、了解类型、关心课程/方向、手机号、来源、跟进状态、备注、提交时间。行操作「跟进」打开 FjFormModal，提交 put exam/exam/mental/appointment/modify。",
          "复刻保留筛选、列与跟进弹窗。跟进状态与备注可改，保存后更新列表并 toast。枚举沿用现网中文值。",
          [
            row("昵称", "输入", "否", "nickName。"),
            row("手机号", "输入", "否", "mobile。"),
            row("预约了解类型", "下拉", "否", "课程咨询/测评解读/心理陪伴/合作咨询。"),
            row("来源", "下拉", "否", "H5 结果页/H5 预约页/官网。"),
            row("跟进状态", "下拉", "否", "待跟进/已联系/已完成。"),
            row("跟进", "行操作", "否", "弹窗改状态与备注。", "iteration")
          ],
          "GET exam/exam/mental/appointment/list\nPUT exam/exam/mental/appointment/modify",
          "H5 预约页 → 后台预约列表：提交昵称、称呼、类型、方向、手机、来源；后台跟进写 status、memo。"
        )
      ]
    },

    "data": {
      title: "测评数据",
      markers: [
        note(
          "EX-014", "data-detail", "",
          "填写情况明细",
          "现网 data/list.vue 第一个页签。筛选：模板标题、填写人ID、姓名、性别、电话、会员类型、6Q身份、测评类型、填写时间、年龄范围。列：测评类型、分类、模板标题、状态、填写人ID/姓名/年龄/性别/电话、会员类型、6Q身份、测评总分、得分、分数区间、填写时长、填写时间。",
          "复刻保留全部筛选与列。顶部加一组 KPI，便于看数据。导出按钮只 toast。",
          [
            row("测评模板标题", "输入", "否", "title。"),
            row("填写人ID", "输入", "否", "serialNo。"),
            row("填写人姓名", "输入", "否", "name。"),
            row("性别", "下拉", "否", "男/女。"),
            row("电话号码", "输入", "否", "mobile。"),
            row("会员类型", "下拉", "否", "会员/非会员。"),
            row("6Q身份", "下拉", "否", "学员/家长/导师。"),
            row("测评类型", "下拉", "否", "取主题列表。"),
            row("填写时间", "日期范围", "否", "createTime。"),
            row("年龄范围", "数字区间", "否", "startUserAge / endUserAge。")
          ],
          "GET exam/exam/user/check/findUserCheckStatistic\nGET exam/exam/user/check/exportCheckStatistic",
          "H5 答题提交 → 后台明细：写入模板、会员、年龄、得分、时长；后台可导出。"
        ),
        note(
          "EX-015", "data-summary", "",
          "填写情况汇总",
          "现网第二个页签。筛选：测评类型、模板标题、状态、时间。列：测评类型、模板标题、状态、收藏人数、查看人数、分享题目人数、分享结果人数、测试人数、测评答题数据（下载）。",
          "复刻保留筛选与列。答题数据列用「下载」按钮，toast 提示导出文件。",
          [
            row("收藏人数", "列", "否", "scNum。"),
            row("查看人数", "列", "否", "viewNum。"),
            row("分享题目人数", "列", "否", "fxtmNum。"),
            row("分享结果人数", "列", "否", "fxjgNum。"),
            row("测试人数", "列", "否", "testNum。"),
            row("下载", "行操作", "否", "导出该模板答题数据。")
          ],
          "GET exam/exam/user/favourite/findTempleteUserFavouriteStatistic\nGET exam/exam/user/favourite/exportTempleteUserAnswer\nGET exam/exam/user/favourite/exportTempleteUserFavouriteStatistic",
          "H5 浏览/收藏/分享/测试 → 后台汇总：按模板聚合人数；下载导出答题明细。"
        ),
        note(
          "EX-053", "data-export", "",
          "答题数据导出的题目与选项内容",
          "现网导出的答题明细里，题目列只有「问题1 / 问题2 / 问题3」，选项值只有「A / B / C / D」字母，看不出题目问的是什么、用户选的又是什么。核对数据时只能回表逐题比对，导出文件本身无法独立阅读。",
          "导出改为输出可读内容：题目列写题号 + 题目原文，选项列写所选选项原文，并补「该题全部选项」与「得分 / 该题最高分」两列。题目、选项、分值三者的明细统一取自<b>卷王答题明细返回</b>；卷王不返回题目与选项原文时，导出退回原先的「问题N / 字母」并在文件里标红提示。新增「导出内容预览」，导出前可在后台直接看到表头与明细的样子。",
          [
            row("题目列", "导出列", "是", "题号 + 题目原文，替代「问题N」。", "new"),
            row("选项值", "导出列", "是", "所选选项原文，替代 A/B/C/D 字母。", "new"),
            row("选项集", "导出列", "否", "该题全部选项原文，按序号拼接。", "new"),
            row("得分", "导出列", "否", "所选选项得分 / 该题最高分。", "new"),
            row("所属维度", "导出列", "否", "取题目关联维度名称。", "new"),
            row("导出内容预览", "按钮", "否", "打开抽屉看表头对照与明细预览。", "new"),
            row("卷王明细", "接口", "是", "题目原文 / 选项原文 / 选项序号 / 选项分值。", "new")
          ],
          "GET exam/exam/user/check/exportCheckStatistic\nGET exam/exam/user/favourite/exportTempleteUserAnswer\n卷王答题明细接口（题目与选项原文来源，字段名待确认）",
          "H5 答题 → 卷王答题明细（题目 / 选项 / 分值）→ 后台导出接口透传 → 导出文件；后台「导出内容预览」读同一份明细。",
          { now: "现在的逻辑 · v2.1.0" }
        )
      ]
    },

    "subject": {
      title: "测评主题",
      markers: [
        note(
          "EX-016", "subject", "",
          "主题与关联商品",
          "现网 subject.vue。筛选：主题名称、状态、创建时间。列：主题名称、主题描述、商品封面、排序值、状态、创建时间。抽屉编辑：封面图 336×213、主题名称（最多 10 字）、排序值、主题描述（最多 50 字）、关联测评商品（弹窗多选）、启用/禁用/删除。",
          "复刻保留列表、抽屉编辑、商品关联。关联商品用选择弹窗，表格可移除。排序值可直接改。删除需二次确认。",
          [
            row("封面图", "上传", "是", "建议 336×213。"),
            row("主题名称", "输入", "是", "最多 10 字。"),
            row("排序值", "数字", "是", "H5 主题排序。"),
            row("主题描述", "多行文本", "否", "最多 50 字。"),
            row("关联测评商品", "表格 + 选择", "是", "至少一个商品。"),
            row("状态", "开关", "否", "启用/禁用；禁用后 H5 首页不展示。")
          ],
          "GET exam/exam/subject/list\nPOST exam/exam/subject/create\nPUT exam/exam/subject/modify\nPUT exam/exam/subject/putaway\nPUT exam/exam/subject/shelves\nDELETE exam/exam/subject/remove",
          "商品管理 → 主题：主题关联 goodsId；主题 → H5 首页：启用主题展示，商品按排序值排列。"
        )
      ]
    },

    "dimension": {
      title: "维度管理",
      markers: [
        note(
          "EX-017", "dimension", "",
          "维度模板与指标",
          "现网 list.vue：筛选模板名称、状态；列维度模板名称、描述、维度指标数、维度ID、创建时间、状态、创建人。抽屉编辑：维度模板名称（最多 20 字）、描述（最多 50 字）、维度指标行（指标名称最多 4 字、指标备注、上移/下移/删除）。",
          "复刻保留列表与抽屉。指标行支持增删与上下移；至少保留一行。启用/禁用、编辑、删除按 status 控制。",
          [
            row("维度模板名称", "输入", "是", "最多 20 字。"),
            row("描述", "多行文本", "否", "最多 50 字。"),
            row("维度指标名称", "输入", "是", "最多 4 字。"),
            row("指标备注", "输入", "否", "说明该指标。"),
            row("上移 / 下移 / 删除", "按钮", "否", "第一行不能上移，最后一行不能下移。"),
            row("添加指标", "按钮", "否", "追加一行。")
          ],
          "GET exam/dimensionality/dic/list?typeFlag=1\nGET exam/dimensionality/dic/detail\nPOST exam/dimensionality/dic/create\nPUT exam/dimensionality/dic/modify\nPUT exam/dimensionality/dic/putaway\nPUT exam/dimensionality/dic/shelves",
          "维度管理 → 模板表单：维度模板下拉；维度指标 → 题目关联维度。"
        )
      ]
    },

    "category": {
      title: "分类管理",
      markers: [
        note(
          "EX-018", "category", "",
          "分类与金刚区",
          "现网 gategoryList.vue：筛选分类名称、状态；列图标、分类名称、分类ID、状态、排序值、创建时间、展示在金刚区、创建人。抽屉编辑：图标 120×120、分类名称（最多 6 字）、展示在金刚区、排序值。禁用会级联下架模板和商品。",
          "复刻保留列表、抽屉、详情。展示在金刚区用开关；禁用弹确认，文案明确级联下架模板与商品。排序值可直接改。",
          [
            row("图标", "上传", "是", "建议 120×120。"),
            row("分类名称", "输入", "是", "最多 6 字。"),
            row("展示在金刚区", "开关", "否", "showFlag=1 展示。"),
            row("排序值", "数字", "是", "H5 金刚区排序。"),
            row("状态", "开关", "否", "启用/禁用。"),
            row("详情", "抽屉", "否", "图标、名称、金刚区、排序、创建人、创建时间。")
          ],
          "GET exam/exam/gategory/list\nPOST exam/exam/gategory/create\nPUT exam/exam/gategory/modify\nPUT exam/exam/gategory/putaway\nPUT exam/exam/gategory/shelves\nPUT exam/exam/gategory/showFlagPutaway\nPUT exam/exam/gategory/showFlagShelves\nDELETE exam/exam/gategory/remove",
          "分类管理 → 模板/商品：分类下拉与分类列；分类禁用 → 模板与商品级联下架；金刚区 → H5 首页。"
        )
      ]
    }
  };

  window.EXAM_NOTES = PAGES;
})();
