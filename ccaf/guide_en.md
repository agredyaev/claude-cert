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

# Architect decision rules

Use these as routing rules, not as slogans. The task statement and scenario constraint still decide the answer.

| Decision | Prefer | Reject when |
|---|---|---|
| Deterministic guarantee vs prompt guidance | Code, hooks, permissions, or preconditions for rules that must always hold | A prompt is being used to enforce a financial, security, legal, or safety invariant |
| Workflow vs agent | Workflow when the steps are known; agent when the path must be discovered dynamically | An agent is adding flexibility to a sequence you can already enumerate |
| Tool surface | The smallest tool set and narrowest capability that completes the task | Monitoring or confirmation is being used instead of removing unnecessary capability |
| Multi-agent decomposition | Independent, bounded work with explicit contracts and a coordinator that reconciles coverage | Subagents share hidden state, duplicate work, or return results with no completeness check |
| Structured output | Schema/tool enforcement plus validation and retry when downstream code depends on shape | Free-form text is parsed as if it were a contract |
| Context management | Preserve decision-critical facts, provenance, state, and uncertainty; discard bulk that can be recovered | Summaries erase numbers, dates, ownership, or source-level disagreement |
| Error handling | Propagate typed failure information and recover at the narrowest boundary | A failed subtask is silently dropped or converted into a confident final answer |
| Human review | Gate irreversible/high-consequence actions; sample lower-risk work by uncertainty and impact | A blanket human review step is added without a risk rule, or a risky action has no approval boundary |
| Architecture complexity | The simplest pattern that satisfies quality, reliability, latency, cost, and governance constraints | Multi-agent/RAG/agentic machinery is chosen because it is more sophisticated rather than necessary |
| Evaluation | Explicit success criteria, representative cases, and re-runs after every material change | A design change is accepted because an example "looks better" |

## Constraint-first reasoning

For every scenario, identify these before reading the options:

1. **What must be true?** The non-negotiable requirement.
2. **What failed?** The observed symptom or failure mode.
3. **Which boundary owns the failure?** Prompt, model, retrieval, tool, orchestration, policy, context, or human process.
4. **What is reversible?** Reversibility determines how much autonomy is safe.
5. **What is the smallest structural fix?** Prefer a fix at the failing boundary over monitoring, warnings, or downstream cleanup.
6. **What trade-off is explicitly named?** Quality, latency, cost, reliability, safety, or operability.

---

# Domain material


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

> **Exam snapshot vs current Claude Code.** The CCAR-F Exam Guide v1.0 names both custom slash commands and Skills. Current Claude Code has merged custom commands into Skills: a project Skill lives at `.claude/skills/<name>/SKILL.md` and can be invoked as `/<name>`. Existing Markdown files under `.claude/commands/` still work as a legacy command format, but current documentation recommends Skills for new reusable workflows.

### Key knowledge:
- **Current project workflow:** `.claude/skills/<name>/SKILL.md`, committed with the repository when the team should share it
- **Current personal workflow:** `~/.claude/skills/<name>/SKILL.md`
- **Legacy/exam-snapshot format:** `.claude/commands/<name>.md` still creates the same slash-invoked command, but lacks the richer supporting-file structure of a Skill
- Skill frontmatter can control invocation, tool access, argument hints, and isolated subagent execution
- `context: fork` isolates verbose work from the main session; `allowed-tools` constrains the capability surface

### Key skills:
- Prefer a project Skill for a new reusable team workflow; recognize `.claude/commands/` when the exam or an existing repository uses the older format
- Choose project vs personal scope from who should receive the workflow, not from where it was first authored
- Use isolation when verbose intermediate work should not consume the main context
- Restrict tool access when the workflow contract does not require mutation or shell execution

**Skill packaging.** A Skill is a directory centered on `SKILL.md`, with optional references and scripts. Only the description is needed for discovery; the body and supporting material load when the Skill is used. A concise trigger and narrow capability boundary are therefore part of the architecture, not cosmetic metadata. Legacy command files remain relevant for compatibility and exam-snapshot questions, but new reusable procedures should be modeled as Skills.

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

# Wording and decision traps

These are reading checks, not shortcuts. Use them to identify the constraint the item is testing.

| Stem signal | What to do | Common wrong move |
|---|---|---|
| **FIRST / NEXT** | Identify the current lifecycle or diagnostic stage before choosing an action | Choosing a good action that belongs later |
| **BEST / MOST appropriate** | Assume several options may work; rank them against the stated constraint | Picking the most sophisticated or comprehensive option |
| **ROOT CAUSE / underlying issue** | Fix the failing boundary, not the symptom | Adding retries, logging, or review around a structural defect |
| **MUST / guarantee / always** | Look for deterministic enforcement | Relying on prompt wording for an invariant |
| **MINIMIZE cost / latency / risk** | Preserve the required quality/safety bar, then optimize the named axis | Optimizing the wrong axis or degrading the requirement itself |
| **Immediately after a change** | Inspect the changed layer and its dependencies first | Blaming the model before checking retrieval, prompts, config, or permissions |
| **WITHOUT / cannot / prohibited** | Treat it as a hard exclusion | Choosing an otherwise-good option that violates the explicit prohibition |
| **Select N** | Evaluate every option independently against the constraint | Selecting every plausible statement instead of exactly the requested set |
| **Production / enterprise / regulated** | Check ownership, observability, failure handling, least privilege, and evidence | Solving only the happy-path model interaction |
| **Irreversible / high consequence** | Put a human or deterministic control before the action | Reviewing only after the action occurs |

The strongest distractors are usually **reasonable practices applied at the wrong boundary, at the wrong time, or with the wrong strength of guarantee**.

---

# Hands-on labs


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
