# Claude Certified Architect — Foundations

## How to use this material

Use the guide as a reference and reasoning source, not as something to memorize linearly.

1. Start with the task statement you are weakest on.
2. Read the relevant concept section and one worked example.
3. Explain the decision rule in your own words: **why this choice, why not the alternatives, and what constraint changes the answer?**
4. Solve a short drill without notes and read the rationale for every option.
5. Complete the related hands-on exercise when the task statement involves implementation or workflow design.
6. Re-test the same concept after a delay. Move on only when the error stops recurring.

## Exam facts

| Parameter | Official detail |
|---|---|
| Exam code | **CCAR-F** |
| Items | **60** |
| Formats | **Multiple-choice and multiple-response** |
| Time | **120 minutes** |
| Passing score | **720** on a 100–1000 scaled score |
| Scenario draw | **4 of 6** published scenarios per attempt |

## Official blueprint

| Domain | Weight |
|---|---:|
| 1. Agentic Architecture & Orchestration | **27%** |
| 2. Tool Design & MCP Integration | **18%** |
| 3. Claude Code Configuration & Workflows | **20%** |
| 4. Prompt Engineering & Structured Output | **20%** |
| 5. Context Management & Reliability | **15%** |

### Official task statements

#### Domain 1: Agentic Architecture & Orchestration

- Design and implement agentic loops for autonomous task execution
- Orchestrate multi-agent systems with coordinator-subagent patterns
- Configure subagent invocation, context passing, and spawning
- Implement multi-step workflows with enforcement and handoff patterns
- Apply Agent SDK hooks for tool call interception and data normalization
- Design task decomposition strategies for complex workflows
- Manage session state, resumption, and forking

#### Domain 2: Tool Design & MCP Integration

- Design effective tool interfaces with clear descriptions and boundaries
- Implement structured error responses for MCP tools
- Distribute tools appropriately across agents and configure tool choice
- Integrate MCP servers into Claude Code and agent workflows
- Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively

#### Domain 3: Claude Code Configuration & Workflows

- Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization
- Create and configure custom slash commands and skills
- Apply path-specific rules for conditional convention loading
- Determine when to use plan mode vs direct execution
- Apply iterative refinement techniques for progressive improvement
- Integrate Claude Code into CI/CD pipelines

#### Domain 4: Prompt Engineering & Structured Output

- Design prompts with explicit criteria to improve precision and reduce false positives
- Apply few-shot prompting to improve output consistency and quality
- Enforce structured output using tool use and JSON schemas
- Implement validation, retry, and feedback loops for extraction quality
- Design efficient batch processing strategies
- Design multi-instance and multi-pass review architectures

#### Domain 5: Context Management & Reliability

- Manage conversation context to preserve critical information across long interactions
- Design effective escalation and ambiguity resolution patterns
- Implement error propagation strategies across multi-agent systems
- Manage context effectively in large codebase exploration
- Design human review workflows and confidence calibration
- Preserve information provenance and handle uncertainty in multi-source synthesis

## Official scenario families

The current Exam Guide v1.0 defines six scenarios and draws four per attempt:

1. Customer Support Agent
2. Code Generation with Claude Code
3. Multi-Agent Research System
4. Developer Productivity Tools
5. Claude Code for Continuous Integration
6. Structured Data Extraction

These scenario families are useful because they force the same task statement to be applied under different constraints. Do not memorize scenario answers; identify the governing constraint first.

---

# Official Documentation

| Resource | URL |
|---|---|
| **Claude API — Messages** | https://platform.claude.com/docs/en/api/messages |
| **Claude API — Tool Use** | https://platform.claude.com/docs/en/build-with-claude/tool-use |
| **Claude API — Message Batches** | https://platform.claude.com/docs/en/build-with-claude/message-batches |
| **Claude Agent SDK — Overview** | https://platform.claude.com/docs/en/agent-sdk/overview |
| **Claude Agent SDK — Hooks** | https://platform.claude.com/docs/en/agent-sdk/hooks |
| **Claude Agent SDK — Subagents** | https://platform.claude.com/docs/en/agent-sdk/subagents |
| **Claude Agent SDK — Sessions** | https://platform.claude.com/docs/en/agent-sdk/sessions |
| **Model Context Protocol (MCP)** | https://modelcontextprotocol.io/ |
| **MCP — Tools** | https://modelcontextprotocol.io/docs/concepts/tools |
| **MCP — Resources** | https://modelcontextprotocol.io/docs/concepts/resources |
| **MCP — Servers** | https://modelcontextprotocol.io/docs/concepts/servers |
| **Claude Code — Documentation** | https://code.claude.com/docs/en/overview |
| **Claude Code — CLAUDE.md and Memory** | https://code.claude.com/docs/en/memory |
| **Claude Code — Skills (incl. slash commands)** | https://code.claude.com/docs/en/skills |
| **Claude Code — Hooks** | https://code.claude.com/docs/en/hooks |
| **Claude Code — Sub-agents** | https://code.claude.com/docs/en/sub-agents |
| **Claude Code — MCP Integration** | https://code.claude.com/docs/en/mcp |
| **Claude Code — GitHub Actions CI/CD** | https://code.claude.com/docs/en/github-actions |
| **Claude Code — GitLab CI/CD** | https://code.claude.com/docs/en/gitlab-ci-cd |
| **Claude Code — Headless (non-interactive mode)** | https://code.claude.com/docs/en/headless |
| **Prompt Engineering Guide** | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview |
| **Extended Thinking** | https://platform.claude.com/docs/en/build-with-claude/extended-thinking |
| **Anthropic Cookbook (code examples)** | https://github.com/anthropics/anthropic-cookbook |

---

# PART I: THEORY FOUNDATIONS

This part covers all the theory you need to pass the exam successfully. The material is organized by technologies and concepts rather than by exam domains—this helps you build a deeper understanding of each topic.

---

# Chapter 1: Claude API — Fundamentals of Model Interaction

> Documentation: [Messages API](https://platform.claude.com/docs/en/api/messages) | [Prompt Engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)

## 1.1 API Request Structure

The Claude API follows a request–response model. Each request to the Claude Messages API includes:

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "How are you?"}
  ],
  "tools": [...],
  "tool_choice": {"type": "auto"}
}
```

**Key fields:**
- `model` — model selection (`claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`)
- `max_tokens` — maximum number of tokens in the response
- `system` — the system prompt (defines model behavior)
- `messages` — conversation history (**you must send the full history** to maintain coherence)
- `tools` — definitions of available tools
- `tool_choice` — tool selection strategy

## 1.2 Message Roles

The `messages` array uses three roles:
- `user` — user messages
- `assistant` — model responses (included when sending history)
- `tool` — tool call results (the role is not explicitly set; this appears as a `tool_result` content block)

**Critically important:** on every API request you must send the **full conversation history**. The model does not persist state between requests—each call is independent.

## 1.3 The `stop_reason` Field in the Response

The Claude API response includes `stop_reason`, which indicates why the model stopped generating:

| Value | Description | Action |
|---|---|---|
| `"end_turn"` | The model finished its response | Show the result to the user |
| `"tool_use"` | The model wants to call a tool | Execute the tool and return the result |
| `"max_tokens"` | Token limit reached | The response is truncated; you may need to increase the limit |
| `"stop_sequence"` | A stop sequence was encountered | Handle based on your application logic |

For agentic systems, `"tool_use"` and `"end_turn"` are the most important—they control the agent loop.

## 1.4 System Prompt

The system prompt is a special instruction that defines context and behavioral rules. It:
- Is not part of the `messages` array; it is passed separately in the `system` field
- Has priority over user messages
- Is loaded once and applies throughout the conversation
- Is used to define role, constraints, and output format

**Important for the exam:** system prompt wording can create unintended tool associations. For example, an instruction like “always verify the customer” can cause the model to overuse `get_customer`, even when it is unnecessary.

## 1.5 Context Window

The context window is the total amount of text (in tokens) the model can process at once. It includes:
- The system prompt
- The full message history
- Tool definitions
- Tool results

**Key context-window problems:**

1. **Lost-in-the-middle effect:** models reliably process information at the start and end of a long input but can miss details in the middle. Mitigation: place key information near the beginning or end.

2. **Accumulation of tool results:** every tool call adds output to the context. If a tool returns 40+ fields but only 5 matter, then most of the context is wasted.

3. **Progressive summarization:** when compressing history, numeric values, percentages, and dates often get lost and become vague (“about”, “roughly”, “a few”).

---

# Chapter 2: Tools and `tool_use`

> Documentation: [Tool Use](https://platform.claude.com/docs/en/build-with-claude/tool-use)

## 2.1 What is `tool_use`

`tool_use` is a mechanism that allows Claude to call external functions. The model does not run code directly—it generates a structured tool call request; your code executes it and returns the result.

## 2.2 Tool Definition

Each tool is defined using a JSON schema:

```json
{
  "name": "get_customer",
  "description": "Finds a customer by email or ID. Returns the customer profile, including name, email, order history, and account status. Use this tool BEFORE lookup_order to verify the customer's identity. Accepts an email (format: user@domain.com) or a numeric customer_id.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": {"type": "string", "description": "Customer email"},
      "customer_id": {"type": "integer", "description": "Numeric customer ID"}
    },
    "required": []
  }
}
```

**Critically important aspects of a tool description:**

1. **The description is the primary selection mechanism.** An LLM chooses tools based on their descriptions. Minimal descriptions (“Retrieves customer information”) lead to mistakes when tools overlap.

2. **Include in the description:**
   - What the tool does and returns
   - Input formats and example values
   - Edge cases and constraints
   - When to use this tool vs similar alternatives

3. **Avoid** identical or overlapping descriptions across tools. If `analyze_content` and `analyze_document` have nearly identical descriptions, the model will confuse them.

4. **Built-in tools vs MCP tools:** agents may prefer built-in tools (Read, Grep) over MCP tools with similar functionality. To prevent this, strengthen MCP tool descriptions—highlight concrete advantages, unique data, or context that built-in tools cannot provide.

## 2.3 The `tool_choice` Parameter

`tool_choice` controls how the model selects tools. **Model and thinking-mode support matters:** current Claude documentation does not allow forced `any` / named-`tool` selection on every model or configuration, so treat the table below as the API modes available where forced tool use is supported:

| Value | Behavior | When to use |
|---|---|---|
| `{"type": "auto"}` | The model decides whether to call a tool or answer in text | Default for most cases |
| `{"type": "any"}` | The model **must** call some tool | When you need guaranteed structured output |
| `{"type": "tool", "name": "extract_metadata"}` | The model **must** call a specific tool | When you need a forced first step / execution order |

**Important scenarios:**
- `tool_choice: "any"` + multiple extraction tools → the model picks the best one, but you still get structured output
- Forced selection → when you must guarantee a specific first action (e.g., `extract_metadata` before enrichment)

## 2.4 JSON Schemas for Structured Output

Using `tool_use` with JSON schemas is the **most reliable** way to obtain structured output from Claude. It:
- Guarantees syntactically valid JSON (no missing braces, no trailing commas)
- Enforces the required structure (required fields are present)
- Does **not** guarantee semantic correctness (values can still be wrong)

**Schema design — key principles:**

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "feature", "docs", "unclear", "other"]
    },
    "category_detail": {
      "type": ["string", "null"],
      "description": "Details if category = 'other' or 'unclear'"
    },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "optional_field": {
      "type": ["string", "null"],
      "description": "Null if the information was not found in the source"
    }
  },
  "required": ["category", "severity"]
}
```

**Schema design rules:**
1. **Required vs optional:** mark fields as required only if the information is always available. Required fields push the model to fabricate values when data is missing.
2. **Nullable fields:** use `"type": ["string", "null"]` for information that may be absent. The model can return `null` instead of hallucinating.
3. **Enums with `"other"`:** add `"other"` + a detail string to avoid losing data outside your predefined categories.
4. **Enum `"unclear"`:** for cases where the model cannot confidently pick a category—honest `"unclear"` is better than a wrong category.

## 2.5 Syntax vs Semantic Errors

| Error type | Example | Mitigation |
|---|---|---|
| **Syntax** | Invalid JSON, wrong field type | `tool_use` with a JSON schema (eliminates) |
| **Semantic** | Totals don't add up, value in wrong field, hallucination | Validation checks, retry with feedback, self-correction |

---

# Chapter 3: Claude Agent SDK — Building Agentic Systems

