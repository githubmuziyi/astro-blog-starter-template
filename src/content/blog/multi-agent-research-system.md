---
title: "Anthropic 揭秘：如何打造多智能体研究系统（MARS）"
description: "深度解析 Anthropic 研究团队如何通过 Orchestrator-Worker 模式，让 Claude 4 的多智能体协作性能提升 90%。"
pubDate: "Mar 01 2026"
heroImage: "/images/mars-cover.jpg"
category: "AI 技术"
---

### 快速阅读
Anthropic 首次公开了其多智能体研究系统（MARS）的实战经验。通过“编排者（Lead Agent）+ 执行者（Subagents）”的并行架构，MARS 在复杂研究任务上的表现比单体模型提升了 90.2%。核心秘诀在于：用更多的 Token 换取并行推理能力，并通过精细的提示词工程（Prompt Engineering）教会智能体如何“思考”与“协作”。

---

### 为什么需要多智能体？

在进行深度研究时，预设的固定路径往往行不通。研究本质上是一个动态、依赖路径的过程，需要根据中间发现不断调整方向。

**多智能体的优势：**
1. **压缩与并行**：子智能体（Subagents）可以在各自独立的上下文窗口中并行搜索，将海量信息压缩成精华，再反馈给主智能体（Lead Agent）。
2. **性能翻倍**：Anthropic 的内部评估显示，在 S&P 500 公司董事成员调查等宽泛任务中，由 Claude Opus 4 担任主控、Claude Sonnet 4 担任子智能体的系统，比单个 Opus 4 强出 90.2%。
3. **Token 即智能**：研究发现，性能提升的 80% 解释权在于消耗了更多 Token。多智能体架构通过分布式推理，有效扩展了单个智能体的能力上限。

*注意：虽然性能强悍，但多智能体系统的 Token 消耗量通常是普通对话的 15 倍。*

### MARS 架构：编排者-执行者模式

MARS 采用了经典的 **Orchestrator-Worker** 架构：

1. **Lead Researcher（主控）**：分析用户查询，制定研究策略，并生成专门的子任务。
2. **Subagents（子智能体）**：作为“智能过滤器”，迭代使用搜索工具（如 Web Search），在各自的上下文窗口中独立工作。
3. **Memory（记忆）**：Lead Researcher 将计划保存到外部记忆中，以防上下文窗口溢出。
4. **CitationAgent（引用代理）**：在研究结束后，专门负责核实所有主张的来源，确保引用的准确性。

### 提示词工程的七条金律

Anthropic 总结了提升智能体协作能力的实战经验：

- **学会像智能体一样思考**：在 Console 中模拟运行，观察智能体的报错路径。
- **教会编排者如何授权**：主控给出的指令不能只是“去搜半导体短缺”，而需要明确目标、输出格式和任务边界。
- **根据复杂度动态分配资源**：简单的实时查找用 1 个智能体，复杂的对比研究可能需要 10 个以上。
- **工具设计至关重要**：使用 MCP (Model Context Protocol) 赋予智能体访问外部工具的能力，并提供清晰、独特的工具描述。
- **让智能体自我改进**：Claude 4 模型本身就是优秀的提示词工程师，可以根据失败案例重写工具描述。
- **先广后窄的搜索策略**：引导智能体先进行短小、宽泛的关键词搜索，再逐步深入。
- **引导思考过程**：利用 Extended Thinking 模式，让智能体在调用工具前先进行逻辑推演。

### 生产环境中的挑战

- **错误会叠加**：智能体任务运行时间长，系统需要具备断点续传（Checkpoints）和错误恢复能力。
- **调试难度大**：由于智能体的非确定性，需要全链路生产追踪（Production Tracing）。
- **部署策略**：采用 Rainbow Deployments，确保更新不中断正在运行的智能体任务。

---

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://www.anthropic.com/engineering/multi-agent-research-system" style="color: #808080; text-decoration: underline;">How we built our multi-agent research system</a></i>
</p>
