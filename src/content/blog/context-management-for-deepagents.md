---
title: "Deep Agents 的上下文管理"
description: "随着 AI 智能体可处理的任务长度不断增加，有效的上下文管理对于防止“上下文腐烂”和应对 LLM 有限的记忆限制变得至关重要。"
pubDate: "Mar 01 2026"
heroImage: "/blog-placeholder-2.jpg"
category: "AI Agents"
---

# Deep Agents 的上下文管理

**作者**：Chester Curme 和 Mason Daugherty
**来源**：[LangChain Blog](https://blog.langchain.com/context-management-for-deepagents/)

随着 AI 智能体（Agents）可处理的任务长度[不断增加](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)，有效的上下文管理（Context Management）变得至关重要，这不仅能防止[上下文腐烂 (context rot)](https://research.trychroma.com/context-rot)，还能有效应对大语言模型 (LLM) 有限的记忆限制。

[Deep Agents SDK](https://docs.langchain.com/oss/python/deepagents/overview) 是 LangChain 推出的开源且“开箱即用”的[智能体脚手架 (agent harness)](https://blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/)。它为构建具备规划能力、衍生子智能体 (subagents) 以及通过文件系统执行复杂、长时间运行任务的智能体提供了一条便捷之路。由于这类任务通常会超出模型的上下文窗口限制，该 SDK 实现了一系列旨在促进**上下文压缩 (Context Compression)** 的功能。

**上下文压缩**是指在保留完成任务所需的相关细节的同时，减少智能体工作记忆中信息量的技术。这可能包括总结之前的交互、过滤过时的信息，或者策略性地决定保留或丢弃哪些内容。

Deep Agents 实现了一个[文件系统抽象](https://docs.langchain.com/oss/python/deepagents/middleware#filesystem-middleware)，允许智能体执行列出、读取、写入文件以及搜索、模式匹配和文件执行等操作。智能体可以根据需要使用文件系统来搜索并检索已卸载（offloaded）的内容。

Deep Agents 实现了三种主要的压缩技术，它们会在不同的触发频率下执行：

1. **卸载大型工具结果 (Offloading large tool results)**：只要出现过大的工具响应，我们就会将其卸载到文件系统中。
2. **卸载大型工具输入 (Offloading large tool inputs)**：当上下文大小超过阈值时，我们会将工具调用中旧的写入/编辑参数卸载到文件系统中。
3. **文本总结 (Summarization)**：当上下文大小超过阈值，并且没有更多符合卸载条件的上下文时，我们会执行总结步骤以压缩消息历史。

为了管理上下文限制，Deep Agents SDK 会在模型上下文窗口达到特定比例阈值时触发这些压缩步骤。（在底层，我们使用 LangChain 的 [模型配置文件 (model profiles)](https://docs.langchain.com/oss/python/langchain/models#model-profiles) 来获取给定模型的 token 阈值。）

## 卸载大型工具结果

工具调用的响应（例如，读取大文件的结果或 API 调用返回的数据）很容易超过模型的上下文窗口。当 Deep Agents 检测到工具响应超过 20,000 个 token 时，它会将响应**卸载到文件系统**中，并在上下文中将其替换为一个文件路径引用以及前 10 行的预览。智能体随后可以根据需要重新读取或搜索该内容。

## 卸载大型工具输入

文件写入和编辑操作会在智能体的对话历史中留下包含完整文件内容的工具调用。由于这些内容已经持久化到了文件系统中，它们通常是多余的。当会话上下文超过模型可用窗口的 **85%** 时，Deep Agents 将截断较旧的工具调用，用指向磁盘上文件的指针替换它们，从而减少活动上下文的大小。

## 文本总结 (Summarization)

当上述卸载操作无法释放出足够的空间时，Deep Agents 将退回到**总结模式**。此过程包含两个部分：

- **上下文内总结 (In-context summary)**：LLM 会生成对话的结构化摘要——包括会话意图、已创建的工件 (artifacts) 以及后续步骤——该摘要将替换智能体工作记忆中的完整对话历史。（参见 Deep Agents [总结提示词](https://github.com/langchain-ai/langchain/blob/master/libs/langchain_v1/langchain/agents/middleware/summarization.py#L33-L74)）。
- **文件系统持久化 (Filesystem preservation)**：完整、原始的对话消息将被写入文件系统，作为规范的记录。

这种双重方法确保了智能体能够（通过摘要）保持对其目标和进度的认知，同时又（通过文件系统搜索）保留了在需要时恢复特定细节的能力。您可以查看[这个追踪示例](https://smith.langchain.com/public/0e3f59e0-7278-4a7a-80fd-99d4fb7fa912/r)，其中模型使用了 `read_file` 工具来获取之前被卸载的消息。

## 实际应用效果

虽然上述技术提供了上下文管理的机制，但我们如何知道它们是否真正发挥了作用？在真实任务中的运行测试（如 [terminal-bench](https://www.tbench.ai/) 等基准测试所捕捉的那样），可能只会偶尔触发上下文压缩，这使得很难孤立地评估它们的影响。

我们发现，通过在基准测试数据集上**更激进地触发**这些功能，可以有效增强信号。例如，虽然在可用上下文窗口仅达到 10-20% 时就触发总结可能会导致整体性能欠佳，但这会产生明显更多的总结事件。这使得比较不同的配置（如实现的不同变体）成为可能。例如，通过强制智能体频繁进行总结，我们可以发现：只需在 deepagents 总结提示词中添加用于明确会话意图和下一步行动的专门字段，这样简单的[更改](https://github.com/langchain-ai/langchain/pull/34754)就能有效帮助提升性能。

*(注：原图展示了模型在基准测试中 token 随时间的使用情况。通过在上下文窗口达到 25% 而不是默认的 85% 时触发压缩，研究人员可以产生更多的压缩事件来进行专门研究。)*

### 针对性评估 (Targeted evals)

Deep Agents SDK 维护了一套旨在隔离和验证各个上下文管理机制的**针对性评估集**。这些是刻意设计的小型测试，能让特定的故障模式变得明显且易于调试。

这些评估的目的不是为了衡量广泛的任务解决能力，而是为了确保智能体的脚手架框架不会阻碍特定任务的完成。例如：

- **总结是否保留了智能体的目标？** 某些评估会故意在任务中途触发总结，然后检查智能体是否能够继续执行任务。这确保了总结不仅保留了智能体的状态，还保留了其行动轨迹。
- **智能体能否恢复被总结掉的信息？** 这里我们在对话早期嵌入一个[“大海捞针”(needle-in-the-haystack)](https://github.com/langchain-ai/deepagents/blob/master/libs/deepagents/tests/integration_tests/test_summarization.py#L166-L183) 事实，强制触发总结事件，然后要求智能体在稍后回忆该事实以完成任务。该事实在总结后不再存在于活动上下文中，必须通过文件系统搜索来恢复。

这些针对性的评估充当了上下文管理的集成测试：它们不能取代完整的基准测试运行，但它们显著减少了迭代时间，并使得故障可以归因于特定的压缩机制，而不是整体智能体的行为。

### 指导建议 (Guidance)

在评估您自己的上下文压缩策略时，我们建议重点关注以下几点：

- **从真实的基准测试开始，然后对单个功能进行压力测试。** 首先在代表性任务上运行您的智能体以建立基准性能。然后，人为地更激进地触发压缩（例如，在达到上下文的 10-20% 时，而不是 85% 时触发），以在每次运行中产生更多的压缩事件。这放大了来自单个功能的信号，使得比较不同的方法（例如提示词的变体）变得更加容易。
- **测试可恢复性。** 只有当关键信息仍然可访问时，上下文压缩才是有用的。请加入针对性测试，验证智能体既能在压缩后继续朝着原始目标前进，又能在需要时恢复特定的细节（例如，关键事实被总结掉但随后必须被找回的“大海捞针”场景）。
- **监控目标偏离 (goal drift)。** 最隐蔽的故障模式是智能体在总结后忘记了用户的初始意图。这可能表现为智能体在总结后的下一轮中请求澄清，或者错误地宣布任务已完成。偏离预期任务的更微妙的失误可能很难归因于文本总结；而在示例数据集上强制频繁进行总结，可能有助于暴露这些隐性故障。

[Deep Agents](https://github.com/langchain-ai/deepagents) 框架的所有功能都是开源的。欢迎尝试最新版本，并告诉我们哪种压缩策略最适合您的用例！