---
title: "Claude Code 构建经验：如何高效利用 Agent Skills"
description: "Anthropic 团队在使用 Claude Code 过程中总结的数百个 Agent Skills 最佳实践。了解如何通过文件系统、Hook 以及特定的配置来编写、分配和管理智能体技能。"
pubDate: "Mar 19 2026"
heroImage: "/images/claude-code-agent-skills-lessons-20260319005115.jpg"
category: "AI Skills"
---

### 快速阅读
Anthropic 团队在内部广泛使用 Claude Code 的 **Skills**（技能）功能，总结出了大量高效利用 AI Agent 技能的最佳实践。Skills 并非单纯的 Markdown 文本文件，而是可以包含脚本、数据和资源的完整文件夹。文章将数百种实用的 Skills 分为九大类别（如 API 参考库、产品测试验证、自动化业务流程等），并分享了编写高水准技能的“秘籍”，例如不要赘述 Claude 已经知道的基础知识、建立专门的“避坑（Gotchas）”章节、善用文件系统提供渐进式上下文，以及巧妙设计按需触发的 Hooks 和持久化记忆功能。合理编排 Skills 能极大地加速日常开发与自动化流程。

---

Skills（技能）已经成为 Claude Code 中使用最频繁、也最具扩展性的功能点。它们灵活易用，但这种灵活性也带来了一个问题：什么类型的技能最有价值？写好一个技能的秘诀是什么？

Anthropic 在日常开发中广泛使用了数百个活跃的 Skills，在此分享我们在构建 Claude Code 时学到的核心经验。

## 什么是 Skills？

对 Skills 最常见的误解是“它仅仅是个 Markdown 文件”。事实上，**Skills 是一个完整的文件夹**，它可以包含供 Agent 发现和操作的脚本、静态资源、数据等。

在 Claude Code 中，Skills 还支持各种复杂的配置，比如注册动态 Hook 等。最出色的技能往往是那些能创造性地利用文件夹结构和高级配置的。

## 九大常见技能类型

我们对内部的所有技能进行了梳理，发现它们主要集中在以下九大类：

### 1. 库与 API 参考 (Library & API Reference)
![API Reference](/images/claude-code-agent-skills-lessons-img1-20260319005115.jpg)

这些技能教导 Claude 如何正确使用你的内部库、CLI 工具或 SDK。通常包含代码片段以及一系列供 Claude 在写代码时参考的“避坑指南”。
* **示例**：`billing-lib`（内部计费库的边缘测试情况）、`frontend-design`（让 Claude 更好地遵循你们的设计系统规范）。

### 2. 产品验证 (Product Verification)
![Product Verification](/images/claude-code-agent-skills-lessons-img2-20260319005115.jpg)

指导 Claude 测试和验证代码是否正常工作，经常配合 Playwright 或 tmux 等外部工具。专门花一周时间让你的验证技能变得完美，绝对物超所值。
* **示例**：`signup-flow-driver`（无头浏览器中运行注册和验证流程）、`checkout-verifier`（测试 Stripe 支付）。

### 3. 数据获取与分析 (Data Fetching & Analysis)
![Data Fetching](/images/claude-code-agent-skills-lessons-img3-20260319005115.jpg)

连接你的数据监控栈的技能，包含数据看板 ID、特定查询脚本以及常规分析流程。
* **示例**：`funnel-query`（连接特定事件表分析转化漏斗）、`grafana`（关联问题和特定的监控看板）。

### 4. 业务流程与团队自动化 (Business Process & Team Automation)
![Business Process Automation](/images/claude-code-agent-skills-lessons-img4-20260319005115.jpg)

将重复性工作流自动化为一个简单的命令。这类技能可以将以前的执行结果保存在日志中，以便模型能够结合上下文进行一致的反馈。
* **示例**：`standup-post`（自动汇总 GitHub 和 Jira 活动，生成每日站会汇报发到 Slack）、`weekly-recap`（周报自动汇总）。

### 5. 代码脚手架与模板 (Code Scaffolding & Templates)
![Code Scaffolding](/images/claude-code-agent-skills-lessons-img5-20260319005115.jpg)

为特定功能生成业务模板。当脚手架需要结合自然语言需求时，这种组合尤其强大。
* **示例**：`new-migration`（带有常见踩坑提示的迁移文件模板）、`create-app`（快速创建一个预置了验证、日志和部署配置的内部应用）。

### 6. 代码质量与 Review (Code Quality & Review)
![Code Quality](/images/claude-code-agent-skills-lessons-img6-20260319005115.jpg)

在组织内部强制执行代码质量规范。你可以结合 GitHub Action 自动运行它们。
* **示例**：`adversarial-review`（生成一个“挑刺”子代理来进行代码审查，直到只剩一些吹毛求疵的意见）、`code-style`（强制约束 Claude 默认做得不太好的特殊代码规范）。

