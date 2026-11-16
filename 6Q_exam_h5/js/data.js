/**
 * 心画测评 H5 · 模拟数据
 * 字段与后台测评模板 / 商品 / 结果配置同口径。
 */
(function () {
  "use strict";

  var COVER = "../assets/covers/v3/";

  var DIMS_6Q = [
    { key: "AQ", name: "逆商", full: "AQ 逆商", color: "#1677ff" },
    { key: "EQ", name: "情商", full: "EQ 情商", color: "#eb2f96" },
    { key: "CQ", name: "创造力", full: "CQ 创造力", color: "#fa8c16" },
    { key: "IQ", name: "学习力", full: "IQ 学习力", color: "#13a8a8" },
    { key: "RQ", name: "关系力", full: "RQ 关系力", color: "#52c41a" },
    { key: "SQ", name: "灵性力", full: "SQ 灵性力", color: "#722ed1" }
  ];

  var DIMS_PARENT = [
    { key: "P1", name: "情感链接力", full: "情感链接力", memo: "接得住情绪", color: "#e11d48" },
    { key: "P2", name: "走心沟通力", full: "走心沟通力", memo: "听得懂心声", color: "#f97316" },
    { key: "P3", name: "边界松弛力", full: "边界松弛力", memo: "放得开手脚", color: "#0d9488" },
    { key: "P4", name: "赋能托底力", full: "赋能托底力", memo: "托得住失败", color: "#7c3aed" },
    { key: "P5", name: "自我觉察力", full: "自我觉察力", memo: "看得清自己", color: "#2563eb" }
  ];

  var DIMS_EQ = [
    { key: "E1", name: "觉察", full: "觉察", color: "#eb2f96" },
    { key: "E2", name: "表达", full: "表达", color: "#fa8c16" },
    { key: "E3", name: "调节", full: "调节", color: "#1677ff" },
    { key: "E4", name: "共情", full: "共情", color: "#13a8a8" },
    { key: "E5", name: "复原", full: "复原", color: "#722ed1" }
  ];

  var DIMS_IQ = [
    { key: "I1", name: "目标", full: "目标", color: "#1677ff" },
    { key: "I2", name: "专注", full: "专注", color: "#13a8a8" },
    { key: "I3", name: "方法", full: "方法", color: "#52c41a" },
    { key: "I4", name: "坚持", full: "坚持", color: "#fa8c16" }
  ];

  var QUESTIONS = [
    { title: "遇到突发变化时，我通常能较快稳住情绪，先处理眼前的事。", options: [["完全符合", 6], ["比较符合", 5], ["一般", 4], ["不太符合", 2]] },
    { title: "我能清楚说出自己当下的感受，而不是只说“还好”。", options: [["总是可以", 6], ["经常可以", 5], ["偶尔可以", 3], ["很难做到", 1]] },
    { title: "面对没有标准答案的问题，我愿意先试一个自己的想法。", options: [["非常愿意", 6], ["比较愿意", 5], ["看情况", 3], ["更想等别人给答案", 1]] },
    { title: "学习新东西时，我会先拆解目标，再安排练习节奏。", options: [["一直这样", 6], ["多数时候", 4], ["偶尔", 2], ["几乎没有", 1]] },
    { title: "和重要的人有分歧时，我能先听完对方，再表达自己。", options: [["很容易做到", 6], ["多数时候可以", 5], ["有时会打断", 3], ["常常急着反驳", 1]] },
    { title: "我会思考“这件事对我意味着什么”，而不只看结果。", options: [["经常思考", 6], ["偶尔思考", 4], ["很少", 2], ["从不", 1]] },
    { title: "计划被打乱后，我能在一小时内重新找到可执行的下一步。", options: [["通常可以", 6], ["需要一点时间", 4], ["会卡住半天", 2], ["很难恢复", 1]] },
    { title: "当我感到压力时，我知道哪些方式能真正帮到自己。", options: [["非常清楚", 6], ["比较清楚", 4], ["知道一点", 2], ["完全不知道", 1]] },
    { title: "我常常能把两个不相关的信息连起来，想到新做法。", options: [["经常发生", 6], ["偶尔发生", 4], ["很少", 2], ["几乎没有", 1]] },
    { title: "我会定期回看自己学过的内容，找出还没掌握的部分。", options: [["每周都会", 6], ["每月会", 4], ["考前才会", 2], ["从不回看", 1]] },
    { title: "在团队里，我能既表达立场，也给对方留余地。", options: [["做得很好", 6], ["基本可以", 4], ["有时会失衡", 2], ["很难兼顾", 1]] },
    { title: "我对自己的长期方向有比较清晰的想象。", options: [["非常清晰", 6], ["大致清晰", 4], ["还在摇摆", 2], ["没有想过", 1]] }
  ];

  function makeQuestions(dims) {
    return QUESTIONS.map(function (q, i) {
      return {
        id: "q" + (i + 1),
        idx: i,
        dim: dims[i % dims.length].key,
        title: q.title,
        options: q.options.map(function (o, oi) {
          return { id: "o" + (oi + 1), content: o[0], score: o[1], idx: oi };
        })
      };
    });
  }

  var PARENT_QUESTIONS = [
    ["情感链接力", "孩子连续几次考试退步，你内心的真实台词或者反应是：", ["“我这么辛苦付出，你考这个分数对得起我吗”", "表面不说，但眼神和语气满是失望，家里陷入低气压", "很焦虑，但事后会反思自己是不是把分数的压力转嫁给了他", "先拥抱孩子接住情绪，让他知道无论成绩怎样父母依然爱他"]],
    ["情感链接力", "孩子因为一点小事或作业遇到难题急得大哭大闹时，你的第一反应是：", ["“这点小事有什么好哭的”——先制止情绪", "瞬间被点燃，忍不住比他声音更大", "明白他有情绪，但手足无措不知怎么安慰", "先蹲下来抱抱他，陪他把情绪安全地流完"]],
    ["情感链接力", "孩子兴冲冲来跟你分享学校的趣事或流行梗时，你会：", ["打断他：“作业写完了吗？整天关注这些”", "边刷手机或做家务，边敷衍地“嗯嗯”应付", "认真听了，但不知道怎么接话，气氛有点尴尬", "放下手上的事，看着他的眼睛，跟他一起兴奋讨论"]],
    ["情感链接力", "当孩子冲你大喊“你们一点都不懂我/不关心我”时，你的第一反应：", ["瞬间被激怒：“我为你付出这么多，你凭什么说这种话！”", "满腹委屈：“我天天围着你转，到底哪里不懂你了？”", "手足无措：不知道该怎么做才能真正走进孩子的内心", "心疼与反思：压下情绪去心疼他的无助，试着静下心听听他到底需要什么"]],
    ["走心沟通力", "一天下来，你对孩子说得最多的话属于哪一类？", ["“快点”“作业写完没”“手机放下”（指令催促类）", "“你怎么又这样”“跟你说了多少遍”（抱怨数落类）", "“真棒”“真聪明”（评价型表扬）", "“今天有什么有趣的？”“我在听，然后呢”（倾听陪伴类）"]],
    ["走心沟通力", "发现孩子撒谎（如藏试卷、谎报作业完成度）时，你会：", ["严厉批评，让他保证不再犯", "火气上来，忍不住发一顿脾气", "忍住了，但事后越想越气、憋得慌", "先想他为什么不敢说实话，再找机会平静沟通"]],
    ["走心沟通力", "当孩子顶嘴、跟你抬杠或带语气说“你烦不烦”时，你的真实反应是：", ["本能暴怒：“你怎么跟父母说话的？没规矩！”", "当场怼回去：“你这是什么态度？有本事你别用我的！”", "投鼠忌器：心里极其窝火，但又怕闹大刺激到他，只能硬憋着", "主动降温：“停止争辩，我们现在都有情绪，等冷静一下再沟通”"]],
    ["走心沟通力", "孩子拿着一道很难的题目来问你或求助时，你会：", ["直接给答案，让他照着步骤抄", "嫌他不动脑子，先数落他几句", "语气耐心，但讲完总要加一句“下次细心点”", "先问他是怎么想的，陪他一起探寻思路"]],
    ["边界松弛力", "孩子放学回房间就把门“砰”地关上，不让你进也不愿多说话，你心里：", ["觉得莫名其妙又窝火", "觉得委屈又小心翼翼，不知道该怎么问", "心里七上八下满是焦虑", "虽有失落，但克制焦虑留出空间，温和敲门：“如果你有需要，妈妈一直在”"]],
    ["边界松弛力", "报兴趣班、补习班或日常衣着选择时，决定权通常在：", ["我们全权决定，孩子负责执行", "商量过，但最后还是按父母的意思来", "让孩子选，但既然选择了就必须坚持不能半途而废", "共同商量，尊重他的决定并允许在试错中调整"]],
    ["边界松弛力", "孩子的房间、书包、时间规划极度混乱时，你通常：", ["强行干涉：“必须按我的标准收拾整齐”", "看不下去就忍不住上手替他全打理好", "想放手，但总忍不住在一旁碎碎念", "让他自己做主，只在需要时提供工具支持"]],
    ["边界松弛力", "对于孩子的日记、手机微信、交友等私事，你的态度是：", ["必要时可以查看，这是为他好", "想看但忍住了，会旁敲侧击地问", "不看，但总忍不住私下打听", "尊重边界，他愿意的时候自然会分享"]],
    ["赋能托底力", "孩子难得主动帮忙做家务，却弄得一团糟或完全不符合预期，你的第一反应：", ["气不打一处来：“越帮越忙！以后别动了”", "叹气泄气：“算了，还不如我自己来，净添乱”", "嘴上夸了一句，接着就忍不住挑毛病哪里没做好", "肯定他的善意与付出：“谢谢宝贝帮妈妈分担”"]],
    ["赋能托底力", "当孩子陷入自卑，说“我肯定不行/别帮我报名了”时，你会：", ["硬逼强推：“这有什么好怕的？必须去！”", "急躁数落：“还没试就打退堂鼓，怎么遇到困难就想躲！”", "盲目打鸡血：“你最棒了！要相信自己！”", "调整期待：“咱把目标拆小，先从最容易的一件小事开始”"]],
    ["赋能托底力", "孩子尝试一件新鲜事（如组装模型、参加竞选）却彻底搞砸时：", ["“早跟你说了不行，非不听”", "批评他做事冲动、不考虑后果", "心疼他，但顺手接过来替他完成剩余部分", "肯定他的勇气：“试错本身就是最棒的积累”"]],
    ["赋能托底力", "孩子失败后（没考好、竞选没选上），他更可能：", ["藏着不说，怕你失望", "说出来，但会被数落一顿", "会说，你会安慰他“下次努力”", "主动找你聊，你陪他把失败变成经验"]],
    ["自我觉察力", "听到别人家孩子成绩拔尖或某方面表现优异时，你内心：", ["忍不住下意识说教：“你看人家多自觉！你要向别人学习”", "急切地追问怎么做：“你自己怎么想的？打算怎么做？”", "满腹心酸与挫败：“算了，我怎么管都没用，随他去吧……”", "笃定孩子有自己的生长节奏，不拿短板撞人长板"]],
    ["自我觉察力", "对孩子发完脾气后，你通常的心理轨迹是：", ["觉得是他太惹人生气，自己一点错没有", "后悔自责，但下次依然控制不住陷入循环", "会跟孩子道歉，但不知道如何避免下一次失控", "觉察自己的焦虑按钮，找到源头并持续自我成长"]],
    ["自我觉察力", "工作不顺、心情极度烦躁时回到家，面对孩子的打扰，你会：", ["孩子一点小事就能把你彻底点燃", "尽量忍着，但语气冰冷或偶尔迁怒", "强行控制，事后解释“妈妈今天太累了”", "进家门前给自己 3 分钟缓冲平复，状态稳了再进门"]],
    ["自我觉察力", "你小时候被父母对待的方式，现在还在影响你带孩子吗？", ["没想过这个问题", "想过，但不知道怎么跳出那些老模式", "看清了一些，正在努力改变", "能分清“那是上一代的方式”，我在写自己的新版本"]]
  ];

  /* 亲子养育五力：20 题，选项固定 0/1/2/3 分，每维 4 题 × 3 分 = 12 分，总分 60 */
  function makeParentQuestions() {
    var byName = {};
    DIMS_PARENT.forEach(function (d) { byName[d.full] = d.key; });
    return PARENT_QUESTIONS.map(function (item, i) {
      return {
        id: "pq" + (i + 1),
        idx: i,
        dim: byName[item[0]],
        title: item[1],
        options: item[2].map(function (text, oi) {
          return { id: "pq" + (i + 1) + "-o" + (oi + 1), content: text, score: oi, idx: oi };
        })
      };
    });
  }

  var PARENT_BANDS = [
    {
      id: "pb1", name: "低档", min: 0, max: 23,
      badge: "☀️ 温暖而坚韧的托底妈妈",
      quote: "所有的育儿焦虑，都是在等待一个觉醒的自己。",
      percentile: "超越 15% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 15% 的家长。你很爱孩子，但方法和精力之间已经出现透支。你很累，孩子也很累。",
      detail: "当前五力整体偏低，最先需要被照顾的其实是你自己的状态。",
      suggest: "先选一件最小的自我照顾动作，坚持一周，再谈改变孩子。"
    },
    {
      id: "pb2", name: "中档", min: 24, max: 47,
      badge: "🌱 向光生长的成长妈妈",
      quote: "父母的觉醒，是孩子一生的救赎；懂得看见，比一味付出更重要。",
      percentile: "超越 45% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 45% 的家长。你已经在努力看见孩子，但在压力叠加时会回到旧模式。",
      detail: "你具备一定的觉察与沟通基础，卡点通常出现在情绪最满的那一刻。",
      suggest: "把「先听完再表达」变成固定动作，每次分歧都练一遍。"
    },
    {
      id: "pb3", name: "高档", min: 48, max: 60,
      badge: "✨ 温柔笃定的觉醒妈妈",
      quote: "育儿先育己，少一点无谓的控制，多一些静待花开的松弛。",
      percentile: "超越 95% 的家长",
      base: "亲爱的，你的测评结果显示：你已经超过了 95% 的家长。你能稳稳接住情绪，也愿意把选择权还给孩子。",
      detail: "五力发展均衡，情感链接与自我觉察是当前的优势。",
      suggest: "把你的经验整理成可复用的方法，分享给身边的家长。"
    }
  ];

  /* 卡点解读：按维度固定文案，遇并列最低分按 DIMS_PARENT 顺序取首个 */
  var POWER_PAIN = {
    P1: {
      tip: "您的核心卡点在【情感链接力】维度。",
      text: "这意味着：孩子有情绪时，您更习惯先解决问题，而不是先接住感受。孩子慢慢学会的不是“说出来”，而是“憋回去”。",
      risk: "您和孩子之间的情绪通道正在变窄。如果不做调整，孩子遇到大事时会先找别人，而不是找您。"
    },
    P2: {
      tip: "您的核心卡点在【走心沟通力】维度。",
      text: "这意味着：您习惯了讲道理、下指令、纠对错。您说得越多，孩子越不听。这不是您不会说话，而是您自己从小就是在这样的“道理”和“要求”中长大的。孩子的生命力，正在被这份“没完没了的说教”一点点耗空。",
      risk: "您和孩子正在严重消耗中。如果不做调整，3-6 个月内可能出现沟通关闭、孩子不愿说话。"
    },
    P3: {
      tip: "您的核心卡点在【边界松弛力】维度。",
      text: "这意味着：您很难放心把选择权交出去，于是用控制和提醒来代替信任。孩子收到的信号是“我不行”，而不是“我可以试”。",
      risk: "长期缺氧的自主权，会让孩子在青春期用更激烈的方式抢回控制权。"
    },
    P4: {
      tip: "您的核心卡点在【赋能托底力】维度。",
      text: "这意味着：孩子失败时，您更容易先给评价，而不是先给托底。孩子学到的不是“失败没关系”，而是“失败不能被看见”。",
      risk: "孩子会越来越不敢尝试新事物，遇到困难先放弃，而不是先试一次。"
    },
    P5: {
      tip: "您的核心卡点在【自我觉察力】维度。",
      text: "这意味着：您的焦虑按钮常常在孩子身上被按下，但源头往往在您自己的成长经历里。不是您不够爱，而是您太累。",
      risk: "未被觉察的焦虑会稳定地传递给孩子，形成一代接一代的重复。"
    }
  };

  var RESULTS = [
    {
      id: "r1", name: "蓄力期", min: 0, max: 47,
      base: "你正在积累对自己的理解。现在的重点不是立刻改变，而是先看见自己的反应模式，找到一个可以小步尝试的入口。",
      detail: "你对情绪的觉察还在建立中，遇到压力时容易先被事情推着走。建议从每天一次“我现在感觉如何”的记录开始。",
      suggest: "先选一个最小的场景练习：比如每天晚饭后，用一句话说出今天的感受。"
    },
    {
      id: "r2", name: "整合期", min: 48, max: 59,
      base: "你已经具备一些稳定的自我调节方式，但在压力叠加时仍会回到旧习惯。你需要的不是更多道理，而是更稳定的练习节奏。",
      detail: "你能识别大部分情绪，也愿意沟通，但在关系紧张时容易先保护自己。把“先听完”变成具体动作，会帮助你更稳。",
      suggest: "下一次分歧时，先复述对方的观点，再表达自己的立场。"
    },
    {
      id: "r3", name: "绽放期", min: 60, max: 72,
      base: "你有较好的心理弹性与关系敏感度，能在变化中保持方向。继续把这种稳定带到更重要的事情上，你会走得更远。",
      detail: "你的六维发展比较均衡，关系力与学习力是当前的优势。可以尝试把个人经验整理成方法，帮助身边的人。",
      suggest: "选一个你想长期投入的方向，写下未来 30 天可以做的三件小事。"
    }
  ];

  var GOODS = [
    {
      id: "g-6q", key: "6q", name: "6Q 全维测评", subTitle: "看见你的六种力量",
      category: "6Q 全维", categoryId: "c-6q", cover: COVER + "6q.svg", poster: COVER + "poster-6q.svg",
      price: 99, testCount: 12860, questionCount: 12, minutes: 8, scoreTotal: 72,
      tags: ["六维雷达", "结果可分享", "约 8 分钟"],
      intro: "用 12 个日常情境，快速看见你在逆商、情商、创造力、学习力、关系力与灵性力上的当前状态。没有好坏，只有此刻的位置。",
      forWho: "第一次接触 6Q、想快速看见自己当前状态的人。",
      dims: DIMS_6Q,
      questions: makeQuestions(DIMS_6Q),
      results: RESULTS,
      showTotal: true, showRadar: true, showDist: true, showHarmony: true,
      recommend: ["g-parent", "g-aq", "g-eq"]
    },
    {
      id: "g-aq", key: "aq", name: "青少年 AQ 逆商测评", subTitle: "遇到变化，你会怎么走",
      category: "AQ 逆商", categoryId: "c-aq", cover: COVER + "aq.svg", poster: COVER + "poster-aq.svg",
      price: 49, testCount: 8620, questionCount: 12, minutes: 6, scoreTotal: 72,
      tags: ["适合 10-18 岁", "逆商画像", "约 6 分钟"],
      intro: "面向 10-18 岁青少年的逆商测评，聚焦变化、挫折、恢复与行动。",
      forWho: "想了解孩子遇到变化与挫折时的真实反应模式的家长与青少年。",
      dims: DIMS_6Q,
      questions: makeQuestions(DIMS_6Q),
      results: RESULTS,
      showTotal: true, showRadar: true, showDist: true, showHarmony: true,
      recommend: ["g-eq", "g-parent", "g-6q"]
    },
    {
      id: "g-parent", key: "parent", name: "高EQ父母 · 亲子养育能力测评", subTitle: "先看见关系，再谈方法",
      category: "亲子关系", categoryId: "c-parent", cover: COVER + "parent.svg", poster: COVER + "poster-parent.svg",
      price: 199, testCount: 15230, questionCount: 20, minutes: 10, scoreTotal: 60,
      tags: ["适合 3-18 岁父母", "五力雷达", "约 10 分钟"],
      intro: "从情感链接力、走心沟通力、边界松弛力、赋能托底力、自我觉察力五个维度，看看你和孩子的关系现在走到了哪里。",
      forWho: "想改善亲子沟通、找到关系卡点的父母。",
      dims: DIMS_PARENT,
      questions: makeParentQuestions(),
      results: PARENT_BANDS,
      resultLayout: 2,
      riskTip: "您和孩子正在严重消耗中。如果不做调整，3-6 个月内可能出现沟通关闭、孩子不愿说话。",
      ctaText: "想知道这个育儿卡点是如何形成的？为什么“道理都懂，面对孩子还是忍不住火大”？1 对 1 测评深度解读，帮您把测评结果转化为一份可落地的《家庭育儿改善清单》。",
      ctaSubText: "添加班主任微信，帮您把分数变成方向",
      ctaQrCode: COVER + "qr.svg",
      painCopy: POWER_PAIN,
      showTotal: true, showRadar: true, showDist: false, showHarmony: false,
      recommend: ["g-eq", "g-6q", "g-rq"]
    },
    {
      id: "g-eq", key: "eq", name: "情绪智慧 EQ 测评", subTitle: "和情绪做朋友",
      category: "EQ 情商", categoryId: "c-eq", cover: COVER + "eq.svg", poster: COVER + "poster-eq.svg",
      price: 99, testCount: 11205, questionCount: 12, minutes: 7, scoreTotal: 72,
      tags: ["五维情绪图", "情绪使用说明", "约 7 分钟"],
      intro: "情绪不是问题，如何与它相处才是。用 12 个情境看看你的觉察、表达与复原力。",
      forWho: "容易被情绪带走、想把情绪变成资源的人。",
      dims: DIMS_EQ,
      questions: makeQuestions(DIMS_EQ),
      results: RESULTS,
      showTotal: true, showRadar: true, showDist: true, showHarmony: true,
      recommend: ["g-rq", "g-parent", "g-6q"]
    },
    {
      id: "g-rq", key: "rq", name: "关系力 RQ 测评", subTitle: "在关系里做自己",
      category: "RQ 关系力", categoryId: "c-rq", cover: COVER + "rq.svg", poster: COVER + "poster-rq.svg",
      price: 99, testCount: 5230, questionCount: 12, minutes: 7, scoreTotal: 72,
      tags: ["关系力雷达", "边界练习", "约 7 分钟"],
      intro: "看见你在倾听、表达、边界与信任上的习惯，找到更舒服的相处方式。",
      forWho: "在关系中容易委屈自己、或总想证明自己的人。",
      dims: DIMS_6Q,
      questions: makeQuestions(DIMS_6Q),
      results: RESULTS,
      showTotal: true, showRadar: true, showDist: true, showHarmony: true,
      recommend: ["g-eq", "g-parent", "g-6q"]
    }
  ];

  var CATEGORIES = [
    { id: "c-6q", name: "6Q 全维", short: "6Q", color: "#1677ff", href: "index.html?cat=c-6q" },
    { id: "c-aq", name: "AQ 逆商", short: "AQ", color: "#2f80ed", href: "index.html?cat=c-aq" },
    { id: "c-eq", name: "EQ 情商", short: "EQ", color: "#eb2f96", href: "index.html?cat=c-eq" },
    { id: "c-cq", name: "CQ 创造力", short: "CQ", color: "#fa8c16", href: "index.html?cat=c-cq" },
    { id: "c-iq", name: "IQ 学习力", short: "IQ", color: "#13a8a8", href: "index.html?cat=c-iq" },
    { id: "c-rq", name: "RQ 关系力", short: "RQ", color: "#52c41a", href: "index.html?cat=c-rq" }
  ];

  var SUBJECTS = [
    { id: "s-1", name: "6Q 全维成长", desc: "一次看见六种力量", goodsIds: ["g-6q", "g-aq", "g-eq"] },
    { id: "s-2", name: "亲子关系", desc: "先看见关系，再谈方法", goodsIds: ["g-parent"] },
    { id: "s-3", name: "情绪与关系", desc: "在关系里做自己", goodsIds: ["g-eq", "g-rq"] }
  ];

  var OVERALL = "6Q 测评不是给你贴标签，而是帮你看清此刻的位置。每份测评约 6-10 分钟，结果页会给出总分、维度图与可执行的小建议。你可以隔一段时间再测一次，看看自己的变化。";

  window.H5_DATA = {
    version: "v2.0.0",
    goods: GOODS,
    categories: CATEGORIES,
    subjects: SUBJECTS,
    results: RESULTS,
    overall: OVERALL,
    byId: function (id) {
      return GOODS.filter(function (g) { return g.id === id || g.key === id; })[0] || null;
    },
    byCategory: function (catId) {
      return GOODS.filter(function (g) { return g.categoryId === catId; });
    }
  };
})();
