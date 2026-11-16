# .specify · 6Q 测评复刻

本目录是项目的 Spec 框架约定，配合 `specs/001-exam-replica/` 使用。

## 目录

| 路径 | 说明 |
| --- | --- |
| `memory/constitution.md` | 项目宪法：源码优先、同一套 Shell、功能清单唯一入口、五段式注释、可运行原型 |
| `../specs/001-exam-replica/` | 本次版本的 Spec 交付 |
| `../docs/CONVENTIONS.md` | 功能清单与注释规范 |

## 使用方式

1. 新版本在 `specs/` 下建 `<编号>-<feature>/`。
2. 按 `spec.md → plan.md → tasks.md` 顺序写。
3. 接口、数据模型、研究、验收分别落到 `contracts/`、`data-model.md`、`research.md`、`quickstart.md`、`checklist.md`。
4. 功能编号与页面注释 key 同步更新。
5. 交付前跑 `checklist.md`。

## 版本

当前 `specs/001-exam-replica` 对应 `v2.0.0`。