> Documentation: [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) | [Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks) | [Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) | [Sessions](https://platform.claude.com/docs/en/agent-sdk/sessions)

## 3.1 What is an Agentic Loop

The agentic loop is the core pattern for autonomous task execution. The model doesn't just answer—it performs a sequence of actions:

```
1. Send a request to Claude with tools
2. Receive a response
3. Check stop_reason:
   - "tool_use" -> execute the tool, append the result to history, go back to step 1
   - "end_turn" -> the task is complete, show the result to the user
4. Repeat until completion
```

**This is a model-driven approach:** Claude decides which tool to call next based on context and prior tool results. This differs from hard-coded decision trees where the action sequence is fixed.

**Anti-patterns (avoid):**
- Parsing assistant text to detect completion (“Task completed”)
- Using an arbitrary iteration limit (e.g., `max_iterations=5`) as the primary stop condition
- Checking whether the assistant produced textual content as a completion signal

**Correct approach:** the only reliable completion signal is `stop_reason == "end_turn"`.

## 3.2 `AgentDefinition` Configuration

`AgentDefinition` is the agent configuration object in the Claude Agent SDK:

```python
agent = AgentDefinition(
    name="customer_support",
    description="Handles customer requests for returns and order issues",
    system_prompt="You are a customer support agent...",
    allowed_tools=["get_customer", "lookup_order", "process_refund", "escalate_to_human"],
    # For a coordinator:
    # allowed_tools=["Agent", "get_customer", ...]
)
```

**Key parameters:**
- `name` / `description` — identification and description of the agent
- `system_prompt` — system prompt with instructions
- `allowed_tools` — list of allowed tools (principle of least privilege)

## 3.3 Hub-and-Spoke: Coordinator and Subagents

A multi-agent architecture is typically built as a hub-and-spoke topology:

```
         Coordinator
        /     |      \
   Subagent1  Subagent2  Subagent3
    (search)   (analysis)   (synthesis)
```

**The coordinator is responsible for:**
- Decomposing the task into subtasks
- Deciding which subagents are needed (dynamic selection)
- Delegating work to subagents
- Aggregating and validating results
- Handling errors and retries
- Communicating results to the user

**Critical principle: subagents have isolated context.**
- Subagents do **not** automatically inherit the coordinator's conversation history
- All required context must be **explicitly passed** in the subagent prompt
- Subagents do not share memory across calls
- All communication flows through the coordinator (for observability and error control)

## 3.4 The `Agent` Tool for Spawning Subagents

Subagents are spawned via the `Agent` tool:

```python
# The coordinator's allowedTools must include "Agent"
coordinator_agent = AgentDefinition(
    allowed_tools=["Agent", "get_customer"]
)
```

**Explicit context passing is mandatory:**

```
# Bad: the subagent has no context
Task: "Analyze the document"

# Good: full context in the prompt
Task: "Analyze the following document.
Document: [full document text]
Prior search results: [web search results]
Output format requirements: [schema]"
```

**Parallel spawning:** a coordinator can call the `Agent` tool multiple times for independent subagents; those subagents can run concurrently.

```
# One coordinator response contains:
Task 1: "Search for articles about X"
Task 2: "Analyze document Y"
Task 3: "Search for articles about Z"
# All three run concurrently
```

## 3.5 Hooks in the Agent SDK

Hooks allow interception and transformation at specific points in the agent lifecycle.

**PostToolUse** intercepts a tool result before it is provided to the model:

```python
# Example: normalize date formats from different MCP tools
@hook("PostToolUse")
def normalize_dates(tool_result):
    # Convert Unix timestamp -> ISO 8601
    # Convert "Mar 5, 2025" -> "2025-03-05"
    return normalized_result
```

**Outgoing-call interception hook** blocks actions that violate policy:

```python
# Example: block refunds above $500
@hook("PreToolUse")
def enforce_refund_limit(tool_call):
    if tool_call.name == "process_refund" and tool_call.args.amount > 500:
        return redirect_to_escalation(tool_call)
```

**Key difference: hooks vs prompt instructions**

| Attribute | Hooks | Prompt instructions |
|---|---|---|
| Guarantee | **Deterministic** (100%) | **Probabilistic** (>90%, not 100%) |
| When to use | Critical business rules, financial operations, compliance | General preferences, recommendations, formatting |
| Example | Block refunds > $500 | “Try to solve before escalating” |

**Rule:** when failure has financial, legal, or safety consequences—use hooks, not prompts.

# Chapter 4: Model Context Protocol (MCP)

> Documentation: [MCP](https://modelcontextprotocol.io/) | [Tools](https://modelcontextprotocol.io/docs/concepts/tools) | [Resources](https://modelcontextprotocol.io/docs/concepts/resources) | [Servers](https://modelcontextprotocol.io/docs/concepts/servers)

## 4.1 What is MCP

The Model Context Protocol (MCP) is an open protocol for connecting external systems to Claude. MCP defines three primary resource types:

1. **Tools** — functions the agent can call to perform actions (CRUD operations, API calls, command execution)
2. **Resources** — data the agent can read for context (documentation, database schemas, content catalogs)
3. **Prompts** — predefined prompt templates for common tasks

## 4.2 MCP Servers

An MCP server is a process that implements the MCP protocol and provides tools/resources. When you connect to an MCP server:
- All tools are discovered automatically
- Tools from all connected servers are available at once
- Tool descriptions determine how the model will use them

## 4.3 Configuring MCP Servers

**Project configuration (`.mcp.json`)** — for team usage:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "jira": {
      "command": "npx",
      "args": ["-y", "mcp-server-jira"],
      "env": {
        "JIRA_TOKEN": "${JIRA_TOKEN}"
      }
    }
  }
}
```

**Key points:**
- `.mcp.json` is stored at the project root and managed in version control
- Environment variables (`${GITHUB_TOKEN}`) are used for secrets—tokens themselves are not committed
- Available to all project contributors

**User configuration (`~/.claude.json`)** — for personal/experimental servers:
- Stored in the user's home directory
- Not shared via version control
- Suitable for personal experiments and testing

**Choosing servers:**
- For standard integrations (Jira, GitHub, Slack), prefer existing community MCP servers
- Build your own servers only for unique, team-specific workflows

## 4.4 The `isError` Flag in MCP

When an MCP tool encounters an error, it uses `isError: true` in the response. This signals to the agent that the call failed.

**Structured error (good):**

```json
{
  "isError": true,
  "content": {
    "errorCategory": "transient",
    "isRetryable": true,
    "message": "The service is temporarily unavailable. Timeout while calling the orders API.",
    "attempted_query": "order_id=12345",
    "partial_results": null
  }
}
```

**Generic error (anti-pattern):**

```json
{
  "isError": true,
  "content": "Operation failed"
}
```

A generic error gives the agent no information for decision-making—should it retry, change the query, or escalate?

## 4.5 MCP Resources

Resources are data that an agent can request to get context without taking actions:

- Content catalogs (e.g., a list of all project tasks, hierarchical navigation)
- Database schemas (understanding data structure)
- Documentation (API references, internal guides)
- Issue/task summaries

**Resource advantage:** the agent does not need exploratory tool calls to understand what data exists. A resource provides an immediate “map.”

---

# Chapter 5: Claude Code — Configuration and Workflows

> Documentation: [Claude Code](https://code.claude.com/docs/en/overview) | [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory) | [Skills](https://code.claude.com/docs/en/skills) | [MCP](https://code.claude.com/docs/en/mcp) | [Hooks](https://code.claude.com/docs/en/hooks) | [Sub-agents](https://code.claude.com/docs/en/sub-agents) | [GitHub Actions](https://code.claude.com/docs/en/github-actions) | [Headless](https://code.claude.com/docs/en/headless)

## 5.1 The CLAUDE.md Hierarchy

CLAUDE.md is the instruction file(s) for Claude Code. There is a three-level hierarchy:

```
1. User-level: ~/.claude/CLAUDE.md
   - Applies only to that user
   - NOT shared via VCS
   - Personal preferences and working style

2. Project-level: .claude/CLAUDE.md or a root CLAUDE.md
   - Applies to all project contributors
   - Managed via VCS
   - Coding standards, testing standards, architectural decisions

3. Directory-level: CLAUDE.md in subdirectories
   - Applies when working with files in that directory
   - Conventions specific to that part of the codebase
```

**Common mistake:** a new team member does not receive project instructions because they were placed in `~/.claude/CLAUDE.md` (user-level) instead of `.claude/CLAUDE.md` (project-level).

## 5.2 `@path` Syntax (File Imports)

CLAUDE.md can reference external files using `@path`, making configuration modular:

```markdown
# Project CLAUDE.md

Coding standards are described in @./standards/coding-style.md
Test requirements are in @./standards/testing-requirements.md
Project overview is in @README.md and dependencies are in @package.json
```

**Rules for `@path`:**
- Use `@` immediately before the file path (no space)
- Relative and absolute paths are supported
- Relative paths are resolved relative to the file that contains the import
- Maximum import nesting depth is 5

This avoids duplication and lets each package include only relevant standards.

## 5.3 The `.claude/rules/` Directory

`.claude/rules/` is an alternative to a monolithic CLAUDE.md, used to organize rules by topic:

```
.claude/rules/
  testing.md          -- testing conventions
  api-conventions.md  -- API conventions
  deployment.md       -- deployment rules
  react-patterns.md   -- React patterns
```

**Key feature: YAML frontmatter with `paths` for conditional loading:**

```yaml
---
paths: ["src/api/**/*"]
---

For API files, use async/await with explicit error handling.
Each endpoint must return a standard response wrapper.
```

```yaml
---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---

Tests must use describe/it blocks.
Use data factories instead of hardcoding.
Do not mock the database—use a test database.
```

**How it works:**
- A rule is loaded **only** when Claude Code edits a file matching the `paths` pattern
- This saves context and tokens—irrelevant rules are not loaded
- Glob patterns let you apply conventions by file type regardless of location (ideal for tests scattered across the codebase)

**When to use `.claude/rules/` with `paths` vs directory-level CLAUDE.md:**
- `.claude/rules/` with `paths` — when conventions apply to files spread across many directories (tests, migrations)
- Directory-level CLAUDE.md — when conventions are tied to a specific directory and are not needed elsewhere

## 5.4 Custom Slash Commands and Skills

> **Note:** in the current Claude Code version, custom commands (`.claude/commands/`) are unified with skills (`.claude/skills/`). Both formats create `/name` commands. The exam guide references `.claude/commands/`—that format is still supported.

Slash commands are reusable prompt templates invoked via `/name`:

**`.claude/commands/` format (legacy, supported):**

```
.claude/commands/
  review.md        -- /review -- standard code review
  test-gen.md      -- /test-gen -- test generation
```

**`.claude/skills/` format (current):**

```
.claude/skills/
  review/SKILL.md  -- /review -- with frontmatter configuration
  test-gen/SKILL.md
```

**Project commands** (`.claude/commands/` or `.claude/skills/`):
- Stored in VCS and available to everyone when cloning the repo
- Ensure consistent workflows across the team

**User commands** (`~/.claude/commands/` or `~/.claude/skills/`):
- Personal commands not shared via VCS
- For individual workflows

## 5.5 Skills — `.claude/skills/`

Skills are advanced commands configured via SKILL.md frontmatter:

```yaml
---
context: fork
allowed-tools: ["Read", "Grep", "Glob"]
argument-hint: "Path to the directory to analyze"
---

Analyze the code structure in the specified directory.
Output a report on dependencies and architectural patterns.
```

**Frontmatter parameters:**

| Parameter | Description |
|---|---|
| `context: fork` | Runs the skill in an isolated subagent. Verbose output does not pollute the main session |
| `allowed-tools` | Restricts which tools are available (security—e.g., the skill cannot delete files if not allowed) |
| `argument-hint` | Hint that asks for an argument when invoked without parameters |

**When to use a skill vs CLAUDE.md:**
- **Skill** — on-demand invocation for a specific task (review, analysis, generation)
- **CLAUDE.md** — always-loaded general standards and conventions

**Personal skills (`~/.claude/skills/`):**
- Create personal variants under different names so you don't affect teammates

## 5.6 Planning Mode vs Direct Execution

**Planning mode:**
- The model only investigates and plans; it does not make changes
- Uses Read, Grep, Glob to explore the codebase
- Produces an implementation plan that the user approves
- Safe exploration with no side effects

**When to use planning mode:**
- Large changes (dozens of files)
- Multiple plausible approaches (microservices: how to define boundaries?)
- Architectural decisions (which framework? what structure?)
- Unfamiliar codebase (you must understand before changing)
- Library migrations affecting 45+ files

**When to use direct execution:**
- Single-file fixes with a clear stack trace
- Adding one validation check
- Well-understood, unambiguous changes

**Combined approach:**
1. Planning mode for investigation and design
2. User approves the plan
3. Direct execution to implement the approved plan

**Explore subagent** — a specialized subagent for exploring the codebase:
- Isolates verbose output from the main context
- Returns only a summary
- Prevents context-window exhaustion in multi-phase tasks

## 5.7 The `/compact` Command

`/compact` is a built-in command for compressing context:
- Summarizes prior history to free up the context window
- Used in long investigation sessions when the context fills up with verbose tool output
- Risk: exact numeric values, dates, and specific details can be lost during summarization

## 5.8 The `/memory` Command

`/memory` is a built-in command for managing memory between sessions:
- Opens the `CLAUDE.md` file for editing, allowing you to save notes, preferences, and context
- Information persists across sessions and is automatically loaded on startup
- Useful for storing project conventions, user preferences, frequently used commands, and current work context
- Alternative to re-explaining the same instructions in every session

## 5.9 Claude Code CLI for CI/CD

**The `-p` (or `--print`) flag:**

```bash
claude -p "Analyze this pull request for security issues"
```

- Non-interactive mode: processes the prompt, prints to stdout, exits
- Does not wait for user input
- The only correct way to run Claude in CI/CD pipelines

**Structured output for CI:**

```bash
claude -p "Review this PR" --output-format json --json-schema '{"type":"object",...}'
```

- `--output-format json` — output in JSON
- `--json-schema` — validate output against a schema
- The result can be parsed to automatically post inline PR comments

**Session context isolation:**
The same Claude session that generated code is often less effective at reviewing it (the model retains its reasoning context and is less likely to challenge its own decisions). Use an independent instance for review.

**Preventing duplicate comments:**
When re-reviewing after new commits, include prior review results in context and instruct Claude to report only new or unresolved issues.

## 5.10 `fork_session` and Session Management

**`--resume <session-name>`** resumes a named session:

```bash
claude --resume investigation-auth-bug
```

- Continues a prior conversation with saved context
- Useful for long investigations across multiple sessions
- Risk: if files changed since the prior session, tool results may be stale

**`fork_session`** creates an independent branch from shared context:

```
Codebase investigation
         |
    fork_session
    /           \
