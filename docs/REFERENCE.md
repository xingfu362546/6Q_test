# 源码对照 · v2.0.0

## 1. 总后台

仓库：`git@codeup.aliyun.com:6q/feijin/sixQEducation-platform.git`  
本地对照：`D:\Cursor\6Q_test\_ref\platform`（只读）

### 路由

`src/config/routers/exam.js`

| 路由 | 名称 | 页面 |
| --- | --- | --- |
| `/exam/templete/list` | `ExamTempleteList` | `src/views/exam/templete/list.vue` |
| `/exam/templete/add` | `ExamTempleteAdd` | `src/views/exam/templete/form.vue` |
| `/exam/templete/edit/:id` | `ExamTempleteEdit` | 同上 |
| `/exam/templete/detail/:id/:type` | `TempleteBaseInfoChildDetail` | `detail.vue` |
| `/exam/goods/list` | `ExamGoodsList` | `src/views/exam/goods/list.vue` |
| `/exam/goods/add` | `ExamGoodsAdd` | `src/views/exam/goods/form.vue` |
| `/exam/goods/edit/:id` | `ExamGoodsEdit` | 同上 |
| `/exam/goods/detail/:id` | `ExamGoodsDetail` | `src/views/exam/goods/detail.vue` |
| `/exam/overallinfo/list` | `ExamOverallInfoList` | `src/views/exam/overallinfo/list.vue` |
| `/exam/appraise/list` | `ExamUserAppraiseList` | `src/views/exam/appraise/list.vue` |
| `/exam/mental/appointment/list` | `ExamMentalAppointmentList` | `src/views/exam/mental/appointment/list.vue` |
| `/exam/data/list` | `ExamDataList` | `src/views/exam/data/list.vue` |
| `/exam/subject/subject` | `ExamSubjectSubject` | `src/views/exam/subject/subject.vue` |
| `/exam/dimensionality` | `ExamDimensionality` | `src/views/exam/dimensionality/list.vue` |
| `/exam/gategory` | `ExamGategory` | `src/views/exam/gategory/gategoryList.vue` |

### 接口清单

| 模块 | 接口 |
| --- | --- |
| 模板 | `exam/exam/templete/list`、`detail`、`detailInfo`、`create`、`modify`、`putaway`、`shelves`、`score/exportTemplateXlsx`、`score/import` |
| 题目 | `exam/exam/question/detaiAndQuestionlList`、`import`、`exportTemplateXlsx` |
| 结果 | `exam/exam/explain/detailListExplainSuggets` |
| 维度 | `exam/dimensionality/dic/list`、`detail`、`create`、`modify`、`remove`、`putaway`、`shelves`、`modifySort`、`listByParentId` |
| 分类 | `exam/exam/gategory/list`、`detail`、`create`、`modify`、`remove`、`putaway`、`shelves`、`showFlagPutaway`、`showFlagShelves`、`modifySort` |
| 商品 | `exam/exam/goods/list`、`detail`、`add`、`modify`、`putaway`、`shelves`、`displayOn`、`displayOff`、`putawayHeartFlag`、`shelvesHeartFlag` |
| 主题 | `exam/exam/subject/list`、`detail`、`create`、`modify`、`remove`、`putaway`、`shelves`、`modifySort` |
| 介绍 | `exam/exam/overall/info/list`、`modify` |
| 反馈 | `exam/exam/user/appraise/list` |
| 预约 | `exam/exam/mental/appointment/list`、`modify` |
| 数据 | `exam/exam/user/check/findUserCheckStatistic`、`exportCheckStatistic`、`exam/exam/user/favourite/findTempleteUserFavouriteStatistic`、`exportTempleteUserFavouriteStatistic`、`exportTempleteUserAnswer` |

### 关键字段

**模板**：`title`、`subTitle`、`virtualTesters`、`categoryId`、`agedTag`、`scoreTotal`、`totalTime`、`totalTimeUnit`、`dimensionalityId`、`faceImg`、`examImg`、`titleImg`、`reportImg`、`examDescription`、`resultTitle`、`resultDemo`、`answerSummary`、`showTotalScore`、`showDimensionalityImage`、`showDistributionImage`、`showHarmonyImage`。

