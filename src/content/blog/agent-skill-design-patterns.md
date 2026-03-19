---
title: 每个 ADK 开发者都应掌握的 5 种 Agent 技能设计模式
description: 随着 Agent 工具标准化的推进，技能的格式问题已基本解决。本文介绍了构建高可靠性 Agent 的 5 种核心设计模式：工具包装器、生成器、代码审查员、需求反转与严格的流水线模式。
pubDate: Mar 18 2026
heroImage: /images/agent-skill-design-patterns-20260318155118.jpg
category: AI Skills
---

### 快速阅读

当涉及 `SKILL.md` 时，很多开发者会将注意力集中在格式上：比如写对 YAML、组织目录结构以及遵循规范。然而，随着市面上超过 30 种 Agent 工具（如 Claude Code, Gemini CLI 和 Cursor 等）在格式标准上达成共识，格式问题已然过时，如今真正的挑战在于**内容设计 (Content Design)**。

本文总结了跨生态（包括 Anthropic、Vercel 及 Google 的内部指南）普遍存在的 **5 种设计模式**。无论你是希望 Agent 能够按部就班地生成标准文档、精确地审查代码，还是让 Agent 能够主动对你进行需求“反问访谈”，掌握这些模式都能让你摆脱臃肿脆弱的单一系统提示词，进而打造出更加强大、可靠的 AI 代理。

---

![Cover](/images/agent-skill-design-patterns-img0-20260318155118.jpg)

当谈论 `SKILL.md` 时，开发者往往专注于格式问题。但在诸如 Claude Code, Gemini CLI, 和 Cursor 等超过 30 个 Agent 工具采用了相同结构的今天，我们面临的新挑战是如何有效组织其中的逻辑。

虽然两个 `SKILL.md` 文件在结构上看起来可能一模一样，但它们底层的运作机制却可能完全不同——例如一个包装 FastAPI 规范的技能和一个四步文档处理流。通过研究各个生态下的开发实践，我们整理了 5 种反复出现的设计模式，帮助开发者更好地构建 Agent。

### 模式 1：工具包装器 (The Tool Wrapper)

以下是一个教授 Agent 如何编写 FastAPI 代码的 Tool Wrapper 示例。注意指令是如何明确告诉 Agent 仅在开始审查或编写代码时才加载 `conventions.md` 文件的：

```markdown
# skills/api-expert/SKILL.md
---
name: api-expert
description: FastAPI development best practices and conventions. Use when building, reviewing, or debugging FastAPI applications, REST APIs, or Pydantic models.
metadata:
  pattern: tool-wrapper
  domain: fastapi
---

You are an expert in FastAPI development. Apply these conventions to the user's code or question.

## Core Conventions

Load 'references/conventions.md' for the complete list of FastAPI best practices.

## When Reviewing Code
1. Load the conventions reference
2. Check the user's code against each convention
3. For each violation, cite the specific rule and suggest the fix

## When Writing Code
1. Load the conventions reference
2. Follow every convention exactly
3. Add type annotations to all function signatures
4. Use Annotated style for dependency injection
```

![Tool Wrapper](/images/agent-skill-design-patterns-img1-20260318155118.jpg)

**工具包装器 (Tool Wrapper)** 能够让你的 Agent 瞬间成为某个特定库的专家。你无需将各种 API 规范硬编码在系统级提示词中，而是可以把它们打包成一个专门的技能。只有当 Agent 实际涉及该技术栈时，才会动态加载相关上下文。

这是最简单也是最实用的实现方式。`SKILL.md` 文件会在用户的提示中侦听特定库的关键字，动态从 `references/` 目录中加载你的内部文档，并将其视为不可变违背的绝对真理。通过这种方式，你可以非常高效地向团队的开发者分发内部编程规范或特定框架的最佳实践。

*(注：例如在处理 FastAPI 开发时，只有当审查或编写代码时才按需加载 `conventions.md`。)*

### 模式 2：生成器 (The Generator)

在这个技术报告生成器的例子中，技能文件并不包含实际的布局或语法规则。它仅仅负责协调提取这些资产，并强制 Agent 一步步执行：

