# Data Model: 测评报告页 v2.1.0

## 1. 模板（exam_templete）新增字段

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `resultLayout` | int | 否 | 1 | 1 旧版结果页 / 2 新版结果页。缺省按 1 处理 |
| `riskTip` | text | 否 | "" | 「您的孩子正在经历什么」文案；空则回退卡点 risk |
| `ctaText` | text | 否 | "" | 「如果您想深度了解」文案；空则整卡隐藏 |
| `ctaSubText` | varchar(100) | 否 | "" | 底部 CTA 副标题 / 二维码抽屉标题 |
| `ctaQrCode` | varchar(255) | 否 | "" | 导师二维码图片地址；空则用占位图 |

## 2. 模板结果（exam_explain）新增字段

复用现有「测评模板结果」表承载档位，不新建表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | varchar(50) | 是 | 档位名称：低档 / 中档 / 高档（展示用，不参与判定） |
| `scoreMin` | int | 是 | 区间下界，含 |
| `scoreMax` | int | 是 | 区间上界，含 |
| `badge` | varchar(60) | 否 | 觉醒勋章，按档位唯一 |
| `quote` | varchar(160) | 否 | 觉醒金句 |
| `percentile` | varchar(40) | 否 | 如「超越 95% 的家长」 |
| `base` | text | 是 | 档位解读（报告「亲爱的，你的测评结果显示」段落） |

校验规则（保存时）：

- 区间必须从 0 开始。
- 相邻区间必须 `min = 上一档 max + 1`，不允许空档与重叠。
- 最高档 `max` 必须等于模板总分。

## 3. 维度模板（exam_dimensionality）

`dt-5power` 五行：

| key | 名称 | 每维上限 |
| --- | --- | --- |
| `d-p1` | 情感链接力 | 12 |
| `d-p2` | 走心沟通力 | 12 |
| `d-p3` | 边界松弛力 | 12 |
| `d-p4` | 赋能托底力 | 12 |
| `d-p5` | 自我觉察力 | 12 |

校验规则：新版式保存时，每维题目最高分之和必须等于 `总分 / 维数`。

## 3.1 各维度指标结果（exam_explain 维度行）新增字段

按维度配置，前端读取**该维度索引为 0** 的那一行：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `painText` | text | 否 | 卡点文案，核心卡点维度的剖析 |
| `riskText` | text | 否 | 风险文案，该维度对应的风险预警 |
| `appreciate` | text | 否 | 欣赏文案，句式「欣赏你 + 行为白描 + 意义升华」 |
| `appreciateTip` | text | 否 | 欣赏小建议 |
| `appreciateAlt` | text | 否 | 相对优势版，非卡点维度全部低于阈值时的兜底 |

规则：

- 卡点维度取自己的 `painText` / `riskText`；欣赏只取非卡点维度。
- 任一字段为空时该段不渲染。
- 旧的 `detail` / `suggest` 仍保留，供旧版结果页使用。

## 3.2 欣赏版块派生数据

```js
maxPer = round(record.total / dims.length)          // 12
thr    = round(maxPer * 2 / 3)                      // 8
cand   = dims.filter(d => d.key !== painKey).map(...)  // 排除卡点维度
top    = cand.filter(c => c.score >= thr).sort(desc).slice(0, 3)
if (!top.length) top = [max(cand)]; useAlt = true   // 兜底 1 条
```

与计分、分档（24/48）、卡点命中算法完全解耦。

## 4. 题目（exam_question）

- 20 题，单选，`typeFlag=1`。
- 每题 4 个选项，分值固定 0 / 1 / 2 / 3。
- 维度分布：Q1–Q4 情感链接力，Q5–Q8 走心沟通力，Q9–Q12 边界松弛力，Q13–Q16 赋能托底力，Q17–Q20 自我觉察力。

## 5. 测评记录（exam_check）

沿用既有结构，新增读取用途（不新增字段）：

| 现有字段 | 新版用途 |
| --- | --- |
| `score` | 总分（0–60），命中档位 |
| `createTime` | 报告头「测评日期」 |
| `scoreList` | 五维得分，画雷达与算卡点 |

## 6. 前端派生数据

```js
// 每维得分还原
maxPer = round(record.total / dims.length)      // 12
raw[i] = round(dims[i].value / 100 * maxPer)    // 0..12

// 档位
band = results.find(r => record.score >= r.scoreMin && record.score <= r.scoreMax)

// 核心卡点（并列取首个，顺序即 dims 顺序）
painKey = 第一个最小值对应的 dims[i].key
```

## 7. 本地存储

| key | 变化 |
| --- | --- |
| `exam_records` | 记录 `goodsId` 决定走哪套版式；结构不变 |
| `exam_feedbacks` | 结构不变 |
| `exam_admin_data` | 模板对象多五个字段；旧数据缺字段时按默认值渲染 |

## 8. 迁移说明

- 历史记录不需要迁移：版式由商品 → 模板决定，渲染时读取。
- 旧模板 `resultLayout` 为空：按 1 处理，行为与 v2.0.0 一致。
- 后台演示数据可经「重置演示数据」重建。
