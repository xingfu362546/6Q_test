# Implementation Plan: 6Q 测评复刻

**Feature**: `001-exam-replica`  
**Version**: `v2.0.0`  
**Strategy**: 静态原型优先，后台复用领袖营 Shell，H5 独立移动端，Spec 与注释同步交付。

## 1. Technical Context

| 项 | 选择 | 原因 |
| --- | --- | --- |
| 后台形态 | 静态 HTML + CSS + 原生 JS | 与领袖营复刻一致，无构建依赖，评审可直接打开 |
| 后台框架 | 复用领袖营 Shell：顶栏 / 侧栏 / 面包屑 / 表格 / 抽屉 / 注释面板 | 满足「同一套项目框架」要求 |
| H5 形态 | 静态 HTML + CSS + 原生 JS，移动端优先 | 可独立部署、可嵌手机框、无依赖 |
| H5 状态 | `localStorage` | 支持登录会员、答题记录、结果页反馈、订单 |
| 图表 | 原生 SVG / Canvas | 雷达、分布、圆环、海报下载，无第三方库 |
| 数据 | 前台 mock（JS 对象） | 不接后端，刷新可复位 |
| 注释 | 五段式 + 红点 | 沿用领袖营规范，补接口与数据流 |
| Spec | `specs/001-exam-replica/` | 需求、方案、任务、数据模型、契约、研究、验收齐全 |

## 2. Project Structure

```text
6Q_test/
├─ index.html                     项目入口
├─ README.md / CHANGELOG.md       v2.0.0 说明与版本记录
├─ docs/
│  ├─ FEATURES.md                 功能清单（EX-001 起）
│  ├─ CONVENTIONS.md              注释规范 / 交付规范
│  └─ REFERENCE.md                源码路由、接口、字段对照
├─ specs/001-exam-replica/
│  ├─ spec.md / plan.md / tasks.md
│  ├─ data-model.md / research.md
│  ├─ contracts/api.md
│  ├─ quickstart.md / checklist.md
├─ assets/covers/                 封面、二维码 SVG
├─ 6Q_exam_battalion/
│  ├─ index.html                  后台功能清单
│  ├─ replica.html                后台 Shell
│  ├─ placeholder.html            非测评模块占位
│  ├─ css/tokens.css, shell.css, pages.css
│  └─ js/data.js, pages-catalog.js, notes.js, shell.js, engine.js
└─ 6Q_exam_h5/
   ├─ index.html / login.html / detail.html / notice.html
   ├─ pre-exam.html / quiz.html / result.html / history.html
   ├─ order-confirm.html / order-pay.html
   ├─ css/h5.css, source.css
   ├─ assets/source/（源码图标与背景图）
   └─ js/data.js, core.js, pages.js, notes.js
```

## 3. Architecture Decisions

### 3.1 后台：配置驱动列表 + 特殊页

- `pages-catalog.js` 描述列表页的筛选、列、工具栏、行操作。
- `engine.js` 负责通用渲染与交互；模板表单、详情、商品表单、测评数据作为特殊页单独渲染。
- `notes.js` 按页面 id 组织五段式注释；`shell.js` 负责红点绘制与面板。
- 写操作只改内存对象，刷新复位；跨页数据流通过共享 `EXAM_DATA` 模拟。

### 3.2 H5：核心工具 + 页面渲染器

- `core.js`：本地存储、结果计算、SVG 图表、Toast、弹窗、底部导航、注释。
- `pages.js`：按 `body[data-page]` 渲染 10 个源码路由页；页面之间用相对链接跳转。
- `data.js`：商品、分类、主题、题目、结果、维度。
- `notes.js`：H5 页面五段式注释。

### 3.3 结果计算

```text
总分 = Σ 选中选项分值
维度分 = 该维度得分 / 该维度满分 × 100
和谐指数 = 总分 / 模板总分 × 100
区间 = results 中 scoreMin ≤ 总分 ≤ scoreMax
```

### 3.4 数据一致性

- 后台模板 `tpl-*` 与 H5 商品 `g-*` 通过 `templeteIds` 关联。
- 后台商品 `status=1` 且 `heartFlag=1` 才在 H5 展示。
- 后台分类 `showFlag=1` 才在 H5 金刚区展示。
- 后台主题 `status=1` 才在 H5 首页展示。

## 4. Phases

### Phase 0 · 源码分析

- 读取 `src/config/routers/exam.js` 与 `src/views/exam/**`。
- 提取路由、字段、接口、枚举。
- 尝试 `exam2.0`：SSH 无权限，记录阻塞。

### Phase 1 · 框架与规范

- 建目录、入口、README、CHANGELOG、功能清单、注释规范、源码对照。
- 复用领袖营 Shell 的布局与注释体系。

### Phase 2 · 后台复刻

- 9 个模块列表与表单。
- 模板三段式编辑、商品关联、主题关联、维度指标、分类金刚区。
- 测评数据双页签。
- 每页红点 + 五段式注释。

### Phase 3 · H5 复刻

- 10 个源码路由页与主链路。
- 断点续答、结果计算、雷达/分布、海报 canvas。
- 我的测评、结果页反馈、确认订单 / 支付、账号登录。
- 每页红点 + 五段式注释。

### Phase 4 · Spec 与验收

- spec / plan / tasks / data-model / contracts / research / quickstart / checklist。
- 浏览器逐页验收，修 JS 错误与布局溢出。

### Phase 5 · 源码校对（待）

- 拿到 `exam2.0` 后：页面清单、路由、视觉 token、微信 SDK、图表与海报样式逐页对齐。
- 拿到后台更多数据后：补真实枚举、导入导出文件格式。

## 5. Verification

- 功能清单所有链接可打开。
- 后台 9 模块无控制台报错。
- H5 主链路可完成并生成记录。
- 红点可打开注释，注释含五段。
- 1366px / 390px 无横向滚动。

## 6. Risks

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| `exam2.0` 无权限 | H5 样式与路由无法像素级对齐 | 按后台模型复刻，文档标记待校对；拿到源码后补 |
| 后台接口无真实返回 | 枚举与字段可能不全 | 以源码字段为准，mock 数据覆盖主路径 |
| 静态原型无持久化 | 刷新后写操作丢失 | 明确原型边界；H5 用 localStorage 保留个人链路 |
| 注释与实现漂移 | 评审无法对照 | 红点 key 与功能编号绑定，功能清单统一入口 |
