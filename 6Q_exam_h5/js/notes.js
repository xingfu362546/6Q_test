/**
 * 6Q 测评 H5 · 页面注释（按 exam2.0 路由）
 * 过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流
 */
(function () {
  "use strict";

  function row(name, control, required, notes, kind) {
    return { name: name, control: control, required: required, notes: notes, kind: kind || "" };
  }
  var LABEL = {
    basePast: "过往逻辑 · v2.0.0",
    baseNow: "现在的逻辑 · v2.0.0",
    newNow: "现在的逻辑 · v2.1.0"
  };

  function note(req, key, name, past, now, rows, api, flow, labels) {
    return {
      req: req, key: key, name: name, past: past, now: now, rows: rows, api: api, flow: flow,
      pastLabel: (labels && labels.past) || LABEL.basePast,
      nowLabel: (labels && labels.now) || LABEL.baseNow
    };
  }

  var PAGES = {
    menu: {
      title: "6Q测评 · 首页",
      markers: [
        note(
          "EX-101", "menu-main", "首页结构与分类",
          "exam2.0 的 /index 指向 examMenu.vue。左侧分类纵向 Tab，右侧测评列表；顶部标题 6Q测评、副标题取 getInfosAndSubjects 的 title，右上角「我的测评」。",
          "复刻保留左侧分类、右侧列表与「我的测评」入口。分类取分类接口；首屏选中第一个分类。顶部副标题用模拟文案。",
          [
            row("标题", "文本", "否", "固定「6Q测评」."),
            row("副标题", "文本", "否", "取接口 title，两行截断。"),
            row("我的测评", "入口", "否", "跳 /myExamHistory。"),
            row("左侧分类", "Tab", "否", "纵向，选中项白底 + 橙色竖条。")
          ],
          "GET api/homeAbout/getInfosAndSubjects\nGET api/homeAbout/getListAllCategorys",
          "分类接口 → 首页左侧；测评列表接口 → 右侧。"
        ),
        note(
          "EX-102", "menu-sort", "分类切换与排序",
          "examMenu 支持左侧分类切换，右侧按最新 / 热门 / 价格排序（orderType 1/2/3），列表分页 pageSize=10，触底加载。",
          "复刻保留三个排序与分类切换；分页一次性渲染，不请求后端。空分类显示「暂时没有该类测评」。",
          [
            row("最新", "排序", "否", "默认，orderType=1。"),
            row("热门", "排序", "否", "orderType=2，按测试人数。"),
            row("价格", "排序", "否", "orderType=3，按价格升序。"),
            row("总数", "文本", "否", "共 N 个测评。")
          ],
          "GET api/menuAbout/getListGoodsByCategoryId",
          "分类/排序 → 列表重新请求；列表 → 详情携带 goodsId。"
        ),
        note(
          "EX-103", "menu-card", "测评卡片",
          "卡片：标题、副标题、价格（iOS/Android 取不同字段，空则限时免费）、测试人数、封面、底部「立即测试 >」。点击跳 /details?goodsId=。",
          "复刻卡片结构与跳转一致；封面取商品封面，价格取 Android 价。",
          [
            row("标题", "文本", "否", "单行省略。"),
            row("副标题", "文本", "否", "单行省略。"),
            row("价格", "文本", "否", "￥ 或限时免费。"),
            row("测试人数", "文本", "否", "N人已测。"),
            row("立即测试", "按钮", "否", "跳详情。")
          ],
          "GET api/menuAbout/getListGoodsByCategoryId",
          "卡片 → /details?goodsId=。"
        )
      ]
    },

    login: {
      title: "测评登录",
      markers: [
        note(
          "EX-116", "login", "账号密码登录",
          "exam2.0 登录页是账号 / 密码，密码 MD5 后请求 userLogin，成功写 token 并 router.back()。测试账号 13925806313。",
          "复刻保留账号 / 密码输入和登录按钮；空值时自动填测试账号；登录写 exam_user，返回上一页或首页。",
          [
            row("账号", "输入", "是", "手机号 / 账号。"),
            row("密码", "密码", "是", "MD5 后提交。"),
            row("登录", "按钮", "否", "成功写 token，返回上一页。"),
            row("Logo", "图片", "否", "6Qlogo.png。")
          ],
          "POST api/user/userLogin",
          "登录 → localStorage token + exam_user；回详情 / 结果。"
        )
      ]
    },

    detail: {
      title: "测评详情",
      markers: [
        note(
          "EX-104", "detail", "详情头图与购买",
          "examDetail.vue：头图、价格、名称、测试人数、副标题、详情富文本；底部收藏 + 立即测试。已购买过弹「去支付 / 查看报告 / 取消」；有未完成记录弹「去完成测评」。",
          "复刻保留头图、价格、名称、人数、副标题、详情、收藏与立即测试。已购/未完成提示用本地记录模拟。",
          [
            row("头图", "图片", "否", "examImg。"),
            row("价格", "文本", "否", "iOS/Android 价，空则限时免费。"),
            row("名称 / 人数", "文本", "否", "商品名 + virtualTesters。"),
            row("详情", "富文本", "否", "examDescription。"),
            row("收藏", "按钮", "否", "写收藏接口。"),
            row("立即测试", "按钮", "否", "校验购买/未完成记录后进须知。")
          ],
          "GET api/detailAbout/getDetailByGoodsId\nGET api/detailAbout/getByTempleteId\nPOST api/favourite/add",
          "首页 → 详情 goodsId；详情 → 须知 templeteId + goodsId。"
        ),
        note(
          "EX-117", "detail-poster", "详情海报分享",
          "详情页右上角分享：createShare 生成二维码，DetailPosters 用 html2canvas 生成 550×956 海报，提示「点击保存至相册」。",
          "复刻用 HTML 海报弹窗展示封面、标题、价格、二维码；下载用 canvas 生成 PNG。",
          [
            row("分享", "图标", "否", "打开海报弹窗。"),
            row("海报", "图片", "否", "550×956 比例。"),
            row("保存", "按钮", "否", "canvas 下载 PNG。")
          ],
          "POST api/share/createShare",
          "详情 → 海报：读取商品与二维码；保存只下载本地图片。"
        )
      ]
    },

    notice: {
      title: "测评须知",
      markers: [
        note(
          "EX-105", "notice", "须知与开始答题",
          "examNotice.vue：显示 answerSummary；点「我已阅读，开始答题」时，agedTag=true 去 /preExam，否则直接 /examQuestion。",
          "复刻保留须知卡片与按钮；按商品 agedTag 分支到年龄页或答题页。",
          [
            row("须知内容", "富文本", "否", "answerSummary。"),
            row("开始答题", "按钮", "否", "agedTag 分支。")
          ],
          "GET api/detailAbout/getTempleteAndQuestionById",
          "详情 → 须知：templeteId + goodsId；须知 → 年龄/答题。"
        )
      ]
    },

    preExam: {
      title: "测评页 · 年龄",
      markers: [
        note(
          "EX-106", "preExam", "年龄必填",
          "preExam.vue：agedTag=true 时先填年龄，校验大于 0 后写 store.ageNumber，再进 /examQuestion。",
          "复刻保留年龄输入与校验；年龄写 localStorage exam_age，进入答题。",
          [
            row("年龄", "数字输入", "是", "例如 14，必须大于 0。"),
            row("开始答题", "按钮", "否", "校验后进答题。")
          ],
          "无独立接口（随答题提交 age）",
          "年龄 → exam_age → 答题提交带上 age。"
        )
      ]
    },

    quiz: {
      title: "测评页 · 答题",
      markers: [
        note(
          "EX-107", "quiz-question", "答题与自动下一题",
          "examQuestion.vue：顶部题号，题干，选项胶囊；选中选项后自动 500ms 进入下一题；最后一题出现「上一题 / 提交」；底部显示累计用时 HH : MM : SS。",
          "复刻保留题号、题干、选项、自动下一题、上一题/提交、累计用时。选项选中态为浅橙底 + 橙色字。",
          [
            row("题号", "文本", "否", "当前 / 总数，大号橙色。"),
            row("题干", "富文本", "否", "支持多行。"),
            row("选项", "按钮", "是", "胶囊，选中 #FFEDE5 / #FE763A。"),
            row("累计用时", "文本", "否", "HH : MM : SS。"),
            row("上一题 / 提交", "按钮", "否", "最后一题显示。")
          ],
          "GET api/detailAbout/getTempleteAndQuestionById",
          "答题 → 提交 submitAnawer → 结果 checkId。"
        ),
        note(
          "EX-108", "quiz-submit", "提交与退出确认",
          "提交前校验当前题已选；退出答题弹「确定要退出测评答题？退出后作答历史将不会保存」。",
          "复刻保留退出确认与提交校验；提交后写 exam_records 并跳结果页。",
          [
            row("提交", "按钮", "否", "校验后提交。"),
            row("退出确认", "弹窗", "否", "确认后回详情。")
          ],
          "POST api/checkAbout/submitAnawer",
          "答题 → exam_records → 结果页。"
        )
      ]
    },

    result: {
      title: "测评结果",
      markers: [
        note(
          "EX-109", "result-score", "结果头部与总分",
          "examResult.vue：头像 + 姓名，showTotalScore 时显示「你的测试总分为 X 分数」。图表可在维度雷达 / 正态分布间切换；两个开关都关时不显示图表。",
          "复刻保留头像、姓名、总分、图表切换。总分来自答题计分；图表用 SVG 绘制。",
          [
            row("头像 / 姓名", "展示", "否", "默认头像 + 会员姓名。"),
            row("总分", "数字", "否", "showTotalScore 控制。"),
            row("图表切换", "Tab", "否", "维度雷达 / 正态分布。")
          ],
          "GET api/checkAbout/viewCheckResult",
          "答题提交 → checkId → 结果。"
        ),
        note(
          "EX-110", "result-chart", "雷达图 / 正态分布",
          "RadarEcharts 用 ECharts 雷达，BarEcharts 用柱 + 折线 + 用户位置标线；AllRadarEcharts 画 6Q 和谐指数。",
          "复刻用原生 SVG 画雷达、柱线分布与 6Q 雷达；配色按源码桃色系。",
          [
            row("维度雷达", "SVG", "否", "showDimensionalityImage。"),
            row("正态分布", "SVG", "否", "showDistributionImage。"),
            row("6Q和谐指数", "SVG", "否", "showHarmonyImage；未点亮维度显示为 0。")
          ],
          "GET api/checkAbout/viewCheckResult\nGET api/checkAbout/getZtfbScore",
          "结果数据 → 图表；不写回。"
        ),
        note(
          "EX-111", "result-detail", "解读 / 建议 / 历史",
          "结果页展示 resultDemo、整体解读 base、各类详解 allWeiduExplainList、建议 suggestList；「历史测评记录」打开 ExamHistory 弹窗。",
          "复刻保留 resultDemo、整体解读、各类详解、建议盒与历史入口；历史入口跳 myExamHistory。",
          [
            row("结果介绍", "富文本", "否", "resultTitle + resultDemo。"),
            row("整体解读", "文本", "否", "explain.base。"),
            row("各类详解", "列表", "否", "维度名称 + detail。"),
            row("建议", "列表", "否", "suggestList，橙底「建议」角标。"),
            row("历史记录", "入口", "否", "跳我的测评。")
          ],
          "GET api/checkAbout/viewCheckResult",
          "结果 → 历史：同一会员记录。"
        ),
        note(
          "EX-112", "result-feedback", "结果页反馈",
          "结果页底部评分 1-5 星 + 反馈内容（最多 500 字），提交后 getFeedback 回填并锁定输入。",
          "复刻保留星级、文字、提交；提交写 exam_feedbacks，按钮变已提交。",
          [
            row("评分", "星级", "是", "1-5 星，默认 0。"),
            row("反馈内容", "多行文本", "否", "最多 500 字。"),
            row("提交反馈", "按钮", "否", "未评分不可提交。")
          ],
          "POST api/checkAbout/submitFeedback\nGET api/checkAbout/getFeedback",
          "结果 → exam_feedbacks → 后台测评反馈。"
        ),
        note(
          "EX-201", "rb-head", "报告头与测评日期",
          "v2.0.0 结果页：顶部只有返回与「测评结果」标题，没有报告头，也没有测评日期；「计分规则」入口不存在。",
          "v2.1.0 新版式新增报告头：大标题「测评报告」+ 测评日期（取记录创建时间）。「计分规则」按钮按本轮决定先隐藏，类名与位置预留，后续放开时无需改动布局。",
          [
            row("报告标题", "文本", "否", "固定「测评报告」。", "new"),
            row("测评日期", "文本", "否", "取记录 createTime，格式 YYYY-MM-DD HH:mm:ss。", "new"),
            row("计分规则", "按钮", "否", "本轮隐藏，位置预留。", "new"),
            row("分享入口", "图标", "否", "打开觉醒海报。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（取 check.createTime）",
          "答题提交 → exam_records.createTime → 报告头日期。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-202", "rb-band", "档位结论与超越百分比",
          "v2.0.0 结果页：总分 + 雷达 / 正态分布 + 整体解读，解读取 explain.base，没有档位、勋章、超越百分比概念。",
          "v2.1.0 新版式按总分命中三档（0-23 / 24-47 / 48-60），每档唯一勋章、金句、超越百分比。百分比按档位固定 95% / 45% / 15%，报告与海报同口径。并列不处理，档位只取一个。",
          [
            row("总分", "文本", "否", "记录 score，满分 60。", "new"),
            row("五维雷达", "SVG", "否", "维度名 + 该维得分，每维上限 12。", "new"),
            row("超越百分比", "文本", "否", "档位固定值，后台可配。", "new"),
            row("档位解读", "文本", "否", "取 results[命中档位].base。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（templete.results[] 含 badge / quote / percentile）",
          "模板结果表 → 档位 → 报告结论与海报金句，同一份数据。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-203", "rb-pain", "核心卡点",
          "v2.0.0 结果页：只按维度列出 detail 与 suggest，没有「核心卡点」这个概念，也没有最低分维度的单独定位。",
          "v2.1.0 新增核心卡点卡：取五维中最低分维度，按固定优先序（情感链接力 → 走心沟通力 → 边界松弛力 → 赋能托底力 → 自我觉察力）解决并列，不随机，保证同一份答卷反复打开结果一致。文案由后台维度解读承载。",
          [
            row("卡点维度", "文本", "是", "最低分维度，并列按固定顺序取首个。", "new"),
            row("卡点说明", "文本", "是", "取该维 detail；留空则整块隐藏。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（scoreList + weiduExplainList）",
          "scoreList → 取最低维 → weiduExplainList 对应 detail → 卡点卡。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-204", "rb-risk", "孩子正在经历什么",
          "v2.0.0 结果页：没有任何风险预警模块，解读全部是中性描述。",
          "v2.1.0 新增风险预警卡，文案取模板字段 riskTip。模板未配时回退到卡点文案里的 risk，两者都为空则整块不渲染，不出现空卡片。",
          [
            row("风险提示", "多行文本", "否", "模板 riskTip，为空回退卡点 risk。", "new"),
            row("卡片标题", "文本", "否", "固定「您的孩子正在经历什么？」。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（templete.riskTip）",
          "模板配置 → viewCheckResult → 风险卡。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-205", "rb-cta", "深度了解与底部预约 CTA",
          "v2.0.0 结果页：底部是结果页反馈 + 课程商城双 Tab，没有固定 CTA，也没有导师二维码入口。",
          "v2.1.0 底部改三层：呼吸动画主 CTA「预约导师 1v1 解读」→ 弹二维码抽屉；下方保留「查看历史测试记录 / 再答一次」双按钮。课程商城并入「深度了解」卡。动画只用 CSS（呼吸缩放 + 光晕 + 箭头位移），遵循 prefers-reduced-motion。",
          [
            row("深度了解文案", "多行文本", "否", "模板 ctaText，为空整卡隐藏。", "new"),
            row("预约 CTA", "按钮", "否", "呼吸动画，点击开二维码抽屉。", "new"),
            row("导师二维码", "图片", "否", "模板 ctaQrCode，缺省用占位图。", "new"),
            row("查看历史测试记录", "按钮", "否", "跳我的测评。", "new"),
            row("再答一次", "按钮", "否", "回须知页重新开始。", "new"),
            row("精选课程", "列表", "否", "并入深度了解卡。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（templete.ctaText / ctaSubText / ctaQrCode）\nGET /exam/app/api/listGoodsInfoByTypeAndIds",
          "模板配置 → viewCheckResult → 深度了解卡与底部 CTA；二维码不新增接口。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-206", "rb-poster", "觉醒海报（深绿金 9:16）",
          "v2.0.0 海报：550×956 深蓝渐变，只有标题、总分、雷达与通用二维码，没有勋章、金句与从众背书。",
          "v2.1.0 海报改深绿金 9:16：勋章称号、觉醒金句、五维雷达、超越百分比、参与人数背书、带参二维码。头像取本地用户，推荐人用昵称，「打卡第 X 天」按本轮决定隐藏。旧版式商品仍用旧海报。",
          [
            row("勋章称号", "文本", "是", "取命中档位 badge，仅一个。", "new"),
            row("觉醒金句", "文本", "是", "取命中档位 quote。", "new"),
            row("参与人数", "文本", "否", "取模板虚拟测试人数。", "new"),
            row("二维码", "图片", "否", "占位图，真实环境用 createShare 返回。", "new"),
            row("打卡天数", "文本", "否", "本轮隐藏。", "new")
          ],
          "POST /security/api/user/share/center/createShare（真实环境取带参二维码）\nGET /exam/app/api/viewCheckResult",
          "结果记录 → 档位 → 海报；二维码真实环境由 createShare 生成。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-207", "rb-poster-data", "海报雷达图的取数规则",          "v2.0.0 海报的雷达按维度百分比直接画（scoreList 的 value 已是 score/maxScore×100），没有还原成原始得分，也没有标注每维实际分数；海报上不显示维度分数。",
          "v2.1.0 海报雷达取数规则固定为四步：\n1、取该次测评记录的 dims（五维，元素含 value 百分比）；\n2、每维上限 maxPer = round(记录总分 ÷ 维数)（五力即 12 分）；\n3、还原原始得分 raw = round(value ÷ 100 × maxPer)；\n4、按 raw ÷ maxPer 归一化画点，并在维度名下方标 (raw分)。\n无测评记录时（详情页分享海报）退化为各维固定 8 分的示意值，不谎报成绩。\n报告与海报使用同一份 dims，保证同一份答卷两处图形一致。",
          [
            row("雷达取数", "规则", "是", "record.dims → 按每维上限还原原始分。", "new"),
            row("每维上限", "推导", "是", "round(总分 ÷ 维数)，五力为 12。", "new"),
            row("无记录兜底", "规则", "否", "详情页分享用各维 8 分示意值。", "new"),
            row("维度标注", "文本", "否", "维度名下方标该维得分。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（scoreList 提供 name / score / maxScore）",
          "答题记录 → dims（百分比）→ 还原原始分 → 海报雷达；与报告页同一数据源。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-211", "rb-appreciate", "这些力，值得欣赏",
          "v2.1.0 报告只有核心卡点，做得好的维度没有任何反馈，家长只看见「我哪里不行」；档位描述还会重复一次「你已经超过了 X% 的家长」，与结论行冗余。",
          "v2.2 新增「这些力，值得欣赏」版块，并去掉结论区的重复句话。\n展示规则：\n1、候选为排除核心卡点维度后的其余 4 个维度；\n2、维度分 ≥ 每维满分 × 2/3（五力即 8 分）才入选，按分数降序；\n3、最多展示 3 条；\n4、若 4 个非卡点维度全部低于 8 分，取最高分那 1 个，文案改用「相对优势版」，保证人人至少 1 条；\n5、核心卡点维度永不出现在欣赏列表。\n位置：核心卡点 → 孩子正在经历什么 → 这些力值得欣赏。规格书原稿是插在卡点之后、风险之前，按需求方口径改为先卡点与风险、后欣赏。\n文案：按维度从后台「各维度指标结果」取，句式「欣赏你 + 行为白描 + 意义升华」，小建议单独成行用绿色底。",
          [
            row("版块标题", "文本", "否", "「这些力，值得欣赏 🌟」。", "new"),
            row("入选阈值", "规则", "是", "维度分 ≥ 每维满分 × 2/3。", "new"),
            row("数量上限", "规则", "是", "最多 3 条，按分数降序。", "new"),
            row("兜底", "规则", "是", "全低于阈值时取最高分 1 条，用相对优势版。", "new"),
            row("维度标题", "文本", "否", "【维度名】（X 分）。", "new"),
            row("小建议", "文本", "否", "绿色底，与卡点区呼应。", "new"),
            row("结论去重", "规则", "是", "档位描述剥掉重复的「超越 X%」前缀。", "new")
          ],
          "GET /exam/app/api/viewCheckResult（weiduExplainList[] 携带 painText / riskText / appreciate / appreciateTip / appreciateAlt）",
          "维度指标结果配置 → viewCheckResult → 排除卡点维度 → 阈值筛选与排序 → 欣赏版块；与计分、分档、卡点算法解耦。",
          { now: "现在的逻辑 · v2.2" }
        )
      ]
    },

    entry: {
      title: "扫码进入 · 分流校验",
      markers: [
        note(
          "EX-208", "entry-flow", "扫码进入的分流与免费无感建单",
          "v2.0.0：海报二维码只指向详情页，没有独立落地页。历史上测评必须先有订单，用户从订单点「测试」才能进测评，因此免费测评也要先下单，路径是「详情 → 确认订单 → 支付 0 元 → 订单 → 测试」，共 4 步且中途容易流失。",
          "v2.1.0 新增统一落地页 entry.html，按商品价格分两条分支：\n1、免费（price = 0）：自动生成免费订单（状态已完成、金额 0）→ 直接进测评须知，用户无感，不需要点支付；已有同类免费订单则复用，不重复建单。\n2、收费（price > 0）：跳商品详情页，由用户自行下单支付，不代下单。\n判定只用价格，不看是否有折扣或券；免费订单金额恒为 0，不参与退款与结算。\n落地页有「校验登录 → 开通订单 → 进入测评」三段状态文案，全过程不出现支付页。",
          [
            row("免费分支", "规则", "是", "price=0 → 建免费订单 → 测评须知。", "new"),
            row("收费分支", "规则", "是", "price>0 → 商品详情页。", "new"),
            row("免费订单", "数据", "是", "金额 0、状态已完成、渠道 scan_free。", "new"),
            row("订单复用", "规则", "否", "同商品已有免费订单不再新建。", "new"),
            row("状态文案", "文本", "否", "校验登录 / 开通订单 / 进入测评。", "new")
          ],
          "POST exam/order/create（免费商品下单，金额 0）\nGET exam/exam/templete/detail（取商品与模板）",
          "扫码 → entry.html（带 goodsId / ref）→ 判定价格 → 免费建单并进须知 / 收费进商品详情。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-209", "entry-referral", "推荐关系的继承",
          "v2.0.0：海报二维码由 createShare 生成，带分发人 userId；但 H5 没有落库推荐关系，用户从海报进入后即使下单，订单里也没有推荐人，跨端业绩无法归属。",
          "v2.1.0 在进入链路里补齐推荐关系：\n1、海报二维码地址带 ref（分发人标识）与 goodsId；\n2、落地页第一时间写入 exam_referral，未登录也先落库，避免登录跳转丢失；\n3、已有推荐人时以首次为准，不被后一次分享覆盖；\n4、免费订单与收费订单都写入 referrer 字段，随订单提交到业务系统；\n5、订单确认页显示推荐人，便于核对归属。",
          [
            row("ref 参数", "URL", "是", "分发人标识，来自 createShare。", "new"),
            row("推荐关系落库", "本地", "是", "exam_referral，未登录也写。", "new"),
            row("首次优先", "规则", "是", "已有推荐人不被覆盖。", "new"),
            row("订单 referrer", "字段", "是", "免费与收费订单都写。", "new"),
            row("推荐人展示", "文本", "否", "订单确认页提示归属。", "new")
          ],
          "POST /security/api/user/share/center/createShare（生成带 ref 的链接）\nPOST exam/order/create（订单带 referrer）",
          "海报 → 二维码带 ref → 落地页落库 → 订单携带 referrer → 业务系统按推荐人归属。",
          { now: "现在的逻辑 · v2.1.0" }
        ),
        note(
          "EX-210", "entry-login", "扫码进入的登录校验",
          "v2.0.0：H5 只有账号密码登录页，登录后固定返回上一页；没有扫码场景的登录拦截，也无法把用户送回原本要打开的商品。",
          "v2.1.0 增加扫码准入校验：\n1、落地页先判登录态（本地 exam_session 是否有 token），未登录先跳登录页；\n2、登录页支持 redirect，登录成功后回到落地页继续，不是简单返回上一页；\n3、跳登录前先把推荐关系与目标商品写入本地，登录回来参数不丢；\n4、H5 与 APP 内嵌（含微信 / 凡泰环境）一律要求登录，不因容器而跳过；\n5、登录成功后才执行建单与进入测评，未登录不产生任何订单。\n边界：已登录用户直接进分支，不再二次弹登录。",
          [
            row("登录态判断", "规则", "是", "exam_session.token 存在即已登录。", "new"),
            row("redirect 回跳", "参数", "是", "登录后回落地页继续。", "new"),
            row("参数保留", "规则", "是", "跳登录前先存商品与推荐关系。", "new"),
            row("APP 内嵌", "规则", "是", "与 H5 同样要求登录。", "new"),
            row("未登录建单", "规则", "是", "禁止，登录后才建单。", "new")
          ],
          "POST /security/api/user/login（真实环境，返回 token）\nGET /security/api/user/info（取会员信息）",
          "扫码 → 落地页 → 未登录跳登录 → 登录成功回跳 → 建单 → 进测评。",
          { now: "现在的逻辑 · v2.1.0" }
        )
      ]
    },

    history: {
      title: "我的测评",
      markers: [
        note(
          "EX-113", "history", "记录与 6Q 雷达",
          "myExamHistory.vue：顶部 6Q 和谐指数雷达（6 个维度，未点亮显示「未点亮」），下面未完成 / 已完成 Tab，列表含封面、名称、状态、支付时间、订单编号、价格；已完成可查看报告 / 再测一次。",
          "复刻保留 6Q 雷达、未完成/已完成切换、记录卡片与操作；未完成取本地进度，已完成取 exam_records。",
          [
            row("6Q雷达", "SVG", "否", "六个维度，未点亮为 0。"),
            row("未完成 / 已完成", "Tab", "否", "切换列表。"),
            row("记录卡片", "列表", "否", "封面、名称、状态、时间、订单号、价格。"),
            row("查看报告", "按钮", "否", "已完成显示。"),
            row("再测一次", "按钮", "否", "已完成显示，回详情。")
          ],
          "GET api/myExamHistory/getMyExamHistoryList\nGET api/myExamHistory/getMyExamData",
          "答题记录 / 进度 → 我的测评；查看报告 → 结果。"
        )
      ]
    },

    orderConfirm: {
      title: "确认订单",
      markers: [
        note(
          "EX-114", "orderConfirm", "确认订单",
          "orderConfirm.vue：商品行、商品价格、共 1 件、总价、底部合计与提交订单；提交跳 /orderPay?orderId=。",
          "复刻保留商品行、价格明细、底部合计与提交；提交带 goodsId 与模拟订单号进支付页。",
          [
            row("商品行", "列表", "否", "封面、名称、价格、x1。"),
            row("商品价格 / 总价", "文本", "否", "同商品价。"),
            row("提交订单", "按钮", "否", "进支付页。")
          ],
          "POST api/order/createOrder",
          "详情 → 订单确认 → 支付。"
        )
      ]
    },

    orderPay: {
      title: "选择支付方式",
      markers: [
        note(
          "EX-115", "orderPay", "余额抵扣与农行支付",
          "orderPay.vue：应付金额、余额抵扣勾选、支付金额、支付方式（农行支付）、提交订单。",
          "复刻保留抵扣勾选、支付金额联动、农行支付勾选与提交；提交只 toast + 跳我的测评。",
          [
            row("应付金额", "文本", "否", "商品价。"),
            row("余额抵扣", "勾选", "否", "勾选减 20。"),
            row("支付金额", "文本", "否", "应付 - 抵扣。"),
            row("农行支付", "勾选", "否", "默认选中。"),
            row("提交订单", "按钮", "否", "支付成功提示。")
          ],
          "POST api/order/pay",
          "支付成功 → 我的测评 / 详情。"
        )
      ]
    }
  };

  window.H5_NOTES = PAGES;
})();