### 7. CI/CD 与部署 (CI/CD & Deployment)
![CI/CD & Deployment](/images/claude-code-agent-skills-lessons-img7-20260319005115.jpg)

帮助获取、推送和部署代码的辅助技能。
* **示例**：`babysit-pr`（监控 PR → 重试失败的 CI → 解决合并冲突 → 开启自动合并）、`cherry-pick-prod`。

### 8. 运维手册 (Runbooks)
![Runbooks](/images/claude-code-agent-skills-lessons-img8-20260319005115.jpg)

给定一个症状（比如一条 Slack 警报或错误特征），自动执行多工具的调查分析，最终生成结构化的故障排查报告。
* **示例**：`<service>-debugging`（高流量服务排查指南）、`log-correlator`（根据 Request ID 收集全链路日志）。

### 9. 基础设施操作 (Infrastructure Operations)
![Infrastructure Operations](/images/claude-code-agent-skills-lessons-img9-20260319005115.jpg)

执行日常维护与常规运维程序。尤其对于带有破坏性的高风险操作，引入带护栏的 AI 技能能极大提升安全性。
* **示例**：`resource-orphans`（寻找孤立的 Pod/Volume → 发到 Slack 确认 → 级联清理）、`cost-investigation`（调查为何当月云存储账单激增）。

---

## 编写优秀技能的实战技巧

一旦你决定了要做什么技能，该如何下手呢？

![Tips 1](/images/claude-code-agent-skills-lessons-img10-20260319005115.jpg)

**1. 不要陈述显而易见的事**
Claude 已经懂很多编程基础了。如果你的技能侧重于知识传递，应该重点告诉 Claude 那些超出它“标准思维模式”的独特规范（比如 Anthropic 的前端技能中特意指出要避免使用 `Inter` 字体和紫色渐变）。

**2. 建立“避坑（Gotchas）”章节**
任何技能中最高信息量的部分就是 Gotchas。把你发现的 Claude 在使用该技能时常犯的错记下来。

**3. 利用文件系统实现“渐进式上下文（Progressive Disclosure）”**
重申一遍，技能是一个文件夹。告诉 Claude 文件夹里有什么，让它自己按需读取。比如把详尽的 API 签名放到 `references/api.md`，或把模板放在 `assets/` 文件夹下。

**4. 避免给 Claude 铺设过于死板的轨道**
因为技能具有高复用性，如果指令太具体，反而会限制 Claude 的发挥。给它必要的信息，然后给它灵活性去适应具体的场景。

**5. 思考初始化配置（Setup）**
比如一个发 Slack 站会报告的技能，你可能需要让 Claude 知道发到哪个频道。推荐在技能目录的 `config.json` 里保存这类信息，如果没配置，可以让 Agent 主动通过 `AskUserQuestion` 工具询问用户。

**6. Description 字段是写给模型看的**
当 Claude Code 启动时，它会扫描所有的技能描述。不要只是写个简单的总结，你需要清楚描述出“**什么时候应该触发这个技能**”。

![Tips 2](/images/claude-code-agent-skills-lessons-img11-20260319005115.jpg)

**7. 记忆与数据存储 (Memory & Storing Data)**
你可以让技能拥有“记忆”。比如在 `standup-post` 里保存一份 `standups.log`，这样明天再运行时它就能读取历史日志并判断今天有什么更新。对于需要持久化保存的数据，可以使用 `${CLAUDE_PLUGIN_DATA}` 变量指定稳定目录。

**8. 存储脚本，让 Claude 去生成代码**
赋予 Claude 最强大的工具就是已有的代码库。提供一个辅助函数库，让 Claude 把精力花在如何**组合（Composition）**和**高级分析**上，而不是从零重写模板。

**9. 按需加载的 Hooks (On Demand Hooks)**
技能可以包含只有在调用时才激活的 Hook。比如 `/careful` 会拦截 `rm -rf` 等危险指令，只有当你去修改生产环境数据时你才会想要激活它，平时一直开启反而会让人抓狂。

## 如何分发你的 Skills？

与团队分享你的 Skills 是其最大的价值之一。

* **提交到代码仓库**：如果是几个特定 Repo 间的小团队，直接把技能放在 `./.claude/skills` 下即可。
* **技能市场 (Plugin Marketplace)**：随着团队规模扩大，每个迁入的技能都会增加一点上下文。拥有一个内部的插件市场能够让大家自由挑选并安装高频使用的插件。

## 结语

Skills 对 AI Agent 来说是非常强大和灵活的工具，而且这仅仅只是开始。别把这看成一份死板的教条，最好的理解方式就是自己动手做，试着写上几行代码，加上一个 Gotcha，慢慢地你就能摸索出最适合团队的智能体工作流！

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://x.com/trq212/status/2033949937936085378" style="color: #808080; text-decoration: underline;">Lessons from Building Claude Code: How We Use Skills</a></i>
</p>
