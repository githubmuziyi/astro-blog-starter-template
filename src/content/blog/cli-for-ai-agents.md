---
title: "Build a CLI for AI agents & humans in less than 10 mins"
description: "如何在 10 分钟内为 AI Agent 和人类共同设计一款命令行工具（CLI）。"
pubDate: "Mar 31 2026"
heroImage: "/images/cli-for-ai-agents-20260331022000.jpg"
category: "AI Agents"
---

### 快速阅读
随着 AI Agent（智能体）的爆发，所有的 CLI（命令行工具）迟早都会被 Agent 调用。传统的交互式 CLI（包含花哨的提示符、终端 UI 和高亮颜色）在人类眼中很棒，但一旦被 Agent 解析就会立刻崩溃。
本文探讨了如何兼顾人类与 AI 需求：核心法则是“数据与展示分离”。通过遵循结构化发现、Agent 优先的互操作性、环境感知、错误引导、命令一致性以及语义化的终端 UI 等设计模式，开发者可以编写出既能让机器预测，又能让人类愉悦的 CLI 工具，甚至无需维护两套代码。

## 设计给人类与 AI 共同使用的 CLI

核心理念非常简单：**解耦数据和表现形式**。当一个脚本或 Agent 调用你的 CLI 时，它需要的是原始、结构化的数据（比如 JSON）。而当人类使用时，则需要渲染后的、可交互的格式（比如 TUI 终端用户界面）。只要把 CLI 的内部逻辑当作一个能输出数据的“引擎”，而将终端 UI 看作是其中的一个“客户端”，你就能完美满足两者的需求。

同样的 `watch` 命令，既能给人类一个实时更新的 TUI，又能给 Agent 提供结构化的 NDJSON 数据流：

```bash
# Human gets the interactive TUI
a2acli watch --task abc123

# Agent gets structured NDJSON
a2acli watch --task abc123 --no-tui
```

只要遵循以下几种深思熟虑的设计模式，就能实现这种双受众的完美体验：

### 1. 结构化的发现机制 (Structured discoverability)
无论是人类还是 Agent，了解 CLI 的第一步都是通过 `--help`。
*   **按功能分组**：而不是按字母排序。分类能避免在根帮助命令中出现一堵“文字墙”。
*   **显式标记入口点**：在帮助描述中添加提示，如 `(start here)` 或 `(typical first step)`，Agent 可以借此决定先调用哪个命令。
*   **为每个命令填充三个字段**：
    *   **Short（快速浏览）**：一句话总结（5-10个词，以动词开头）。
    *   **Long（深度理解）**：命令是做什么的、为何使用、与类似命令有何不同。
    *   **Example（即插即用）**：3-5个具体的可复制示例。无论是开发者还是 Agent，都会从示例中推断参数模式。

此外，**跳出传统的 `--help`**：不要指望大语言模型天生就知道怎么用你的工具。在仓库根目录添加一个 `AGENTS.md` 文件，明确定义交互规则、默认工作流等。对于复杂的命令，还可以包含一个 `skills/` 目录供 Agent 摄取。

### 2. Agent 优先的互操作性 (Agent-first interoperability)
想要让 Agent 能用，CLI 必须具备极高的可解析性和可预测性。
*   **到处使用 `--json`**：所有产出数据的命令都必须支持 `--json` 或 `--no-tui` 标志，输出有效的 JSON 或 NDJSON。
*   **自动检测受众**：支持 `NO_COLOR` 和 `[APP]_NO_TUI` 环境变量。当检测到这些环境或标准输出被重定向时，完全跳过交互元素。
*   **保护上下文窗口**：Agent 的 Token 是有限的。要主动截断超大文本，并掩码输出中的敏感信息。如果 Agent 真的需要原始数据，需要它显式传入 `--full` 或 `--verbose`。
*   **预处理和排序数据**：永远让最重要的信息（如严重漏洞、待办任务）出现在最顶部。
*   **委托状态管理**：不要把 Agent 困在 CLI 的交互式死循环里。通过引用标识符（如 `--task <ID>`）保持 CLI 的无状态性。

### 3. 配置与环境上下文 (Configuration and context)
CLI 应该能理解自己所处的环境，而不需要在每次调用时都带上一大堆标志。
支持通过简单的 `--env` 标志切换多个配置（如 local, staging, prod）：

```yaml
# ~/.config/a2acli/config.yaml
default_env: "local"

envs:
  local:
    service_url: "http://127.0.0.1:9001"
  staging:
    service_url: "https://staging-agent.internal.corp"
    token: "my-staging-auth-token"
  prod:
    service_url: "https://agent.example.com"
    token: "my-secure-prod-token"
```

这对于 Agent 尤为重要，调度器甚至可以在不知道具体 URL 和 Token 的情况下，直接运行：

```bash
# Switch context in one flag
a2acli send "Generate report" --env staging
```

### 4. 错误引导 (Error guidance)
不要只抛出错误，要提供解决路径。
*   **上下文提示**：当命令因为缺少前置条件而失败时，加入一条 `Hint:` 提示，比如 `Hint: run 'a2acli init' to create the local database`。
*   **快速失败 (Fail fast)**：在执行繁重逻辑前尽早验证。
*   **确定性的退出码 (Deterministic exit codes)**：如 `0` 表示成功，`1` 表示一般错误，`2` 表示用法错误等。如果发生错误却返回了 `0`，会直接破坏所有的自动化流程。

### 5. 标志和参数的一致性 (Flag and argument consistency)
如果 `用户 (或 Agent)` 学会了如何使用某个命令，这种直觉应该能自然延伸到其他命令上。
*   **标准化简写**：如果在某个命令中 `-o` 代表 `--out-dir`，就绝对不能在另一个命令里代表 `--output`。
*   **位置参数 vs 可选参数**：核心必要实体使用位置参数（例如 `a2acli get <task-id>`），修饰符使用 `--flags`。

### 6. 终端的视觉设计 (Visual design for terminals)
颜色应该服务于功能，而非美观。
*   **保留语义化的颜色**：使用代表状态的颜色（成功为绿，警告为黄，错误为红），描述文本则不要着色。
*   **留白优先**：结构和对齐比颜色更能传达层次感。

### 7. 版本管理与生命周期 (Versioning and Lifecycle)
CLI 工具不是静态制成品，它们在自动化的动态序列中运行。
*   它应该知道自己的版本 (`--version`)。
*   优雅地处理 `SIGINT` (Ctrl+C)，防止 Agent 强杀进程时造成数据损坏。
*   追踪写操作的“操作者”(Actor) 以备审计。

---

如果想看到将 Agent 与 CLI 结合使用的具体示范，可以参考作者提到的 YouTube CLI 项目。通过具备 Agent 感知的 CLI Skill，你可以和你的 Agent 一起协作来检索数据、切换视频可见性甚至上传新内容，并且整个流程具备 100% 的确定性。

2026 年最优秀的 CLI 工具不再是那些终端界面做得最花哨的工具，而是当你手动敲入命令和 Agent 编写代码调用时，都能完美工作的工具。

<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://x.com/googlecloudtech/status/2038778093104779537?s=46" style="color: #808080; text-decoration: underline;">Build a CLI for AI agents & humans in less than 10 mins</a></i>
</p>
