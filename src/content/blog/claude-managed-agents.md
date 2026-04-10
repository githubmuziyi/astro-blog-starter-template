---
title: "Anthropic 发布 Claude Managed Agents: 加速云端自治 AI 代理的生产部署"
description: "Claude Managed Agents 现已开启公测，这是一款可组合的 API 架构，能够安全、快速地在托管基础设施中构建和部署多智能体，彻底解决沙箱、权限和复杂业务流的工程难题。"
pubDate: "Apr 08 2026"
heroImage: "/images/claude-managed-agents-20260408120000.jpg"
category: "AI Agents"
---

### 快速阅读

Anthropic 今天发布了 **Claude Managed Agents** 的公测版（Public Beta），这是一款全新的可组合 API 套件，专门为在云端大规模构建、部署和托管 AI 智能体而设计。开发者以往需要花费数周或数月处理沙箱环境、权限控制和错误恢复等复杂基础设施，现在借助 Claude Managed Agents，仅需几天即可将产品推向市场。它不仅提供了一套专为 Claude 优化的工作流编排引擎，还内置了安全治理机制和运行轨迹追踪，支持单任务或复杂多智能体管道（Multi-agent Pipelines）。在包括 Notion、Asana 和 Atlassian 在内的早期测试企业中，该平台使开发周期提速了 10 倍。核心的工程创新在于“大脑（模型与编排）”与“双手（沙箱与工具）”的解耦，彻底抛弃了脆弱的“宠物”式单体容器架构，走向稳定可靠的“牛群”式分布式管理。

### 10倍速实现产品化部署

交付一个生产级别的 AI 智能体往往伴随着艰巨的工程挑战——沙箱代码执行、节点检查（Checkpointing）、凭证管理、细粒度权限管控以及端到端追踪。过去，企业在让用户体验产品前，必须先经历长达数月的基础设施搭建。

**Claude Managed Agents** 彻底接管了这些复杂性。你只需要定义智能体的任务、工具（Tools）和行为边界（Guardrails），剩余的运行工作由托管平台在安全的基础设施中完成。其内置的编排引擎能够智能决定何时调用工具、如何管理上下文记忆，并具备强大的错误自动恢复能力。

平台核心特性包括**受信治理（Trusted governance）**，为智能体赋予精确控制的实际系统访问权限，并提供身份管理与端到端的执行监控。

![Claude Managed Agents Diagram](/images/claude-managed-agents-diagram-20260408120000.png)

### 核心工程架构：大脑与双手解耦 (Decoupling Brain from Hands)

Anthropic 的工程团队在这款产品的架构演进上经历了从“把所有东西塞进一个容器（宠物模式）”到“组件解耦（牛群模式）”的深刻转变。

早期设计中，智能体的会话（Session）、编排器（Harness）和沙箱（Sandbox）共享一个环境。虽然这带来了直接进行系统调用的便利，但也导致服务变得极其脆弱：如果容器死掉，会话日志就丢失了；且排查卡死的会话异常困难，常常需要工程师进入包含用户敏感数据的容器内部查看。此外，若客户想让 Claude 连接其私有云 (VPC)，就必须进行复杂的网络对等连接。

为了解决这些问题，Managed Agents 实现了关键的组件虚拟化和解耦：

1. **大脑离开了容器**：编排器不再与沙箱绑定，而是把沙箱当成一个外部工具来调用（`execute(name, input) → string`）。沙箱变成了随时可被替换的“牛”——如果崩溃了，编排器只需重新初始化一个即可，无需像照顾宠物一样去修复它。
2. **编排器本身也是可抛弃的**：因为会话日志（Session log）独立于编排器持久化保存，编排器如果崩溃，新的实例可以随时启动，通过 `getSession(id)` 拉取历史事件，然后继续无缝运行。
3. **安全边界更加明确**：在耦合设计中，Claude 生成的不可信代码与环境凭证（Tokens）跑在同一个容器内，容易遭受提示词注入攻击。解耦后，凭证永远不会触达执行代码的沙箱。以 Git 或 MCP 为例，认证操作在安全金库代理层完成，沙箱内的工作流只能使用，却无法接触到 Token 明文。
4. **性能与首字延迟（TTFT）的大幅优化**：过去每个会话即使不需要沙箱，也要等待容器启动。现在，编排器在确切需要沙箱时才会动态请求，这项架构改进使得智能体的 p50 首字延迟降低了 60%，p95 延迟下降了惊人的 90%。

### 专为发挥 Claude 优势打造

Claude 系列模型天生适合执行复杂的代理工作（Agentic work）。作为专用的托管环境，Managed Agents 能够以更少的精力实现更优的智能体结果。

通过该平台，开发者可以预先设定预期成果与成功标准，Claude 便会自我评估并迭代，直到达成目标。对于需要更精细控制的场景，它也完全支持传统的“提示与响应”（Prompt-and-response）工作流。内部测试显示，在结构化文件生成的复杂任务中，相较于标准提示循环，Managed Agents 能够将任务成功率提升高达 10 个百分点。

此外，所有会话追踪（Session tracing）、集成分析与故障排查指南都直接内置于 Claude Console 中。你可以随时洞察每一次工具调用的细节、决策逻辑及失败原因。

#### 突破上下文窗口的“记忆”管理
面对长周期任务，Claude 的上下文窗口经常不够用。Managed Agents 将 **会话（Session）** 提升为了超越模型原生上下文窗口的持久化对象。它提供 `getEvents()` 接口，允许编排器对事件流进行切片、回溯和按需提取，再结合编译器的灵活变换，大幅提高了 Prompt Cache 的命中率。这保证了模型即便在海量上下文下也不会“丢失关键细节”。

### 头部团队的实战案例

众多行业领导者已经通过 Managed Agents 实现了 10 倍速的生产级发布部署：

- **Notion** 接入该平台后，其智能体不仅具备长时运行（Long-running sessions）和记忆管理能力，还能输出高质量的工作成果，让用户在 Notion 内即可完成从写代码到生成表格/幻灯片等各种开放式复杂任务。
- **Rakuten（乐天）** 利用它在一周内部署专业智能体，轻松跨越工程、产品、销售、市场和财务等领域，在安全沙箱内生成应用程序与提案。
- **Asana** 借助平台极大地加速了“Asana AI Teammates”的开发速度。
- **Atlassian** 则将其用于编排人机协作，允许用户直接从 Jira 向智能体分配任务，不再为繁杂的基础架构维护感到困扰。
- **Sentry** 和 **VibeCode** 则通过赋予智能体代码修复与提 PR 的能力，使工程师能专注于业务价值本身。

### 计费与获取途径

Claude Managed Agents 采用按需使用的计费模式，除标准的 Claude Token 费用外，活跃运行时间（Active runtime）将按每会话小时 $0.08 收费。

现在，你可以在 Claude 平台上体验该服务的公测版。开发者可以直接通过最新版 Claude Code 以及内置的 `claude-api` Skill 进行探索，只需提问 “start onboarding for managed agents in Claude API” 即可快速入门。

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<br>
  <a href="https://claude.com/blog/claude-managed-agents" style="color: #808080; text-decoration: underline;">Claude Managed Agents: get to production 10x faster</a><br>
  <a href="https://www.anthropic.com/engineering/managed-agents" style="color: #808080; text-decoration: underline;">Engineering Blog: Scaling Managed Agents</a>
  </i>
</p>