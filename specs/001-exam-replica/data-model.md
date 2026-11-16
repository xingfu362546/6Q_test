# Data Model: 6Q 测评复刻

> 字段名与 `sixQEducation-platform / src/views/exam` 保持一致；H5 字段是后台字段的下发子集。

## 1. 实体关系

```text
Category 1 ── N Template
Category 1 ── N Goods
Dimension 1 ── N Template
Template 1 ── N Question
Template 1 ── N Result
Template N ── N Goods          （templeteIds）
Subject  1 ── N Goods          （goodsIds）
Goods    1 ── N Record
Template 1 ── N Feedback
Member   1 ── N Record / Feedback / Appointment
```

## 2. 后台实体

### 2.1 Template（测评模板）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | `tpl-*` |
| title | string | 是 | 最多 15 字 |
| subTitle | string | 是 | 副标题 |
| categoryId / categoryName | string | 是 | 分类 |
| dimensionalityId / dimensionName | string | 是 | 维度模板 |
| questionCount / resultCount | number | 否 | 冗余统计 |
| scoreTotal | number | 否 | 题目选项最高分累加 |
| totalTime / totalTimeUnit | number | 是 | 建议时长，单位分钟 |
| virtualTesters | number | 否 | 虚拟人数 |
| agedTag | boolean | 是 | 是否需填年龄 |
| faceImg / examImg / titleImg / reportImg | string | 是 | 四张图 |
| examDescription | string | 是 | 测评详情 |
| resultTitle / resultDemo | string | 是 | 结果页介绍 |
| answerSummary | string | 是 | 答题摘要 |
| showTotalScore / showDimensionalityImage / showDistributionImage / showHarmonyImage | boolean | 是 | 结果页开关 |
| status | 1/2 | 是 | 1 启用、2 禁用 |
| createUser / createTime | string | 否 | 创建信息 |

### 2.2 Question（题目）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 题目 id |
| typeFlag | 1 | 1 单选（现网仅见单选） |
| title | string | 题干 |
| dimensionalityId | string | 关联维度指标 |
| idx | number | 排序 |
| options | array | `{ id, content, score, idx }` |

### 2.3 Result（结果）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 结果 id |
| name | string | 指数名称，如蓄力期 / 整合期 / 绽放期 |
| scoreMin / scoreMax | number | 区间 |
| base | string | 基础解读 |
| detail | string | 维度详细解读 |
| suggest | string | 建议 |
| typeFlag | 1/2 | 1 维度、2 指标 |

### 2.4 Goods（商品）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `g-*` |
| key | string | H5 短 key |
| code | string | 商品编号 |
| name | string | 商品名称 |
| categoryId / categoryName | string | 分类 |
| coverImage / qrCode | string | 封面、二维码 |
| price / priceIos | number | 双端价格 |
| idx | number | 排序 |
| oaProductName | string | 所属 OA 产品 |
| templeteIds / templeteTitle | array/string | 关联模板 |
| thirdParty | string | `nh` 表示农行 |
| status | 1/2 | 1 上架、2 下架 |
| heartFlag | 1/2 | 1 展示到心画 |
| displayStatus | boolean | 前端显示 |
| testCount / intro | number/string | 人数、简介 |

### 2.5 Subject（主题）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `s-*` |
| name | string | 最多 10 字 |
| detail | string | 最多 50 字 |
| faceImg | string | 封面 336×213 |
| idx | number | 排序 |
| status | 1/0 | 1 启用、0 禁用 |
| goodsIds | array | 关联商品 |

### 2.6 Category（分类）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `c-*` |
| name | string | 最多 6 字 |
| image | string | 图标 120×120 |
| idx | number | 排序 |
| status | 1/2 | 1 启用、2 禁用 |
| showFlag | 1/0 | 1 展示在金刚区 |

### 2.7 Dimension（维度）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `dt-*` |
| name | string | 最多 20 字 |
| memo | string | 最多 50 字 |
| rows | array | `{ key, name, memo }` |
| sonNum | number | 指标数 |
| status | 1/2 | 1 启用、2 禁用 |

## 3. H5 实体

### 3.1 Record（测评记录）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `rec-*` |
| goodsId / goodsKey | string | 商品 |
| title | string | 测评名称 |
| score / total | number | 得分 / 总分 |
| rangeName | string | 区间名称 |
| harmony / percentile | number | 和谐指数 / 百分位 |
| dims | array | `{ key, name, full, color, value }` |
| answers | object | `{ questionId: optionIndex }` |
| createTime | string | `YYYY-MM-DD HH:mm` |
| status | string | `finished` |

### 3.2 Progress（原型扩展，源码未使用）

> `exam2.0` 的 `examQuestion.vue` 退出不保存作答历史；本原型保留该 key 仅用于演示「未完成」列表的扩展能力，不冒充源码行为。

localStorage key：`exam_progress_<goodsId>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| answers | object | 题目 id → 选项下标 |
| index | number | 当前题号 |
| updatedAt | string | 更新时间 |

### 3.3 Feedback（反馈）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `fb-*` |
| recordId / goodsId | string | 关联测评 |
| score | 1-5 | 星级 |
| tags | array | 快捷标签 |
| content | string | 最多 500 字 |
| createTime | string | 提交时间 |

### 3.4 Appointment（预约）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `ap-*` |
| nickName / nickType | string | 昵称、称呼 |
| needType | string | 课程咨询 / 测评解读 / 心理陪伴 / 合作咨询 |
| needContent | string | 关心方向 |
| mobile | string | 11 位手机号 |
| sourceFrom | string | H5 预约页 / H5 结果页 |
| status | string | 待跟进 / 已联系 / 已完成 |
| memo | string | 跟进备注 |
| createTime | string | 提交时间 |

## 4. localStorage Keys

| Key | 内容 |
| --- | --- |
| `exam_user` | 会员信息 |
| `exam_records` | 已完成测评记录，最多 50 条 |
| `exam_progress_<goodsId>` | 答题进度 |
| `exam_favorites` | 收藏商品 id 数组 |
| `exam_feedbacks` | 反馈列表 |
| `exam_appointments` | 预约列表 |

## 5. 状态机

### 模板 / 商品 / 分类

```text
启用/上架 (1) ──禁用/下架──▶ 禁用/下架 (2)
     ▲                         │
     └────────启用─────────────┘
```

- 模板禁用 → 关联商品 status=2。
- 分类禁用 → 该分类模板与商品 status=2。
- 主题禁用 → H5 首页不展示，商品不受影响。

### 答题

```text
未开始 ──进入──▶ 作答中 ──提交──▶ 已完成
                  │ 退出/刷新
                  └─▶ 作答中（localStorage 恢复）
```

### 预约

```text
待跟进 ──联系──▶ 已联系 ──完成──▶ 已完成
```
