/**
 * 测评管理复刻 · 模拟数据
 * 口径按 sixQEducation-platform / src/views/exam 与 H5 exam2.0 的字段整理。
 * 页面只读这份数据，写操作只改内存 + localStorage，不发真实请求。
 */
(function () {
  "use strict";

  var COVER = "../assets/covers/v3/";

  /* 旧版本本地缓存里的封面路径统一迁移到 v3 目录，避免命中损坏的旧图 */
  function fixCoverPaths(value) {
    if (typeof value === "string") {
      return value.replace(/assets\/covers\/(?!v3\/)/g, "assets/covers/v3/");
    }
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) value[i] = fixCoverPaths(value[i]);
      return value;
    }
    if (value && typeof value === "object") {
      Object.keys(value).forEach(function (k) { value[k] = fixCoverPaths(value[k]); });
      return value;
    }
    return value;
  }

  function q(id, dim, title, options) {
    return {
      id: id,
      typeFlag: 1,
      dimensionalityId: dim,
      title: title,
      options: options.map(function (o, i) {
        return { id: id + "-o" + (i + 1), content: o[0], score: o[1], idx: i };
      })
    };
  }

  var QUESTIONS = [
    q("Q1", "d-aq", "遇到突发变化时，我通常能较快稳住情绪，先处理眼前的事。", [
      ["完全符合", 6], ["比较符合", 5], ["一般", 4], ["不太符合", 2]
    ]),
    q("Q2", "d-eq", "我能清楚说出自己当下的感受，而不是只说“还好”。", [
      ["总是可以", 6], ["经常可以", 5], ["偶尔可以", 3], ["很难做到", 1]
    ]),
    q("Q3", "d-cq", "面对没有标准答案的问题，我愿意先试一个自己的想法。", [
      ["非常愿意", 6], ["比较愿意", 5], ["看情况", 3], ["更想等别人给答案", 1]
    ]),
    q("Q4", "d-iq", "学习新东西时，我会先拆解目标，再安排练习节奏。", [
      ["一直这样", 6], ["多数时候", 4], ["偶尔", 2], ["几乎没有", 1]
    ]),
    q("Q5", "d-rq", "和重要的人有分歧时，我能先听完对方，再表达自己。", [
      ["很容易做到", 6], ["多数时候可以", 5], ["有时会打断", 3], ["常常急着反驳", 1]
    ]),
    q("Q6", "d-sq", "我会思考“这件事对我意味着什么”，而不只看结果。", [
      ["经常思考", 6], ["偶尔思考", 4], ["很少", 2], ["从不", 1]
    ]),
    q("Q7", "d-aq", "计划被打乱后，我能在一小时内重新找到可执行的下一步。", [
      ["通常可以", 6], ["需要一点时间", 4], ["会卡住半天", 2], ["很难恢复", 1]
    ]),
    q("Q8", "d-eq", "当我感到压力时，我知道哪些方式能真正帮到自己。", [
      ["非常清楚", 6], ["比较清楚", 4], ["知道一点", 2], ["完全不知道", 1]
    ]),
    q("Q9", "d-cq", "我常常能把两个不相关的信息连起来，想到新做法。", [
      ["经常发生", 6], ["偶尔发生", 4], ["很少", 2], ["几乎没有", 1]
    ]),
    q("Q10", "d-iq", "我会定期回看自己学过的内容，找出还没掌握的部分。", [
      ["每周都会", 6], ["每月会", 4], ["考前才会", 2], ["从不回看", 1]
    ]),
    q("Q11", "d-rq", "在团队里，我能既表达立场，也给对方留余地。", [
      ["做得很好", 6], ["基本可以", 4], ["有时会失衡", 2], ["很难兼顾", 1]
    ]),
    q("Q12", "d-sq", "我对自己的长期方向有比较清晰的想象。", [
      ["非常清晰", 6], ["大致清晰", 4], ["还在摇摆", 2], ["没有想过", 1]
    ])
  ];

  function cloneQuestions(prefix) {
    return QUESTIONS.map(function (item, index) {
      return {
        id: prefix + "-" + item.id,
        typeFlag: 1,
        dimensionalityId: item.dimensionalityId,
        title: item.title,
        idx: index,
        options: item.options.map(function (o, i) {
          return { id: prefix + "-" + o.id, content: o.content, score: o.score, idx: i };
        })
      };
    });
  }

  var DIM_ROWS = {
    "d-aq": { name: "AQ 逆商", memo: "面对变化与挫折的恢复力" },
    "d-eq": { name: "EQ 情商", memo: "识别、表达与调节情绪" },
    "d-cq": { name: "CQ 创造力", memo: "联想、试错与生成新方案" },
    "d-iq": { name: "IQ 学习力", memo: "目标拆解、练习与复盘" },
    "d-rq": { name: "RQ 关系力", memo: "倾听、表达与边界" },
    "d-sq": { name: "SQ 灵性力", memo: "意义感与长期方向" }
  };

  /* ---------- v2.1.0 亲子养育五力（按规格书 v2.4） ---------- */
  var POWER_ROWS = {
    "d-p1": { name: "情感链接力", memo: "接得住情绪" },
    "d-p2": { name: "走心沟通力", memo: "听得懂心声" },
    "d-p3": { name: "边界松弛力", memo: "放得开手脚" },
    "d-p4": { name: "赋能托底力", memo: "托得住失败" },
    "d-p5": { name: "自我觉察力", memo: "看得清自己" }
  };

  function p(idx, dim, title, options) {
    return {
      id: "PQ" + idx, typeFlag: 1, dimensionalityId: dim, title: title, idx: idx - 1,
      options: options.map(function (text, i) {
        return { id: "PQ" + idx + "-" + (i + 1), content: text, score: i, idx: i };
      })
    };
  }

  var PARENT_QUESTIONS = [
    p(1, "d-p1", "孩子连续几次考试退步，你内心的真实台词或者反应是：", [
      "“我这么辛苦付出，你考这个分数对得起我吗”",
      "表面不说，但眼神和语气满是失望，家里陷入低气压",
      "很焦虑，但事后会反思自己是不是把分数的压力转嫁给了他",
      "先拥抱孩子接住情绪，让他知道无论成绩怎样父母依然爱他"
    ]),
    p(2, "d-p1", "孩子因为一点小事或作业遇到难题急得大哭大闹时，你的第一反应是：", [
      "“这点小事有什么好哭的”——先制止情绪",
      "瞬间被点燃，忍不住比他声音更大",
      "明白他有情绪，但手足无措不知怎么安慰",
      "先蹲下来抱抱他，陪他把情绪安全地流完"
    ]),
    p(3, "d-p1", "孩子兴冲冲来跟你分享学校的趣事或流行梗时，你会：", [
      "打断他：“作业写完了吗？整天关注这些”",
      "边刷手机或做家务，边敷衍地“嗯嗯”应付",
      "认真听了，但不知道怎么接话，气氛有点尴尬",
      "放下手上的事，看着他的眼睛，跟他一起兴奋讨论"
    ]),
    p(4, "d-p1", "当孩子冲你大喊“你们一点都不懂我/不关心我”时，你的第一反应：", [
      "瞬间被激怒：“我为你付出这么多，你凭什么说这种话！”",
      "满腹委屈：“我天天围着你转，到底哪里不懂你了？”",
      "手足无措：不知道该怎么做才能真正走进孩子的内心",
      "心疼与反思：压下情绪去心疼他的无助，试着静下心听听他到底需要什么"
    ]),
    p(5, "d-p2", "一天下来，你对孩子说得最多的话属于哪一类？", [
      "“快点”“作业写完没”“手机放下”（指令催促类）",
      "“你怎么又这样”“跟你说了多少遍”（抱怨数落类）",
      "“真棒”“真聪明”（评价型表扬）",
      "“今天有什么有趣的？”“我在听，然后呢”（倾听陪伴类）"
    ]),
    p(6, "d-p2", "发现孩子撒谎（如藏试卷、谎报作业完成度）时，你会：", [
      "严厉批评，让他保证不再犯",
      "火气上来，忍不住发一顿脾气",
      "忍住了，但事后越想越气、憋得慌",
      "先想他为什么不敢说实话，再找机会平静沟通"
    ]),
    p(7, "d-p2", "当孩子顶嘴、跟你抬杠或带语气说“你烦不烦”时，你的真实反应是：", [
      "本能暴怒：“你怎么跟父母说话的？没规矩！”",
      "当场怼回去：“你这是什么态度？有本事你别用我的！”",
      "投鼠忌器：心里极其窝火，但又怕闹大刺激到他，只能硬憋着",
      "主动降温：“停止争辩，我们现在都有情绪，等冷静一下再沟通”"
    ]),
    p(8, "d-p2", "孩子拿着一道很难的题目来问你或求助时，你会：", [
      "直接给答案，让他照着步骤抄",
      "嫌他不动脑子，先数落他几句",
      "语气耐心，但讲完总要加一句“下次细心点”",
      "先问他是怎么想的，陪他一起探寻思路"
    ]),
    p(9, "d-p3", "【青春期暗线】孩子放学回房间就把门“砰”地关上，不让你进也不愿多说话，你心里：", [
      "觉得莫名其妙又窝火",
      "觉得委屈又小心翼翼，不知道该怎么问",
      "心里七上八下满是焦虑",
      "虽有失落，但克制焦虑留出空间，温和敲门：“如果你有需要，妈妈一直在”"
    ]),
    p(10, "d-p3", "报兴趣班、补习班或日常衣着选择时，决定权通常在：", [
      "我们全权决定，孩子负责执行",
      "商量过，但最后还是按父母的意思来",
      "让孩子选，但既然选择了就必须坚持不能半途而废",
      "共同商量，尊重他的决定并允许在试错中调整"
    ]),
    p(11, "d-p3", "孩子的房间、书包、时间规划极度混乱时，你通常：", [
      "强行干涉：“必须按我的标准收拾整齐”",
      "看不下去就忍不住上手替他全打理好",
      "想放手，但总忍不住在一旁碎碎念",
      "让他自己做主，只在需要时提供工具支持"
    ]),
    p(12, "d-p3", "【青春期暗线】对于孩子的日记、手机微信、交友等私事，你的态度是：", [
      "必要时可以查看，这是为他好",
      "想看但忍住了，会旁敲侧击地问",
      "不看，但总忍不住私下打听",
      "尊重边界，他愿意的时候自然会分享"
    ]),
    p(13, "d-p4", "孩子难得主动帮忙做家务，却弄得一团糟或完全不符合预期，你的第一反应：", [
      "气不打一处来：“越帮越忙！以后别动了”",
      "叹气泄气：“算了，还不如我自己来，净添乱”",
      "嘴上夸了一句，接着就忍不住挑毛病哪里没做好",
      "肯定他的善意与付出：“谢谢宝贝帮妈妈分担”"
    ]),
    p(14, "d-p4", "当孩子陷入自卑，说“我肯定不行/别帮我报名了”时，你会：", [
      "硬逼强推：“这有什么好怕的？必须去！”",
      "急躁数落：“还没试就打退堂鼓，怎么遇到困难就想躲！”",
      "盲目打鸡血：“你最棒了！要相信自己！”",
      "调整期待：“咱把目标拆小，先从最容易的一件小事开始”"
    ]),
    p(15, "d-p4", "孩子尝试一件新鲜事（如组装模型、参加竞选）却彻底搞砸时：", [
      "“早跟你说了不行，非不听”",
      "批评他做事冲动、不考虑后果",
      "心疼他，但顺手接过来替他完成剩余部分",
      "肯定他的勇气：“试错本身就是最棒的积累”"
    ]),
    p(16, "d-p4", "孩子失败后（没考好、竞选没选上），他更可能：", [
      "藏着不说，怕你失望",
      "说出来，但会被数落一顿",
      "会说，你会安慰他“下次努力”",
      "主动找你聊，你陪他把失败变成经验"
    ]),
    p(17, "d-p5", "听到别人家孩子成绩拔尖或某方面表现优异时，你内心：", [
      "忍不住下意识说教：“你看人家多自觉！你要向别人学习”",
      "急切地追问怎么做：“你自己怎么想的？打算怎么做？”",
      "满腹心酸与挫败：“算了，我怎么管都没用，随他去吧……”",
      "笃定孩子有自己的生长节奏，不拿短板撞人长板"
    ]),
    p(18, "d-p5", "对孩子发完脾气后，你通常的心理轨迹是：", [
      "觉得是他太惹人生气，自己一点错没有",
      "后悔自责，但下次依然控制不住陷入循环",
      "会跟孩子道歉，但不知道如何避免下一次失控",
      "觉察自己的焦虑按钮，找到源头并持续自我成长"
    ]),
    p(19, "d-p5", "工作不顺、心情极度烦躁时回到家，面对孩子的打扰，你会：", [
      "孩子一点小事就能把你彻底点燃",
      "尽量忍着，但语气冰冷或偶尔迁怒",
      "强行控制，事后解释“妈妈今天太累了”",
      "进家门前给自己 3 分钟缓冲平复，状态稳了再进门"
    ]),
    p(20, "d-p5", "你小时候被父母对待的方式，现在还在影响你带孩子吗？", [
      "没想过这个问题",
      "想过，但不知道怎么跳出那些老模式",
      "看清了一些，正在努力改变",
      "能分清“那是上一代的方式”，我在写自己的新版本"
    ])
  ];

  function cloneParentQuestions() {
    return PARENT_QUESTIONS.map(function (q) {
      return {
        id: "tpl-parent-" + q.id, typeFlag: 1, dimensionalityId: q.dimensionalityId,
        title: q.title, idx: q.idx,
        options: q.options.map(function (o) { return { id: "tpl-parent-" + o.id, content: o.content, score: o.score, idx: o.idx }; })
      };
    });
  }

  /* 三档：档位固定百分比，勋章与金句随档位唯一，不并列 */
  var POWER_RESULTS = [
    {
      id: "pr1", name: "低档", scoreMin: 0, scoreMax: 23,
      badge: "☀️ 温暖而坚韧的托底妈妈",
      quote: "所有的育儿焦虑，都是在等待一个觉醒的自己。",
      percentile: "超越 15% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 15% 的家长。你很爱孩子，但方法和精力之间已经出现透支。你很累，孩子也很累。",
      detail: "当前五力整体偏低，最先需要被照顾的其实是你自己的状态。",
      suggest: "先选一件最小的自我照顾动作，坚持一周，再谈改变孩子。"
    },
    {
      id: "pr2", name: "中档", scoreMin: 24, scoreMax: 47,
      badge: "🌱 向光生长的成长妈妈",
      quote: "父母的觉醒，是孩子一生的救赎；懂得看见，比一味付出更重要。",
      percentile: "超越 45% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 45% 的家长。你已经在努力看见孩子，但在压力叠加时会回到旧模式。",
      detail: "你具备一定的觉察与沟通基础，卡点通常出现在情绪最满的那一刻。",
      suggest: "把「先听完再表达」变成固定动作，每次分歧都练一遍。"
    },
    {
      id: "pr3", name: "高档", scoreMin: 48, scoreMax: 60,
      badge: "✨ 温柔笃定的觉醒妈妈",
      quote: "育儿先育己，少一点无谓的控制，多一些静待花开的松弛。",
      percentile: "超越 95% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 95% 的家长。你能稳稳接住情绪，也愿意把选择权还给孩子。",
      detail: "五力发展均衡，情感链接与自我觉察是当前的优势。",
      suggest: "把你的经验整理成可复用的方法，分享给身边的家长。"
    }
  ];

  /* 各维度指标结果（索引为 0 的那一行）承载三段文案：卡点 / 风险 / 欣赏。
     前端按维度 key 读取，不再写死在页面里。 */
  var POWER_DIM_EXPLAINS = [
    {
      key: "d-p1", dimensionId: "d-p1", name: "情感链接力", scoreMin: 0, scoreMax: 12,
      painTip: "您的核心卡点在【情感链接力】维度。",
      painText: "这意味着：孩子有情绪时，您更习惯先解决问题，而不是先接住感受。孩子慢慢学会的不是“说出来”，而是“憋回去”。",
      riskText: "您和孩子之间的情绪通道正在变窄。如果不做调整，孩子遇到大事时会先找别人，而不是找您。",
      appreciate: "欣赏你在孩子崩溃、考砸、发脾气的时候，能先稳稳地接住他的情绪，不急着讲道理、不急着纠正——先给拥抱，再给爱。孩子确定“无论怎样爸妈都在”，这是他一生安全感的底座。",
      appreciateAlt: "比起很多家长，你在接住孩子情绪这件事上已经走在了前面——孩子崩溃、考砸、发脾气时，你能先稳稳接住，不急着讲道理。孩子确定“无论怎样爸妈都在”，这是他一生安全感的底座。",
      detail: "", suggest: ""
    },
    {
      key: "d-p2", dimensionId: "d-p2", name: "走心沟通力", scoreMin: 0, scoreMax: 12,
      painTip: "您的核心卡点在【走心沟通力】维度。",
      painText: "这意味着：您习惯了讲道理、下指令、纠对错。您说得越多，孩子越不听。这不是您不会说话，而是您自己从小就是在这样的“道理”和“要求”中长大的。孩子的生命力，正在被这份“没完没了的说教”一点点耗空。",
      riskText: "您和孩子正在严重消耗中。如果不做调整，3-6 个月内可能出现沟通关闭、孩子不愿说话。",
      appreciate: "欣赏你听得懂孩子没说出口的心声。一天里你说的不只有“快点”和“作业”，还有“我在听，然后呢”——愿意放下手里的事，看着他的眼睛把话听完。被这样倾听着长大的孩子，内心是敞亮的。",
      appreciateAlt: "比起很多家长，你在倾听孩子这件事上已经走在了前面——你愿意放下手里的事，看着他的眼睛把话听完，而不只是问“作业写完没”。被这样倾听着长大的孩子，内心是敞亮的。",
      detail: "", suggest: ""
    },
    {
      key: "d-p3", dimensionId: "d-p3", name: "边界松弛力", scoreMin: 0, scoreMax: 12,
      painTip: "您的核心卡点在【边界松弛力】维度。",
      painText: "这意味着：您很难放心把选择权交出去，于是用控制和提醒来代替信任。孩子收到的信号是“我不行”，而不是“我可以试”。",
      riskText: "长期缺氧的自主权，会让孩子在青春期用更激烈的方式抢回控制权。",
      appreciate: "欣赏你克制住了包办的冲动。孩子关门时你稳得住，选择权、试错权你舍得还给他——知道他需要在试错里长出自己的边界。你的松弛，就是孩子青春期的呼吸感。",
      appreciateAlt: "比起很多家长，你在放手这件事上已经走在了前面——孩子关门时你稳得住，也愿意把选择权还给他。你的松弛，就是孩子青春期的呼吸感。",
      detail: "", suggest: ""
    },
    {
      key: "d-p4", dimensionId: "d-p4", name: "赋能托底力", scoreMin: 0, scoreMax: 12,
      painTip: "您的核心卡点在【赋能托底力】维度。",
      painText: "这意味着：孩子失败时，您更容易先给评价，而不是先给托底。孩子学到的不是“失败没关系”，而是“失败不能被看见”。",
      riskText: "孩子会越来越不敢尝试新事物，遇到困难先放弃，而不是先试一次。",
      appreciate: "欣赏你能看见孩子的努力与善意，而不只盯着结果。他搞砸时你先肯定勇气，他自卑时你把大目标拆成小台阶——孩子收到的不是“我不行”，而是“我可以再试一次”。这份底气，会变成他面对失败的肌肉记忆。",
      appreciateAlt: "比起很多家长，你在托底孩子这件事上已经走在了前面——他搞砸时你先肯定勇气，他自卑时你愿意把目标拆小。孩子收到的不是“我不行”，而是“我可以再试一次”。",
      detail: "", suggest: ""
    },
    {
      key: "d-p5", dimensionId: "d-p5", name: "自我觉察力", scoreMin: 0, scoreMax: 12,
      painTip: "您的核心卡点在【自我觉察力】维度。",
      painText: "这意味着：您的焦虑按钮常常在孩子身上被按下，但源头往往在您自己的成长经历里。不是您不够爱，而是您太累。",
      riskText: "未被觉察的焦虑会稳定地传递给孩子，形成一代接一代的重复。",
      appreciate: "欣赏你能回头看见自己。发完火会复盘、面对“别人家孩子”能想起自己孩子的节奏、分得清“那是上一代的方式”——你正在写属于自己的养育新版本。你稳了，孩子就稳了。",
      appreciateAlt: "比起很多家长，你在自我觉察这件事上已经走在了前面——你开始回头看见自己，分得清哪些是上一代的方式。你正在写属于自己的养育新版本。",
      detail: "", suggest: ""
    }
  ];

  var DIMENSION_TEMPLATES = [
    {
      id: "dt-6q",
      name: "6Q 六维模型",
      memo: "AQ/EQ/CQ/IQ/RQ/SQ 六维综合，适用于全维测评。",
      rows: Object.keys(DIM_ROWS).map(function (k) { return { key: k, name: DIM_ROWS[k].name, memo: DIM_ROWS[k].memo }; }),
      sonNum: 6,
      status: 1,
      createTime: "2026-03-12 10:20",
      createUser: "余炜烽"
    },
    {
      id: "dt-parent",
      name: "亲子养育五力模型",
      memo: "情感链接力、走心沟通力、边界松弛力、赋能托底力、自我觉察力，每维 4 题 × 3 分 = 12 分，总分 60。",
      rows: Object.keys(POWER_ROWS).map(function (k) { return { key: k, name: POWER_ROWS[k].name, memo: POWER_ROWS[k].memo }; }),
      sonNum: 5,
      status: 1,
      createTime: "2026-11-10 09:20",
      createUser: "余炜烽"
    },
    {
      id: "dt-parent-old",
      name: "亲子关系四维",
      memo: "陪伴、沟通、边界、信任四个维度。",
      rows: [
        { key: "d-p1", name: "陪伴", memo: "高质量相处时间" },
        { key: "d-p2", name: "沟通", memo: "倾听与表达" },
        { key: "d-p3", name: "边界", memo: "规则与自由" },
        { key: "d-p4", name: "信任", memo: "彼此的安全感" }
      ],
      sonNum: 4,
      status: 1,
      createTime: "2026-04-02 14:05",
      createUser: "余炜烽"
    },
    {
      id: "dt-emotion",
      name: "情绪智慧五维",
      memo: "觉察、表达、调节、共情、复原。",
      rows: [
        { key: "d-e1", name: "觉察", memo: "看见情绪" },
        { key: "d-e2", name: "表达", memo: "说出感受" },
        { key: "d-e3", name: "调节", memo: "安顿自己" },
        { key: "d-e4", name: "共情", memo: "理解他人" },
        { key: "d-e5", name: "复原", memo: "从波动中回来" }
      ],
      sonNum: 5,
      status: 1,
      createTime: "2026-05-18 09:40",
      createUser: "余炜烽"
    },
    {
      id: "dt-study",
      name: "学习动力四维",
      memo: "目标、专注、方法、坚持。",
      rows: [
        { key: "d-s1", name: "目标", memo: "知道为什么学" },
        { key: "d-s2", name: "专注", memo: "进入学习状态" },
        { key: "d-s3", name: "方法", memo: "会拆解与练习" },
        { key: "d-s4", name: "坚持", memo: "遇到困难不放弃" }
      ],
      sonNum: 4,
      status: 2,
      createTime: "2026-06-06 16:12",
      createUser: "余炜烽"
    }
  ];

  var RESULTS = [
    {
      id: "r1",
      name: "蓄力期",
      scoreMin: 0,
      scoreMax: 47,
      base: "你正在积累对自己的理解。现在的重点不是立刻改变，而是先看见自己的反应模式，找到一个可以小步尝试的入口。",
      detail: "你对情绪的觉察还在建立中，遇到压力时容易先被事情推着走。建议从每天一次“我现在感觉如何”的记录开始。",
      suggest: "先选一个最小的场景练习：比如每天晚饭后，用一句话说出今天的感受。"
    },
    {
      id: "r2",
      name: "整合期",
      scoreMin: 48,
      scoreMax: 59,
      base: "你已经具备一些稳定的自我调节方式，但在压力叠加时仍会回到旧习惯。你需要的不是更多道理，而是更稳定的练习节奏。",
      detail: "你能识别大部分情绪，也愿意沟通，但在关系紧张时容易先保护自己。把“先听完”变成具体动作，会帮助你更稳。",
      suggest: "下一次分歧时，先复述对方的观点，再表达自己的立场。"
    },
    {
      id: "r3",
      name: "绽放期",
      scoreMin: 60,
      scoreMax: 72,
      base: "你有较好的心理弹性与关系敏感度，能在变化中保持方向。继续把这种稳定带到更重要的事情上，你会走得更远。",
      detail: "你的六维发展比较均衡，关系力与学习力是当前的优势。可以尝试把个人经验整理成方法，帮助身边的人。",
      suggest: "选一个你想长期投入的方向，写下未来 30 天可以做的三件小事。"
    }
  ];

  var DIM_EXPLAINS = [
    {
      dimensionId: "d-aq",
      name: "AQ 逆商",
      scoreMin: 0, scoreMax: 12,
      detail: "面对变化时容易先僵住，需要更多“下一步做什么”的小练习。",
      suggest: "把大变化拆成一个 10 分钟内能完成的小动作。"
    },
    {
      dimensionId: "d-eq",
      name: "EQ 情商",
      scoreMin: 0, scoreMax: 12,
      detail: "能感受到情绪，但表达还不够具体。把“烦”换成更准确的情绪词，会更容易被理解。",
      suggest: "每天记录一个情绪词，并写下触发它的事情。"
    },
    {
      dimensionId: "d-cq",
      name: "CQ 创造力",
      scoreMin: 0, scoreMax: 12,
      detail: "你有想法，但有时会等“想清楚了”再行动。先做一个小样，会带来更多线索。",
      suggest: "本周把一个想法做成 1 页草图或 1 分钟说明。"
    },
    {
      dimensionId: "d-iq",
      name: "IQ 学习力",
      scoreMin: 0, scoreMax: 12,
      detail: "你愿意学，但复盘节奏还不稳定。把“学过”变成“讲出来”，掌握会更牢。",
      suggest: "每周选一个知识点，用自己的话讲给一个人听。"
    },
    {
      dimensionId: "d-rq",
      name: "RQ 关系力",
      scoreMin: 0, scoreMax: 12,
      detail: "你重视关系，也愿意表达，但在冲突中容易急着证明自己。先听完，再回应。",
      suggest: "分歧时先问一句：“你最在意的是哪一点？”"
    },
    {
      dimensionId: "d-sq",
      name: "SQ 灵性力",
      scoreMin: 0, scoreMax: 12,
      detail: "你开始思考长期方向，但还需要更具体的画面。把“想要”写成可描述的场景。",
      suggest: "写下三年后普通的一天，从早到晚是什么样子。"
    }
  ];

  var TEMPLATES = [
    {
      id: "tpl-6q",
      title: "6Q 全维测评",
      subTitle: "看见你的六种力量",
      categoryId: "c-6q",
      categoryName: "6Q 全维",
      dimensionalityId: "dt-6q",
      dimensionName: "6Q 六维模型",
      questionCount: 12,
      resultCount: 3,
      scoreTotal: 72,
      totalTime: 8,
      totalTimeUnit: 1,
      status: 1,
      createUser: "余炜烽",
      createTime: "2026-09-18 10:20",
      virtualTesters: 12860,
      agedTag: true,
      faceImg: COVER + "6q.svg",
      examImg: COVER + "6q-wide.svg",
      titleImg: COVER + "poster-6q.svg",
      reportImg: COVER + "poster-6q.svg",
      examDescription: "用 12 个日常情境，快速看见你在逆商、情商、创造力、学习力、关系力与灵性力上的当前状态。没有好坏，只有此刻的位置。",
      resultTitle: "你的 6Q 当前位置",
      resultDemo: "结果页会展示总分、六维雷达、同龄分布与每一维的具体解读。",
      answerSummary: "请按最近一个月的真实状态作答，不必选“应该”的答案。",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: true,
      showHarmonyImage: true,
      questions: cloneQuestions("6q"),
      results: RESULTS,
      dimensionExplains: DIM_EXPLAINS
    },
    {
      id: "tpl-aq",
      title: "青少年 AQ 逆商测评",
      subTitle: "遇到变化，你会怎么走",
      categoryId: "c-aq",
      categoryName: "AQ 逆商",
      dimensionalityId: "dt-6q",
      dimensionName: "6Q 六维模型",
      questionCount: 12,
      resultCount: 3,
      scoreTotal: 72,
      totalTime: 6,
      totalTimeUnit: 1,
      status: 1,
      createUser: "余炜烽",
      createTime: "2026-09-20 15:02",
      virtualTesters: 8620,
      agedTag: true,
      faceImg: COVER + "aq.svg",
      examImg: COVER + "aq-wide.svg",
      titleImg: COVER + "poster-aq.svg",
      reportImg: COVER + "poster-aq.svg",
      examDescription: "面向 10-18 岁青少年的逆商测评，聚焦变化、挫折、恢复与行动。",
      resultTitle: "你的逆商画像",
      resultDemo: "结果页展示逆商总分、恢复力与行动力两条曲线。",
      answerSummary: "按最近一个月的真实反应作答。",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: true,
      showHarmonyImage: true,
      questions: cloneQuestions("aq"),
      results: RESULTS,
      dimensionExplains: DIM_EXPLAINS
    },
    {
      id: "tpl-parent",
      title: "高EQ父母 · 亲子关系测评",
      subTitle: "先看见关系，再谈方法",
      categoryId: "c-parent",
      categoryName: "亲子关系",
      dimensionalityId: "dt-parent",
      dimensionName: "亲子养育五力模型",
      questionCount: 20,
      resultCount: 3,
      scoreTotal: 60,
      totalTime: 10,
      totalTimeUnit: 1,
      status: 1,
      createUser: "余炜烽",
      createTime: "2026-09-22 09:18",
      virtualTesters: 15230,
      agedTag: false,
      resultLayout: 2,
      faceImg: COVER + "parent.svg",
      examImg: COVER + "parent-wide.svg",
      titleImg: COVER + "poster-parent.svg",
      reportImg: COVER + "poster-parent.svg",
      examDescription: "从情感链接力、走心沟通力、边界松弛力、赋能托底力、自我觉察力五个维度，看看你和孩子的关系现在走到了哪里。",
      resultTitle: "测评结果",
      resultDemo: "",
      answerSummary: "请以你与孩子最近一个月的真实相处作答，不必选“应该”的答案。",
      riskTip: "您和孩子正在严重消耗中。如果不做调整，3-6 个月内可能出现沟通关闭、孩子不愿说话。",
      ctaText: "想知道这个育儿卡点是如何形成的？为什么“道理都懂，面对孩子还是忍不住火大”？1 对 1 测评深度解读，帮您把测评结果转化为一份可落地的《家庭育儿改善清单》。",
      ctaSubText: "添加导师微信，帮您把分数变成方向",
      ctaQrCode: COVER + "qr.svg",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: false,
      showHarmonyImage: false,
      questions: cloneParentQuestions(),
      results: POWER_RESULTS,
      dimensionExplains: POWER_DIM_EXPLAINS
    },
    {
      id: "tpl-eq",
      title: "情绪智慧 EQ 测评",
      subTitle: "和情绪做朋友",
      categoryId: "c-eq",
      categoryName: "EQ 情商",
      dimensionalityId: "dt-emotion",
      dimensionName: "情绪智慧五维",
      questionCount: 12,
      resultCount: 3,
      scoreTotal: 72,
      totalTime: 7,
      totalTimeUnit: 1,
      status: 1,
      createUser: "余炜烽",
      createTime: "2026-09-25 11:42",
      virtualTesters: 11205,
      agedTag: true,
      faceImg: COVER + "eq.svg",
      examImg: COVER + "eq-wide.svg",
      titleImg: COVER + "poster-eq.svg",
      reportImg: COVER + "poster-eq.svg",
      examDescription: "情绪不是问题，如何与它相处才是。用 12 个情境看看你的觉察、表达与复原力。",
      resultTitle: "你的情绪使用说明",
      resultDemo: "结果页展示情绪五维与三条可立即练习的小建议。",
      answerSummary: "按最近一个月的真实状态作答。",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: true,
      showHarmonyImage: true,
      questions: cloneQuestions("eq"),
      results: RESULTS,
      dimensionExplains: DIM_EXPLAINS
    },
    {
      id: "tpl-iq",
      title: "学习动力 IQ 测评",
      subTitle: "找回学习的掌控感",
      categoryId: "c-iq",
      categoryName: "IQ 学习力",
      dimensionalityId: "dt-study",
      dimensionName: "学习动力四维",
      questionCount: 12,
      resultCount: 3,
      scoreTotal: 72,
      totalTime: 6,
      totalTimeUnit: 1,
      status: 2,
      createUser: "余炜烽",
      createTime: "2026-09-28 16:30",
      virtualTesters: 6840,
      agedTag: true,
      faceImg: COVER + "iq.svg",
      examImg: COVER + "iq-wide.svg",
      titleImg: COVER + "poster-iq.svg",
      reportImg: COVER + "poster-iq.svg",
      examDescription: "从目标、专注、方法、坚持四个角度，找到学习卡住的真实位置。",
      resultTitle: "你的学习动力曲线",
      resultDemo: "结果页展示四维动力图与一份 7 天行动清单。",
      answerSummary: "按最近一个月的学习状态作答。",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: false,
      showHarmonyImage: false,
      questions: cloneQuestions("iq"),
      results: RESULTS,
      dimensionExplains: DIM_EXPLAINS
    },
    {
      id: "tpl-rq",
      title: "关系力 RQ 测评",
      subTitle: "在关系里做自己",
      categoryId: "c-rq",
      categoryName: "RQ 关系力",
      dimensionalityId: "dt-6q",
      dimensionName: "6Q 六维模型",
      questionCount: 12,
      resultCount: 3,
      scoreTotal: 72,
      totalTime: 7,
      totalTimeUnit: 1,
      status: 1,
      createUser: "余炜烽",
      createTime: "2026-10-02 10:05",
      virtualTesters: 5230,
      agedTag: true,
      faceImg: COVER + "rq.svg",
      examImg: COVER + "rq-wide.svg",
      titleImg: COVER + "poster-rq.svg",
      reportImg: COVER + "poster-rq.svg",
      examDescription: "看见你在倾听、表达、边界与信任上的习惯，找到更舒服的相处方式。",
      resultTitle: "你的关系力画像",
      resultDemo: "结果页展示关系力雷达与一段关系练习。",
      answerSummary: "按最近一个月的真实相处作答。",
      showTotalScore: true,
      showDimensionalityImage: true,
      showDistributionImage: true,
      showHarmonyImage: true,
      questions: cloneQuestions("rq"),
      results: RESULTS,
      dimensionExplains: DIM_EXPLAINS
    }
  ];

  var GOODS = [
    {
      id: "g-6q",
      key: "6q",
      code: "EX20260918001",
      name: "6Q 全维测评",
      categoryId: "c-6q",
      categoryName: "6Q 全维",
      coverImage: COVER + "6q.svg",
      qrCode: COVER + "qr.svg",
      price: 99,
      priceIos: 99,
      idx: 1,
      oaProductName: "6Q 心画测评 · 全维版",
      templeteIds: ["tpl-6q"],
      templeteTitle: "6Q 全维测评",
      thirdParty: "",
      status: 1,
      heartFlag: 1,
      displayStatus: true,
      createUser: "余炜烽",
      createTime: "2026-09-18 10:30",
      testCount: 12860,
      intro: "一次看见六种力量，适合第一次接触 6Q 的你。"
    },
    {
      id: "g-aq",
      key: "aq",
      code: "EX20260920001",
      name: "青少年 AQ 逆商测评",
      categoryId: "c-aq",
      categoryName: "AQ 逆商",
      coverImage: COVER + "aq.svg",
      qrCode: COVER + "qr.svg",
      price: 49,
      priceIos: 49,
      idx: 2,
      oaProductName: "6Q 心画测评 · 青少年版",
      templeteIds: ["tpl-aq"],
      templeteTitle: "青少年 AQ 逆商测评",
      thirdParty: "nh",
      status: 1,
      heartFlag: 1,
      displayStatus: true,
      createUser: "余炜烽",
      createTime: "2026-09-20 15:10",
      testCount: 8620,
      intro: "遇到变化时，你是先僵住，还是先找下一步？"
    },
    {
      id: "g-parent",
      key: "parent",
      code: "EX20260922001",
      name: "高EQ父母 · 亲子关系测评",
      categoryId: "c-parent",
      categoryName: "亲子关系",
      coverImage: COVER + "parent.svg",
      qrCode: COVER + "qr.svg",
      price: 199,
      priceIos: 199,
      idx: 3,
      oaProductName: "6Q 心画测评 · 父母版",
      templeteIds: ["tpl-parent"],
      templeteTitle: "高EQ父母 · 亲子关系测评",
      thirdParty: "",
      status: 1,
      heartFlag: 1,
      displayStatus: true,
      createUser: "余炜烽",
      createTime: "2026-09-22 09:30",
      testCount: 15230,
      intro: "先看见关系，再谈方法。适合 3-18 岁孩子的父母。"
    },
    {
      id: "g-eq",
      key: "eq",
      code: "EX20260925001",
      name: "情绪智慧 EQ 测评",
      categoryId: "c-eq",
      categoryName: "EQ 情商",
      coverImage: COVER + "eq.svg",
      qrCode: COVER + "qr.svg",
      price: 99,
      priceIos: 99,
      idx: 4,
      oaProductName: "6Q 心画测评 · 情绪版",
      templeteIds: ["tpl-eq"],
      templeteTitle: "情绪智慧 EQ 测评",
      thirdParty: "nh",
      status: 1,
      heartFlag: 1,
      displayStatus: true,
      createUser: "余炜烽",
      createTime: "2026-09-25 11:50",
      testCount: 11205,
      intro: "情绪不是问题，如何与它相处才是。"
    },
    {
      id: "g-iq",
      key: "iq",
      code: "EX20260928001",
      name: "学习动力 IQ 测评",
      categoryId: "c-iq",
      categoryName: "IQ 学习力",
      coverImage: COVER + "iq.svg",
      qrCode: COVER + "qr.svg",
      price: 49,
      priceIos: 49,
      idx: 5,
      oaProductName: "6Q 心画测评 · 学习版",
      templeteIds: ["tpl-iq"],
      templeteTitle: "学习动力 IQ 测评",
      thirdParty: "",
      status: 2,
      heartFlag: 2,
      displayStatus: false,
      createUser: "余炜烽",
      createTime: "2026-09-28 16:40",
      testCount: 6840,
      intro: "找回学习的掌控感，从看见卡点开始。"
    },
    {
      id: "g-rq",
      key: "rq",
      code: "EX20261002001",
      name: "关系力 RQ 测评",
      categoryId: "c-rq",
      categoryName: "RQ 关系力",
      coverImage: COVER + "rq.svg",
      qrCode: COVER + "qr.svg",
      price: 99,
      priceIos: 99,
      idx: 6,
      oaProductName: "6Q 心画测评 · 关系版",
      templeteIds: ["tpl-rq"],
      templeteTitle: "关系力 RQ 测评",
      thirdParty: "",
      status: 1,
      heartFlag: 1,
      displayStatus: true,
      createUser: "余炜烽",
      createTime: "2026-10-02 10:15",
      testCount: 5230,
      intro: "在关系里做自己，也给别人留位置。"
    }
  ];

  var SUBJECTS = [
    { id: "s-1", name: "6Q 全维成长", detail: "一次看见六种力量，适合第一次接触 6Q 的你。", faceImg: COVER + "6q.svg", idx: 1, status: 1, goodsIds: ["g-6q", "g-aq", "g-eq"], createTime: "2026-09-18 10:40" },
    { id: "s-2", name: "亲子关系", detail: "先看见关系，再谈方法。", faceImg: COVER + "parent.svg", idx: 2, status: 1, goodsIds: ["g-parent"], createTime: "2026-09-22 09:40" },
    { id: "s-3", name: "青少年成长", detail: "面向 10-18 岁青少年的逆商与情绪测评。", faceImg: COVER + "aq.svg", idx: 3, status: 1, goodsIds: ["g-aq", "g-eq"], createTime: "2026-09-20 15:20" },
    { id: "s-4", name: "学习与专注", detail: "找到学习卡住的真实位置。", faceImg: COVER + "iq.svg", idx: 4, status: 0, goodsIds: ["g-iq"], createTime: "2026-09-28 16:50" },
    { id: "s-5", name: "关系与沟通", detail: "在关系里做自己，也给别人留位置。", faceImg: COVER + "rq.svg", idx: 5, status: 1, goodsIds: ["g-rq"], createTime: "2026-10-02 10:20" }
  ];

  var CATEGORIES = [
    { id: "c-6q", name: "6Q 全维", image: COVER + "6q.svg", idx: 1, status: 1, showFlag: 1, createTime: "2026-03-12 10:00", createUser: "余炜烽" },
    { id: "c-aq", name: "AQ 逆商", image: COVER + "aq.svg", idx: 2, status: 1, showFlag: 1, createTime: "2026-03-12 10:05", createUser: "余炜烽" },
    { id: "c-eq", name: "EQ 情商", image: COVER + "eq.svg", idx: 3, status: 1, showFlag: 1, createTime: "2026-03-12 10:10", createUser: "余炜烽" },
    { id: "c-cq", name: "CQ 创造力", image: COVER + "cq.svg", idx: 4, status: 1, showFlag: 1, createTime: "2026-03-12 10:15", createUser: "余炜烽" },
    { id: "c-iq", name: "IQ 学习力", image: COVER + "iq.svg", idx: 5, status: 1, showFlag: 1, createTime: "2026-03-12 10:20", createUser: "余炜烽" },
    { id: "c-rq", name: "RQ 关系力", image: COVER + "rq.svg", idx: 6, status: 1, showFlag: 1, createTime: "2026-03-12 10:25", createUser: "余炜烽" },
    { id: "c-parent", name: "亲子关系", image: COVER + "parent.svg", idx: 7, status: 1, showFlag: 0, createTime: "2026-04-02 14:10", createUser: "余炜烽" },
    { id: "c-emotion", name: "情绪管理", image: COVER + "emotion.svg", idx: 8, status: 2, showFlag: 0, createTime: "2026-05-18 09:50", createUser: "余炜烽" }
  ];

  var APPRAISES = [
    { id: "a1", title: "6Q 全维测评", user: { serialNo: "S6MULM1", name: "赵欣然", mobile: "134****2552" }, score: 5, content: "第一次这么清楚地看到自己在关系里的习惯，结果页的建议很具体，不是空话。", createTime: "2026-10-28 20:12" },
    { id: "a2", title: "高EQ父母 · 亲子关系测评", user: { serialNo: "LXW8821", name: "林晓雯", mobile: "138****1101" }, score: 4, content: "有几道题很戳中，尤其是“先听完再表达”。希望后面能出针对孩子的版本。", createTime: "2026-10-27 19:40" },
    { id: "a3", title: "青少年 AQ 逆商测评", user: { serialNo: "CQH7601", name: "陈启航", mobile: "135****9840" }, score: 5, content: "孩子自己做完的，结果说他“遇到变化会先僵住”，他觉得挺准。", createTime: "2026-10-27 16:05" },
    { id: "a4", title: "情绪智慧 EQ 测评", user: { serialNo: "WM8EELU", name: "王敏", mobile: "133****1201" }, score: 4, content: "题目不难，做起来没有压力。结果里的情绪词表很实用。", createTime: "2026-10-26 21:18" },
    { id: "a5", title: "6Q 全维测评", user: { serialNo: "3N2006", name: "吴彤", mobile: "132****6762" }, score: 5, content: "雷达图很好看，分享给朋友了。", createTime: "2026-10-26 18:32" },
    { id: "a6", title: "关系力 RQ 测评", user: { serialNo: "LY20414", name: "刘洋", mobile: "186****0414" }, score: 3, content: "整体不错，但报告里的建议有点少，希望能再具体一点。", createTime: "2026-10-25 14:22" },
    { id: "a7", title: "高EQ父母 · 亲子关系测评", user: { serialNo: "V1MHF63", name: "黄志远", mobile: "177****5773" }, score: 5, content: "和爱人一起做的，做完聊了很久。", createTime: "2026-10-24 22:10" },
    { id: "a8", title: "青少年 AQ 逆商测评", user: { serialNo: "GF32KT7", name: "孙悦", mobile: "134****6979" }, score: 4, content: "希望答题过程可以自动保存，中途退出不用重来。", createTime: "2026-10-24 10:45" },
    { id: "a9", title: "情绪智慧 EQ 测评", user: { serialNo: "GDZE232", name: "马丽", mobile: "188****2924" }, score: 5, content: "结果页的“情绪使用说明”这个说法很喜欢。", createTime: "2026-10-23 20:08" },
    { id: "a10", title: "6Q 全维测评", user: { serialNo: "HJ2988", name: "何俊", mobile: "159****9888" }, score: 4, content: "题目数量刚好，8 分钟能做完。", createTime: "2026-10-23 11:26" }
  ];

  var APPOINTMENTS = [
    { id: "m1", nickName: "小满", nickType: "女士", needType: "测评解读", needContent: "想了解孩子的 AQ 报告怎么看", mobile: "138****2210", sourceFrom: "H5 结果页", status: "待跟进", memo: "", createTime: "2026-10-28 21:05" },
    { id: "m2", nickName: "阿哲", nickType: "先生", needType: "课程咨询", needContent: "高EQ父母课程什么时候开", mobile: "139****8821", sourceFrom: "H5 预约页", status: "已联系", memo: "已加微信，发送课程表", createTime: "2026-10-28 17:40" },
    { id: "m3", nickName: "晨曦", nickType: "女士", needType: "心理陪伴", needContent: "最近和青春期孩子沟通很累", mobile: "136****1029", sourceFrom: "H5 结果页", status: "待跟进", memo: "", createTime: "2026-10-27 22:18" },
    { id: "m4", nickName: "老周", nickType: "先生", needType: "合作咨询", needContent: "学校心理测评合作", mobile: "137****6630", sourceFrom: "官网", status: "已联系", memo: "转给渠道同事", createTime: "2026-10-27 15:02" },
    { id: "m5", nickName: "叶子", nickType: "女士", needType: "测评解读", needContent: "RQ 报告里的边界感怎么练", mobile: "135****4412", sourceFrom: "H5 结果页", status: "已完成", memo: "已预约周日下午", createTime: "2026-10-26 19:30" },
    { id: "m6", nickName: "安安", nickType: "孩子", needType: "课程咨询", needContent: "青少年营还有名额吗", mobile: "134****7781", sourceFrom: "H5 预约页", status: "待跟进", memo: "", createTime: "2026-10-26 13:12" },
    { id: "m7", nickName: "木木", nickType: "女士", needType: "心理陪伴", needContent: "想找老师聊聊自己的情绪", mobile: "133****9021", sourceFrom: "H5 结果页", status: "已联系", memo: "已发测评解读文章", createTime: "2026-10-25 20:55" },
    { id: "m8", nickName: "大川", nickType: "先生", needType: "合作咨询", needContent: "企业员工心理测评", mobile: "138****3345", sourceFrom: "官网", status: "待跟进", memo: "", createTime: "2026-10-25 10:20" }
  ];

  var CHECK_DETAILS = [
    { id: "d1", examType: "6Q 全维", categoryText: "6Q 全维", title: "6Q 全维测评", status: 1, serialNo: "S6MULM1", name: "赵欣然", age: 19, sexText: "女", mobile: "134****2552", memberTypeText: "会员", memberPosition: "学员", scoreTotal: 72, exchangeScore: 63, explainMsg: "绽放期", examTime: "7分12秒", createTime: "2026-10-28 20:10" },
    { id: "d2", examType: "亲子关系", categoryText: "亲子关系", title: "高EQ父母 · 亲子关系测评", status: 1, serialNo: "LXW8821", name: "林晓雯", age: 28, sexText: "女", mobile: "138****1101", memberTypeText: "会员", memberPosition: "家长", scoreTotal: 72, exchangeScore: 58, explainMsg: "整合期", examTime: "9分40秒", createTime: "2026-10-27 19:38" },
    { id: "d3", examType: "AQ 逆商", categoryText: "AQ 逆商", title: "青少年 AQ 逆商测评", status: 1, serialNo: "CQH7601", name: "陈启航", age: 40, sexText: "男", mobile: "135****9840", memberTypeText: "非会员", memberPosition: "家长", scoreTotal: 72, exchangeScore: 66, explainMsg: "绽放期", examTime: "6分05秒", createTime: "2026-10-27 16:02" },
    { id: "d4", examType: "EQ 情商", categoryText: "EQ 情商", title: "情绪智慧 EQ 测评", status: 1, serialNo: "WM8EELU", name: "王敏", age: 32, sexText: "女", mobile: "133****1201", memberTypeText: "会员", memberPosition: "导师", scoreTotal: 72, exchangeScore: 61, explainMsg: "绽放期", examTime: "8分18秒", createTime: "2026-10-26 21:15" },
    { id: "d5", examType: "6Q 全维", categoryText: "6Q 全维", title: "6Q 全维测评", status: 1, serialNo: "3N2006", name: "吴彤", age: 37, sexText: "女", mobile: "132****6762", memberTypeText: "会员", memberPosition: "学员", scoreTotal: 72, exchangeScore: 55, explainMsg: "整合期", examTime: "10分02秒", createTime: "2026-10-26 18:30" },
    { id: "d6", examType: "RQ 关系力", categoryText: "RQ 关系力", title: "关系力 RQ 测评", status: 1, serialNo: "LY20414", name: "刘洋", age: 35, sexText: "男", mobile: "186****0414", memberTypeText: "会员", memberPosition: "导师", scoreTotal: 72, exchangeScore: 49, explainMsg: "整合期", examTime: "7分44秒", createTime: "2026-10-25 14:20" },
    { id: "d7", examType: "亲子关系", categoryText: "亲子关系", title: "高EQ父母 · 亲子关系测评", status: 1, serialNo: "V1MHF63", name: "黄志远", age: 28, sexText: "女", mobile: "177****5773", memberTypeText: "会员", memberPosition: "家长", scoreTotal: 72, exchangeScore: 70, explainMsg: "绽放期", examTime: "8分55秒", createTime: "2026-10-24 22:08" },
    { id: "d8", examType: "AQ 逆商", categoryText: "AQ 逆商", title: "青少年 AQ 逆商测评", status: 2, serialNo: "GF32KT7", name: "孙悦", age: 22, sexText: "男", mobile: "134****6979", memberTypeText: "会员", memberPosition: "学员", scoreTotal: 72, exchangeScore: 44, explainMsg: "蓄力期", examTime: "11分20秒", createTime: "2026-10-24 10:42" },
    { id: "d9", examType: "EQ 情商", categoryText: "EQ 情商", title: "情绪智慧 EQ 测评", status: 1, serialNo: "GDZE232", name: "马丽", age: 31, sexText: "女", mobile: "188****2924", memberTypeText: "会员", memberPosition: "导师", scoreTotal: 72, exchangeScore: 68, explainMsg: "绽放期", examTime: "6分30秒", createTime: "2026-10-23 20:05" },
    { id: "d10", examType: "6Q 全维", categoryText: "6Q 全维", title: "6Q 全维测评", status: 1, serialNo: "HJ2988", name: "何俊", age: 29, sexText: "男", mobile: "159****9888", memberTypeText: "非会员", memberPosition: "家长", scoreTotal: 72, exchangeScore: 57, explainMsg: "整合期", examTime: "9分10秒", createTime: "2026-10-23 11:24" }
  ];

  var CHECK_SUMMARY = [
    { id: "s1", examType: "6Q 全维", title: "6Q 全维测评", status: 1, scNum: 680, viewNum: 12860, fxtmNum: 420, fxjgNum: 315, testNum: 9860, templeteId: "tpl-6q" },
    { id: "s2", examType: "亲子关系", title: "高EQ父母 · 亲子关系测评", status: 1, scNum: 920, viewNum: 15230, fxtmNum: 610, fxjgNum: 502, testNum: 11230, templeteId: "tpl-parent" },
    { id: "s3", examType: "AQ 逆商", title: "青少年 AQ 逆商测评", status: 1, scNum: 510, viewNum: 8620, fxtmNum: 288, fxjgNum: 240, testNum: 7210, templeteId: "tpl-aq" },
    { id: "s4", examType: "EQ 情商", title: "情绪智慧 EQ 测评", status: 1, scNum: 730, viewNum: 11205, fxtmNum: 402, fxjgNum: 356, testNum: 8900, templeteId: "tpl-eq" },
    { id: "s5", examType: "IQ 学习力", title: "学习动力 IQ 测评", status: 2, scNum: 320, viewNum: 6840, fxtmNum: 180, fxjgNum: 150, testNum: 5210, templeteId: "tpl-iq" },
    { id: "s6", examType: "RQ 关系力", title: "关系力 RQ 测评", status: 1, scNum: 260, viewNum: 5230, fxtmNum: 140, fxjgNum: 120, testNum: 4020, templeteId: "tpl-rq" }
  ];

  var OVERALL = [
    { id: "o1", title: "测评总介绍", detail: "6Q 测评不是给你贴标签，而是帮你看清此刻的位置。每份测评约 6-10 分钟，结果页会给出总分、维度图与可执行的小建议。你可以隔一段时间再测一次，看看自己的变化。", modifyTime: "2026-10-20 14:30" }
  ];

  window.EXAM_DATA = {
    categories: CATEGORIES,
    subjects: SUBJECTS,
    templates: TEMPLATES,
    goods: GOODS,
    appraises: APPRAISES,
    appointments: APPOINTMENTS,
    checkDetails: CHECK_DETAILS,
    checkSummary: CHECK_SUMMARY,
    overall: OVERALL,
    dimensions: DIMENSION_TEMPLATES,
    questions: QUESTIONS,
    results: RESULTS,
    dimExplains: DIM_EXPLAINS,
    dimRows: DIM_ROWS
  };

  try {
    var savedAdmin = localStorage.getItem("exam_admin_data");
    if (savedAdmin) {
      var parsedAdmin = JSON.parse(savedAdmin);
      parsedAdmin = fixCoverPaths(parsedAdmin);
      ["templates", "goods", "subjects", "dimensions", "categories", "overall"].forEach(function (k) {
        if (parsedAdmin[k]) window.EXAM_DATA[k] = parsedAdmin[k];
      });
    }
  } catch (e) {}

  window.EXAM_CONST = {
    version: "v2.0.0",
    topNav: [
      { id: "biz", label: "6Q业务" },
      { id: "live", label: "直播" },
      { id: "schedule", label: "排课管理" },
      { id: "bbs", label: "社区" },
      { id: "mentor", label: "高EQ导师管理" },
      { id: "angel", label: "传播天使管理" },
      { id: "plan", label: "计划与实施" },
      { id: "exam", label: "测评管理", current: true },
      { id: "points", label: "积分管理" },
      { id: "video", label: "视频号管理" },
      { id: "one2one", label: "一对一服务" }
    ],
    sideMenu: [
      { id: "template-list", label: "测评模板管理" },
      { id: "goods-list", label: "测评商品管理" },
      { id: "overall", label: "测评介绍" },
      { id: "appraise", label: "测评反馈" },
      { id: "mental", label: "预约老师留言" },
      { id: "data", label: "测评数据" },
      { id: "subject", label: "测评主题" },
      { id: "dimension", label: "维度管理" },
      { id: "category", label: "分类管理" }
    ],
    statusText: {
      template: { 1: "启用", 2: "禁用" },
      goods: { 1: "上架", 2: "下架" },
      common: { 1: "启用", 0: "禁用", 2: "禁用" }
    }
  };
})();