Approach A:      Approach B:
Redux            Context API
```

- Both forks inherit context up to the branch point
- Afterwards, they diverge independently
- Useful for comparing approaches or testing strategies

**When to start a new session instead of resuming:**
- Tool results are stale (files changed)
- A lot of time has passed and context has degraded
- It is better to restart with "Here is a short summary of what we found: ..." than to resume with old tool data

---

# Chapter 6: Prompt Engineering — Advanced Techniques

> Documentation: [Prompt Engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) | [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)

## 6.1 Few-shot Prompting

Few-shot prompting is the inclusion of 2–4 input/output examples in a prompt to demonstrate the expected behavior.

**Why few-shot is more effective than textual descriptions:**
- A vague instruction like “be more precise” can be interpreted in many ways
- An example unambiguously shows the expected format and decision logic
- The model generalizes the pattern to new cases (it does not just repeat the examples)

**Types of few-shot examples and when to use them:**

1. **Examples for ambiguous scenarios:**

```
Request: "My order is broken"
Action: Call get_customer -> lookup_order -> check status.
Rationale: “broken” may mean a damaged item; you need order details.

Request: "Get me a manager"
Action: Immediately call escalate_to_human.
Rationale: The customer explicitly requests a human. Do not attempt to solve autonomously.
```

2. **Examples for output formatting:**

```
Finding example:
{
  "location": "src/auth/login.ts:42",
  "issue": "SQL injection in the username parameter",
  "severity": "critical",
  "suggested_fix": "Use a parameterized query"
}
```

3. **Examples to separate acceptable vs problematic code:**

```
// Acceptable (do not flag):
const items = data.filter(x => x.active);

// Problem (flag):
const items = data.filter(x => x.active == true); // Use strict equality ===
```

4. **Examples for extraction from different document formats:**

```
Document with inline citations:
"As shown in the study (Smith, 2023), the rate is 42%."
-> {"value": "42%", "source": "Smith, 2023", "type": "inline_citation"}

Document with bibliography references:
"The rate is 42%. [1]"
-> {"value": "42%", "source": "reference_1", "type": "bibliography"}
```

5. **Examples for informal measurements:**

```
Text: "about two handfuls of rice"
-> {"amount": "~100g", "original_text": "two handfuls", "precision": "approximate"}

Text: "a pinch of salt"
-> {"amount": "~1g", "original_text": "a pinch", "precision": "approximate"}
```

Few-shot is especially effective for extracting informal and non-standard measurement units that are too diverse for purely rule-based instructions.

**Format normalization rules in prompts:**
When using strict JSON schemas for structured output, add normalization rules in the prompt:

```
Normalization:
- Dates: always ISO 8601 (YYYY-MM-DD); "yesterday" -> compute an absolute date
- Currency: numeric amount + currency code; "five bucks" -> {"amount": 5, "currency": "USD"}
- Percentages: decimal fraction; "half" -> 0.5
```

This prevents semantic errors where the JSON is syntactically valid but values are inconsistent.

## 6.2 Explicit Criteria vs Vague Instructions

**Bad (vague):**

```
Check code comments for accuracy.
Be conservative—report only high-confidence findings.
```

**Good (explicit criteria):**

```
Flag a comment as problematic ONLY if:
1. The comment describes behavior that CONTRADICTS the actual code behavior
2. The comment references a non-existent function or variable
3. A TODO/FIXME comment refers to a bug that has already been fixed in code

Do NOT flag:
- Comments that are merely stylistically outdated
- Comments with minor wording inaccuracies
- Missing comments (that is a separate category)
```

**Define severity criteria with examples:**

```
CRITICAL: Runtime failure for users
  Example: NullPointerException while processing a payment

HIGH: Security vulnerability
  Example: SQL injection, XSS, missing authorization checks

MEDIUM: Logic bug without immediate impact
  Example: Wrong sorting, off-by-one error

LOW: Code quality
  Example: Duplication, suboptimal algorithm for small data
```

## 6.3 Prompt Chaining

Prompt chaining breaks a complex task into a sequence of focused steps:

```
Step 1: Analyze auth.ts (local issues only)
       -> Output: list of issues in auth.ts

Step 2: Analyze database.ts (local issues only)
       -> Output: list of issues in database.ts

Step 3: Integration pass (cross-file dependencies)
       -> Output: issues at module boundaries
```

**Why this matters:**
- Avoids **attention dilution**—when the model receives too many files at once, it may miss bugs in some files while providing shallow commentary on others
- Ensures consistent analysis quality per file
- Allows separate analysis of cross-file interactions

**When to use prompt chaining vs dynamic decomposition:**
- **Prompt chaining** — predictable, repeatable tasks (code review, file migrations)
- **Dynamic decomposition** — open-ended investigations where subtasks become clear only during execution

## 6.4 The “Interview” Pattern

Before implementing a solution, Claude asks clarifying questions:

```
Claude: "Before implementing caching for the API, a few questions:
1. Which cache invalidation strategy do you prefer—TTL or event-based?
2. Is stale data acceptable when the cache is unavailable?
3. Should caching be per-user or global?
4. What is the expected data volume to cache?"
```

**When this is useful:**
- Unfamiliar domain (fintech, healthcare, legal systems)
- Tasks with non-obvious implications (cache strategies, failure modes)
- Multiple viable approaches where the best choice depends on context

## 6.5 Validation and Retry-with-Feedback

When extracted data fails validation:

```
Step 1: Extract data from the document
Step 2: Validate (Pydantic, JSON Schema, business rules)
Step 3: If there's an error—retry with context:
  - The original document
  - The previous (incorrect) extraction
  - The specific error: "Field 'total' = 150, but sum(line_items) = 145. Re-check values."
```

**When retry will be effective:**
- Format errors (date in the wrong format)
- Structural errors (a field placed in the wrong location)
- Arithmetic inconsistencies (the model can re-check)

**When retry will NOT help:**
- The information is absent from the source document
- The required context is external (the data is in another document not provided)

**Pydantic as a validation tool:**
Pydantic is a Python library for schema-based data validation. For the exam, the key points are:
- **Structural validation:** types, requiredness, enum constraints checked in code after receiving JSON from Claude
- **Semantic validation:** custom validators enforce business logic (sum of items equals total; start_date < end_date)
- **Validate–retry loops:** on Pydantic validation failure, construct an error message and re-prompt Claude with the error context
- **JSON Schema generation:** Pydantic models can generate JSON Schema for `tool_use`, providing a single source of truth

## 6.6 Self-correction

A pattern for detecting internal contradictions:

```json
{
  "stated_total": "$150.00",
  "calculated_total": "$145.00",
  "conflict_detected": true,
  "line_items": [
    {"name": "Widget A", "price": 75.00},
    {"name": "Widget B", "price": 70.00}
  ]
}
```

The model extracts both the stated value and a computed value—if they differ, `conflict_detected` allows you to handle the discrepancy.

---

# Chapter 7: Message Batches API

> Documentation: [Message Batches](https://platform.claude.com/docs/en/build-with-claude/message-batches)

## 7.1 Overview

The Message Batches API lets you submit batches of requests for asynchronous processing:

| Attribute | Value |
|---|---|
| Savings | **50%** compared to synchronous calls |
| Processing window | Up to **24 hours** (no latency SLA guarantee) |
| Multi-turn tool calling | **Not supported** (one request = one response) |
| Correlation | `custom_id` field to link request and response |

## 7.2 When to Use Batch API vs Synchronous API

| Task | API | Why |
|---|---|---|
| Pre-merge PR check | **Synchronous** | The developer is waiting; 24 hours is unacceptable |
| Overnight tech-debt report | **Batch** | Result is needed by morning; 50% savings |
| Weekly security audit | **Batch** | Not urgent; 50% savings |
| Interactive code review | **Synchronous** | Immediate response required |
| Processing 10,000 documents | **Batch** | Bulk processing; savings are significant |

## 7.3 Using `custom_id`

```json
{
  "custom_id": "doc-invoice-2024-001",
  "params": {
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Extract data from: ..."}]
  }
}
```

`custom_id` allows you to:
- Link the result to the original document
- On failure, re-submit only the failed documents
- Avoid re-processing successful documents

## 7.4 Handling Failures in Batches

1. Submit a batch of 100 documents
2. 95 succeed; 5 fail (context limit exceeded)
3. Identify failures by `custom_id`
4. Modify strategy (e.g., split long documents into chunks)
5. Re-submit only the 5 failed documents

## 7.5 SLA Planning

If you need a result in 30 hours and the Batch API can take up to 24 hours:
- Submission window: 30 - 24 = **6 hours**
- Batches must be submitted no later than 24 hours before the deadline
- For frequent submissions, split into 4-hour windows

---

# Chapter 8: Task Decomposition Strategies

## 8.1 Fixed Pipelines (Prompt Chaining)

Each step is defined in advance:

```
Document -> Metadata extraction -> Data extraction -> Validation -> Enrichment -> Final output
```

**When to use:**
- The task structure is predictable (reviews always follow the same template)
- All steps are known up front
- You need stability and reproducibility

## 8.2 Dynamic Adaptive Decomposition

Subtasks are generated based on intermediate results:

```
1. "Add tests for a legacy codebase"
2. -> First: map the structure (Glob, Grep)
3. -> Found: 3 modules with no tests, 2 with partial coverage
4. -> Prioritize: start with the payments module (high risk)
5. -> During work: discovered a dependency on an external API
6. -> Adapt: add a mock for the external API before writing tests
```

**When to use:**
- Open-ended investigative tasks
- When the full scope is unknown up front
- When each step depends on the results of the previous step

## 8.3 Multi-pass Code Review

For pull requests with 10+ files:

```
Pass 1 (per-file): Analyze auth.ts -> list local issues
Pass 1 (per-file): Analyze database.ts -> list local issues
Pass 1 (per-file): Analyze routes.ts -> list local issues
...
Pass 2 (integration): Analyze relationships between files
  -> Cross-file issues: inconsistent types, circular dependencies
```

**Why a single pass over 14 files is bad:**
- Attention dilution: deep analysis for some files, shallow for others
- Inconsistent comments: a pattern is flagged in one file but approved in another
- Missed bugs: obvious errors get skipped due to cognitive overload

---

# Chapter 9: Escalation and Human-in-the-Loop

## 9.1 When to Escalate to a Human

**Escalation triggers (clear rules):**

| Situation | Action |
|---|---|
| The customer explicitly asks “get me a manager” | Escalate immediately; do not attempt to solve |
| Policy does not cover the request | Escalate (e.g., competitor price matching when policy is silent) |
| The agent cannot make progress | Escalate after a reasonable number of attempts |
| Financial operation above a threshold | Escalate (preferably enforced via a hook, not a prompt) |
| Multiple matches when searching for a customer | Ask for additional identifiers; do not guess |

**What is NOT a reliable trigger:**

| Unreliable method | Why it fails |
|---|---|
| Sentiment analysis | Customer mood does not correlate with case complexity |
| Model self-rated confidence (1–10) | The model can be confidently wrong; calibration is poor |
| An automatic classifier | Overengineering; may require training data you don’t have |

## 9.2 Escalation Patterns

**Immediate escalation:**

```
Customer: "I want to speak to a manager"
Agent: [immediately calls escalate_to_human]
NOT: "I can help with your issue, let me..."
```

**Escalation after an attempt to resolve:**

```
Customer: "My refrigerator broke two days after purchase"
Agent: [checks the order, offers a warranty replacement]
If the customer is not satisfied -> escalate
```

**Nuanced escalation (acknowledge → resolve → escalate on reiteration):**

```
Customer: "This is outrageous, I'm very unhappy with the quality!"
Agent: [acknowledges frustration] "I understand your frustration."
       [offers resolution] "I can offer a replacement or a refund."
Customer: "No, I want to talk to someone!"
Agent: [customer insists again -> immediate escalation]
```

Key principle: acknowledge emotion first, then propose a concrete solution, and only escalate if the customer reiterates the desire for a human. Do not escalate on the first expression of dissatisfaction (that is not the same as requesting a manager).

**Escalation for a policy gap:**

```
Customer: "Competitor X has this item 30% cheaper—give me a discount"
Policy: covers price adjustments only on your own site
Agent: [escalates — policy does not cover competitor price matching]
```

## 9.3 Structured Handoff Protocols

On escalation, the agent should pass a structured summary to a human:

```json
{
  "customer_id": "CUST-12345",
  "customer_name": "Ivan Petrov",
  "issue_summary": "Refund request for a damaged item",
  "order_id": "ORD-67890",
  "root_cause": "Item arrived damaged; photos attached",
  "actions_taken": [
    "Verified customer via get_customer",
    "Confirmed order via lookup_order",
    "Offered a standard replacement — customer insists on a refund"
  ],
  "refund_amount": "$89.99",
  "recommended_action": "Approve a full refund",
  "escalation_reason": "Customer requested to speak with a manager"
}
```

The human operator does not have access to the full conversation transcript—they only see this summary. Therefore it must be complete and self-contained.

## 9.4 Confidence Calibration and Human Oversight

For data extraction systems:

1. **Field-level confidence scores:** the model outputs a confidence score per extracted field
2. **Calibration:** use labeled validation sets to tune thresholds
3. **Routing:**
   - High confidence + stable accuracy -> automated processing
   - Low confidence or ambiguous sources -> human review

**Stratified random sampling:**
- Even for high-confidence extractions, regularly audit a sample
- An aggregate 97% accuracy can hide 40% errors for a particular document type
- Analyze accuracy by document type and by field, not only overall

---

# Chapter 10: Error Handling in Multi-agent Systems

## 10.1 Error Categories

| Category | Examples | Retryable | Agent action |
|---|---|---|---|
| **Transient** | Timeout, 503, network failure | Yes | Retry with exponential backoff |
| **Validation** | Invalid input format, missing required field | No (fix input) | Modify request and retry |
| **Business** | Policy violation, threshold exceeded | No | Explain to the user; propose an alternative |
| **Permission** | Access denied | No | Escalate |

## 10.2 Error-handling Anti-patterns

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| Generic status “search unavailable” | The coordinator can’t decide how to recover | Return error type, query, partial results, alternatives |
| Silent suppression (empty result = success) | Coordinator thinks there were no matches, but it was a failure | Distinguish “no results” from “search failure” |
| Aborting the whole workflow on one failure | You lose all partial results | Continue with partial results; annotate gaps |
| Infinite retries inside a subagent | Latency and wasted resources | Local recovery (1–2 retries), then propagate to coordinator |

## 10.3 A Structured Subagent Error

```json
{
  "status": "partial_failure",
  "failure_type": "timeout",
  "attempted_query": "AI impact on music industry 2024",
  "partial_results": [
    {"title": "AI Music Generation Report", "url": "...", "relevance": 0.8}
  ],
  "alternative_approaches": [
    "Try a narrower query: 'AI music composition tools'",
    "Use an alternative data source"
  ],
  "coverage_impact": "Not covered: AI impact on music production"
}
```

This provides the coordinator with the information needed to decide:
- Retry with a modified query?
- Use partial results?
- Delegate to a different subagent?
- Continue without this section and annotate the gap?

## 10.4 Coverage Annotations in the Final Synthesis

```markdown
## Report: AI Impact on Creative Industries

