---
title: "每个 ADK 开发者都应了解的 5 个 Agent Skill 设计模式"
description: "探讨如何设计结构清晰的 Agent Skill，告别混乱的系统提示词，让 AI Agent 像专家一样稳定执行任务。本文详细介绍了 5 种核心的 Agent Skill 设计模式及其在 ADK (Agent Development Kit) 中的应用。"
pubDate: "Mar 18 2026"
heroImage: "/images/COVER_IMAGE_PLACEHOLDER.jpg"
category: "AI Skills"
---

### 快速阅读

当涉及到 `SKILL.md` 时，开发者往往过于关注格式——确保 YAML 正确、结构化目录以及遵循规范。但随着超过 30 种 Agent 工具（如 Claude Code、Gemini CLI 和 Cursor）标准化了同一套布局，格式问题已基本过时。

现在的挑战是**内容设计**。规范解释了如何打包一个 Skill，但对其内部逻辑结构的构建却缺乏指导。例如，一个包装 FastAPI 规范的 Skill 与一个四步文档流水线 Skill 虽然在外部看来 `SKILL.md` 文件相同，但运作方式却截然不同。

通过研究整个生态系统（从 Anthropic 的代码库到 Vercel 和 Google 的内部指南）中构建 Skill 的方式，我们总结了五种可帮助开发者构建可靠 Agent 的核心设计模式：

1. **Tool Wrapper（工具包装器）**: 让 Agent 瞬间成为特定库的专家。
2. **Generator（生成器）**: 基于可复用的模板生成结构化文档。
3. **Reviewer（审查器）**: 根据严重程度列表来检查代码。
4. **Inversion（反转模式）**: Agent 在行动前先对你进行访谈收集需求。
5. **Pipeline（流水线）**: 强制执行具有检查点的严格多步工作流。

本文将详细介绍这五种模式，并附带可运行的 ADK（Agent Development Kit）代码示例。

---

### 模式一：Tool Wrapper（工具包装器）

Tool Wrapper 让你的 Agent 在特定库中获得按需调用的上下文。与其将 API 约定硬编码到系统提示词中，不如将它们打包到一个 Skill 中。你的 Agent 只有在实际处理该技术时才会加载这个上下文。

这是最简单的一种实现模式。`SKILL.md` 文件会监听用户提示词中特定的库关键字，动态加载 `references/` 目录中的内部文档，并将其作为绝对规则应用。这正是将团队的内部编码指南或特定框架最佳实践直接分发到开发者工作流中的绝佳机制。

![Tool Wrapper](/images/adk-agent-skill-design-patterns-img1-20260318160002.jpg)

以下是一个教 Agent 如何编写 FastAPI 代码的 Tool Wrapper 示例。注意这些指令如何明确告诉 Agent 只有在开始审查或编写代码时才加载 `conventions.md` 文件：

```yaml
# skills/api-expert/SKILL.md
---
name: api-expert
description: FastAPI 开发最佳实践和约定。用于构建、审查或调试 FastAPI 应用程序、REST API 或 Pydantic 模型。
metadata:
  pattern: tool-wrapper
  domain: fastapi
---

你是一位 FastAPI 开发专家。请将这些约定应用于用户的代码或问题。

## 核心约定

加载 'references/conventions.md' 以获取完整的 FastAPI 最佳实践列表。

## 审查代码时
1. 加载约定参考文档
2. 根据每个约定检查用户代码
3. 对于每个违规项，引用特定规则并建议修复方法

## 编写代码时
1. 加载约定参考文档
2. 严格遵循每个约定
3. 为所有函数签名添加类型注解
4. 使用 Annotated 风格进行依赖注入
```

### 模式二：The Generator（生成器）

如果说 Tool Wrapper 用于应用知识，那么 Generator 则用于强制实现一致的输出。如果你发现 Agent 在每次运行时生成的文档结构都不同，Generator 可以通过编排一个“填空”过程来解决这个问题。

