# Contracts: 测评报告页 v2.1.0 接口调整方案

> 原则：**只扩字段，不新增接口，不改既有字段语义**。旧客户端忽略新字段即可正常工作。

## 1. 源码位置

| 用途 | 文件 | 位置 |
| --- | --- | --- |
| 结果页渲染 | `_ref/exam2.0/src/views/examResult/examResult.vue` | `viewCheckResult()` 第 317 行 |
| 结果页样式 | `_ref/exam2.0/src/views/examResult/index.scss` | 全文 |
| 结果接口 | `_ref/exam2.0/src/server/api/examResult/index.ts` | `viewCheckResult` / `getFeedback` / `submitFeedback` / `getZtfbScore` / `listGoodsInfoByTypeAndIds` |
| 结果类型 | `_ref/exam2.0/src/server/api/examResult/types/index.ts` | `ICheckResult` / `IWeiduDetail` / `ICheckFeedback` |
| 海报组件 | `_ref/exam2.0/src/components/ResultPoster/index.vue` | `showPoster()` / `html2canvas` |
| 海报二维码 | `_ref/exam2.0/src/server/api/shareAbout/index.ts` | `createShare` |
| 雷达组件 | `_ref/exam2.0/src/components/RadarEcharts/index.vue` | 五维复用，维度数由数据决定 |
| 后台模板 | `sixQEducation-platform` `src/views/exam/templete/**` | `form.vue` 三个页签 |

## 2. 接口总表

| 接口 | 方法 | 本版是否改动 |
| --- | --- | --- |
| `/exam/app/api/viewCheckResult` | GET | **改**：响应扩字段 |
| `/exam/app/api/listGoodsInfoByTypeAndIds` | POST | 不改 |
| `/exam/app/api/submitFeedback` | POST | 不改 |
| `/exam/app/api/feedback` | GET | 不改 |
| `/exam/app/api/getZtfbScore` | GET | **新版式不再调用** |
| `/security/api/user/share/center/createShare` | POST | 不改 |
| `exam/exam/templete/detail` | GET | **改**：响应扩字段 |
| `exam/exam/templete/create` | POST | **改**：请求扩字段 |
| `exam/exam/templete/modify` | PUT | **改**：请求扩字段 |

## 3. `GET /exam/app/api/viewCheckResult`

### 请求

不变：`?id={checkId}`（`Content-Type: application/x-www-form-urlencoded`，带 `token`）。

### 响应新增字段

```jsonc
{
  "code": 0,
  "data": {
    "check": { "score": 36, "createTime": "2026-11-03 17:13:32" },

    "templete": {
      // 既有
      "title": "高EQ父母 · 亲子养育能力测评",
      "showTotalScore": true,
      "showDimensionalityImage": true,
      "showDistributionImage": false,
      "showHarmonyImage": false,
      "resultTitle": "测评结果",
      "resultDemo": "",

      // 新增
      "resultLayout": 2,
      "riskTip": "您和孩子正在严重消耗中……",
      "ctaText": "想知道这个育儿卡点是如何形成的？……",
      "ctaSubText": "添加班主任微信，帮您把分数变成方向",
      "ctaQrCode": "https://cdn.example.com/qr/bzr.png",

      // 既有：复用为档位表，新增三个字段
      "results": [
        {
          "name": "低档", "scoreMin": 0, "scoreMax": 23,
          "base": "亲爱的，你的测评结果显示……",
          "badge": "☀️ 温暖而坚韧的托底妈妈",     // 新增
          "quote": "所有的育儿焦虑，都是在等待一个觉醒的自己。", // 新增
          "percentile": "超越 15% 的家长"          // 新增
        }
      ]
    },

    "scoreList": [
      { "name": "情感链接力", "score": 11, "maxScore": 12 }
    ],
    "weiduExplainList": [
      { "name": "情感链接力", "detail": "……", "suggest": "……" }
    ]
  }
}
```

### 后端实现要点

1. `resultLayout` 从模板表直出；为空时返回 `1`。
2. `results[]` 的 `badge` / `quote` / `percentile` 为空时，返回默认兜底文案，避免前端出现空白勋章。
3. `scoreList` 的 `maxScore` 必须返回真实每维上限（新版式为 12），前端用它还原得分。
4. 新版式下 `showDistributionImage` / `showHarmonyImage` 建议同时返回 `false`，前端也会忽略。

### 前端改动点

| 文件 | 改动 |
| --- | --- |
| `examResult.vue` | 取到 `resultLayout === 2` 时改用新版模板结构；不再调 `getZtfbScore` |
| `types/index.ts` | `ICheckResult` 增加上面五个字段；新增 `IBandResult` |
| `ResultPoster/index.vue` | 新版式渲染勋章 / 金句 / 百分比 / 背书；底图取 `templete.reportImg` |
| `index.scss` | 新增新版区块样式，与原型 `report-v2.css` 对齐 |

## 4. `GET exam/exam/templete/detail`

响应 `data` 增加：

```jsonc
{
  "resultLayout": 2,
  "riskTip": "……",
  "ctaText": "……",
  "ctaSubText": "……",
  "ctaQrCode": "……",
  "results": [ { "badge": "……", "quote": "……", "percentile": "……" } ]
}
```

## 5. `POST exam/exam/templete/create` / `PUT exam/exam/templete/modify`

请求体增加同名字段。后端校验：

| 规则 | 失败返回 |
| --- | --- |
| `resultLayout=2` 时，`results` 必须从 0 开始 | `档位必须从 0 分开始` |
| 相邻档位 `min = 上一档 max + 1` | `档位之间存在空档或重叠` |
| 最高档 `max = 总分` | `最高档位必须覆盖到测评总分` |
| 每维题目最高分之和 = 总分 / 维数 | `各维度分值需均衡` |

## 6. 不再调用的接口

`GET /exam/app/api/getZtfbScore`：新版式没有正态分布图，调了也无处渲染。
建议保留接口不动（旧版式仍在用），仅在新版式分支跳过请求，省一次往返。

## 7. 二维码来源的两种形态

| 场景 | 来源 |
| --- | --- |
| 海报内二维码 | `POST /security/api/user/share/center/createShare`（带 `userId`、`sourceParam`），返回带参 `qrCode` |
| 报告底部班主任码 | 模板字段 `ctaQrCode`，静态图片直出，**不新增接口** |

两者语义不同：前者是用户专属溯源，后者是加微入口。不要混用。

## 8. 埋点建议（待确认）

| 事件 | 触发 |
| --- | --- |
| `report_v2_view` | 新版结果页渲染完成 |
| `report_v2_cta_click` | 点击底部主 CTA |
| `report_v2_qr_open` | 二维码抽屉打开 |
| `report_v2_poster_save` | 海报保存 |
