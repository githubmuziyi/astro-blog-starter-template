---
title: "构建内部代码智能体指南：Stripe、Ramp 与 Coinbase 的 7 大核心决策"
description: "探讨 Stripe、Ramp 和 Coinbase 三家顶级工程团队如何构建内部代码智能体，从底层架构、沙盒环境、上下文工程到验证与采用的实践解析。"
pubDate: "Mar 18 2026"
heroImage: "/images/internal-coding-agents-stripe-ramp-coinbase-20260318020500.jpg"
category: "AI Agents"
---

### 快速阅读
Stripe、Ramp 和 Coinbase 等顶级工程团队正在构建自家的内部代码智能体。这些智能体不仅仅是辅助工具，它们作为 Slackbot、CLI 或 Web 应用运行，与内部系统深度集成，能在极少甚至无需人工干预的情况下自主运行代码。文章总结了他们在架构底层（Fork vs Compose vs Build）、运行沙盒（云主机 vs 容器 vs 自研）、工具与上下文控制、执行编排模式、验证与测试、触发方式以及组织内部推广这 7 大核心维度上的不同决策。总结来说：智能体的护城河在于隔离沙盒、受控工具链与强大的上下文管理。

---

正如 @rywalker 的研究所指出的，建立内部代码智能体（In-house coding agents）正在成为行业趋势。

![Stripe, Ramp, Coinbase 决策矩阵](/images/internal-coding-agents-stripe-ramp-coinbase-image1-20260318020500.jpg)

以下指南总结了构建内部代码智能体时必须面对的 7 大决策，并对比了 Stripe、Ramp 和 Coinbase 三家公司的具体解法。

### 1. 智能体底层架构 (The Agent Harness)
你的智能体运行在什么样的底层框架之上？
* **Stripe 选择分叉（Fork）：** 他们复刻了 Block 的开源项目 `goose` 并进行了定制化改造。这让他们拥有了更高的自主性，可以利用内部的确定性代码（如 git 操作、代码风格检查和测试）来穿插智能体的执行流。
* **Ramp 选择组合（Compose）：** 基于 `OpenCode` 搭建。该架构支持服务器优先并具备强类型 SDK，最实用的好处是，智能体可以“阅读自己”，从而理解自己的能力边界。
* **Coinbase 选择从零构建（Build from scratch）：** 他们的 Cloudbot 完全自研且支持多模型切换。这主要是因为加密货币金融平台极高的安全合规要求。

![沙盒对比](/images/internal-coding-agents-stripe-ramp-coinbase-image2-20260318020500.jpg)

### 2. 沙盒：代码的隔离执行环境
不要让智能体直接在开发者的本地机器上运行代码，所有的三家公司都采用了**云端沙盒**：
* **Stripe（云端虚拟机）：** 使用预热好的 AWS EC2 开发机（devboxes）。它们包含预克隆的 GB 级代码库、预热的缓存和检查环境。沙盒具备完全隔离性，无法访问真实用户数据或生产网络。因此，智能体在里面可以拥有完全权限而无需二次确认。
* **Ramp（预热容器平台）：** 使用 Modal 打造独立开发环境。在用户输入提示词时，后台就开始预热沙盒，并支持智能体开启“子会话”来并发处理任务。
* **Coinbase（自研合规沙盒）：** 出于金融机构的安全考量完全自建，将沙盒作为合规边界。

**核心共识：**先做好环境隔离，然后在边界内给予智能体完全权限。通过弹窗让用户反复授权既不安全也不高效。

### 3. 工具与上下文：智能体的视野与动作
* **工具基建：** Stripe 构建了包含 500 个内部工具的 `Toolshed` 服务，但他们强调**工具策展**（Curation）。并非越多越好，针对不同类型的智能体分配精简的工具集，能显著提升成功率并降低 Token 消耗。
* **上下文工程：** Stripe 通过自动关联目录规则（类似 Cursor），并在智能体运行前预先获取 Slack 讨论、Jira 工单、文档和搜索结果，进行上下文“预水合”（Pre-hydration）。Coinbase 则将 **Linear** 作为唯一的上下文源：人类先在 Linear 整理所有结构化问题，智能体再去抓取并扩展信息。

### 4. 编排：智能体如何思考与行动
* **Stripe 的 Blueprints：** 一种混合了确定性工作流和 LLM 灵活性的状态机。将必定要执行的测试、格式化节点设为“确定性节点”，将写代码等工作设为“子任务节点”，从而将 LLM 限制在安全的黑盒内，极大提升了可靠性。
* **Ramp 的 Session（会话）模型：** 专注于长生命周期和多用户协作（Multiplayer）。高级工程师可以和实习生、智能体共同在一个 Session 中交互。
* **Coinbase 的三模态：** 包括创建 PR、Plan（仅生成计划写回 Linear 供审核）和 Explain（拉取 Datadog/Sentry 等排查报错）。

### 5. 测试与验证
如何在智能体提交代码后进行验收？
* **保守派（Stripe）：** 依靠两轮 CI 测试。如果失败且无法自动修复，只允许智能体最后重试一次，失败就交由人工处理。防止陷入死循环。
* **温和派（Ramp）：** 借助自建 Chrome 扩展进行**视觉验证**。他们能读取 DOM 树并进行可视化校验，避免那些“通过了单元测试但在网页上乱套”的前端代码。
* **激进派（Coinbase）：** 已经在使用智能体评审委员会（Agent Councils）进行首轮代码 Review，对于低风险变更（如文案修改）实行全自动合并，目标是将 PR 周期从过去的 150 小时压缩到 5 分钟。

### 6. 触发方式：工程师如何唤起智能体
* **Slack 是绝对的通用层。** 所有三家公司都将智能体集成到了 Slackbot。在 Slack 里请求智能体的成本几乎为零。这能最大化团队曝光，让其他人看到智能体的成果。
* 除此之外，Stripe 会在所有的内部系统（文档、Feature Flag、工单系统）里植入一键唤起按钮。而 Ramp 提供了包含 VS Code 和数据大盘的 Web 界面。Coinbase 甚至会在 PR 提交后自动回复二维码，方便工程师扫码在手机上测试改动。

![结论矩阵](/images/internal-coding-agents-stripe-ramp-coinbase-image3-20260318020500.jpg)

### 7. 内部推广策略
如何让上千名工程师主动拥抱 AI？
不要强制，而是让产品自己说话。Ramp 持续追踪“最近 5 分钟内发起提示词的人数”作为内部采用脉搏，并向非技术人员（产品经理等）推广。Coinbase 建立了“Cursor 胜负频道”，鼓励大家公开讨论失败案例，并通过“PR 速通比赛”（在 15-30 分钟内完成大量修复）来展示能力。Stripe 则通过无处不在的一键按钮让 AI 工具变得“不可避免”。

### 总结：如果你的团队也要开始构建
1. 谨慎选择底层框架。
2. 建立一个能让智能体犯错而无后果的隔离沙盒。
3. 精简智能体的工具权限。
4. 在 Slack 这样的公共空间让智能体大显身手，采用率自然会水涨船高。


<p style="font-size: 0.85rem; color: #808080; text-align: right; margin-top: 2rem;">
  <i>🔗 原文链接：<a href="https://x.com/kishan_dahya/status/2028971339974099317" style="color: #808080; text-decoration: underline;">Enough About Harnesses, Your Org Needs Its Own Coding Agent</a></i>
</p>