它利用两个可选目录：`assets/` 存放你的输出模板，而 `references/` 存放你的样式指南。指令就像一个项目经理，告诉 Agent 加载模板、阅读样式指南、向用户询问缺失的变量并填充文档。这非常适合用来生成可预测的 API 文档、标准化提交信息或搭建项目架构。

![The Generator](/images/adk-agent-skill-design-patterns-img2-20260318160002.jpg)

在这个技术报告生成器示例中，Skill 文件不包含实际的布局或语法规则。它只是协调这些资产的检索，并强制 Agent 逐步执行它们：

```yaml
# skills/report-generator/SKILL.md
---
name: report-generator
description: 以 Markdown 格式生成结构化的技术报告。当用户要求撰写、创建或起草报告、摘要或分析文档时使用。
metadata:
  pattern: generator
  output-format: markdown
---

你是一个技术报告生成器。请严格遵循以下步骤：

第一步：加载 'references/style-guide.md' 获取语气和排版规则。
第二步：加载 'assets/report-template.md' 获取所需的输出结构。
第三步：向用户询问填充模板所需的任何缺失信息：
- 主题或科目
- 关键发现或数据点
- 目标受众（技术、高管、普通人员）
第四步：按照样式指南规则填充模板。模板中的每一节都必须出现在输出中。
第五步：将完整的报告作为一个单一的 Markdown 文档返回。
```

### 模式三：The Reviewer（审查器）

Reviewer 模式将“检查什么”和“如何检查”分离开来。你不需要编写一个冗长的系统提示词来详细描述所有的代码坏味道，而是将模块化的标准评分表存储在 `references/review-checklist.md` 文件中。

当用户提交代码时，Agent 会加载此清单，并有条理地对提交内容进行评分，按严重程度对发现的问题进行分组。如果你将 Python 样式清单换成 OWASP 安全清单，你就能使用完全相同的 Skill 基础设施进行完全不同的专业审计。这是一种自动执行 PR 审查或在人类查看代码前捕获漏洞的极其有效的方法。

![The Reviewer](/images/adk-agent-skill-design-patterns-img3-20260318160002.jpg)

下面展示了这个分离过程：

```yaml
# skills/code-reviewer/SKILL.md
---
name: code-reviewer
description: 审查 Python 代码的质量、风格和常见错误。当用户提交代码供审查或要求审计时使用。
metadata:
  pattern: reviewer
  severity-levels: error,warning,info
---

你是一名 Python 代码审查员。请严格遵循以下审查协议：

第一步：加载 'references/review-checklist.md' 获取完整的审查标准。
第二步：仔细阅读用户的代码。在进行批评之前理解其目的。
第三步：将清单中的每条规则应用于代码。对于发现的每个违规行为：
- 记录行号（或大概位置）
- 严重程度分类：错误（必须修复）、警告（应修复）、信息（可考虑）
- 解释为什么这是一个问题，而不仅仅是出了什么错
- 提供具体修复建议和修正后的代码
第四步：生成包含以下部分的结构化审查报告：
- **总结**：代码的功能，整体质量评估
- **发现问题**：按严重程度分组（错误优先，其次警告，最后信息）
- **评分**：1-10分并附带简短理由
- **三大建议**：影响最大的改进点
```

### 模式四：Inversion（反转模式）

Agent 通常想要立即猜测并生成结果。反转模式（Inversion）颠覆了这种动态平衡。Agent 不再由用户驱动执行，而是转变为一个面试官。

反转模式依赖于明确且不可协商的关卡指令（例如：“在所有阶段完成之前不要开始构建”），以迫使 Agent 首先收集上下文。它会按顺序提出结构化问题，并等待你的回答后再进入下一阶段。在完全了解你的需求和部署限制之前，Agent 会拒绝综合最终输出。

![Inversion](/images/adk-agent-skill-design-patterns-img4-20260318160002.jpg)

项目规划器示例：

