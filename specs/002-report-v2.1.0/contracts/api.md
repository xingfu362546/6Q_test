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
| 卷王答题明细接口 | — | **改**：需返回题目原文 / 选项原文 / 选项序号 / 选项分值 |
| `exam/exam/user/check/exportCheckStatistic` | GET | **改**：导出题目与选项原文 |
| `exam/exam/user/favourite/exportTempleteUserAnswer` | GET | **改**：同上 |
| `exam/exam/user/check/findUserCheckStatistic` | GET | 不改 |
| `exam/exam/user/favourite/findTempleteUserFavouriteStatistic` | GET | 不改 |
| `POST exam/order/create` | POST | **改**：新增 `referrer` / `referrerGoodsId` / `channel` |
| `POST /security/api/user/login` | POST | 不改 |
| `GET /security/api/user/info` | GET | 不改 |

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
      "ctaSubText": "添加导师微信，帮您把分数变成方向",
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
| 报告底部导师码 | 模板字段 `ctaQrCode`，静态图片直出，**不新增接口** |

两者语义不同：前者是用户专属溯源，后者是加微入口。不要混用。

## 8. 答题数据导出（EX-053）

### 8.1 问题

现网导出把题目写成「问题1 / 问题2 / 问题3」，选项值写成「A / B / C / D」，
导出文件离开系统后无法独立阅读，核对数据只能回表逐题比对。

### 8.2 目标结构

一行一个学员，题目列写题目原文，值写所选选项原文：

| 列 | 内容 | 来源 |
| --- | --- | --- |
| 填写人ID / 姓名 / 手机 | 学员身份 | `exam/exam/user/check/findUserCheckStatistic`（既有） |
| 提交时间 / 总分 / 得分区间 | 记录信息 | 同上 |
| 所属维度 | 题目关联维度名称 | 卷王答题明细 |
| 题目 | 题号 + 题目原文 | **卷王答题明细** |
| 所选选项 | 选项原文（不写字母） | **卷王答题明细** |
| 全部选项 | 该题所有选项原文，按序号拼接 | **卷王答题明细** |
| 得分 | 所选选项得分 / 该题最高分 | **卷王答题明细** |

### 8.3 卷王答题明细需返回的字段

字段名以卷王实际契约为准，下列为原型占位命名，标注「待接口确认」：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `questionTitle` | string | 题目原文 |
| `optionContent` | string | 选项原文 |
| `optionSort` | int | 选项序号（1 起），用于定位所选选项 |
| `optionScore` | number | 该选项得分 |
| `maxScore` | number | 该题最高分 |
| `options` | array | 该题全部选项 `[{content, score, sort}]` |

### 8.4 降级约定

| 情况 | 行为 |
| --- | --- |
| 卷王返回题目与选项原文 | 按新结构导出 |
| 卷王只返回序号 / 字母 | 退回「问题N / 字母」，并在导出文件首行标红提示「题目与选项原文缺失」 |
| 卷王接口整体失败 | 导出失败并提示重试，不产出只有表头的空文件 |

### 8.5 导出接口

| 接口 | 用途 | 改动 |
| --- | --- | --- |
| `GET exam/exam/user/check/exportCheckStatistic` | 明细导出 | 透传卷王的题目与选项原文 |
| `GET exam/exam/user/favourite/exportTempleteUserAnswer` | 汇总「下载」 | 同上 |

后台另加「导出内容预览」：读同一份明细，在页面里渲染表头对照与逐题预览，不产出文件。

## 9. 分享与扫码进入（EX-207 ~ EX-210）

完整链路见 [share-entry.md](../share-entry.md)。

### 9.1 `POST exam/order/create`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `goodsId` | string | 是 | 商品 ID |
| `templeteId` | string | 是 | 关联模板 |
| `price` | number | 是 | 商品价；免费商品为 0 |
| `payAmount` | number | 是 | 实付金额；免费为 0 |
| `referrer` | string | 否 | **新增**：推荐人标识，来自海报 `ref` |
| `referrerGoodsId` | string | 否 | **新增**：发生推荐的商品 |
| `channel` | string | 否 | **新增**：`scan_free`（扫码免费）/ `h5_order`（正常下单） |

免费订单约束：`price = 0`、`payAmount = 0`、`status = finished`，不参与退款与结算。

### 9.2 `POST /security/api/user/share/center/createShare`

不改字段。`sourceParam` 需带 `goodsId` 与 `ref`，保证生成的二维码落地到 `entry.html?goodsId=&ref=`。

### 9.3 `POST /security/api/user/login`

不改。H5 登录成功后写本地 `exam_session`（含 token），作为扫码准入判断依据。

### 9.4 海报雷达取数

不新增接口。用 `viewCheckResult` 的 `scoreList[]`：

```
maxPer = round(record.total / dims.length)
raw[i] = round(dims[i].value / 100 * maxPer)
```

### 9.5 维度文案字段（EX-054 / EX-211）

`viewCheckResult` 的 `weiduExplainList[]` 每条增加五个字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `painText` | string | 卡点文案 |
| `riskText` | string | 风险文案 |
| `appreciate` | string | 欣赏文案 |
| `appreciateTip` | string | 欣赏小建议 |
| `appreciateAlt` | string | 相对优势版 |

后台 `exam/exam/templete/detail` / `create` / `modify` 的 `dimensionExplains[]` 同步收发这五个字段，
取该维度索引为 0 的那一行。旧的 `detail` / `suggest` 保留不动。

建议后端直接返回 `appreciations` 数组（`[{dim, score, text}]`）以减少前端重复计算，
但原型为保持「只扩字段」原则，仍由前端按 `scoreList` 计算。

## 10. 埋点建议（待确认）

| 事件 | 触发 |
| --- | --- |
| `report_v2_view` | 新版结果页渲染完成 |
| `report_v2_cta_click` | 点击底部主 CTA |
| `report_v2_qr_open` | 二维码抽屉打开 |
| `report_v2_poster_save` | 海报保存 |
| `data_export_preview_open` | 打开导出内容预览 |
| `scan_entry_view` | 扫码落地页打开 |
| `scan_entry_login_redirect` | 未登录跳登录 |
| `scan_free_order_created` | 免费订单创建成功 |
| `scan_entry_to_quiz` | 进入测评须知 |
| `scan_entry_to_goods` | 收费商品跳详情 |
| `report_appreciation_view` | 欣赏版块展示（记录条数与被展示维度） |
| `report_appreciation_count` | 展示条数：1 / 2 / 3，用于验证对完读率的影响 |