### Visual Art (FULL COVERAGE)
[research results]

### Music (PARTIAL COVERAGE — search agent timeout)
[partial results]
⚠️ Note: coverage for this section is limited due to a timeout in the search agent.

### Literature (FULL COVERAGE)
[research results]
```

---

# Chapter 11: Context Management in Production Systems

## 11.1 Extract Facts into a Separate Block

Instead of relying on conversation history (which degrades during summarization), extract key facts into a structured block:

```
=== CASE FACTS (updated whenever a new fact appears) ===
Customer ID: CUST-12345
Order ID: ORD-67890
Order Date: 2025-01-15
Order Amount: $89.99
Issue: Damaged item on delivery
Customer Request: Full refund
Status: Pending manager approval
===
```

Include this block in every prompt, regardless of how history is summarized.

## 11.2 Trimming Tool Results

If `lookup_order` returns 40+ fields but you only need 5 for the current task:

```python
# PostToolUse hook: keep only relevant fields
@hook("PostToolUse", tool="lookup_order")
def trim_order_fields(result):
    return {
        "order_id": result["order_id"],
        "status": result["status"],
        "total": result["total"],
        "items": result["items"],
        "return_eligible": result["return_eligible"]
    }
```

This conserves context and reduces noise.

## 11.3 Position-aware Input

Place critical information with the lost-in-the-middle effect in mind:

```
[KEY FINDINGS — at the top]
Found 3 critical vulnerabilities...

[DETAILED RESULTS — middle]
=== File auth.ts ===
...
=== File database.ts ===
...

[ACTION ITEMS — at the end]
Priority: fix auth.ts vulnerabilities before merge.
```

## 11.4 Scratchpad Files

In long investigations, the agent can write key findings to a scratchpad file:

```
# investigation-scratchpad.md
## Key findings
- PaymentProcessor in src/payments/processor.ts inherits from BaseProcessor
- refund() is called from 3 places: OrderController, AdminPanel, CronJob
- External PaymentGateway API has a rate limit of 100 req/min
- Migration #47 added refund_reason (NOT NULL) — 2024-12-01
```

When context degrades (or in a new session), the agent can consult the scratchpad instead of re-running discovery.

## 11.5 Delegating to Subagents to Protect Context

```
Main agent: "Investigate dependencies of the payments module"
  -> Subagent (Explore): reads 15 files, traces imports
  -> Returns: "Payments depends on AuthService, OrderModel, and the external PaymentGateway API"

Main agent: keeps one line in context instead of 15 files
```

**Separate context layer:**
In multi-agent systems, each subagent operates within a limited context budget—it receives only the information required for its task. The coordinator acts as a separate context layer: it aggregates subagent outputs, stores global state, and allocates context. This prevents “context leakage,” where one agent consumes the window with information irrelevant to others.

**Constrained context budgets for subagents:**
- Send minimal context: a specific task + necessary data
- Instruct the subagent to return structured results, not raw data dumps
- Use `allowedTools` to limit the subagent’s toolset—fewer tools means fewer distractions and lower context cost

## 11.6 Structured State Persistence (for crash recovery)

Each agent exports its state to a known location:

```json
// agent-state/web-search-agent.json
{
  "status": "completed",
  "queries_executed": ["AI music 2024", "AI music composition"],
  "results_count": 12,
  "key_findings": [...],
  "coverage": ["music composition", "music production"],
  "gaps": ["music distribution", "music licensing"]
}
```

The coordinator loads a manifest on resume:

```json
// agent-state/manifest.json
{
  "web-search": "completed",
  "doc-analysis": "in_progress",
  "synthesis": "not_started"
}
```

---

# Chapter 12: Preserving Provenance

## 12.1 The Attribution Loss Problem

When summarizing results from multiple sources, the “claim → source” link can be lost:

```
Bad: "The AI music market is estimated at $3.2B." (No source, no year.)