```markdown
# skills/report-generator/SKILL.md
---
name: report-generator
description: Generates structured technical reports in Markdown. Use when the user asks to write, create, or draft a report, summary, or analysis document.
metadata:
  pattern: generator
  output-format: markdown
---

You are a technical report generator. Follow these steps exactly:

Step 1: Load 'references/style-guide.md' for tone and formatting rules.

Step 2: Load 'assets/report-template.md' for the required output structure.

Step 3: Ask the user for any missing information needed to fill the template:
- Topic or subject
- Key findings or data points
- Target audience (technical, executive, general)

Step 4: Fill the template following the style guide rules. Every section in the template must be present in the output.

Step 5: Return the completed report as a single Markdown document.
```

![Generator](/images/agent-skill-design-patterns-img2-20260318155118.jpg)

如果工具包装器关注的是知识的“输入”，那么**生成器 (Generator)** 关注的则是输出的一致性。为了避免 Agent 每次运行生成结构迥异的文档，生成器扮演了一个协调者和填空人的角色。

它利用了两个核心目录：`assets/` 存放输出模板，而 `references/` 存放风格指南。在这里，指令的职责更像是一个项目经理——指示 Agent 加载模板、阅读规范、向用户询问缺失的变量信息，并最终填入模板。这种模式在生成 API 文档、标准化 Git 提交信息或构建项目基础架构骨架时极其有效。

### 模式 3：审查员 (The Reviewer)

下面的代码审查员技能展示了这种分离。指令是静态的，但 Agent 会动态地从外部清单中加载特定的审查标准，并强制输出结构化的、基于严重程度的结果：

```markdown
# skills/code-reviewer/SKILL.md
---
name: code-reviewer
description: Reviews Python code for quality, style, and common bugs. Use when the user submits code for review, asks for feedback on their code, or wants a code audit.
metadata:
  pattern: reviewer
  severity-levels: error,warning,info
---

You are a Python code reviewer. Follow this review protocol exactly:

Step 1: Load 'references/review-checklist.md' for the complete review criteria.

Step 2: Read the user's code carefully. Understand its purpose before critiquing.

Step 3: Apply each rule from the checklist to the code. For every violation found:
- Note the line number (or approximate location)
- Classify severity: error (must fix), warning (should fix), info (consider)
- Explain WHY it's a problem, not just WHAT is wrong
- Suggest a specific fix with corrected code

Step 4: Produce a structured review with these sections:
- **Summary**: What the code does, overall quality assessment
- **Findings**: Grouped by severity (errors first, then warnings, then info)
- **Score**: Rate 1-10 with brief justification
- **Top 3 Recommendations**: The most impactful improvements
```

![Reviewer](/images/agent-skill-design-patterns-img3-20260318155118.jpg)

**审查员 (Reviewer)** 模式将“检查什么”与“如何检查”彻底分离。你不需要写一段极长且繁琐的系统提示词来罗列所有的代码缺陷，而是将模块化的审查规则清单存储在独立的 `references/review-checklist.md` 文件中。

当用户提交代码时，Agent 会加载这份检查清单，按部就班地进行评分，并将发现的问题按严重程度进行分类。采用这种分离设计后，如果你将 Python 风格检查清单替换为 OWASP 安全检查清单，你就立刻获得了一个专门的安全审计工具，而背后的技能基础设施却无需做任何改动。这非常适合自动化 PR 代码审查或漏洞检测。

### 模式 4：反转模式 (Inversion)

来看看这个项目规划器技能的实际效果。这里的关键要素是严格的阶段划分和明确的门控提示，阻止 Agent 在收集完所有用户答案之前合成最终计划：

```markdown
# skills/project-planner/SKILL.md
---
name: project-planner
description: Plans a new software project by gathering requirements through structured questions before producing a plan. Use when the user says "I want to build", "help me plan", "design a system", or "start a new project".
metadata:
  pattern: inversion
  interaction: multi-turn
---

You are conducting a structured requirements interview. DO NOT start building or designing until all phases are complete.

## Phase 1 — Problem Discovery (ask one question at a time, wait for each answer)

Ask these questions in order. Do not skip any.

- Q1: "What problem does this project solve for its users?"
- Q2: "Who are the primary users? What is their technical level?"
- Q3: "What is the expected scale? (users per day, data volume, request rate)"

## Phase 2 — Technical Constraints (only after Phase 1 is fully answered)

- Q4: "What deployment environment will you use?"
- Q5: "Do you have any technology stack requirements or preferences?"
- Q6: "What are the non-negotiable requirements? (latency, uptime, compliance, budget)"

## Phase 3 — Synthesis (only after all questions are answered)

1. Load 'assets/plan-template.md' for the output format
2. Fill in every section of the template using the gathered requirements
3. Present the completed plan to the user
4. Ask: "Does this plan accurately capture your requirements? What would you change?"
5. Iterate on feedback until the user confirms
```

