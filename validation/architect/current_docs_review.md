# Current Claude product documentation review

Reviewed: 2026-11-03

Purpose: keep the training corpus aligned with current Claude behavior while preserving the official July 2026 exam blueprint as the exam-scope source of truth. When current product behavior and the exam snapshot use different terminology, the material teaches the current behavior and records the exam-snapshot difference instead of presenting stale behavior as universal.

## Reviewed surfaces

| Surface | Current official source | Reviewed conclusion |
|---|---|---|
| Message Batches API | https://platform.claude.com/docs/en/build-with-claude/batch-processing | Batch requests support tool use, all server tools, multi-turn message histories, and extended thinking. A batch request still cannot pause for an application-supplied client-tool result inside that same request; client-side tool continuation requires another request. |
| Tool choice | https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools | `auto`, `any`, `tool`, and `none` exist, but forced `any` / named-`tool` is not supported by every current model/configuration. Training material must not describe forced tool choice as universally available. |
| Client tool loop | https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works | Client tools require the application loop: model emits `tool_use`, application executes, returns `tool_result`, and the conversation continues. |
| Agent SDK subagents | https://code.claude.com/docs/en/agent-sdk/subagents | Current SDK subagents are invoked through the `Agent` tool. `allowedTools` / `allowed_tools` should include `Agent` when delegation is to be auto-approved. Explicitly naming a defined subagent in the prompt is the documented explicit-invocation path and directly invokes it. |
| Agent SDK hooks | https://code.claude.com/docs/en/agent-sdk/hooks | `PostToolUse.updatedToolOutput` can replace output for any tool in current TypeScript and Python SDKs. Older `updatedMCPToolOutput` applies only to MCP tool output. |
| Agent SDK permissions | https://code.claude.com/docs/en/agent-sdk/permissions | `allowedTools` pre-approves matching tools; it does not constrain `bypassPermissions`. Deny rules and hooks are evaluated earlier and can still block. For a locked-down non-interactive surface, pair an allowlist with `dontAsk` rather than assuming `allowedTools` is a capability boundary. |
| Claude Code skills and custom commands | https://code.claude.com/docs/en/skills | Custom commands have been merged into skills. Existing `.claude/commands/*.md` files remain supported; `.claude/skills/<name>/SKILL.md` is the richer current form. |
| Claude Code sessions | https://code.claude.com/docs/en/cli-reference | `--continue`, `--resume`, and `--fork-session` are current CLI mechanisms. Resumed context can contain stale observations after the repository changes, so training should distinguish restoring context from re-validating state. |
| Claude Code bare mode | https://code.claude.com/docs/en/cli-reference | `--bare` exists. It skips auto-discovery of hooks, skills, custom commands, subagents, plugins, MCP servers, auto memory, and CLAUDE.md, while retaining Bash/read/edit tools and explicit additions. |
| Model specifications | https://platform.claude.com/docs/en/models/overview | Current model pages are the source of truth for context windows and knowledge cutoffs. Verified 2026-11-03: Sonnet 5 is 1M / Jan 2026 reliable cutoff; Haiku 4.5 is 200k / Feb 2025. Questions using model specs must be rechecked when the lineup changes. |
| Skills / scope | https://code.claude.com/docs/en/skills | Skill bodies load on use. Use them for repeatable procedures; keep durable project facts/instructions in CLAUDE.md or scoped rules. |

## Changes required by this review

- Replace old Agent SDK `Task`-tool references with current `Agent`-tool terminology in active study material and scored questions.
- Correct the old scored item that claimed a named subagent prompt could not guarantee explicit invocation.
- Correct the old distractor rationale that claimed `--bare` did not exist.
- Replace the absolute claim that Message Batches cannot use multi-turn/tool workflows with the narrower client-side tool-result round-trip limitation.
- Keep `.claude/commands/` as supported legacy syntax, but teach Skills as the current unified mechanism.
- Qualify forced `tool_choice` guidance with model/configuration support instead of teaching it as universally available.

## Review policy

The official CCAR-F / CCAR-P exam guides define exam scope and blueprint. Current Claude documentation defines current product behavior. A product-sensitive claim is acceptable in scored material only when it is consistent with both, or when the material explicitly labels the exam-snapshot terminology and teaches the current implementation separately.