Good:
{
  "claim": "The AI music market is estimated at $3.2B.",
  "source_url": "https://example.com/report",
  "source_name": "Global AI Music Report 2024",
  "publication_date": "2024-06-15",
  "confidence": 0.9
}
```

## 12.2 Handling Conflicting Data

When two sources provide different values:

```json
{
  "claim": "Share of AI-generated music on streaming platforms",
  "values": [
    {
      "value": "12%",
      "source": "Spotify Annual Report 2024",
      "date": "2024-03",
      "methodology": "Automated classification"
    },
    {
      "value": "8%",
      "source": "Music Industry Association Survey",
      "date": "2024-07",
      "methodology": "Survey of 500 labels"
    }
  ],
  "conflict_detected": true,
  "possible_explanation": "Difference in methodology and time period"
}
```

Do not arbitrarily choose one value. Preserve both with attribution and let the coordinator decide.

## 12.3 Include Dates for Correct Interpretation

Without dates, temporal differences can be misinterpreted as contradictions:

```
Bad: "Source A says 10%, source B says 15%. Contradiction."
Good: "Source A (2023) says 10%, source B (2024) says 15%. Likely +5% growth over a year."
```

## 12.4 Render by Content Type

Don’t force everything into one format:
- Financial data -> tables
- News and analysis -> prose
- Technical findings -> structured lists
- Time series -> chronological ordering

---

# Chapter 13: Claude Code Built-in Tools

## 13.1 Tool Selection Reference

| Task | Tool | Example |
|---|---|---|
| Find files by name/pattern | **Glob** | `**/*.test.tsx`, `src/components/**/*.ts` |
| Search within files | **Grep** | Function name, error message, import |
| Read a file in full | **Read** | Load a file for analysis |
| Write a new file | **Write** | Create a file from scratch |
| Edit an existing file precisely | **Edit** | Replace a specific snippet via unique text match |
| Run a shell command | **Bash** | git, npm, run tests, build |

## 13.2 Incremental Investigation Strategy

Do not read all files at once. Build understanding incrementally:

```
1. Grep: find entry points (function definition, export)
2. Read: read the found files
3. Grep: find usages (import, calls)
4. Read: read consumer files
5. Repeat until you have a complete picture
```

## 13.3 Fallback: Read + Write Instead of Edit

When Edit fails due to a non-unique text match:
1. Read — load the full file content
2. Modify the content programmatically
3. Write — write the updated version

---

# PART II: EXAM DOMAIN NOTES

---

<a id="domain-1-material"></a>\n\n# Domain 1: Agentic Architecture & Orchestration (27%)

## 1.1 Designing Agentic Loops for Autonomous Task Execution

### Key knowledge:
- Agent loop lifecycle: send a Claude request, check `stop_reason` (`"tool_use"` vs `"end_turn"`), execute tools, return results for the next iteration
- Tool results are appended to the conversation history so the model can decide the next action
- Model-driven decision making (Claude chooses the next tool) vs hard-coded decision trees

### Key skills:
- Flow control: continue the loop when `stop_reason = "tool_use"` and stop on `"end_turn"`
- Appending tool results to context between iterations
- Anti-patterns to avoid: parsing assistant text for completion, using arbitrary iteration limits as the primary stopping mechanism

**Mechanics of the loop.** A tool turn produces an assistant message whose `content` is a list of blocks — typically a `text` block (the model narrating intent) plus one or more `tool_use` blocks. You execute each requested tool and reply with a *user* message containing `tool_result` blocks; each carries a `tool_use_id` that must match the `tool_use` it answers, so when Claude requests several tools in one turn the ids — not the ordering — pair results to requests. The follow-up request must resend the full history (user → assistant `tool_use` → user `tool_result`) *and* the original tool schemas, even on a turn where no further call is expected, because the prior blocks reference them. The loop ends only when `stop_reason` is no longer `"tool_use"`; never terminate by checking whether the assistant said it is done.

## 1.2 Orchestrating Multi-agent Systems (Coordinator–Subagent)

### Key knowledge:
- Hub-and-spoke architecture: the coordinator owns all inter-agent communication, error handling, and routing
- Subagents operate with isolated context—they do not automatically inherit the coordinator’s history
- Coordinator responsibilities: task decomposition, delegation, result aggregation, dynamic selection of subagents
- Risk of overly narrow decomposition by the coordinator

### Key skills:
- Split research coverage among subagents to minimize duplication
- Implement iterative refinement loops (coordinator evaluates synthesis and re-routes tasks)
- Route all communication through the coordinator for observability

**Workflow vs. agent — the governing decision.** Use a **workflow** when you can write the exact sequence of steps ahead of time; use an **agent** when the steps are unknown and Claude must plan from a toolset. Workflows are more reliable and far easier to test and evaluate because the path is fixed; agents trade reliability and testability for flexibility (a lower successful-completion rate, harder to reproduce). Default to workflows and reach for an agent only when the task genuinely cannot be scripted.

**Named workflow patterns** (all fixed, code-orchestrated calls to Claude):

| Pattern | When it fits |
|---|---|
| Chaining | A long prompt with many constraints that Claude keeps violating; split into focused sequential steps so each call attends to one concern |
| Routing | Input must be handled by a specialized pipeline — first call categorizes, then dispatch to the matching prompt/tools |
| Parallelization | One task split into independent sub-asks (evaluate each material separately); run concurrently, then aggregate |
| Evaluator-optimizer | Produce → grade → feed back → repeat until the grader accepts |

**Tool abstraction for agents.** Give an agent a small set of abstract tools (`read_file`, `write_file`, `run_command`) and let Claude compose them — the way Claude Code uses `Bash`/`Read`/`Write`. Hyper-specialized tools (`refactor_file`, `install_dependencies`) remove the planning that makes an agent flexible and only cover pre-planned scenarios.

**Environment inspection.** After (and often before) an action, the agent needs a way to observe its result beyond the tool's return value — a screenshot after a click, a file read before a write. Without inspection the agent cannot gauge progress or recover from surprises; build it into the system prompt (for example, run a caption extractor on the generated video, then inspect the frames).

## 1.3 Configuring Subagent Calls, Context Passing, and Spawning

### Key knowledge:
- The current Agent SDK invokes subagents through the `Agent` tool; include `"Agent"` in `allowedTools` when delegation should be auto-approved
- Subagent context must be explicitly included in the prompt; subagents do not inherit parent context
- `AgentDefinition` configuration: descriptions, system prompts, tool constraints
- Session management via `fork_session` for exploring alternatives

### Key skills:
- Include full outputs from prior agents in the subagent prompt
- Use structured formats to separate data from metadata when passing context
- Spawn independent subagents through separate `Agent` invocations so their contexts stay isolated
- Write coordinator prompts in terms of goals and quality criteria rather than step-by-step instructions

**Passing context to subagents.** Because subagent context is isolated, the prompt must be self-contained: the full prior outputs, the document text, and the output schema. Separate data from metadata with explicit structure so the subagent cannot confuse a finding with its source. Spawn parallel work through separate `Agent` invocations with self-contained prompts. Describe the work in terms of goals and quality criteria (“produce a coverage-annotated synthesis with a citation for every claim”) rather than a rigid step list — a rigid list defeats the flexibility of delegation and tends to reproduce the coordinator’s own bias.

## 1.4 Implementing Multi-step Workflows with Enforcement and Handoff Patterns

### Key knowledge:
- The difference between **programmatic enforcement** (hooks, preconditions) and **prompt guidance** for ordering a workflow
- When you need deterministic guarantees (e.g., identity verification before financial operations), prompts alone are insufficient
- Structured handoff protocols during escalation (customer ID, reason, recommended action)

### Key skills:
- Programmatic preconditions that block downstream calls until prior steps are complete (e.g., block `process_refund` until `get_customer` returns a verified ID)
- Decompose multi-aspect customer requests into separate items
- Produce structured summaries when escalating to a human

**Enforcement vs. guidance.** Ordering a workflow by prompt (“always verify identity first”) is *probabilistic* — Claude usually complies but can skip it. A programmatic precondition (a hook or a guard that refuses `process_refund` until `get_customer` has returned a verified id) is *deterministic*. Use guidance for preference and flow; use preconditions for anything with financial, legal, or safety weight. For multi-aspect requests (“my order is broken and I want a manager”), decompose into separate items and handle each on its own merits rather than collapsing them into one action.

## 1.5 Agent SDK Hooks for Intercepting Tool Calls and Normalizing Data

### Key knowledge:
- Hook patterns (e.g., `PostToolUse`) to intercept tool results before the model consumes them
- Hooks that intercept outgoing calls to enforce compliance rules (e.g., block refunds above a threshold)
- Hooks provide **deterministic guarantees** vs prompt instructions that provide **probabilistic compliance**

### Key skills:
- `PostToolUse` hooks for normalizing data formats (Unix timestamps, ISO 8601, numeric status codes)
- Interception hooks to block policy-violating actions with redirection to escalation
- Choose hooks over prompts when business rules require guaranteed compliance

**Why hooks, not prompts, for hard rules.** A prompt instruction is a request Claude can decline; a hook is code at a fixed point in the loop that cannot be skipped. `PostToolUse` is ideal for normalization (Unix epoch → ISO 8601, status codes → labels) because it transforms a result before the model sees it. `PreToolUse` is the enforcement primitive — it can `deny`, `ask`, or silently `update` the input (for example, redact a secret from a Bash command and still let it run). Reserve hooks for rules where failure has consequences; over-hooking routine formatting only adds latency.

## 1.6 Task Decomposition Strategies for Complex Workflows

### Key knowledge:
- **Fixed pipelines** (prompt chaining) vs **dynamic adaptive decomposition** based on intermediate results
- Prompt chaining: sequential steps (analyze each file separately, then run an integration pass)
- Adaptive investigation plans that generate subtasks based on what was discovered

### Key skills:
- Use prompt chaining for predictable multi-aspect reviews; use dynamic decomposition for open-ended investigations
- Split large code reviews into per-file analysis plus a separate cross-file integration pass
- Decompose open-ended tasks: map structure first, then build a prioritized plan

**Fixed vs. dynamic decomposition.** Choose a fixed pipeline (prompt chaining) when the structure is known up front and reproducibility matters — per-file review then an integration pass, or extraction → validation → enrichment. Choose dynamic adaptive decomposition when the scope only becomes clear as you work: map structure first, let the findings set the next task, and re-plan when a dependency surfaces. For large reviews, the per-file-then-integration split is what prevents attention dilution — a single pass over many files produces deep analysis for some files and shallow for others, and flags a pattern in one file that it ignores in another.

## 1.7 Session State, Resuming, and Forking

### Key knowledge:
- `--resume <session-name>` to continue named sessions
- `fork_session` to create independent investigation branches from shared context
- The importance of informing the agent about file changes when resuming sessions
- A new session with a structured summary can be more reliable than resuming with stale results

### Key skills:
- Use `--resume` to continue named investigation sessions
- Use `fork_session` to compare approaches in parallel
- Choose between resuming (context still current) vs starting a new session (results stale)

**Resume vs. fork vs. fresh.** `--resume <session>` continues a named session with its saved context — good for a long investigation you walked away from, but risky if files changed, because cached tool results may now be stale. `fork_session` branches from shared context so two approaches (Redux vs. Context API) can diverge independently without polluting each other. When results have aged or the context has degraded, a fresh session opened with a short written summary is more reliable than resuming stale tool data — and tell the agent what changed since the prior session.

---

<a id="domain-2-material"></a>\n\n# Domain 2: Tool Design & MCP Integration (18%)

## 2.1 Designing Tool Interfaces with Clear Descriptions

### Key knowledge:
- Tool descriptions are the **primary mechanism** an LLM uses to select tools; minimal descriptions lead to unreliable selection
- The importance of including input formats, example queries, edge cases, and applicability boundaries
- Ambiguous or overlapping descriptions cause misrouting
- System prompt wording can create unintended associations with tools

### Key skills:
- Write descriptions that clearly distinguish each tool from similar alternatives
- Rename tools to eliminate functional overlap (e.g., `analyze_content` -> `extract_web_results`)
- Split general-purpose tools into specialized ones with clear input/output contracts

**Writing the description.** The description is the selection mechanism, so make it discriminate: state what the tool does, what it returns, the input format with an example value, edge cases, and — critically — *when to use this tool versus a near-twin*. If `analyze_content` and `analyze_document` read alike, the model will misroute; either rename to eliminate the overlap (`analyze_content` → `extract_web_results`) or split a general tool into specialized ones with distinct contracts. Watch the system prompt too: a line like “always verify the customer” can bias the model toward `get_customer` even when it is unnecessary. When an MCP tool overlaps a built-in (your `search_code` vs `Grep`), spell out the concrete advantage only your tool provides, or the model defaults to the built-in.

## 2.2 Implementing Structured Error Responses for MCP Tools

### Key knowledge:
- The `isError` flag in MCP tool responses
- The difference between **transient errors** (timeouts), **validation errors** (bad input), **business errors** (policy violations), and **access/permission errors**
- Generic errors ("Operation failed") prevent correct recovery decisions
- The difference between retryable and non-retryable errors

### Key skills:
- Return structured metadata such as `errorCategory` (transient/validation/permission), `isRetryable`, and a human-readable message
- Use `retryable: false` for business-rule violations with clear user-facing explanations
- Do local recovery inside subagents for transient failures; propagate only errors they cannot resolve
- Distinguish access failures (retry decision) from valid empty results (no matches)

**`isError` and what to put in it.** Set `isError: true` and return a **structured** payload — `errorCategory` (transient / validation / business / permission), `isRetryable`, a human-readable message, what was attempted, and any partial results. A bare `"Operation failed"` gives the agent nothing to decide on. The categories drive the action: transient (timeout, 503) → retry with backoff; validation (bad input) → fix the request and retry; business (policy/threshold) → explain to the user, not retryable; permission (access denied) → escalate. Two anti-patterns to avoid: **silent suppression** (returning an empty result on failure so the coordinator mistakes “search broke” for “no matches”) and **aborting the whole workflow** on one failure (you lose all partial results) — instead annotate the gap and continue.

## 2.3 Allocating Tools Across Agents and Configuring `tool_choice`

### Key knowledge:
- Too many tools per agent (e.g., 18 instead of 4–5) **reduces** tool selection reliability
- Agents with tools outside their specialization tend to misuse them
- Scoped tool access: only role-relevant tools plus a limited set of cross-role utilities
- `tool_choice`: `"auto"`, `"any"`, and forced tool selection (`{"type": "tool", "name": "..."}`)

### Key skills:
- Restrict each subagent’s toolset to what is relevant for its role
- Replace general tools with constrained alternatives (e.g., `fetch_url` -> `load_document`)
- Use `tool_choice: "any"` to guarantee a tool call instead of a text answer
- Force a specific tool to ensure execution order

**Right-size the toolset.** Reliability falls as tools multiply — about 4–5 well-chosen tools per agent beats 18. Scope each subagent to its role plus only a few cross-role utilities; an agent with tools outside its specialization tends to misuse them. Replace a general tool with a constrained one when the constraint is the point (`fetch_url` → `load_document` that rejects non-doc URLs). `tool_choice` then governs selection: `"auto"` lets the model answer in text or call a tool (default), `"any"` forces *some* tool call (guaranteed structured output when several schemas exist), and `{"type":"tool","name":"extract_metadata"}` forces a specific tool to lock an execution order (metadata before enrichment).

## 2.4 Integrating MCP Servers into Claude Code and Agent Workflows

### Key knowledge:
- MCP server scope: project (`.mcp.json`) for teams vs user (`~/.claude.json`) for experiments
- Environment variable substitution in `.mcp.json` (e.g., `${GITHUB_TOKEN}`) for secret management
- Tools from all connected MCP servers are discovered on connection and are available simultaneously
- MCP resources as “content catalogs” (task summaries, database schemas) to reduce exploratory tool calls

### Key skills:
- Configure shared MCP servers in project `.mcp.json` with env-var-based tokens
- Keep personal/experimental servers in `~/.claude.json`
- Prefer community MCP servers over custom servers for standard integrations

**MCP topology and config.** An MCP deployment is **Host → Client → Server**: the server owns tools, resources, and prompts; the client is the bridge that lists and calls them (a `ListToolsRequest` discovers tools, a `CallToolRequest` runs one). The connection is **transport-agnostic** — stdio on the same machine is the common dev transport; HTTP and WebSocket are alternatives. For config the guide tests **two scopes**: project `.mcp.json` (version-controlled, shared, tokens via `${ENV_VAR}` substitution so secrets are not committed) and user `~/.claude.json` (personal, experimental). On connection, tools from *all* servers are discovered and available at once. (Note: the prep course describes additional MCP scopes; the exam guide tests two — keep the two-scope model.)

**The three primitives and when each fits.** **Tools** are functions the model calls to act; **Resources** are data the client reads for context without a tool round-trip (an `@document` mention can be expanded via a *templated* resource like `docs://documents/{doc_id}`, vs. a *direct* resource with a static URI); **Prompts** are server-authored, pre-tested message templates for a workflow the *user* triggers (a `/format` slash command) — use a Prompt, not a Tool, when the user controls when the workflow starts. Test all three in the **MCP Inspector** (`mcp dev mcp_server.py`) before wiring to Claude. In the Python SDK, define a tool with the `@mcp.tool()` decorator and let the SDK generate the JSON schema rather than hand-writing it.

## 2.5 Selecting and Applying Built-in Tools (Read, Write, Edit, Bash, Grep, Glob)

### Key knowledge:
- **Grep**: search within file contents (function names, error messages, imports)
- **Glob**: find files by name/extension patterns
- **Read/Write**: full-file operations; **Edit**: precise changes via unique text matches
- If Edit fails due to non-unique matches, fall back to Read + Write

### Key skills:
- Use Grep for content search and Glob for file discovery by patterns
- Build understanding incrementally: Grep entry points, then Read to trace flows
- Trace function usage through wrapper modules

**Choosing among Read/Write/Edit/Bash/Grep/Glob.** `Glob` finds files by name or pattern (`**/*.test.tsx`); `Grep` searches *inside* files (a function name, an error string, an import). Investigate incrementally — `Grep` an entry point, `Read` the hits, `Grep` the usages, `Read` the callers — rather than reading everything at once. `Edit` makes a precise replacement via a unique text match; when the match is not unique, fall back to `Read` the whole file, modify it, and `Write` it back. `Bash` runs shell (git, tests, build) and is the escape hatch when no file tool fits.

**Two senses of “built-in tool.”** Do not conflate Claude Code’s local file/shell tools with the API’s server-side built-in tools — they share the word “built-in” but split the work differently. The Claude Code tools above run on *your* machine; Claude Code itself supplies both schema and execution. At the API level, “built-in” means Claude supplies the *schema* (a small dated stub the model expands into a full spec), and who supplies *execution* depends on the tool: the **text editor** tool gives Claude file-creation and string-replace abilities, but **you** must implement the functions that actually touch the file system — the schema is free, the execution is not. The **web search** and **code execution** tools are *server-side*: you add only the predefined schema and Claude runs them — web search returns result blocks plus citation blocks you can render, and code execution runs Python in an **isolated Docker container with no network access** (move data in and out with the Files API’s `container_upload` block and downloaded output file IDs). The design lesson: a server-side built-in gives you capability with no code to maintain but no control over how it runs; the text editor leaves execution in your hands, so you keep control but own the glue code. When a custom tool overlaps a server-side built-in (your own `search` vs the web search tool), prefer the built-in unless you need data or behavior it cannot reach.

---

<a id="domain-3-material"></a>\n\n# Domain 3: Claude Code Configuration & Workflows (20%)

## 3.1 Configuring CLAUDE.md with Hierarchy, Scope, and Modular Organization

### Key knowledge:
- CLAUDE.md hierarchy: user (`~/.claude/CLAUDE.md`), project (`.claude/CLAUDE.md` or root `CLAUDE.md`), and directory-level (CLAUDE.md in subdirectories)
- User-level settings apply only to one user and are not shared via VCS
- `@path` syntax for referencing external files (e.g., `@./standards/coding-style.md`) to modularize CLAUDE.md
- The `.claude/rules/` directory for topic-focused rule files instead of a monolithic CLAUDE.md

### Key skills:
- Diagnose hierarchy issues (a new team member misses instructions because they are user-level instead of project-level)
- Use `@path` (e.g., `@./standards/testing.md`) to selectively include standards in each package’s CLAUDE.md
- Split large CLAUDE.md into multiple `.claude/rules/` files (testing.md, api-conventions.md, deployment.md)

**CLAUDE.md is instruction, not configuration.** It is guidance Claude *tries* to follow, not a rule it *must* follow — so a hard rule (“never push to main”) belongs in a `PreToolUse` hook, which stops the action even when Claude attempts it. The file also competes with itself: the longer it grows, the less of it Claude reliably honors. Keep it lean by (a) making rules **specific and checkable** (“put new API routes in `src/api/handlers/`, one per file”, not “follow best practices”), (b) **naming the replacement** (“use named exports, not default exports” closes the loophole that “don’t use default exports” leaves open), and (c) treating **emphasis as a budget** — reserve “IMPORTANT”/“you must” for the two or three rules that hurt when broken. When Claude does the wrong thing, treat it as a bug report against the file and ask it to add the rule. Note that `@path` imports organize a large file but **do not reduce context** — imported files are expanded inline at launch, so everything still loads up front.

## 3.2 Creating and Configuring Custom Slash Commands and Skills

### Key knowledge:
- **Project commands** in `.claude/commands/` (shared via VCS) vs **user commands** in `~/.claude/commands/`
- Skills in `.claude/skills/` with `SKILL.md` frontmatter: `context: fork`, `allowed-tools`, `argument-hint`
- `context: fork` runs the skill in an isolated subagent context so it does not pollute the main session
- Personal skill variants can live in `~/.claude/skills/` under different names

### Key skills:
- Store project slash commands in `.claude/commands/` so the whole team gets them
- Use `context: fork` to isolate skills with verbose output
- Use `allowed-tools` to restrict what tools a skill can use
- Use `argument-hint` to prompt developers for required parameters

