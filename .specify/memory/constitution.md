# 6Q 测评复刻 Constitution

**Version**: 1.0.0  
**Ratified**: 2026-11-12  
**Last Amended**: 2026-11-12

## Core Principles

### I. 源码优先（Source First）

任何页面、字段、接口、枚举都以现网源码为准。后台引用 `sixQEducation-platform`，H5 引用 `exam2.0`。  
源码不可得时，必须在 `research.md` 与页面注释里写明「待源码校对」，不得把推测写成事实。

### II. 同一套框架（One Shell）

后台复用领袖营复刻的 Shell：顶栏、侧栏、面包屑、筛选、表格、抽屉、注释面板。  
新增页面只能扩展目录与渲染器，不另起一套布局。H5 使用独立的移动端 Shell，但与后台共用同一份业务口径。

### III. 功能清单唯一入口（Single Feature List）

所有功能必须进入 `6Q_exam_battalion/index.html`，编号 `EX-xxx`。  
功能清单是评审入口，页面注释是规格，不另写 Word。

### IV. 五段式注释（Five-Part Notes）

每条注释固定五段：过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流。  
红点 `data-note-key` 必须能映射到功能编号；不允许无编号注释。

### V. 可运行原型（Runnable Prototype）

纯静态、无构建依赖、从仓库根启动即可运行。写操作可以只改内存，但主链路必须可点击、可跳转、可回退。  
H5 的个人链路（答题进度、记录、收藏、反馈、预约）用 `localStorage` 保留。

## Additional Constraints

- 版本统一 `v2.0.0`。
- 不出现真实手机号、身份证、银行卡。
- 不接入真实后端、支付、短信、微信 SDK。
- 跨端链接使用相对路径，从仓库根启动。

## Development Workflow

1. 读源码 → 写 `research.md` 与字段清单。
2. 更新功能清单编号与页面注释 key。
3. 实现页面 → 浏览器逐页验收。
4. 更新 `tasks.md` / `checklist.md`。
5. 有源码变更时同步 `docs/REFERENCE.md` 与 `contracts/api.md`。

## Governance

Constitution 优先于实现细节。  
新增模块或改注释格式必须先改本文件与 `docs/CONVENTIONS.md`。  
每次版本交付必须通过 `checklist.md`。
