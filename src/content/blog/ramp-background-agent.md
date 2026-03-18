---
title: "为什么我们要打造自己的后台自动编程 Agent (Inspect)"
description: "Ramp 团队如何利用 Modal 沙盒、OpenCode 和 Cloudflare Durable Objects 打造强大的内部编程智能体，并且接管了约 30% 的拉取请求 (PR)。"
pubDate: "Mar 18 2026"
heroImage: "/images/ramp-background-agent-20260318042500.jpg"
category: "AI Agents"
---

### 快速阅读
Ramp 团队打造了名为 "Inspect" 的后台自动编程 Agent。与普通的编程助手不同，Inspect 运行在 Modal 提供的云端沙盒中，拥有工程师完整的工作环境（如 Vite、数据库、GitHub、Slack 等）。它的主要特点是速度极快、支持无限并发、无缝融入现有工作流（Slack 机器人、浏览器扩展、Web 版 VS Code），并且支持“多人协作”（Multiplayer）模式。通过预热沙盒、增量同步代码以及使用 Cloudflare Durable Objects 管理状态，Inspect 实现了低延迟和高度的稳定性。目前，它已经自动编写了 Ramp 团队约 30% 的前端与后端拉取请求（PR）。

### 赋予 Agent 真正的“代理权”
Inspect 的核心理念是让 Agent 拥有与人类工程师完全相同的上下文和工具。它不仅仅是一个代码生成器，而是一个可以在后端运行测试、查询日志、在前端进行视觉验证的“全栈”工具。因为它运行在云端的沙盒中，你不需要占用本地电脑资源，甚至可以同时开启多个会话（Session）尝试不同的 Prompt，让不同的 Agent 相互比拼思路。

![Inspect 演示](/images/ramp-background-agent-hero-20260318042500.png)

### 核心架构与优化手段

#### 1. 高速沙盒环境 (Sandbox)
他们选择了 **Modal** 作为基础设施，利用其快速启动和文件系统快照功能：
- **镜像预构建**：每 30 分钟拉取一次代码库并安装所有依赖，保存为快照，这就避免了每次新建沙盒时漫长的构建过程。
- **极速启动**：新会话直接基于最新的快照启动，最多只需通过 Git 同步过去 30 分钟的代码修改。
- **预热机制**：当用户还在输入框中敲击 Prompt 时，沙盒就已经在后台开始启动和同步代码，从而实现“零延迟”的使用体验。

作为底层的智能体驱动，他们推荐使用开源项目 **OpenCode**，因为其“Server First”的架构和完善的插件系统非常适合进行定制开发。

![沙盒架构](/images/ramp-background-agent-take-screenshot-20260318042500.png)

#### 2. 可靠的 API 与多人协作
API 层基于 Cloudflare 的 **Durable Objects** 和 **Agents SDK** 构建。每个会话都有自己独立的 SQLite 数据库和持久化的 WebSocket 连接，即使并发成百上千个会话也不会互相干扰，可以非常流畅地将大模型的 Token 流式推送到前端。

更具创新性的是 **“多人协作 (Multiplayer)”** 功能。就像在同一个分支上写代码一样，整个团队的人可以在同一个 Agent 会话中共同发送指令。这对于团队 QA 测试、代码审查（Code Review）或者指导非技术人员使用 AI 工具非常有用。

![多人协作](/images/ramp-background-agent-multiplayer-20260318042500.png)

#### 3. 无缝接入工作流 (Clients)
Inspect 并不强迫工程师改变习惯，而是主动提供多种形态适配团队的常用客户端：
- **Slack 机器人**：通过大模型快速分类用户的意图，路由到对应的代码库。它不仅可以通过 Slack 进行操作通知，用户甚至可以直接在聊天线程中发需求。
- **Web 端与 VS Code**：提供了运行在沙盒中的托管版 VS Code 和实时的桌面视图流（允许视觉检测 UI 变更），用户随时可以手动接管代码逻辑。
- **Chrome 浏览器扩展**：通过获取 DOM 元素树而非截图（减少 Token 消耗），让非技术人员也能直观地在页面上指出需要修改的地方，Agent 会自动理解其组件结构并修改 React 代码。

![Chrome 扩展](/images/ramp-background-agent-extension-20260318042500.png)

### 结语
掌握内部的基础工具架构可以打造出远超开箱即用（Off-the-shelf）产品的强大能力。Ramp 并没有靠强制规定来推行 Inspect，而是通过它在团队公共空间中的出色表现，带来了病毒式的自发传播。现在，只需几分钟的提示词时间，你就可以让后台的 Agent 去代替你通宵达旦地编写业务代码了。

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://builders.ramp.com/post/why-we-built-our-background-agent" style="color: #808080; text-decoration: underline;">Why we built our background agent</a></i>
</p>