**Skill packaging.** A skill is a folder: a `SKILL.md` with a name, a `description` that triggers it, and the procedure, plus optional `reference.md` for deep material and scripts Claude *executes* rather than loads. Keep `SKILL.md` lean and push depth into the side files — only descriptions load until a skill is invoked, so a fat skill wastes no context at rest. `context: fork` runs the skill in an isolated subagent so verbose output never reaches the main session; `allowed-tools` is the security boundary (a skill that should never delete files must not list `Write`/`Bash`). If you have typed the same multi-step procedure twice, it is a skill.

**Plugins — read before you install.** Installing a plugin grants it your own privileges, and any hook it carries joins your existing ones rather than superseding them — matching tool calls fire both. That is the whole risk: a plugin can register a `Stop` hook that reaches the network, and your configuration gives no signal that it happened. Popularity is not review. Enumerate the hooks, agents, and MCP servers a plugin contributes before you enable it. Skills, agents, and commands are namespaced under the plugin name so they cannot clash with yours, but behavior-changing `settings.json` keys (for example, promoting a plugin subagent to the main thread) do change how Claude Code behaves by default.

## 3.3 Using Path-specific Rules for Conditional Convention Loading

### Key knowledge:
- `.claude/rules/` files can include YAML frontmatter `paths` to activate rules based on glob patterns
- Path-scoped rules load **only** when editing matching files, saving context and tokens
- Glob-based path rules can be preferable to directory-level CLAUDE.md when conventions apply across many directories (e.g., tests)

### Key skills:
- Create `.claude/rules/` files with `paths: ["terraform/**/*"]` to load only when working on matching files
- Use glob patterns (`**/*.test.tsx`) to apply conventions by file type regardless of location
- Prefer path-specific rules over directory-level CLAUDE.md when conventions span the codebase

**Why path-scoped rules save context.** A `.claude/rules/` file with `paths: ["terraform/**/*"]` is loaded only when Claude edits a matching file; everything else stays out of context. This is the right tool when a convention applies to a *kind* of file scattered across the tree (tests, migrations) — a directory-level `CLAUDE.md` would force you to repeat the same rule in every directory. For conventions tied to one place, a directory-level `CLAUDE.md` is still simpler.

## 3.4 Deciding When to Use Planning Mode vs Direct Execution

### Key knowledge:
- **Planning mode**: for complex tasks with large changes, multiple viable approaches, and architectural decisions
- **Direct execution**: for simple, well-understood changes (e.g., adding a single validation)
- Planning mode enables safe exploration of the codebase before making changes
- Explore subagent isolates verbose discovery output

### Key skills:
- Use planning mode for tasks with architectural consequences (microservices, migrations touching 45+ files)
- Use direct execution for fixes with a clear stack trace and a single file
- Use Explore subagent to prevent context-window exhaustion in multi-phase tasks
- Combine approaches: plan for discovery, then execute for implementation

**Planning mode and steering a long run.** Plan mode researches read-only and hands you a plan; the more thoroughly you read and revise that plan before approving, the fewer hiccups during execution. For autonomy, `/goal` sets a **checkable completion condition** (“all tests in `src/billing` pass and the type checker reports zero errors”) and keeps Claude working across turns until a fast evaluator confirms it — the condition must be checkable from output Claude produces (test results), not from private state; `/goal clear` cancels it. `/loop` re-runs a prompt on an interval to watch an external state (a CI run, a deploy) and act on change. When the session drifts, `/compact` with an instruction directs *what* the summary keeps (“keep only the API changes, drop the debugging”); `Rewind` (double-tap Escape on an empty prompt) restores a prior checkpoint so you do not prompt your way out of a wrong path. For two sessions on one repo, use **worktrees** so they cannot fight over the same files.

## 3.5 Iterative Refinement for Progressive Improvement

### Key knowledge:
- Concrete input/output examples are the most effective way to communicate expectations
- **Test-driven iteration**: write tests first, then iterate based on failures
- The “interview” pattern: Claude asks questions to surface non-obvious design considerations
- When to provide all issues in one message (interdependent) vs sequentially (independent)

### Key skills:
- Provide 2–3 concrete input/output examples to clarify transformation requirements
- Build test sets with expected behavior, edge cases, and performance requirements before implementation
- Use the interview pattern to surface design aspects (cache invalidation, failure modes)
- Provide concrete test cases with sample inputs and expected outputs for edge cases

**Iterate against an eval, not by eye.** A typical prompt-eval workflow: (1) write a draft prompt; (2) assemble a dataset of inputs — by hand, or generated by Claude (use a fast model like Haiku for generation, never the model under test); (3) run the prompt against every case; (4) **grade** each output; (5) average the scores for an objective baseline; (6) change the prompt and re-run to compare. Test on more than one or two of your own inputs before shipping — real users supply the inputs that break a prompt.

**Grader types.**

| Grader | What it checks | Notes |
|---|---|---|
| Code | Programmatic: length, substring presence, JSON/Python/regex syntax (parse the AST or regex) | Fast, deterministic; returns a score |
| Model | Another Claude call judges quality, instruction-following, completeness | Most flexible; ask for **strengths, weaknesses, and reasoning** alongside the score, not just a number — a bare 1–10 collapses to safe middle values |
| Human | A person rates the outputs | Most flexible, slowest and most tedious |

Feed the grader the task, the generated output, and explicit **solution criteria** (“a good solution includes…”) so it judges against a standard. After applying any prompt-engineering technique, re-run the eval to confirm it actually improved — never assume.

## 3.6 Integrating Claude Code into CI/CD Pipelines

### Key knowledge:
- The `-p` (or `--print`) flag for non-interactive mode in automated pipelines
- `--output-format json` and `--json-schema` for structured output in CI
- CLAUDE.md provides project context (testing standards, review criteria) for CI-triggered Claude Code
- **Session context isolation**: the same session that generated code is less effective at reviewing it than an independent instance

### Key skills:
- Run Claude Code in CI with `-p` to avoid hanging on interactive input
- Use `--output-format json` + `--json-schema` for structured results (e.g., inline PR comments)
- Include prior review results when re-running after new commits (report only new/unfixed issues)
- Document testing standards and available fixtures in CLAUDE.md to improve test generation quality
- Include existing test files in context when generating new tests to avoid duplication and keep style consistent

**Non-interactive execution.** `-p`/`--print` runs Claude Code one-shot (stdin in, stdout out) and is the only correct way to run it in a pipeline — it never waits for interactive input. Pair `--output-format json` with `--json-schema` so the structured result lands in a known field you can `jq` and pipe onward; for multi-step jobs, capture the session id from the JSON output and `--resume` it later. `--bare` skips auto-discovery of hooks, skills, plugins, MCP servers, and CLAUDE.md — you get Claude plus only the tools you explicitly allow, which makes CI runs reproducible.

**Permission modes for unattended runs.** `auto` lets Claude run without prompts while a separate classifier reviews each action for *danger* (deploys, force-pushes, piping downloads to a shell, sending data to external endpoints) — but it does **not** judge correctness, so broken-but-safe code passes. Pair `auto` with a `Stop` hook that runs your tests so correctness is gated too. `don’t ask` auto-denies anything not pre-approved and is right for CI; `bypass permissions` skips all checks and belongs only inside an isolated container or VM.

**Review options.** **Managed code review** (the Claude GitHub app) is Anthropic-hosted: review agents analyze the diff against the full codebase, post findings as inline comments tagged by severity, deduplicate and rank them, and **never approve or block** the PR — the judgment stays with a human; apply fixes locally with `/code-review --fix`. Reach for the **Claude Code GitHub Action** when the job is more than review (implement from a comment, scheduled reports, any GitHub event); it runs the agent on PR comments, cron, or manual dispatch, with `claude_args` tuning (`max_turns`, `permission_mode: don’t ask`, `allow_tools`).

**Routines** run a saved prompt plus repo and connectors on Anthropic infrastructure on a cron or webhook trigger — no machine of yours stays on and no workflow file to maintain; each run starts from a fresh clone of the default branch and can push only to `claude/`-prefix branches, which keeps an autonomous run off `main`.

**Verifying a run you did not watch.** Scale the checking to how little supervision the run had. Read the change, not the account of it: `git diff` is the evidence, and a confident summary can coexist with an edit to a file that was never in scope. Treat "tests pass" as a claim until something independent confirms it — a `Stop` hook that gates completion on the real result makes it unskippable, and returning exit code 2 hands the failure back for repair without your involvement. When the stakes justify it, add a **cold second opinion**: hand the diff to a reviewer that never saw the build — a separate session or subagent, carrying none of the original context. Independence is the mechanism, because a reviewer holding the reasoning that produced the code inherits its blind spots.

---

<a id="domain-4-material"></a>\n\n# Domain 4: Prompt Engineering & Structured Output (20%)

## 4.1 Designing Prompts with Explicit Criteria to Improve Accuracy

### Key knowledge:
- Explicit criteria are more effective than vague instructions (e.g., “flag comments only when they contradict code” vs “check comment accuracy”)
- Generic guidance like “be more conservative” works worse than concrete categorical criteria
- The effect of false positives on developer trust: high false-positive rates in some categories undermine trust in accurate categories

### Key skills:
- Define review criteria: what to report (bugs, security) vs what to ignore (minor style)
- Temporarily disable categories with high false-positive rates
- Define explicit severity criteria with code examples for each level

**First line, specificity, structure.** The first line carries the most weight: lead with an action verb and the task (“write three paragraphs explaining how solar panels work”), not a hedge (“can you help me with something about solar panels?”). Then be specific in one of two ways — list **attributes** the output should have (length, structure, required elements) for almost any prompt, or list **steps** for a complex problem where you want to force Claude to consider viewpoints it otherwise would not. Wrap large or interpolated content in **XML tags** (`<sales_records>…</sales_records>`, `<doc>…</doc> <instructions>…</instructions>`) so Claude can tell where one block ends and another begins — this matters most when you paste in many pages.

**Temperature.** Temperature (0–1) shapes the sampling distribution: low (≈0.0–0.3) makes output deterministic and is right for **factual Q&A, coding, and data extraction**; high (≈0.8–1.0) widens the token distribution and is right for **brainstorming, creative writing, and marketing**. Raising temperature only *raises the chance* of variety — it does not guarantee it.

**Role via system prompt.** A system prompt sets role and tone (“you are a patient math tutor; give hints, not the answer”) and applies to every turn; without it, Claude defaults to a helpful-but-generic style.

## 4.2 Using Few-shot Prompting to Improve Output Consistency

### Key knowledge:
- Few-shot examples are the most effective method for producing consistently formatted, actionable output
- Few-shot can demonstrate handling of ambiguous cases (tool selection, gaps in test coverage)
- Few-shot helps the model generalize to new patterns rather than just repeating defaults
- Few-shot can reduce hallucinations in extraction tasks

### Key skills:
- Provide 2–4 targeted examples for ambiguous scenarios with rationale
- Include few-shot examples that demonstrate the output format (location, issue, severity, suggested fix)
- Provide examples that distinguish acceptable code patterns from real issues
- Provide examples of correct extraction from documents with different structures

**How to write a few-shot example.** State explicitly “here is an example with a sample input and an ideal output,” then wrap the input and output in XML tags. Use multi-shot for **corner cases** (sarcasm, ambiguous intents) and add a line of context (“be especially careful with tweets that contain sarcasm”) right before the example that demonstrates it. For complex output formats, one fully-worked example teaches the structure faster than describing it. A high-value source of examples is your own eval: copy a test case the grader scored highly, and include a sentence on *why* it is ideal — the reasoning reinforces the target, not just the shape.

## 4.3 Enforcing Structured Output with `tool_use` and JSON Schemas

### Key knowledge:
- `tool_use` with JSON Schemas is the most reliable way to guarantee schema-conformant output and eliminate JSON syntax errors
- With `tool_choice: "auto"` the model can return text; with `"any"` it must call a tool; forced selection chooses a specific tool
- Strict JSON Schemas eliminate syntax errors but do not prevent semantic errors (totals don’t add up; values in wrong fields)
- Schema design: required vs optional fields; enums with “other” plus a detail string for extensibility

### Key skills:
- Define extraction tools with JSON Schemas and parse data from `tool_use` results
- Use `tool_choice: "any"` to guarantee structured output when multiple schemas exist
- Force a specific tool call: `tool_choice: {"type": "tool", "name": "extract_metadata"}`
- Make fields optional/nullable when the source may not contain information to avoid fabricating values
- Use enum values like `"unclear"` and `"other"` plus detail fields for extensible categorization

**`tool_use` + schema is the guide’s recommended path** for structured output: it guarantees syntactically valid JSON and the required shape, and a forced `tool_choice` can guarantee a specific extraction tool runs first. Remember the mechanics: a tool turn returns **multi-block** content (text + `tool_use`), you reply with `tool_result` blocks in a *user* message keyed by `tool_use_id`, and you resend the schemas on the follow-up. Mark fields nullable (`"type": ["string","null"]`) and add `"other"`/`"unclear"` enums so the model returns `null` or “unclear” instead of fabricating — required fields with missing data are what drive hallucination.

