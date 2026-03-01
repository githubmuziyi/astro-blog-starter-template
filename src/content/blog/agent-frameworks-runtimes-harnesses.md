---
title: "智能体框架、运行时与工具台 (Agent Frameworks, Runtimes, and Harnesses)"
description: "LangChain、LangGraph 与 DeepAgents 的核心区别与适用场景深度解析。"
pubDate: "Mar 01 2026"
heroImage: "/blog-placeholder-2.jpg"
---

# 智能体框架、运行时与工具台：概念解析

我们维护着几个不同的开源代码库：其中最大的是 **[LangChain](https://docs.langchain.com/oss/python/langchain/)** 和 **[LangGraph](https://docs.langchain.com/oss/python/langgraph/)**，而 **[DeepAgents](https://docs.langchain.com/oss/python/deepagents/)** 则是近期越来越受欢迎的一个。

为了更好地描述它们，我开始使用不同的术语：
*   **LangChain** 是一个**智能体框架 (Agent Framework)**
*   **LangGraph** 是一个**智能体运行时 (Agent Runtime)**
*   **DeepAgents** 是一个**智能体工具台 (Agent Harness)**

业界其他人也开始使用这些术语，但我认为目前对于这三者的界限还没有一个清晰的定义。这篇文章就是尝试对这些概念进行界定的一次努力。当然，这些概念之间仍然存在模糊和重叠的地带。

---

## 🛠️ 智能体框架 (Agent Frameworks)

大多数帮助开发者基于大语言模型 (LLM) 构建应用的工具包，我都会将其归类为**智能体框架**。

它们提供的核心价值在于**抽象 (Abstractions)**。这些抽象代表了对世界的一种心智模型，其首要目标是降低开发门槛，让上手变得更容易。同时，框架提供了一种标准化的应用构建方式，使得开发者能够快速入门并在不同项目之间无缝切换。

不过，对抽象的常见抱怨是：如果设计得不好，它们可能会掩盖底层运作逻辑，并导致在处理高级复杂场景时缺乏足够的灵活性。

我们认为 **LangChain** 就是一个典型的智能体框架。在发布 1.0 版本时，我们花了大量时间思考如何设计抽象——无论是结构化的内容块、智能体循环，还是中间件（我们认为这能为标准的智能体循环增加灵活性）。

**其他智能体框架示例：**
*   Vercel AI SDK
*   CrewAI
*   OpenAI Agents SDK
*   Google ADK
*   LlamaIndex

---

## ⚙️ 智能体运行时 (Agent Runtimes)

当你需要将智能体部署到生产环境时，你需要某种**智能体运行时**。运行时应当提供更多基础设施层面的考量。

我能想到的最主要特性是**持久化执行 (Durable Execution)**，此外还包括：
*   流式传输支持 (Streaming)
*   人机交互支持 (Human-in-the-loop)
*   线程级持久化 (Thread-level persistence)
*   跨线程持久化 (Cross-thread persistence)

在构建 **LangGraph** 时，我们的初衷就是从零开始打造一个生产级别的智能体运行时。我们认为与此最接近的其他项目是 Temporal、Inngest 等持久化执行引擎。

智能体运行时通常比框架更底层，并且可以作为框架的底层驱动。例如，LangChain 1.0 就是建立在 LangGraph 之上的，从而充分利用了其提供的运行时特性。

---

## 🧰 智能体工具台 (Agent Harnesses)

**DeepAgents** 是我们正在开发的最新项目。它比智能体框架处于更高的抽象层级——它是建立在 LangChain 之上的。

它不仅仅是一个框架，更是“开箱即用”的完整套件。它内置了：
*   默认提示词 (Default prompts)
*   对工具调用的定制化处理 (Opinionated tool calling)
*   规划工具 (Planning tools)
*   文件系统访问权限 (Filesystem access)

我们描述 DeepAgents 的另一种方式是：**“通用版 Claude Code”**。平心而论，Claude Code 也正试图成为一个智能体工具台——他们发布的 Claude Agent SDK 就是朝着这个方向迈出的一步。除了 Claude Agent SDK 之外，我认为目前市面上还没有太多其他通用的智能体工具台。不过，你也可以说*所有*编码辅助 CLI 本质上都是智能体工具台，甚至可能是通用型的。

---

## 💡 总结：何时使用哪一个？

让我们总结一下它们的区别以及适用场景：

| 类别 | 抽象层级 | 核心价值 | 代表项目 |
| :--- | :--- | :--- | :--- |
| **框架 (Framework)** | 中层 | 快速上手，标准化构建，抽象模型 | LangChain, LlamaIndex, CrewAI |
| **运行时 (Runtime)** | 底层 | 生产环境基础设施，持久化，状态管理 | LangGraph, Temporal |
| **工具台 (Harness)** | 高层 | 开箱即用的默认配置，内置工具与工作流 | DeepAgents, Claude Code |

必须承认，这些界限有时是模糊的。例如，LangGraph 可能最好被描述为兼具“运行时”和“框架”的特性。而“智能体工具台”也是一个我刚刚开始看到被广泛使用的术语。目前这些概念都还没有超级清晰的最终定义。

在一个早期发展的领域进行探索，部分乐趣就在于提出新的心智模型来探讨事物。将它们分别定义为框架、运行时和工具台是一个很有用的区分方式。

*(本文提取并翻译自 [LangChain 官方博客](https://blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/))*