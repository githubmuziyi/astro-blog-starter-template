---
title: "为 Claude 构建技能 (Skills) 的完整指南"
description: "学习如何使用 Skills 和 MCP 为 Claude 构建强大的定制化工作流，提升工具调用的准确性和一致性。"
pubDate: "Mar 09 2026"
heroImage: "/images/claude-skills-complete-guide-20260309161700.jpg"
category: "AI Skills"
---

### 快速阅读

Claude 技能 (Skills) 是一个打包为文件夹的指令集合，用于教导 Claude 如何处理特定的任务或工作流。如果你有重复性的工作（例如按规范生成前端设计、执行具有统一方法论的调研等），技能可以让你“一次教学，永久受益”。与 MCP（模型上下文协议）结合时，MCP 提供的是工具连接能力（“厨房和食材”），而 Skills 则提供了最佳实践和工作流（“菜谱”）。本文将带你了解技能的设计原则、核心构成、最佳实践案例以及不同的编排模式，帮助你构建出能让大模型稳定发挥的专有技能。

---

## 什么是技能 (Skills)？

一个完整的技能是一个目录，通常包含以下结构：

*   **`SKILL.md` (必需)**：使用 Markdown 编写的主指令文件，顶部包含 YAML Frontmatter (前置元数据)。
*   **`scripts/` (可选)**：可执行代码（如 Python、Bash 脚本等）。
*   **`references/` (可选)**：根据需要加载的文档或参考手册。
*   **`assets/` (可选)**：模板、字体、图标等资源。

### 核心设计原则

1.  **渐进式披露 (Progressive Disclosure)**：技能采用三层系统。第一层（YAML Frontmatter）始终加载在 Claude 的系统提示词中，告知何时触发；第二层（`SKILL.md` 主体）仅在技能被判定为相关时加载；第三层（附带文件）仅在需要时被检索。这可以在保持专业度的同时最小化 Token 消耗。
2.  **可组合性 (Composability)**：Claude 可以同时加载多个技能。你的技能应该与其他技能协同工作。
3.  **便携性 (Portability)**：只需创建一次，即可在不同的终端（Claude.ai, Claude Code, API）上使用。

### MCP 与 Skills 的完美结合

如果你已经有一个 MCP Server，那么 Skills 将为你补全最后一块拼图。
**MCP 提供连接能力**（是什么）：连接到 Notion、Asana 等服务，提供实时数据和工具。
**Skills 提供知识引擎**（怎么做）：教导 Claude 如何高效使用这些服务，封装最佳实践和工作流程。

---

## 常见的技能用例分类与案例

我们在日常构建中总结了三大常见用例：

### 类别 1：文档与资产创建
用于生成一致的、高质量的输出结果，如文档、演示文稿或代码。
**实际案例：`frontend-design` 技能**
> “创建具有高设计质量和独特风格的生产级前端界面。适用于构建 Web 组件、页面或应用程序。”

### 类别 2：工作流自动化
用于受益于一致性方法论的多步骤流程。
**实际案例：`skill-creator` 技能**
> “交互式的新技能创建指南。引导用户定义用例、生成 Frontmatter、编写指令并进行验证。”

### 类别 3：MCP 增强
为 MCP Server 提供的工具集增加工作流引导。
**实际案例：`sentry-code-review` 技能 (来自 Sentry)**
> “通过 Sentry MCP Server 获取错误监控数据，自动分析并修复 GitHub PR 中检测到的 Bug。”

---

## 构建有效技能的最佳实践

### YAML Frontmatter：最重要的一环

YAML 位于 `SKILL.md` 顶部，是 Claude 决定是否加载该技能的关键。必须包含 `name` 和 `description` 字段。
`description` 必须同时包含 **“它做什么”** 和 **“何时使用它 (触发条件)”**。

**好的案例 (Good)：**
> `description: 分析 Figma 设计文件并生成开发者交接文档。当用户上传 .fig 文件，并要求提供“设计规范”、“组件文档”或“设计到代码交接”时使用。`

**坏的案例 (Bad)：**
> `description: 帮助处理项目。` (太模糊，缺乏触发短语)

### 编写主指令 (SKILL.md)

指令应该清晰、具体并具有可操作性。

*   **保持具体**：例如明确写出 `运行 python scripts/validate.py --input {filename}`，而不是泛泛地说“在继续前验证数据”。
*   **包含错误处理**：预判可能出现的报错（如“连接被拒绝”），并提供检查配置的步骤。
*   **结构化**：使用 `## 步骤 1` 这样的明确结构，并提供 `示例 (Examples)` 和 `故障排除 (Troubleshooting)` 板块。

---

## 技能设计模式 (Design Patterns)

你可以根据需要选择“问题优先”还是“工具优先”的策略。以下是几种常见且经过验证的模式：

### 模式 1：顺序工作流编排 (Sequential Workflow)
适用于用户需要按特定顺序执行多步骤流程的场景。
**案例：入职新客户**
1. 创建账户 (调用 `create_customer` 工具)
2. 设置支付 (调用 `setup_payment_method`)
3. 创建订阅 (依赖步骤1的客户 ID)
4. 发送欢迎邮件

### 模式 2：多 MCP 协调 (Multi-MCP Coordination)
适用于跨多个服务的工作流。
**案例：设计到开发的交接**
1. **阶段 1 (Figma MCP)**：导出资产和规范。
2. **阶段 2 (Drive MCP)**：创建云盘文件夹，上传资源并生成链接。
3. **阶段 3 (Linear MCP)**：创建开发任务，附带上一步的链接。
4. **阶段 4 (Slack MCP)**：向工程师频道发送包含总结和链接的通知。

### 模式 3：迭代优化 (Iterative Refinement)
适用于需要通过循环检验来提高质量的任务。
**案例：报告生成**
先获取数据生成初稿，然后运行 `scripts/check_report.py` 脚本校验遗漏或格式问题，随后让模型针对问题进行循环重写，直到满足质量阈值，最后再输出定稿。

### 模式 4：上下文感知工具选择 (Context-aware Tool Selection)
同一种目标，根据上下文动态决策使用不同工具。
**案例：智能文件存储**
技能内部设置决策树：如果是大文件 (>10MB) 存入云盘 MCP；如果是协作文档存入 Notion MCP；代码片段存入 GitHub MCP。

### 模式 5：特定领域智能 (Domain-specific Intelligence)
超越单纯的工具调用，融入了深度的专业知识判定。
**案例：带合规校验的支付处理**
在真正调用支付 MCP 工具之前，技能要求模型先执行合规校验（检查制裁名单、管辖权允许范围、评估风险等级），如果不合规必须转交人工审核，而非直接阻断或盲目执行。

---

无论你是为自己、为团队还是为社区构建技能，掌握这些核心原则和设计模式，都将极大地提升 AI 智能体在处理具体业务时的稳定性和可靠性。

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf" style="color: #808080; text-decoration: underline;">The Complete Guide to Building Skills for Claude</a></i>
</p>
