# 6Q 测评复刻 · v2.2.1

测评管理后台 + 心画测评 H5 的静态复刻集合，用于对齐页面结构、字段、交互与跳转逻辑。  
纯静态，不需要安装依赖，从仓库根起一个本地静态服务即可打开。

> 当前版本 **v2.2.1**（v2.0.0 基线 → v2.1.0 报告改版 → v2.2.0 值得欣赏的力 → v2.2.1 欣赏收敛为单条）。版本变更见 [CHANGELOG.md](CHANGELOG.md)。

## 目录

| 目录 | 说明 |
| --- | --- |
| `6Q_exam_battalion/` | 总后台「测评管理」复刻：功能清单 + 9 个业务模块 + 页面注释 |
| `6Q_exam_h5/` | 6Q 测评 H5 全量复刻：首页 / 登录 / 详情 / 须知 / 年龄 / 答题 / 结果 / 我的测评 / 确认订单 / 支付 |
| `assets/covers/` | 两端共用的测评封面 SVG |
| `docs/` | 功能清单、注释规范、源码对照、交付说明、逐页验收报告 |
| `docs/acceptance/v2.0.0/` | 23 个页面的验收截图与验收报告 |
| `docs/acceptance/v2.1.0/` | 页面的验收截图与验收报告 |
| `specs/001-exam-replica/` | v2.0.0 基线的 Spec：需求、方案、任务、数据模型、接口契约 |
| `specs/002-report-v2.1.0/` | v2.1.0 亲子养育报告改版的 Spec（含 `requirements.md` 需求明细与接口调整方案） |
| `index.html` | 项目入口 |

## 怎么跑

两端之间有相对跳转（功能清单会跳到后台页面和 H5 页面），所以**从仓库根起服务**，不要单独起每个目录：

```bash
python -m http.server 8766
```

打开：

- 项目入口：`http://localhost:8766/`
- 后台功能清单：`http://localhost:8766/6Q_exam_battalion/index.html`
- 后台复刻：`http://localhost:8766/6Q_exam_battalion/replica.html?p=template-list`
- H5 首页：`http://localhost:8766/6Q_exam_h5/index.html`

## 从功能清单开始看

`6Q_exam_battalion/index.html` 是测评管理的功能清单，**只展示 v2.1.0 本期 8 条需求**（后台 `EX-051`、`EX-052`，H5 `EX-201` ~ `EX-206`）。
v2.0.0 基线不单独列出，只作为「改动前是什么」写进每条的逻辑说明。  
每条都标了是否需要 UI 出稿，并带「逻辑说明」与「接口改动」两列。序号、原型名都可以点开，直接跳到对应原型：

- 带 `note=EX-xxx` 的链接：进页面后自动展开该条注释
- 结果报告页用固定模拟数据跳转：`record=demo-low`（16 分）/ `demo-mid`（40 分）/ `demo-high`（56 分），刷新结果不变
- 页面上的红色序号：点开是注释面板（过往逻辑 / 现在的逻辑 / 元素表 / 接口与数据流）
- 「全部注释」按钮：列出当前页全部功能点

## 注释怎么写

每条注释固定五段：

> H5 页面的注释面板在桌面端（≥1200px）固定在**手机右侧**，不覆盖手机画面；窄屏才回到底部抽屉。

1. **过往逻辑 · v2.0.0**：`sixQEducation-platform` / `exam2.0` 里本来的行为，只写事实
2. **现在的逻辑 · v2.1.0**：本次版本做到哪、不做什么、和上一版的差异
3. **元素表**：字段 / 控件 / 必填 / 说明；复刻新增标 `new`，逻辑调整标 `Iteration`
4. **接口**：现网接口路径与方法
5. **数据流**：数据从哪个页面写入、在哪个页面被读取

功能清单与注释规范详见 [docs/CONVENTIONS.md](docs/CONVENTIONS.md)。

## 范围

- 后台只复刻「测评管理」9 个模块，其余菜单保留占位。
- H5 复刻测评主链路与个人中心，页面数据均为原型模拟数据，不含真实用户信息。
- 接口名只作对照，未接后端；本地状态用 `localStorage` 模拟。
- 本项目是原型，不是可上线实现。

## 源码对照

| 端 | 仓库 | 复刻范围 |
| --- | --- | --- |
| 总后台 | `git@codeup.aliyun.com:6q/feijin/sixQEducation-platform.git` | `src/views/exam/**`、`src/config/routers/exam.js` |
| 前端 H5 | `git@codeup.aliyun.com:6q/exam/exam2.0.git` | 测评主链路全量页面与跳转 |

对照记录与未取到的源码说明见 [docs/REFERENCE.md](docs/REFERENCE.md)。

## 验收

逐页截图与交互抽检结果见 [docs/acceptance/v2.0.0/README.md](docs/acceptance/v2.0.0/README.md)。

- 后台 13 个页面 + H5 10 个路由页全部渲染
- 断图 0，横向滚动 0
- 答题提交、列表筛选、页签切换、结果图表与反馈均已实测