![Inversion](/images/agent-skill-design-patterns-img4-20260318155118.jpg)

大多数 Agent 的本能是“接到命令，立即生成”。但**反转模式 (Inversion)** 改变了这一动态关系——不再是用户驱动 Agent，而是让 Agent 充当起面试官的角色。

这种模式依赖于绝对且不可妥协的关卡指令（例如：“在所有阶段完成之前，请勿开始构建！”）。它强制 Agent 按照逻辑顺序提出结构化问题，并在获得你的回答后才进入下一阶段。在对你的需求和部署限制建立完整认知之前，Agent 会直接拒绝合成最终的输出结果。对于项目规划、系统设计等场景，这能有效避免 Agent 产生偏离初衷的幻觉和猜测。

### 模式 5：流水线模式 (The Pipeline)

在这个文档流水线示例中，请注意明确的门控条件。如果用户在前一步中没有确认生成的 docstrings，Agent 会被明确禁止进入组装阶段：

```markdown
# skills/doc-pipeline/SKILL.md
---
name: doc-pipeline
description: Generates API documentation from Python source code through a multi-step pipeline. Use when the user asks to document a module, generate API docs, or create documentation from code.
metadata:
  pattern: pipeline
  steps: "4"
---

You are running a documentation generation pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Parse & Inventory
Analyze the user's Python code to extract all public classes, functions, and constants. Present the inventory as a checklist. Ask: "Is this the complete public API you want documented?"

## Step 2 — Generate Docstrings
For each function lacking a docstring:
- Load 'references/docstring-style.md' for the required format
- Generate a docstring following the style guide exactly
- Present each generated docstring for user approval
Do NOT proceed to Step 3 until the user confirms.

## Step 3 — Assemble Documentation
Load 'assets/api-doc-template.md' for the output structure. Compile all classes, functions, and docstrings into a single API reference document.

## Step 4 — Quality Check
Review against 'references/quality-checklist.md':
- Every public symbol documented
- Every parameter has a type and description
- At least one usage example per function
Report results. Fix issues before presenting the final document.
```

![Pipeline](/images/agent-skill-design-patterns-img5-20260318155118.jpg)

面对极其复杂的任务，跳步或者忽略指令的代价是非常高昂的。**流水线模式 (Pipeline)** 通过设置严格的顺序工作流和硬性的检查点来解决这一问题。

在这种模式下，指令本身就是对工作流的定义。通过实现明确的“菱形闸门”条件（例如在从生成代码注释进入最终文档组装阶段之前，必须强制获得用户的确认与批准），你可以确保 Agent 绝对无法绕过既定规则，从而杜绝输出未体验证的最终结果。

这种模式在适当的步骤才动态拉取相应的 `references` 文件与模板，能够确保上下文窗口始终保持整洁与高效。

---

### 选择适合你的 Agent 技能模式

这五种模式各自解决不同的问题。你可以参考下面的决策树来寻找适合你自己用例的最佳方案：

![Decision Tree](/images/agent-skill-design-patterns-img6-20260318155118.jpg)

### 最后，模式之间是可以组合的 (Patterns Compose)

这些设计模式并不是互斥的，而是**可组合的 (Compose)**。

![Composition](/images/agent-skill-design-patterns-img7-20260318155118.jpg)

一个流水线 (Pipeline) 技能完全可以在最后一步嵌入一个审查员 (Reviewer) 步骤来复核自己的工作；而生成器 (Generator) 则可以在最开始就结合反转模式 (Inversion)，在填写模板前主动收集必要的变量。多亏了 ADK 的特性与渐进式加载机制，你的 Agent 只需在运行时花费极少的上下文 Tokens 在当前所必需的特定模式上。

请停止试图在单一的系统提示词中塞满那些既复杂又脆弱的指令。拆解你的工作流，应用正确的设计模式，开始构建真正可靠的智能 Agent 吧！

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://x.com/googlecloudtech/status/2033953579824758855" style="color: #808080; text-decoration: underline;">5 Agent Skill design patterns every ADK developer should know</a></i>
</p>
