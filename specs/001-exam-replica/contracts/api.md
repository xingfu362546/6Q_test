# API Contracts: 6Q 测评复刻

> 原型不请求后端。下表用于对照现网接口；每行给出原型替代方式。

## 1. 后台测评模板

| 方法 | 路径 | 用途 | 原型替代 |
| --- | --- | --- | --- |
| GET | `exam/exam/templete/list` | 模板列表 | `EXAM_DATA.templates` + 前端筛选 |
| GET | `exam/exam/templete/detail` | 模板详情 | `templates.find(id)` |
| GET | `exam/exam/templete/detailInfo` | 详情基础信息 | 同上 |
| POST | `exam/exam/templete/create` | 新增 | 内存 `unshift` + toast |
| PUT | `exam/exam/templete/modify` | 编辑 | `Object.assign` |
| PUT | `exam/exam/templete/putaway` | 启用 | `status=1` |
| PUT | `exam/exam/templete/shelves` | 禁用 | `status=2` + 级联商品 |
| GET | `exam/exam/templete/score/exportTemplateXlsx` | 下载导入模板 | toast |
| POST | `exam/exam/templete/score/import` | 导入分数 | 弹窗 + toast |

## 2. 题目 / 结果

| 方法 | 路径 | 用途 | 原型替代 |
| --- | --- | --- | --- |
| GET | `exam/exam/question/detaiAndQuestionlList` | 题目列表 | `template.questions` |
| POST | `exam/exam/question/import` | 导入题目 | 弹窗 + toast |
| GET | `exam/exam/question/exportTemplateXlsx` | 题目模板 | toast |
| GET | `exam/exam/explain/detailListExplainSuggets` | 结果解读 | `template.dimensionExplains` |

## 3. 分类 / 维度 / 主题 / 商品

| 方法 | 路径 | 用途 | 原型替代 |
| --- | --- | --- | --- |
| GET/POST/PUT/DELETE | `exam/exam/gategory/*` | 分类 CRUD / 启停 / 金刚区 / 排序 | `EXAM_DATA.categories` |
| GET/POST/PUT/DELETE | `exam/dimensionality/dic/*` | 维度 CRUD / 启停 / 排序 | `EXAM_DATA.dimensions` |
| GET/POST/PUT/DELETE | `exam/exam/subject/*` | 主题 CRUD / 启停 | `EXAM_DATA.subjects` |
| GET/POST/PUT/DELETE | `exam/exam/goods/*` | 商品 CRUD / 上下架 / 展示到心画 | `EXAM_DATA.goods` |
| GET | `goods/productOaRelation/productList` | OA 产品 | 表单手填 |

## 4. 介绍 / 反馈 / 预约 / 数据

| 方法 | 路径 | 用途 | 原型替代 |
| --- | --- | --- | --- |
| GET | `exam/exam/overall/info/list` | 测评介绍 | `EXAM_DATA.overall` |
| PUT | `exam/exam/overall/info/modify` | 编辑介绍 | 内存更新 + toast |
| GET | `exam/exam/user/appraise/list` | 反馈列表 | `EXAM_DATA.appraises` |
| GET | `exam/exam/mental/appointment/list` | 预约列表 | `EXAM_DATA.appointments` |
| PUT | `exam/exam/mental/appointment/modify` | 跟进 | 内存更新 + toast |
| GET | `exam/exam/user/check/findUserCheckStatistic` | 填写明细 | `EXAM_DATA.checkDetails` |
| GET | `exam/exam/user/check/exportCheckStatistic` | 导出明细 | toast |
| GET | `exam/exam/user/favourite/findTempleteUserFavouriteStatistic` | 填写汇总 | `EXAM_DATA.checkSummary` |
| GET | `exam/exam/user/favourite/exportTempleteUserAnswer` | 下载答题数据 | toast |
| GET | `exam/exam/user/favourite/exportTempleteUserFavouriteStatistic` | 导出汇总 | toast |

## 5. H5 接口（待源码校对）

> `exam2.0` 源码已接入，以下按 `src/server/api` 的调用整理，仅作原型注释对照。

| 方法 | 路径 | 用途 | 原型替代 |
| --- | --- | --- | --- |
| GET | `api/homeAbout/getInfosAndSubjects` | 首页副标题 / 主题 | 静态文案 |
| GET | `api/homeAbout/getListAllCategorys` | 首页左侧分类 | `H5_DATA.categories` |
| GET | `api/menuAbout/getListGoodsByCategoryId` | 分类商品列表 / 排序 | `H5_DATA.goods` + 前端排序 |
| GET | `api/detailAbout/getDetailByGoodsId` | 商品/模板详情 | `byId(id)` |
| GET | `api/detailAbout/getTempleteAndQuestionById` | 题目与须知 | `goods.questions` / `answerSummary` |
| POST | `api/checkAbout/submitAnawer` | 提交答案 | `calcResult` + `exam_records` |
| GET | `api/checkAbout/viewCheckResult` | 结果数据 | `recordById` |
| GET | `api/checkAbout/getZtfbScore` | 正态分布数据 | 前端模拟分布 |
| POST | `api/checkAbout/submitFeedback` | 结果页反馈 | `exam_feedbacks` |
| GET | `api/checkAbout/getFeedback` | 回填反馈 | `exam_feedbacks` |
| GET | `api/myExamHistory/getMyExamHistoryList` | 我的测评列表 | `exam_records` |
| GET | `api/myExamHistory/getMyExamData` | 6Q 雷达数据 | 最近记录维度 |
| POST | `api/user/userLogin` | 账号密码登录 | `exam_user` |
| POST | `api/favourite/add` | 详情收藏 | `exam_favorites` |
| POST | `api/share/createShare` | 分享二维码 | 本地 QR |
| POST | `api/posterUpload` | 海报上传 | 本地 PNG 下载 |
| POST | `api/order/createOrder` / `pay` | 订单 / 支付 | 本地模拟 |

## 6. 统一响应约定（现网）

```json
{ "code": 200, "msg": "success", "data": {} }
```

分页列表：

```json
{ "code": 200, "data": { "records": [], "total": 0, "current": 1, "size": 10 } }
```

原型不校验 `code/msg`，所有请求以 mock 数据替代。
