---
title: "Agent Client Protocol (ACP): 终结 AI Agent 的“战国时代”"
description: "深入解析 JetBrains 与 IBM 分别推动的两种 ACP 协议：它们如何标准化 AI 代理与编辑器、代理与代理之间的通信？"
pubDate: "Feb 10 2025"
heroImage: "/acp-protocol-cover.jpg"
category: "AI Protocols"
---

# Agent Client Protocol (ACP): 终结 AI Agent 的“战国时代”

在 AI Agent 爆发的今天，我们正面临一个类似早期互联网的困局：不同的 AI 代理（Agent）、不同的编辑器（IDE）以及不同的平台之间，通信协议千差万别。这种“战国时代”的割据，极大地增加了开发者集成和协作的成本。

为了打破这一僵局，业界出现了两个同名但侧重点不同的 **ACP (Agent Client Protocol)** 协议。今天，我们就用深度研究（Research）的视角，扒一扒这两个协议到底是什么，以及它们将如何改变 AI 的未来。

## 1. 两个“ACP”：你是哪一个？

有趣的是，目前市面上活跃着两个使用 “ACP” 缩写、但应用场景截然不同的标准：

1.  **编辑器 ↔ 代理 (Agent Client Protocol)**：由 **JetBrains** 和 **Zed** 联合主导，旨在标准化代码编辑器与 AI 编程代理之间的通信。
2.  **代理 ↔ 代理 (Agent Communication Protocol)**：由 **IBM Research (BeeAI)** 发起，隶属于 Linux 基金会，侧重于不同代理之间的互操作性。

---

## 2. 编辑器之桥：JetBrains & Zed 的 ACP

如果你是一名开发者，你可能已经厌倦了为每个编辑器编写不同的 Copilot 插件。JetBrains 推出的 ACP 正是为了解决这个问题。

### 核心设计理念
- **标准化接口**：基于 JSON-RPC 2.0，让任何符合 ACP 的代理都能无缝接入任何支持 ACP 的编辑器。
- **本地优先与隐私**：默认通过标准输入输出（stdio）进行本地进程通信。除非用户明确授权，否则代码不会轻易离开本地环境。
- **复用 MCP**：它明智地复用了 **Model Context Protocol (MCP)** 的数据类型，减少了重复造轮子。

### 工作流程
1. 编辑器启动 Agent 进程。
2. 通过 `session/initialize` 初始化。
3. 通过 `session/prompt` 发起任务，Agent 通过 `session/update` 实时流式返回 Markdown 格式的结果。
4. Agent 可以请求权限（如调用工具、读取文件），由编辑器作为“守门人”进行仲裁。

---

## 3. 代理间协作：IBM 的 Agent Communication Protocol

当任务变得极其复杂，需要多个专项 Agent 协同工作时，IBM 推动的这个 ACP 就派上用场了。

### 核心功能
- **RESTful 设计**：它是“Web 原生”的，通过标准的 HTTP 接口进行通信，甚至可以用 `curl` 直接调试。
- **发现机制**：支持在线（目录/注册表）和离线（嵌入元数据）发现，让 Agent 能够“找到”彼此。
- **多模态支持**：消息载体不仅可以是文本，还可以包含文件、图像或 Embedding。
- **异步协作**：支持长耗时任务的异步推送和流式反馈（SSE）。

---

## 4. ACP  vs 其他协议：位置在哪里？

为了让你更清楚 ACP 的生态位，我们做个简单的对比：

| 协议 | 核心用途 | 通信对象 |
| :--- | :--- | :--- |
| **LSP** | 语言分析（补全、跳转） | 编辑器 ↔ 语言服务器 |
| **MCP** | 工具与数据访问 | 模型 ↔ 外部工具/数据 |
| **ACP (Editor)** | AI 编程交互与会话管理 | 编辑器 ↔ AI 代理 |
| **ACP (Comm)** | 跨平台、跨组织协作 | 代理 ↔ 代理 |

---

## 5. 总结：标准化是 Agent 规模化的前提

无论是 JetBrains 想要统一编程体验，还是 IBM 想要构建“AI 版的 HTTP”，ACP 的出现都释放了一个强烈信号：**AI Agent 正在从“炫技阶段”走向“工业化阶段”。**

对于开发者来说，这意味着我们不再被锁定在某个特定的闭环生态中。你可以用 Zed 编辑器配合你自己在本地运行的定制化 ACP Agent，同时这个 Agent 还能通过通信协议去求助另一个专门负责数据库优化的远程 Agent。

**欢迎来到 AI 互联时代。**

---
*本文基于 Javes (OpenClaw) 使用 Research (Pro) 技能生成的调研报告整理而成。*
*调研时间：2025年2月10日*
*参考来源：JetBrains, Zed.dev, IBM Research, BeeAI Toolkit.*
