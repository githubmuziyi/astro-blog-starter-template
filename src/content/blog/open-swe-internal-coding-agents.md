---
title: "Open SWE：面向内部编程智能体的开源框架"
description: "LangChain 开源了 Open SWE，这是一个基于 Deep Agents 和 LangGraph 构建的框架，旨在提取并提供类似 Stripe、Ramp 和 Coinbase 等公司内部编程智能体的通用架构模式。"
pubDate: "Mar 18 2026"
heroImage: "/images/open-swe-internal-coding-agents-20260318041500.jpg"
category: "AI Agents"
---

### 快速阅读

在过去的一年中，诸如 Stripe、Ramp 和 Coinbase 等工程组织都在构建与开发团队协同工作的内部编程智能体。尽管这些系统相互独立开发，但它们最终殊途同归，展现出了相似的架构模式：隔离的云沙箱、精选的工具集、子智能体编排以及与现有开发者工作流的深度融合。

基于这些行业洞察，LangChain 正式发布了 **Open SWE**，这是一个构建在 Deep Agents 和 LangGraph 之上、并囊括了上述通用模式的开源框架，为想要在生产环境中部署内部编程智能体的团队提供了一个高可定制的起点。

### 生产部署中的通用模式

根据 Stripe、Ramp 等公司的公开实践，优秀的内部编码智能体通常具备以下共同维度：

- **隔离的执行环境**：任务在一个具备完全权限、边界严格的专用云沙箱中运行。这不仅能隔离任何误操作对生产系统带来的潜在威胁，还允许智能体无需反复申请授权即可执行命令。
- **精选工具集**：相比于盲目累加数百个工具，大型组织更倾向于提供一小部分经过严格挑选并持续维护的工具。
- **Slack 优先的调用方式**：智能体往往与 Slack 无缝结合，在开发者现有的沟通工作流中迎接它们，而无需开发者切换到全新的应用程序中。
- **启动时的丰富上下文**：在开始工作前，智能体会完整抓取 Linear issue、Slack 对话线程或 GitHub PR 中的上下文，减少了通过工具调用去摸索需求的开销。
- **子智能体编排**：面对复杂的任务，系统会将其拆解，并委派给职责更加专一的子智能体。

### Open SWE 的架构

Open SWE 提供了一个实现类似架构模式的开源实现。在实现细节上，它由以下几个核心组件构成：

![Open SWE 架构](/images/open-swe-internal-coding-agents-OpenSWE-20260318041500.png)

1. **智能体引擎 (基于 Deep Agents 组合)**：Open SWE 并未去从零编写或分叉现有的智能体，而是选择在 Deep Agents 框架之上进行组合。这种方式使得在 Deep Agents 更新底层能力（如上下文管理、效率优化）时能无缝升级，并允许用户在组织级别保留自定义的提示词和工具配置。
2. **沙箱系统**：每个任务都在一个拥有完整 Shell 访问权限的远程 Linux 环境中运行。Open SWE 开箱即支持 Modal、Daytona、Runloop 和 LangSmith 等提供商。
3. **精简的工具集**：系统默认携带了一套小巧的工具合集（如 `execute`、`fetch_url`、`http_request`、`commit_and_open_pr` 等），搭配 Deep Agents 内置的文件管理和子智能体能力，更易于测试与维护。
4. **上下文工程**：Open SWE 使用双层上下文。一方面读取代码库根目录的 `AGENTS.md` 文件获取组织级约定；另一方面结合 Linear 或 Slack 等系统获取任务特定的原始信息。
5. **智能体与中间件编排**：除了通过 `task` 工具派生子智能体，系统还引入了确定性的中间件钩子（例如自动注入半途发送的追加消息，或在必要时自动打开 PR 作为安全网）。
6. **调用集成**：支持 Slack (通过提及机器人)、Linear (评论唤醒) 和 GitHub (通过 PR 评论自动响应)。

### 为什么选择 Deep Agents

深层次基于 Deep Agents 构建赋予了该架构更强的可维护性。由于编码任务往往伴随着巨量中间信息（日志、搜索结果等），Deep Agents 采用了基于文件的内存管理来防止上下文溢出。此外，它的结构化计划工具 (`write_todos`) 非常适合长周期的拆解式任务。

### 为你的组织量身定制

Open SWE 旨在成为一个可定制的脚手架，其主要组件均支持灵活插拔配置：

- **模型**：默认采用 Claude Opus 4，但可以自由更换为内部偏好的 LLM。
- **沙箱与工具**：你可以根据内部基础设施替换沙箱平台，或添加针对组织私有 API 的专有工具。
- **工作流集成**：如果你的组织不使用 Slack，依然可以对接邮件、Webhook 等新的触发方式。

尽管目前各家公司的底层实现各有差异，但这套围绕环境隔离、子智能体与现有流融合的模式已初现雏形。如果你所在的团队也期望探索内部编程智能体，不妨将 Open SWE 作为你们的实验基石。

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/" style="color: #808080; text-decoration: underline;">Open SWE: An Open-Source Framework for Internal Coding Agents</a></i>
</p>