**The course’s API-level alternative (note the conflict).** The prep course also teaches getting raw structured data without a tool: **prefill** an assistant message with the opening delimiter (`` ```json ``) and set the matching closing fence as a **stop sequence**, so Claude emits only the JSON between them. This is the same idea behind “prefill + stop sequences for clean JSON.” The exam guide treats `tool_use` + schema as the *most reliable* method; treat prefill + stop as a lighter alternative for raw-content extraction, not a replacement.

**Assistant prefill to steer, not just to format.** Prefilling `"Coffee is better because"` makes Claude *continue from the end of that string* (you must stitch the prefill and the response together) — useful to force a stance or a format, never to give a complete first sentence.

**“Batch tool” ≠ Message Batches API.** A **batch tool** is an application-level tool that groups several operations behind one interface. The **Message Batches API** is an asynchronous API path for processing many independent Messages requests. Do not use one concept as a substitute for the other.

## 4.4 Implementing Validation, Retries, and Feedback Loops for Extraction Quality

### Key knowledge:
- Retry-with-error-feedback: include concrete validation errors in the retry prompt to guide corrections
- Retries are ineffective when the information is simply absent from the source
- Feedback loop design: track the pattern that triggered a finding (`detected_pattern`)
- Semantic errors (totals don’t reconcile) vs syntax errors (addressed by `tool_use`)

### Key skills:
- Follow-up prompts with the original document, an incorrect extraction, and specific validation errors
- Identify when retry will be ineffective (the required info is only in an external document)
- Include `detected_pattern` fields in findings to analyze false positives
- Design self-correction by extracting both `calculated_total` and `stated_total` to detect discrepancies

**Retry with the error in the prompt.** On a failed validation, resend the original document, the incorrect extraction, and the *specific* error (“`total`=150 but `sum(line_items)`=145; re-check”) — the model can re-check arithmetic and fix placement, but it cannot conjure information that is absent from the source, so do not retry forever. Self-correction is the same idea turned inward: extract both a `stated_total` and a `calculated_total` and flag the conflict for downstream handling.

**Extended thinking as a last-resort accuracy lever.** When you have exhausted prompt improvements and the eval still plateaus, enable extended thinking: Claude reasons in a `thinking` block before the final answer, at the cost of latency and the tokens it spends thinking. The `thinking` block carries a **signature** you must return unmodified in later turns (tampering is rejected); `budget_tokens` has a 1024 minimum and `max_tokens` must exceed it. Treat it as an eval-driven decision, not a default.

## 4.5 Designing Efficient Batch Processing Strategies

### Key knowledge:
- Message Batches API: 50% savings, up to 24-hour processing window, no latency SLA guarantees
- Batch processing is suitable for non-blocking tasks (overnight reports, audits) and not suitable for blocking tasks (pre-merge checks)
- Batch requests can include multi-turn message histories and tool use. The important boundary is **interactive client-side tool execution**: one batch request cannot stop and wait for your application to execute a client tool and send a `tool_result` back into that same request. Server-side tools can run inside the batch worker.
- `custom_id` fields correlate request/response within batches

### Key skills:
- Use synchronous API for blocking checks; use Batch API for overnight/weekly workloads
- Plan batch submission cadence based on SLA needs (e.g., 4-hour windows for a 30-hour guarantee with 24-hour processing)
- Handle failures by re-submitting only failed documents (identified by `custom_id`)
- Iterate on prompts using a sample before running large-scale processing

**Batch API mechanics.** The Message Batches API takes a list of independent asynchronous requests and charges less than standard synchronous processing. Current Claude Platform documentation supports multi-turn message histories, tool use, and server-side tools inside batch requests. What it does **not** provide is a live application round trip inside one batch request for client-executed tools: if Claude asks your application to run a client tool, continuation requires a later request. Tag every request with `custom_id`, preserve partial successes, and retry only failed work.

## 4.6 Designing Multi-instance and Multi-pass Review Architectures

### Key knowledge:
- Self-review limitations: the model retains its reasoning context and is less likely to challenge its own decisions
- Independent review instances (without generation context) are better at finding subtle issues
- Multi-pass review: per-file local analysis plus a cross-file integration pass to avoid attention dilution

### Key skills:
- Use a second independent Claude instance to review changes without generation context
- Split multi-file reviews into per-file passes plus integration passes for cross-file dataflow analysis
- Use verification passes with self-rated confidence to route reviews in a calibrated way

**Why a second instance beats self-review.** The session that generated code carries its own reasoning context and is therefore reluctant to challenge its decisions; an independent instance, given only the diff and the criteria, has no stake in the approach and finds what the author talked itself past. For many files, run a **per-file pass** for local issues and a separate **integration pass** for cross-file dataflow — a single pass over many files dilutes attention and inconsistently flags the same pattern. Route by self-rated confidence *only after* calibrating those scores on labeled data; uncalibrated confidence is the unreliable trigger this domain warns against.

---

<a id="domain-5-material"></a>\n\n# Domain 5: Context Management & Reliability (15%)

## 5.1 Managing Conversation Context to Preserve Critical Information

### Key knowledge:
- Risks of progressive summarization: numeric values, percentages, and dates get condensed into vague summaries
- Lost-in-the-middle effect: models reliably process the start and end of long inputs, but may miss findings from the middle
- Tool outputs can accumulate in context disproportionately to relevance (40+ fields when 5 are needed)
- The importance of sending the full conversation history in subsequent API requests

### Key skills:
- Extract transactional facts into a persistent “case facts” block outside the summarized history
- Trim verbose tool outputs down to relevant fields
- Place key findings at the beginning of aggregated data with explicit section headings
- Require subagents to include metadata (dates, sources) in structured outputs

**Where context actually leaks.** Three failure modes: progressive summarization drops numbers, percentages, and dates into vague prose (“about”, “roughly”); the **lost-in-the-middle** effect means findings buried in the middle of a long input get missed; and tool results accumulate (40 fields returned when 5 matter). Counter with a persistent **case-facts block** re-injected every turn, `PostToolUse` trimming of verbose results to the fields you need, and key findings placed at the *top* of any aggregated block.

**Prompt caching for repeated context.** When the same large content recurs across requests (a system prompt, a tool list, a long document), **prompt caching** reuses the work of processing it: add a `cache_control` breakpoint to a block and the content *up to and including* that breakpoint is cached for about an hour. The follow-up request must be **identical** up to the breakpoint or the cache misses. Cache where content is stable — tool schemas and the system prompt are the usual choices — and note the rules: a **minimum of 1024 tokens** to cache, breakpoints can span tools → system → messages in that join order, and up to **four** breakpoints total. Caching cuts latency and cost on repeated context; it is not a reliability tool.

**Files API and PDF/document content — move bulk out of the request.** Two API features keep large or repeated content from bloating every request. The **Files API** lets you upload a file (PDF, image, text, CSV) once and receive a **file ID** in a file-metadata object; later requests reference the file by ID inside the content block instead of re-encoding raw base64 each turn — the same file, referenced across many turns, is the context-efficiency counterpart to caching stable text. **PDF support** is a content-block matter: send a `document` block with `media_type: "application/pdf"` (and the file bytes or the file ID) rather than an `image` block; Claude reads the PDF’s text directly, which is what makes **Citations** (see 5.6) able to point at specific pages. The Files API also feeds the **code execution** tool: a `container_upload` block injects an uploaded file into the isolated container, and any plot or output Claude generates comes back as a file ID you download — bulk goes in by ID, results come out by ID, and nothing large is ever inlined twice.

## 5.2 Designing Effective Escalation Patterns and Resolving Ambiguity

### Key knowledge:
- Suitable escalation triggers: explicit request for a human, policy gaps/exceptions, inability to make progress
- Immediate escalation (explicit request) vs attempt-to-resolve (within agent scope)
- Sentiment analysis and model confidence self-ratings are unreliable proxies for case complexity
- Multiple customer matches require asking for additional identifiers, not heuristic guessing

### Key skills:
- Explicit escalation criteria with few-shot examples in the system prompt
- Execute explicit requests for a human immediately without additional investigation
- Escalate when policy is ambiguous or silent for a specific request
- Ask for additional identifiers when tool results contain multiple matches

**Triggers that hold up.** Escalate on explicit requests for a human (immediately, no investigation), policy gaps (the request is silent or ambiguous), and inability to make progress after a reasonable attempt. The unreliable triggers — sentiment and the model’s self-rated confidence — fail because mood and self-confidence do not track case complexity. For ambiguity in *data* (a search returns several customers), do not guess: ask for another identifier. For a multi-faceted complaint, acknowledge the emotion first, offer a concrete resolution, and escalate only if the customer reiterates the request for a human — a first expression of dissatisfaction is not the same as asking for a manager.

## 5.3 Implementing Error Propagation Strategies in Multi-agent Systems

### Key knowledge:
- Structured error context (failure type, query, partial results, alternatives) enables smarter coordinator recovery
- Distinguish access failures (timeouts require a retry decision) from valid empty results (no matches)
- Generic error statuses (“search unavailable”) hide valuable context from the coordinator
- Silent suppression or aborting the whole workflow on a single failure are both anti-patterns

### Key skills:
- Return structured error context: failure type, what was attempted, partial results, possible alternatives
- Distinguish access failures from valid empty results
- Perform local recovery in subagents for transient failures; propagate only non-recoverable errors with partial results
- Annotate coverage in synthesis: what is well-supported vs where gaps remain

**Propagate enough to recover.** A subagent error should hand the coordinator a decision: the failure type, the query that was attempted, any partial results, and alternative approaches. That lets the coordinator choose — retry with a narrower query, use the partial results, delegate elsewhere, or continue and annotate the gap. Distinguish an **access failure** (timeout → retry decision) from a **valid empty result** (no matches → nothing to retry); conflating them is the silent-suppression anti-pattern. Do local recovery (1–2 retries) inside the subagent for transient failures and propagate only what it cannot fix, always with partial results attached.

## 5.4 Managing Context Efficiently When Investigating Large Codebases

### Key knowledge:
- Context degradation in long sessions: the model starts producing unstable answers and referring to “typical patterns” instead of specific classes
- Scratchpad files preserve key findings across context boundaries
- Delegating to subagents isolates verbose discovery output
- Structured state persistence enables crash recovery

### Key skills:
- Spawn subagents for specific questions while keeping high-level coordination in the main agent
- Use scratchpad files to store key findings and reference them later
- Summarize key findings before spawning next-phase subagents
- Use `/compact` to reduce context usage during long investigations

**Spotting context degradation.** A long session is degrading when the model starts referring to “typical patterns” and generic class names instead of the specific code it was reading. At that point, stop re-deriving: write key findings to a **scratchpad file** and consult it instead of re-running discovery; delegate the verbose reading to a subagent and keep only its one-line summary in the main context; and use `/compact` to reclaim the window. For crash recovery, have each agent export its state to a known location and have the coordinator read a manifest on resume so it knows what is done, in progress, and not started.

## 5.5 Designing Workflows with Human Oversight and Confidence Calibration

### Key knowledge:
- Aggregate metrics (e.g., 97% overall accuracy) can mask poor performance on specific document types or fields
- Stratified random sampling measures error rates in high-confidence extractions
- Field-level confidence calibration using labeled validation sets
- Validate accuracy by document type and field segment before automating

### Key skills:
- Implement stratified random sampling to detect new error patterns
- Analyze accuracy by document type and field to validate stable performance
- Output field-level confidence scores and calibrate review thresholds using labeled data
- Route low-confidence or ambiguous-source extractions to human review

**Calibrate, then automate.** An aggregate 97% accuracy can hide 40% errors on one document type, so validate **by segment** — by document type and by field — not just overall. Output **field-level** confidence and tune the human-review threshold on labeled validation data; high confidence plus stable per-segment accuracy automates, low confidence or ambiguous sources route to a human. Keep auditing: stratified random sampling of even the high-confidence outputs catches new error patterns before they accumulate.

## 5.6 Preserving Provenance and Handling Uncertainty in Multi-source Synthesis

### Key knowledge:
- Attribution is lost during summarization without preserving “claim → source” mappings
- Structured mappings must be preserved during aggregation
- Handle conflicting statistics by annotating conflicts with attribution rather than arbitrarily choosing one value
- Include publication/collection dates to avoid misreading temporal differences as contradictions

### Key skills:
- Require subagents to output “claim → source” mappings (URL, document name, quotes)
- Structure reports to separate stable findings from disputed ones
- Preserve conflicting values with annotations and pass them to the coordinator for reconciliation
- Include publication dates for correct temporal interpretation
- Render content by type: financial data as tables, news as prose, technical findings as structured lists

**Keep the claim→source link, and cite.** Summarization severs attribution; require every claim to carry its source (URL, document name, quote). Claude’s **Citations** feature formalizes this for grounded answers: enabled on a document block, the response’s text blocks carry `citation_page_location` (or `citation_char_location` for plain text) with the cited text, document title, and start/end page — use it whenever a user must be able to verify where a fact came from.

**Conflicts and time.** When two sources disagree, preserve **both** values with their attribution and a `conflict_detected` flag rather than picking one — the difference may be methodology, not error. Always carry the publication/collection date: “10% (2023) vs 15% (2024)” is growth, not a contradiction. Render by content type — tables for financials, prose for news, structured lists for technical findings — so each kind stays auditable.

---

# Examples of Exam Questions with Explanations

## Example 1 (Scenario: Customer Support Agent)

**Situation:** Data shows that in 12% of cases the agent skips `get_customer` and calls `lookup_order` using only the customer’s name, which leads to incorrect refunds.

**Which change is most effective?**

- A) Add a programmatic precondition that blocks `lookup_order` and `process_refund` until an ID is obtained from `get_customer` **[CORRECT]**
- B) Improve the system prompt
- C) Add few-shot examples
- D) Implement a routing classifier

**Why A:** When critical business logic requires a specific tool sequence, software provides **deterministic guarantees** that prompt-based approaches (B, C) cannot. D addresses availability, not tool ordering.

---

## Example 2 (Scenario: Customer Support Agent)

**Situation:** The agent often calls `get_customer` instead of `lookup_order` for order-related questions. Tool descriptions are minimal and similar.

**What is the first step?**

- A) Few-shot examples
- B) Expand each tool’s description with input formats, examples, and boundaries **[CORRECT]**
- C) Add a routing layer
- D) Merge the tools

**Why B:** Tool descriptions are the model’s primary selection mechanism. This is the lowest-effort, highest-impact fix. A adds tokens without addressing the root cause. C is overengineering. D requires more effort than justified.

---

## Example 3 (Scenario: Customer Support Agent)

**Situation:** The agent resolves only 55% of issues with a target of 80%. It escalates simple cases and tries to handle complex policy exceptions autonomously.

**How do you improve calibration?**

- A) Add explicit escalation criteria with few-shot examples **[CORRECT]**
- B) Self-rated confidence (1–10) with automatic escalation
- C) A separate classifier trained on historical data
- D) Sentiment analysis

**Why A:** It directly addresses the root cause—unclear decision boundaries. B is unreliable (the model can be confidently wrong). C is overengineering. D solves a different problem (mood != complexity).

---

## Example 4 (Scenario: Code Generation with Claude Code)

**Situation:** You need a custom `/review` command for standard code review that is available to the whole team when they clone the repository.

**Where should you create the command file?**

- A) `.claude/commands/` in the project repository **[CORRECT]**
- B) `~/.claude/commands/`
- C) Root `CLAUDE.md`
- D) `.claude/config.json`

**Why A:** Project commands stored in `.claude/commands/` are version-controlled and automatically available to everyone. B is for personal commands. C is for instructions, not command definitions. D does not exist.

---

## Example 5 (Scenario: Code Generation with Claude Code)

**Situation:** You need to restructure a monolith into microservices (dozens of files, service-boundary decisions).

**What approach should you use?**

- A) Planning mode: explore the codebase, understand dependencies, design an approach **[CORRECT]**
- B) Direct execution incrementally
- C) Direct execution with detailed up-front instructions
- D) Direct execution and switch to planning when it gets hard

**Why A:** Planning mode is designed for large changes, multiple possible approaches, and architectural decisions. B risks expensive rework. C assumes you already know the structure. D is reactive.

---

## Example 6 (Scenario: Code Generation with Claude Code)

**Situation:** A codebase has different conventions across areas (React, API, database). Tests are co-located with code. You want conventions to be applied automatically.

**What approach should you use?**

- A) `.claude/rules/` files with YAML frontmatter and glob patterns **[CORRECT]**
- B) Put everything in the root CLAUDE.md
- C) Skills in `.claude/skills/`
- D) CLAUDE.md in every directory

**Why A:** `.claude/rules/` with glob patterns (e.g., `**/*.test.tsx`) enables automatic convention application based on file paths—ideal for tests spread across the codebase. B relies on model inference. C is manual/on-demand. D does not work well when relevant files are in many directories.

---

## Example 7 (Scenario: Multi-agent Research System)

**Situation:** The system researches “AI impact on creative industries,” but reports cover only visual art. The coordinator decomposed the topic into: “AI in digital art,” “AI in graphic design,” “AI in photography.”

**What’s the cause?**

- A) The synthesis agent does not detect gaps
- B) The coordinator decomposed the task too narrowly **[CORRECT]**
- C) The web search agent does not search thoroughly enough
- D) The document analysis agent filters out non-visual sources

**Why B:** The logs show the coordinator decomposed “creative industries” only into visual subtopics, completely missing music, literature, and film. Subagents executed correctly—the issue is what they were assigned.

---

## Example 8 (Scenario: Multi-agent Research System)

**Situation:** A web-search subagent times out while researching a complex topic. You need to design how error information is passed back to the coordinator.

**Which error propagation approach best enables intelligent recovery?**

- A) Return structured error context to the coordinator: failure type, query, partial results, and alternatives **[CORRECT]**
- B) Implement automatic retries with exponential backoff inside the subagent, then return a generic “search unavailable” status
- C) Catch the timeout inside the subagent and return an empty result set marked as success
- D) Propagate the timeout exception to a top-level handler that terminates the whole workflow

**Why A:** Structured error context gives the coordinator what it needs to decide whether to retry with a modified query, try an alternative approach, or continue with partial results. B hides context behind a generic status. C masks failure as success. D aborts the entire workflow unnecessarily.

---

## Example 9 (Scenario: Multi-agent Research System)

**Situation:** The synthesis agent often needs to verify specific claims while merging results. Currently, when verification is needed, the synthesis agent hands control back to the coordinator, which calls the web-search agent and then re-runs synthesis with the new results. This adds 2–3 extra round trips per task and increases latency by 40%. Your assessment shows that 85% of these checks are simple fact checks (dates, names, statistics), while 15% require deeper investigation.

**How do you reduce overhead while maintaining reliability?**

- A) Give the synthesis agent a limited `verify_fact` tool for simple checks, and continue routing complex verification through the coordinator **[CORRECT]**
- B) Accumulate all verification needs into a batch and return them to the coordinator at the end
- C) Give the synthesis agent full access to all web-search tools
- D) Proactively cache additional context around each source

**Why A:** This applies the principle of least privilege: the synthesis agent gets exactly what it needs for the 85% common case (simple fact checks) while preserving the coordinator-mediated path for complex investigations. B introduces blocking dependencies (later synthesis steps may depend on earlier verified facts). C breaks separation of responsibilities. D relies on speculative caching that cannot reliably predict needs.

---

## Example 10 (Scenario: Claude Code for Continuous Integration)

**Situation:** A pipeline runs `claude "Analyze this pull request for security issues"`, but hangs waiting for interactive input.

**What is the correct approach?**

- A) Use the `-p` flag: `claude -p "Analyze this pull request for security issues"` **[CORRECT]**
- B) Set `CLAUDE_HEADLESS=true`
- C) Redirect stdin from `/dev/null`
- D) Use `--batch`

**Why A:** `-p` (or `--print`) is the documented way to run Claude Code in non-interactive mode. It processes the prompt, prints to stdout, and exits. The other options are either non-existent features or Unix workarounds.

---

## Example 11 (Scenario: Claude Code for Continuous Integration)

**Situation:** The team wants to reduce API cost for automated analysis. Claude currently serves two workflows in real time: (1) a blocking pre-merge check that must complete before developers can merge a PR, and (2) a tech-debt report generated overnight for morning review. A manager proposes moving both to the Message Batches API to save 50%.

**How should you evaluate this proposal?**

- A) Use batch processing only for tech-debt reports; keep real-time calls for pre-merge checks **[CORRECT]**
- B) Move both workflows to batch processing and poll for completion
- C) Keep real-time calls for both to avoid ordering issues in batch results
- D) Move both to batch processing with a fallback to real time if a batch takes too long

**Why A:** The Message Batches API saves 50%, but processing time can be up to 24 hours with no guaranteed latency SLA. That makes it unsuitable for blocking pre-merge checks where developers are waiting, but ideal for overnight batch workloads like tech-debt reports.

---

## Example 12 (Scenario: Multi-file Code Review)

**Situation:** A pull request changes 14 files in an inventory tracking module. A single-pass review of all files produces inconsistent results: detailed comments for some files but superficial ones for others, missed obvious bugs, and contradictory feedback (a pattern is flagged as problematic in one file but approved in identical code in another file).

**How should you restructure the review?**

- A) Split into focused passes: analyze each file individually for local issues, then run a separate integration pass for cross-file data flows **[CORRECT]**
- B) Require developers to split large PRs into submissions of 3–4 files
- C) Switch to a higher-tier model with a larger context window to review all 14 files in one pass
- D) Run three independent full-PR review passes and report only issues found in at least two runs

**Why A:** Focused passes directly address the root cause—attention dilution when processing many files at once. Per-file analysis ensures consistent depth, and a separate integration pass catches cross-file issues. B shifts burden to developers without improving the system. C is a misconception: larger context does not fix attention quality. D suppresses real bugs by requiring consensus across inconsistent detections.

---

# Practical Exercises

## Exercise 1: Multi-tool Agent with Escalation Logic

**Goal:** Design an agent loop with tool integration, structured error handling, and escalation.

**Steps:**
1. Define 3–4 MCP tools with detailed descriptions (include two similar tools to test tool selection)
2. Implement an agent loop checking `stop_reason` (`"tool_use"` / `"end_turn"`)
3. Add structured error responses: `errorCategory`, `isRetryable`, description
4. Implement an interceptor hook that blocks operations above a threshold and routes to escalation
5. Test with multi-aspect requests

**Domains:** 1 (Agent architecture), 2 (Tools and MCP), 5 (Context and reliability)

---

## Exercise 2: Configuring Claude Code for Team Development

**Goal:** Configure CLAUDE.md, custom commands, path-specific rules, and MCP servers.

**Steps:**
1. Create a project-level CLAUDE.md with universal standards
2. Create `.claude/rules/` files with YAML frontmatter for different code areas (`paths: ["src/api/**/*"]`, `paths: ["**/*.test.*"]`)
3. Create a project skill under `.claude/skills/` with `context: fork` and `allowed-tools`
4. Configure an MCP server in `.mcp.json` with environment variables + a personal override in `~/.claude.json`
5. Test planning mode vs direct execution on tasks of different complexity

**Domains:** 3 (Claude Code configuration), 2 (Tools and MCP)

---

## Exercise 3: Structured Data Extraction Pipeline

**Goal:** JSON schemas, `tool_use` for structured output, validation/retry loops, batch processing.

**Steps:**
1. Define an extraction tool with a JSON schema (required/optional fields, enums with "other", nullable fields)
2. Build a validation loop: on error, retry with the document, the incorrect extraction, and the specific validation error
3. Add few-shot examples for documents with different structures
4. Use batch processing via the Message Batches API: 100 documents, handle failures via `custom_id`
5. Route to humans: field-level confidence scores, document-type analysis

**Domains:** 4 (Prompt engineering), 5 (Context and reliability)

---

## Exercise 4: Designing and Debugging a Multi-agent Research Pipeline

**Goal:** Subagent orchestration, context passing, error propagation, synthesis with source tracking.

**Steps:**
1. A coordinator with 2+ subagents (`allowedTools` includes `"Agent"` when delegation should be auto-approved; context is passed explicitly in prompts)
2. Run independent subagents concurrently and keep each prompt self-contained
3. Require structured subagent output: claim, quote, source URL, publication date
4. Simulate a subagent timeout: return structured error context to the coordinator and continue with partial results
5. Test with conflicting data: preserve both values with attribution; separate confirmed vs disputed findings

**Domains:** 1 (Agent architecture), 2 (Tools and MCP), 5 (Context and reliability)

---

# Appendix: Technologies and Concepts

| Technology | Key aspects |
|---|---|
| **Claude Agent SDK** | AgentDefinition, agent loops, `stop_reason`, hooks (PostToolUse), spawning subagents via the `Agent` tool, `allowedTools` |
| **Model Context Protocol (MCP)** | MCP servers, tools, resources, `isError`, tool descriptions, `.mcp.json`, environment variables |
| **Claude Code** | CLAUDE.md hierarchy, `.claude/rules/` with glob patterns, `.claude/commands/`, `.claude/skills/` with SKILL.md, planning mode, `/compact`, `--resume`, `fork_session` |
| **Claude Code CLI** | `-p` / `--print` for non-interactive mode, `--output-format json`, `--json-schema` |
| **Claude API** | `tool_use` with JSON schemas, `tool_choice` ("auto"/"any"/forced), `stop_reason`, `max_tokens`, system prompts |
| **Message Batches API** | asynchronous bulk requests, `custom_id`, tool use supported; client-side tool-result round trips require a later request |
| **JSON Schema** | Required vs optional, nullable fields, enum types, "other" + detail, strict mode |
| **Pydantic** | Schema validation, semantic errors, validation/retry loops |
| **Built-in tools** | Read, Write, Edit, Bash, Grep, Glob — purpose and selection criteria |
| **Few-shot prompting** | Targeted examples for ambiguous situations, generalization to new patterns |
| **Prompt chaining** | Sequential decomposition into focused passes |
| **Context window** | Token budgets, progressive summarization, "lost in the middle", scratchpad files |
| **Session management** | Resume, `fork_session`, named sessions, context isolation |
| **Confidence calibration** | Field-level scoring, calibration on labeled sets, stratified sampling |

---

# Out-of-Scope Topics

The following adjacent topics will **NOT** be on the exam:

- Fine-tuning Claude models or training custom models
- Claude API authentication, billing, or account management
- Detailed implementation in specific programming languages or frameworks (beyond what’s needed for tool/schema configuration)
- Deploying or hosting MCP servers (infrastructure, networking, container orchestration)
- Claude’s internal architecture, training process, or model weights
- Constitutional AI, RLHF, or safety training methodologies
- Embedding models or vector database implementation details
- Computer use (browser automation, desktop interaction)
- Image analysis capabilities (Vision)
- Streaming API or server-sent events
- Rate limiting, quotas, or detailed API cost calculations
- OAuth, API key rotation, or authentication protocol details
- Cloud-provider-specific configurations (AWS, GCP, Azure)
- Performance benchmarks or model comparison metrics
- Prompt caching implementation details (beyond knowing it exists)
- Token counting algorithms or tokenization specifics

---

# Learning loop

Use the dashboard sequence instead of reading the entire guide repeatedly:

1. **Diagnose** — use a weighted drill or domain drill to find a specific task statement that fails.
2. **Study** — return to that task statement in this guide and inspect the decision rule and examples.
3. **Explain** — state why the correct approach fits the constraint and why the nearest alternative fails.
4. **Apply** — complete the corresponding hands-on exercise or a new scenario question.
5. **Retrieve later** — re-test after a delay rather than immediately re-reading.
6. **Interleave** — once individual domains are stable, mix domains so the problem itself must cue the right strategy.
7. **Master** — proceed to full mocks only after repeated errors have stopped recurring.

A practice score is a training signal. Readiness depends on stable performance across task statements, the ability to explain trade-offs, and successful completion of the hands-on work.
