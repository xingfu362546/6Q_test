# Research: 6Q 测评复刻

## 1. 源码获取

### 后台 `sixQEducation-platform`

- SSH：`git@codeup.aliyun.com:6q/feijin/sixQEducation-platform.git`，可访问。
- 本地只读：`_ref/platform`。
- 关键文件：
  - `src/config/routers/exam.js`
  - `src/views/exam/templete/{list,form,detail}.vue`
  - `src/views/exam/templete/components/*`
  - `src/views/exam/goods/{list,form,detail}.vue`
  - `src/views/exam/{gategory,dimensionality,subject,overallinfo,appraise,data,mental}/*`

### H5 `exam2.0`

- SSH 已开通，本地只读：`_ref/exam2.0`。
- 技术栈：Vue 3 + Vant 4 + Pinia + Vue Router + ECharts + html2canvas + Vite 5。
- 路由：`/index`（examMenu）、`/login`、`/details`、`/examNotice`、`/preExam`、`/examQuestion`、`/examResult`、`/myExamHistory`、`/orderConfirm`、`/orderPay`。
- 视图目录：`src/views/{examMenu,loginPage,examDetail,examNotice,preExam,examQuestion,examResult,myExamHistory,orderConfirm,orderPay}`。
- 视觉：桃色底 `#FFD6C1` / `#FFF4EE` / `#F8F8F8`，主橙 `#FF9E4D`，强调 `#FF8E79`；雷达网格 `#FEE3D4`、区域 `rgba(255,177,153,.6)`。
- rem：`html.style.fontSize = min(width, 430) / 31 + 'px'`。

## 2. 后台模块结论

`exam.js` 明确 9 个模块：

1. 测评模板管理（列表 / 新增 / 编辑 / 详情）
2. 测评商品管理（列表 / 新增 / 编辑 / 详情）
3. 测评介绍
4. 测评反馈
5. 预约老师留言
6. 测评数据（明细 / 汇总）
7. 测评主题
8. 维度管理
9. 分类管理

## 3. 关键口径

- 模板总分 = 每题选项最高分累加。
- 模板禁用以 `status=2` 表示，会级联下架商品。
- 分类禁用会级联下架模板与商品。
- 商品「展示到心画」由 `heartFlag` 控制，H5 只展示 `status=1 && heartFlag=1`。
- 主题 `status=1` 才在 H5 首页展示。
- 结果页四个开关：总分、维度图、正态分布、6Q 和谐指数。
- 预约枚举：课程咨询 / 测评解读 / 心理陪伴 / 合作咨询；跟进状态：待跟进 / 已联系 / 已完成。

## 4. H5 复刻结论

| 项 | 源码结论 |
| --- | --- |
| 首页 | 左侧分类纵向 Tab + 右侧测评列表 + 最新/热门/价格排序（`examMenu.vue`） |
| 详情 | 头图、价格、人数、副标题、详情、收藏、立即测试（`examDetail.vue`） |
| 须知 | `answerSummary`，`agedTag` 分支年龄页/答题页（`examNotice.vue`） |
| 年龄 | 大于 0 才可继续（`preExam.vue`） |
| 答题 | 题号、选项、选中自动下一题、累计用时、上一题/提交（`examQuestion.vue`） |
| 结果 | 头像+总分、雷达/分布切换、resultDemo、整体解读、各类详解、建议、6Q 雷达、推荐课程/商城、反馈、海报（`examResult.vue`） |
| 我的测评 | 6Q 雷达、未完成/已完成、记录卡片、查看报告/再测一次（`myExamHistory.vue`） |
| 订单 | 确认订单、余额抵扣、农行支付（`orderConfirm.vue` / `orderPay.vue`） |
| 登录 | 账号/密码，密码 MD5（`loginPage.vue`） |

## 5. 设计决策

1. 后台复用领袖营 Shell，而不是重写一套布局，满足「同一套项目」要求。
2. 后台列表配置化，复杂表单独立渲染，避免一个文件堆所有逻辑。
3. H5 用 localStorage 跑通断点续答与个人链路，评审可实际操作。
4. 图表用原生 SVG，海报用 canvas，不引入第三方依赖。
5. 注释统一五段式，红色序号与功能编号绑定。
6. 功能清单同时覆盖后台与 H5，作为唯一入口。

## 6. 未决问题

- `exam2.0` 页面清单、路由、视觉 token。
- H5 微信授权、分享、支付 SDK 的真实调用。
- 后台导入分数、导入题目、二维码下载的真实文件格式。
- 题目是否只有单选；是否有量表题、多选题。
- 结果页「6Q 和谐指数」的真实计算公式。

## 7. 验证记录

- `node --check` 通过：后台 5 个 JS、H5 4 个 JS。
- 浏览器验证：后台模板列表 / 商品列表 / 测评数据 / 主题 / 模板详情；H5 首页 / 详情 / 须知 / 年龄 / 答题 / 结果 / 海报 / 我的测评 / 确认订单 / 支付 / 登录。
- 交互验证：答题选项 → 下一题 → 提交 → 结果 → 历史记录链路可跑通。
