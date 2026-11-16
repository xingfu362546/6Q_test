# 001-exam-replica

6Q 测评复刻（后台 + H5）的 Spec 交付目录，版本 `v2.0.0`。

| 文件 | 内容 |
| --- | --- |
| [spec.md](spec.md) | 用户故事、验收场景、功能需求、成功标准 |
| [plan.md](plan.md) | 技术方案、目录结构、阶段拆分、风险 |
| [tasks.md](tasks.md) | 可勾选任务，含已完成与待源码校对 |
| [data-model.md](data-model.md) | 实体字段、关系、状态机、localStorage |
| [contracts/api.md](contracts/api.md) | 后台/H5 接口与原型替代方式 |
| [research.md](research.md) | 源码分析、H5 权限阻塞、设计决策 |
| [quickstart.md](quickstart.md) | 启动与验收路径 |
| [checklist.md](checklist.md) | 交付前逐项检查 |

## 交付口径

- 功能编号：后台 `EX-001` 起，H5 `EX-101` 起。
- 注释：五段式（过往逻辑 / 现在的逻辑 / 元素表 / 接口 / 数据流）。
- 数据：全部 mock；H5 个人链路用 localStorage。
- 版本：全站 `v2.0.0`。

## 当前结论

后台 9 个模块已完成复刻；H5 已按 `exam2.0` 源码的 10 个路由页完成复刻。
`exam2.0` 仓库当前无 SSH 权限，H5 视觉细节与 SDK 调用列为待校对，不阻塞本次原型交付。