**题目**：`typeFlag`（1 单选）、`title`、`dimensionalityId`、`idx`、`options[{ content, score, idx }]`。

**结果**：`name`、`scoreMin`、`scoreMax`、`base`、`detail`、`suggest`、`typeFlag`（1 维度 / 2 指标）。

**商品**：`code`、`name`、`price`、`priceIos`、`idx`、`oaProductId`、`templeteIds`、`coverImage`、`thirdParty`、`status`、`heartFlag`、`qrCode`。

**主题**：`name`、`detail`、`faceImg`、`idx`、`goodsId`。

**分类**：`name`、`image`、`idx`、`showFlag`、`status`。

**维度**：`name`、`memo`、`rows[{ name, memo }]`、`typeFlag=1`。

## 2. 前端 H5

仓库：`git@codeup.aliyun.com:6q/exam/exam2.0.git`

### 技术栈

- Vue 3 + Vant 4 + Pinia + Vue Router
- ECharts / vue-echarts：雷达图、柱线分布、6Q 和谐指数
- html2canvas：详情海报、结果海报
- Vite 5，`base: /h5-exam-app`
- rem 方案：`html.style.fontSize = min(width, 430) / 31 + 'px'`

### 路由

`src/router/index.ts`：

| 路径 | 视图 | 说明 |
| --- | --- | --- |
| `/index` | `examMenu.vue` | 首页：左侧分类、右侧列表、排序 |
| `/login` | `loginPage.vue` | 账号 / 密码登录 |
| `/details` | `examDetail.vue` | 详情、收藏、立即测试、海报 |
| `/examNotice` | `examNotice.vue` | 测试须知、answerSummary |
| `/preExam` | `preExam.vue` | agedTag=true 时填年龄 |
| `/examQuestion` | `examQuestion.vue` | 答题、计时、自动下一题 |
| `/examResult` | `examResult.vue` | 结果、图表、解读、反馈、海报 |
| `/myExamHistory` | `myExamHistory.vue` | 我的测评、6Q 雷达、未完成/已完成 |
| `/orderConfirm` | `orderConfirm.vue` | 确认订单 |
| `/orderPay` | `orderPay.vue` | 余额抵扣、农行支付 |

### 关键组件

- `AllRadarEcharts`：6Q 和谐指数雷达，未点亮维度显示「未点亮」。
- `RadarEcharts`：维度雷达。
- `BarEcharts`：柱 + 折线 + 「您的位置」标线。
- `DetailPosters`：详情海报 550×956。
- `ResultPoster`：结果海报 550×956，含雷达与整体解读。
- `ExamHistory`：结果页历史记录弹窗。

### 视觉资源

`6Q_exam_h5/assets/source/` 下的图标与背景图来自 `exam2.0/src/assets`，用于复刻页面视觉；仅作原型对照，不对外发布。

### 视觉 token

| 项 | 值 |
| --- | --- |
| 页面底色 | `#FFD6C1`（年龄/答题）、`#FFF4EE`（我的测评）、`#F8F8F8`（结果/订单） |
| 主橙 | `#FF9E4D` / `#FFA87B` / `#FF915F` |
| 强调橙 | `#FF8E79` / `#FE763A` / `#FF846E` |
| 正文 | `#392D2B` / `#2E2A2B` / `#464142` / `#555152` |
| 次要 | `#696566` / `#847C7E` / `#A3A0A0` |
| 分割线 | `#E6E1E2` / `#EFE9E4` |
| 雷达 | 网格 `#FEE3D4` / `#F0DACF`，区域 `rgba(255,177,153,.6)`，线 `#FF8E79` |

### 已复刻 / 仍为占位

已复刻：10 个路由页面、详情/结果海报弹窗、结果页反馈、订单确认/支付、6Q 雷达与未点亮状态、分类/排序/空态、答题计时与自动下一题。

仍为占位：真实 `userLogin` / `submitAnawer` / `viewCheckResult` / 支付接口、微信与凡泰 SDK、后端海报合成、题目富文本图片。