```yaml
# skills/project-planner/SKILL.md
---
name: project-planner
description: 在制定计划之前，通过结构化的提问收集需求来规划新的软件项目。
metadata:
  pattern: inversion
  interaction: multi-turn
---

你正在进行一场结构化的需求收集访谈。在所有阶段完成之前，请不要开始构建或设计。

## 阶段一：问题发现（一次问一个问题，等待回答）
- Q1：“这个项目为它的用户解决了什么问题？”
- Q2：“核心用户是谁？他们的技术水平如何？”
- Q3：“预期规模如何？（每日用户数、数据量、请求率）”

## 阶段二：技术约束（仅在阶段一回答完毕后进行）
- Q4：“你将使用什么部署环境？”
- Q5：“你对技术栈有什么要求或偏好吗？”
- Q6：“不可协商的需求是什么？（延迟、运行时间、合规性、预算）”

## 阶段三：综合（仅在所有问题回答完毕后进行）
1. 加载 'assets/plan-template.md' 获取输出格式
2. 使用收集到的需求填写模板的每个部分
3. 向用户展示完整的计划
4. 询问：“这个计划准确捕捉到你的需求了吗？你有什么想修改的？”
5. 根据反馈进行迭代，直到用户确认。
```

### 模式五：The Pipeline（流水线）

对于复杂的任务，你无法承受遗漏步骤或忽略指令的风险。流水线（Pipeline）模式强制执行带有硬检查点的严格顺序工作流。

指令本身就充当了工作流的定义。通过实施显式的门控条件（例如在从生成文档字符串转移到最终组装之前需要用户批准），Pipeline 确保 Agent 无法绕过复杂任务直接呈现未经验证的最终结果。

![The Pipeline](/images/adk-agent-skill-design-patterns-img5-20260318160002.jpg)

以下 API 文档生成器示例明确禁止 Agent 在用户确认前进入下一步：

```yaml
# skills/doc-pipeline/SKILL.md
---
name: doc-pipeline
description: 通过多步流水线从 Python 源代码生成 API 文档。
metadata:
  pattern: pipeline
  steps: "4"
---

你正在运行一个文档生成流水线。请按顺序执行每一步。请勿跳过步骤或在某步骤失败时继续前进。

## 步骤一：解析与盘点
分析用户的 Python 代码提取所有公共类、函数和常量。以清单形式展示并询问：“这是你要记录的完整公共 API 吗？”

## 步骤二：生成文档字符串
对于每个缺乏文档字符串的函数：
- 加载 'references/docstring-style.md'
- 严格按照样式指南生成文档字符串
- 呈现每个生成的文档字符串供用户批准
在用户确认之前，请勿进入步骤三。

## 步骤三：组装文档
加载 'assets/api-doc-template.md'，将所有类、函数和文档字符串编译成一份单一的 API 参考文档。

## 步骤四：质量检查
根据 'references/quality-checklist.md' 进行复核：
- 记录了每一个公共符号
- 每个参数都有类型和描述
- 每个函数至少有一个用法示例
报告结果并在展示最终文档前修复问题。
```

### 选择正确的 Agent Skill 模式

每个模式回答不同的问题。使用此决策树来寻找适合您用例的模式：

![选择正确的模式](/images/adk-agent-skill-design-patterns-img6-20260318160002.jpg)

### 最后，模式是可以组合的

这些模式并不互相排斥。它们可以组合使用！

![模式组合](/images/adk-agent-skill-design-patterns-img7-20260318160002.jpg)

一个流水线（Pipeline）技能可以在最后加入审查器（Reviewer）步骤来复核自己的工作。一个生成器（Generator）技能可以在开始时依赖反转模式（Inversion）在填写模板之前收集必要的变量。得益于 ADK 的按需特性和渐进式加载，你的 Agent 只会在运行时将上下文 Token 花在它确实需要的模式上。

不要再试图将复杂脆弱的指令塞进一个单一的系统提示词中。拆分你的工作流，应用正确的结构化模式，构建出真正可靠的智能 Agent 吧！

![构建可靠 Agent](/images/adk-agent-skill-design-patterns-img8-20260318160002.jpg)

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://x.com/googlecloudtech/status/2033953579824758855" style="color: #808080; text-decoration: underline;">5 Agent Skill design patterns every ADK developer should know</a></i>
</p>
