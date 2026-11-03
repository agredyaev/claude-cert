# foundation

## f1-004 · D1 · 1.5 · factors=0
S: An architect's agent calls three MCP tools that each return timestamps in a different format: Unix epoch integers, ISO 8601 strings, and numeric status codes mixed with dates. The model frequently misreads these inconsistent formats when reasoning about order history.
Q: Which hook design correctly normalizes the data before the model ever sees it?
- A: Register a PreToolUse hook matched to the three MCP tools that intercepts the call, rewrites any timestamp field in tool_input to ISO 8601 format, ensuring each MCP server receives a pre-normalized request payload.
* B: Register a PostToolUse hook matched to the three MCP tools that parses each tool's response and returns hookSpecificOutput.updatedToolOutput with values rewritten into one consistent format.
- C: Register a Notification hook for the three MCP tools that parses each tool invocation's returned message field for date-like substrings, converts them into ISO 8601 format, and republishes a normalized summary to the transcript.
- D: Add a system prompt instruction directing Claude to convert all timestamps and status codes from the three MCP tools into a single consistent ISO 8601 format before reasoning about order history.

## f1-042 · D1 · 1.7 · factors=2
S: An architect is designing a serverless pipeline where each stage runs in a fresh, short-lived container and cannot guarantee access to any previous container's local disk. The pipeline still needs later stages to act on the conclusions of an earlier stage's investigation.
Q: Which strategy best fits this constraint?
* A: Capture the earlier stage's key results as application state and pass them into a new session's opening prompt
- B: Pass the earlier stage's session ID to resume in the next container and expect the transcript to be found automatically
- C: Set fork_session=True in the next container so it branches from the earlier stage's session ID directly
- D: Rely on claude --continue in the next container to pick up the most recent local session automatically

## f1-009 · D1 · 1.5 · factors=5
S: An Agent SDK application uses a PreToolUse hook to enforce a hard policy: an issue_refund call above $500 must never execute, and no approval prompt may be shown at call time. The hook returns permissionDecision: 'deny' with the generic permissionDecisionReason "Refund denied", and the agent responds by retrying the identical issue_refund call instead of using the available escalate_refund tool.
Q: Which change best stops the retry loop while keeping the hook the deterministic gate?
* A: Keep permissionDecision: 'deny' and rewrite permissionDecisionReason to state the $500 limit and name escalate_refund as the next step for the agent.
- B: Move the amount check to a PostToolUse hook that lets the refund execute and then issues a compensating reversal transaction whenever the amount exceeded $500.
- C: Return permissionDecision: 'ask' so that a reviewer approves or rejects each refund above $500 interactively at the moment the agent makes the tool call.
- D: Return permissionDecision: 'allow' together with an updatedInput that swaps the issue_refund call for a harmless no-op call so the tool call reports success.

## f2-004 · D2 · 2.4 · factors=0
S: A contributor clones a team repository that includes a checked-in .mcp.json defining a deploy-tools server. They open the project in Claude Code for the first time and run claude mcp list.
Q: What should they expect to see for deploy-tools before they take any further action?
- A: It connects immediately and silently, because checking a server into .mcp.json is itself treated as implicit approval from every contributor who clones the repo
- B: It fails to load at all, because project-scoped servers only activate for the teammate who originally added them via claude mcp add --scope project
- C: It is renamed automatically with a numeric suffix, because Claude Code assumes any newly cloned .mcp.json server name conflicts with an existing one
* D: It appears as pending approval, because project-scoped servers from .mcp.json require the contributor to explicitly approve them before Claude Code connects

## f2-053 · D2 · 2.2 · factors=1
S: A charge_card MCP tool receives a request with an amount field formatted as "$45.00" instead of a numeric type as specified by its input schema.
Q: Before the tool's handler logic even runs, how does the MCP client typically surface this failure, and how should that differ from the tool later reporting a declined charge?
- A: Both failures are reported identically as JSON-RPC protocol errors with code -32602 (Invalid params), because the client validates the request against the schema before calling the tool handler.
- B: Both failures are reported inside a tool result with isError:true, because protocol errors are reserved for unknown tool names; all other issues, like malformed arguments or declined charges, appear as tool-level errors.
* C: The malformed argument triggers a JSON-RPC protocol error from schema validation before the tool executes, while a declined charge is reported inside the tool result with isError:true.
- D: The client silently coerces the malformed argument to a number before invocation, so neither a schema validation error nor a declined charge occurs; the handler receives a valid amount, and any decline is a business result.

## f2-018 · D2 · 2.3 · factors=5
S: A synthesis agent frequently needs to confirm a single numeric claim (e.g. a statistic cited in a source) before including it in a final answer, but it is not equipped to resolve deeper factual disputes between conflicting sources.
Q: Following the guidance on scoped cross-role tools for high-frequency needs, how should the team design this?
- A: Give the coordinator agent a verify_fact tool but not the synthesis agent, so that the synthesis agent must send every numeric claim to the coordinator for verification and wait for the result.
- B: Give the synthesis agent the full research agent tool set, enabling it to independently verify any numeric claim and resolve source discrepancies without coordinator intervention.
- C: Give the synthesis agent no verification tools at all, and require every numeric claim to be manually checked by the coordinator before inclusion in the final answer, regardless of complexity.
* D: Give the synthesis agent a narrow verify_fact tool for quick single-claim checks, and have it refer cases with conflicting sources to the coordinator for deeper resolution.

## f3-005 · D3 · 3.5 · factors=0
S: An architect asks Claude Code to "normalize phone numbers to a standard format" across a customer database. After two rounds of correction, Claude is still inconsistently formatting extensions and international codes.
Q: What should the architect do to communicate the transformation more effectively?
- A: Split the normalization rules into separate sections for domestic numbers, international codes, and extensions, each described with exhaustive prose detail rather than examples.
- B: Ask Claude to research five phone-number libraries, extract the formatted output each produces for sample international numbers, and adopt the most frequent convention as the standard.
* C: Provide 2-3 concrete input/output pairs covering domestic, international, and extension cases so Claude can infer the exact rule from examples alone, not prose.
- D: Repeat the original instruction but prepend each rule with all-caps modifiers like IMPORTANT and MUST so that Claude gives the normalization task greater weight.

## f3-083 · D3 · 3.3 · factors=1
S: A developer has both a personal rule at ~/.claude/rules/formatting.md (no paths field) and their team's project rule at ./.claude/rules/formatting.md (no paths field) with conflicting formatting guidance. Both load unconditionally.
Q: According to Claude Code memory documentation, how should the developer understand load order and conflict resolution?
* A: User-level rules load before project rules, so when the two conflict, the project rule wins. Claude gives it priority for loading later, not for being more specific.
- B: User-level rules under ~/.claude/rules/ are ignored whenever a project defines a rules file with the same name, so only the project's formatting.md file ever loads.
- C: User-level rules load before project rules, and project rules win any conflict, but only because project-level guidance is inherently more specific than personal guidance.
- D: Project rules load before user-level rules, so the personal formatting.md file takes higher priority over the team's shared project guidance.

## f3-057 · D3 · 3.6 · factors=5
S: A DevOps engineer wants a locked-down CI runner where Claude Code can only use a small, explicitly-approved set of read-only commands and anything else causes the run to abort rather than prompt, since no human is present to answer a permission prompt.
Q: Which configuration best matches this requirement?
- A: Set --max-turns to 1, limiting Claude to one tool call so no command needing approval is ever reached and the run completes entirely without any prompts.
* B: Set the permission mode to dontAsk, which denies anything not covered by permissions.allow rules or the built-in read-only command set without prompting.
- C: Omit --allowedTools entirely, rely on the default interactive permission prompt to block unapproved commands, and set a short timeout so the run aborts when no one confirms.
- D: Set the permission mode to acceptEdits, so file writes and common filesystem commands get automatic approval, and the CI run continues without pausing.

## f4-008 · D4 · 4.6 · factors=0
S: A function signature changes in module A, and callers in modules B and C are updated inconsistently, causing a runtime mismatch. Per-file passes each judged their own file correct in isolation and missed the mismatch.
Q: Which review step should have caught this, and why?
- A: The self-review step performed by the generator, since it still remembers why it changed the signature and can check callers from memory
- B: A second per-file pass over module A alone, since re-reading the same file twice increases the chance of noticing the signature change
* C: The cross-file integration pass, because it traces data flow and interface usage across files rather than analyzing each file alone
- D: A longer per-file pass that reads both module A and module B together in one sitting rather than as two separate local passes

## f4-035 · D4 · 4.2 · factors=2
S: An agent has both a search_docs tool and a search_code tool available. For requests that could plausibly be answered by either tool, such as 'where is the rate limit defined,' the agent picks inconsistently between them across similar sessions. The team wants the agent to make a consistent, well-reasoned choice for this class of ambiguous request.
Q: What is the most effective change?
- A: Add a routing step that always calls search_docs first and only falls back to search_code if no results are returned.
- B: Rename the two tools to be more visually distinct (e.g., docs_lookup and code_search) to reduce the chance of confusion.
- C: Expand each tool's natural-language description with more adjectives that characterize its typical use cases.
* D: Provide input_examples in the tool definitions that demonstrate for the same ambiguous request which tool should be selected and why.

## f4-072 · D4 · 4.4 · factors=8
S: A utility-bill extraction pipeline has logged the following four distinct failed extractions: 1. The meter_reading value was extracted correctly but placed under billing_address instead of the usage_details object. 2. The account_holder_phone field is blank because no phone number appears anywhere on the scanned bill provided so far. 3. The prior_year_comparison figure is missing because it only appears in an annual letter never supplied to the pipeline. 4. The service_address field holds the mailing address because that is the only address printed on this particular bill.
Q: Which of these is the one most likely to be fixed by an error-feedback retry, as opposed to requiring a different source document or human escalation?
* A: The meter_reading value was extracted correctly but placed under billing_address instead of the usage_details object
- B: The account_holder_phone field is blank because no phone number appears anywhere on the scanned bill provided so far
- C: The prior_year_comparison figure is missing because it only appears in an annual letter never supplied to the pipeline
- D: The service_address field holds the mailing address because that is the only address printed on this particular bill

## f5-001 · D5 · 5.2 · factors=0
S: A streaming service agent looks up a customer to resolve a billing question and finds two profiles sharing the same email domain and last name, consistent with a family plan. Usage data shows one profile is far more active than the other.
Q: What should the agent do?
- A: Merge billing details from both profiles to answer the question without confirming which one applies
- B: Select the profile with the earlier account creation date, since it is likely the primary plan holder
- C: Select the more active profile, since higher usage suggests it belongs to the customer who initiated contact
* D: Ask the customer for an additional identifier, such as the last four digits of the payment card on file

## f5-044 · D5 · 5.4 · factors=1
S: An architect needs to understand how a refund flow touches the payments, ledger, and notification services before proposing a redesign. The main agent should stay focused on synthesizing the redesign proposal rather than tracing every function call itself.
Q: How should the architect structure this investigation?
- A: Ask the main agent to guess at the refund flow's dependencies based on similar flows it recalls from other codebases.
* B: Delegate a subagent with the bounded question of tracing refund flow dependencies across the three services and report a distilled summary.
- C: Have the main agent open every file in the three services one at a time and keep each file's full contents in the conversation.
- D: Spawn a subagent with no specific instructions at all and simply let it independently decide which parts of the codebase are relevant to refunds.

## f5-077 · D5 · 5.6 · factors=4
S: A coordinator agent receives structured claim-source mappings from four subagents researching the same topic from different angles. During merging, several claims are near-duplicates reported by multiple subagents with slightly different wording, and the supporting source citations are not identical across the reports.
Q: What is the best way to merge these without losing provenance?
- A: Keep only the version of the claim reported by the subagent that produced its output first, discarding the duplicates
- B: Delete all but one occurrence of the claim and drop its source citations, since the claim is now well established
- C: Rewrite the duplicate claims into a single new sentence that references none of the original subagents' citations
* D: Consolidate the duplicates into one entry while retaining the full set of source citations that support it
# professional

## p1-003 · D1 · 1.4 · factors=0
S: You ask your main agent to delegate a task to a subagent, expecting it to already know which file had the bug and what error message appeared earlier in the conversation. The subagent responds asking for that information again.
Q: Why did this happen, and what should you do?
- A: The subagent inherited the parent's tools but not its system prompt, so providing context requires a tools configuration that includes the file path and error message as tool inputs.
- B: The subagent ran in background mode, which strips file paths and error messages from any prompt passed to it, so switching to interactive mode preserves the file and error message.
- C: The subagent's session was not resumed correctly, so the fix is to pass the parent's session ID into the subagent's resume call to restore the conversational state.
* D: The subagent context starts fresh, lacking parent conversation history. You must include the file path and error message directly in the delegation prompt.

## p1-031 · D1 · 1.6 · factors=6
S: A customer-support chatbot must answer high volumes of routine account questions in under a second per response, and the product team's success metric is purely response latency at a sustainable per-ticket cost.
Q: Which model choice best aligns the architecture with this performance SLA and cost pillar?
* A: Start with Claude Haiku 4.5, the fastest current model with near-frontier intelligence at the lowest per-token price
- B: Start with Claude Opus 4.8 in fast mode, since fast mode delivers up to 2.5x higher output speed at premium pricing
- C: Start with Claude Sonnet 5 and disable adaptive thinking entirely to remove all reasoning latency from every response
- D: Start with Claude Fable 5, since its 1M token context window allows the entire support knowledge base to load per request

## p2-001 · D2 · 2.5 · factors=0
S: A developer is deciding what to mark with cache_control in a Messages API request that includes tool definitions, a system prompt, multi-turn message history with images, and citation-enabled document blocks.
Q: Which of the following are directly cacheable? (Select 3.)
* A: The tools array that holds the tool definitions Claude can call
- B: Thinking blocks marked directly with their own cache_control entry
* C: Message content blocks like text, images, and tool results
- D: Empty text blocks inserted as placeholders between conversation turns
* E: The system array that holds Claude's fixed instructions
- F: Citation sub-content blocks nested inside a cached document block

## p2-034 · D2 · 2.1 · factors=8
S: A platform team is designing a long-horizon agentic workflow where a fast, lower-cost model executes routine steps while a separate higher-intelligence model periodically provides strategic guidance mid-generation, without replacing the executor entirely. They also want to reduce latency and token consumption when the executor calls many tools inside a code execution container, and they want thousands of tool definitions to be discoverable without loading them all into context up front.
Q: Which set of platform features addresses these three needs respectively? (Select 3.)
- A: Batch processing is the documented mechanism that pairs a fast executor model with a separate strategic-guidance model batched mid-generation for complex long-horizon agentic workflows.
* B: Tool search scales to the thousands of tools by dynamically discovering and loading tools on-demand using regex-based search, enabling discovery without loading tool definitions.
* C: Programmatic tool calling enables Claude to call tools programmatically from within code execution containers, reducing latency and total token consumption for multi-tool workflows.
- D: Prompt caching is the documented mechanism for discovering and loading thousands of tool definitions on demand, enabling fast access without loading all definitions into context.
* E: The advisor tool pairs a faster executor model with a higher-intelligence advisor model that provides strategic guidance mid-generation for complex long-horizon agentic workloads.

## p3-002 · D3 · 3.8 · factors=0
S: An enterprise agent aggregates tool catalogs from GitHub, Slack, Sentry, Grafana, and Splunk MCP servers, and the combined tool definitions consume about 55,000 tokens before the agent does any work.
Q: Which strategy best addresses this context bloat?
* A: Enable tool search so Claude discovers and loads only the three to five tools relevant to each request instead of loading every definition upfront.
- B: Manually rewrite every MCP server's tool descriptions into single short sentences so the combined definitions shrink below the fifty-five thousand token total.
- C: Apply prompt caching to the tool definitions so repeated requests skip re-sending the fifty-five thousand tokens on every subsequent turn.
- D: Ask the model provider to raise the context window limit so all fifty-five thousand tokens of definitions fit alongside the rest of the conversation.

## p3-028 · D3 · 3.3 · factors=6
S: A team building a codebase-analysis tool debates whether to send an entire multi-million-token monorepo in every request context versus retrieving only the relevant files per query. Latency and cost are growing concerns as the corpus grows, while answer accuracy on multi-file reasoning tasks must stay high.
Q: What is the most defensible configuration decision?
- A: Reduce the effort parameter to low while still sending the full monorepo context, since a lower effort setting reduces processing time per token, counteracting the latency of a larger context and making overall request latency similar to a smaller prompt while keeping all files available.
- B: Split the monorepo into arbitrary fixed-size chunks and send a different chunk on each request in rotation, since this distributes latency across requests while still keeping any single request short, and over multiple requests each file gets an equal chance to be included.
- C: Always include the full monorepo up to the model's context window on every request, since providing maximum available context ensures that the model can reason across all inter-file dependencies that a query might require, avoiding the risk of missing necessary context.
* D: Retrieve and include only the files relevant to each specific query rather than the full corpus, since larger contexts increase both processing latency and cost while unrelated content adds no accuracy benefit and can dilute relevant signal.

## p4-004 · D4 · 4.2 · factors=0
S: An evaluator is designing a mixed-methodology test framework for a Claude-based tool that (1) extracts a structured JSON record of invoice fields, and (2) writes a short natural-language summary explaining any discrepancies it found.
Q: Which combination of grading methods appropriately matches each part of the tool's output? (Select 3.)
* A: ROUGE-L scoring between the discrepancy summary and a small set of reference summaries, since references are available
- B: A single fixed pass/fail check requiring the tool to respond in under one second, used as the sole grading method for both outputs
* C: An LLM-based grader rating the discrepancy summary against a rubric for clarity and completeness, since it is open-ended prose
- D: Embedding-based cosine similarity between the JSON field values and the invoice PDF's raw text, used as structural validation
* E: Exact-match or field-level string comparison against a labeled ground-truth JSON record, for the structured field extraction

## p4-055 · D4 · 4.1 · factors=8
S: An analytics team runs a nightly job that classifies hundreds of thousands of customer reviews using the Batch API, which is not latency-sensitive but must stay within a fixed monthly compute budget. They want a cost metric that reflects the actual production spend, not just per-call list pricing.
Q: Which approach best defines an appropriate cost metric for this workload?
- A: Track the 95th-percentile response time per request to ensure the batch completes before the next business day
- B: Track the cosine similarity between outputs for paraphrased versions of the same review
* C: Track total spend per batch run, factoring in the batch-processing discount, against a defined monthly budget ceiling
- D: Track the F1 score of the classifier against a held-out labeled sample of reviews

## p5-001 · D5 · 5.5 · factors=0
S: During a red-team exercise on a Claude-based loan-eligibility assistant, testers find that the assistant's explanations for declining an application vary in specificity depending on how the applicant phrases their question, even when the underlying facts are identical.
Q: Which response best addresses the ethical concern this raises?
- A: Add a disclaimer stating explanations may vary by applicant, then leave the underlying prompt behavior that produced the inconsistency unchanged.
* B: Standardize the explanation prompt so decline rationales cite the same categories of decision factors regardless of wording, then re-test across phrasing variants.
- C: Disable explanations for every declined application, since removing the rationale entirely also removes any risk of inconsistent wording between applicants.
- D: Give the most detailed explanation only to applicants who explicitly ask for one, leaving everyone else with a short generic decline message instead.

## p5-027 · D5 · 5.3 · factors=6
S: A safety team reviewing Anthropic's approach to human oversight in agentic systems notes that requiring a human to approve every single tool call quickly becomes unsustainable at scale, and at hundreds of actions per session reviewers begin rubber-stamping without real scrutiny.
Q: Which strategy reflects Anthropic's documented approach to keeping human review meaningful without triggering this kind of consent fatigue?
- A: Keep prompting for every tool call regardless of risk level, and address reviewer fatigue by shortening each prompt's text to a single-sentence summary of the proposed action, allowing reviewers to approve actions faster without reading the full context of the request.
- B: Remove human approval from the workflow entirely once the agent has completed a fixed number of sessions without an incident, such as 50 consecutive error-free sessions, and instead rely on an automated audit log that flags only statistically anomalous tool calls based on accumulated session history.
* C: Combine automated defense-in-depth safeguards, such as classifiers and permission rules that auto-resolve low-risk routine actions, with escalation to human reviewers reserved for ambiguous, high-stakes, or edge-case decisions that genuinely need judgment.
- D: Rotate the reviewer assigned to approve each tool call throughout the session, using a round-robin schedule among reviewers, on the assumption that fresh reviewers approve more carefully than one reviewer who has already approved many prior calls, such as swapping reviewers after every few actions.

## p6-002 · D6 · 6.5 · factors=0
S: Before any prompts are written, a consulting team meets with a client to scope a document-classification assistant.
Q: Which activity most correctly belongs in the discovery phase of the engagement?
- A: Configuring prompt caching and batch processing to minimize the client's token costs
* B: Defining the use case, measurable success criteria, and an evaluation set for later validation
- C: Writing the production deployment runbook the client's support team will follow at launch
- D: Selecting the final production model and locking the system prompt before requirements exist

## p6-043 · D6 · 6.3 · factors=7
S: A customer stakeholder in a real-time, latency-sensitive product wants a contractual guarantee that their requests will maintain low latency and available throughput even during periods of high overall platform demand, before they will sign off on the SLA.
Q: Which Anthropic mechanism is most directly relevant to raise as part of meeting this expectation?
- A: The retry-after response header, which specifies the retry delay and serves as Anthropic's documented mechanism for guaranteeing low latency during peak demand, should be referenced in the contractual SLA.
* B: Priority Tier provides dedicated rate limit headers for priority input/output tokens, separate from standard limits, guaranteeing low latency and throughput during high demand when included in the SLA.
- C: The Message Batches API, which processes requests in batches to reduce overhead and guarantees the lowest possible latency for any workload during peak platform demand, should be adopted for the SLA.
- D: Extended thinking, which exposes step-by-step reasoning and determines whether requests are deprioritized during high demand, should be included in the contractual SLA to guarantee low latency and throughput.

## p7-009 · D7 · 7.3 · factors=0
S: A custom subagent that runs a full integration test suite stops midway and Claude Code reports "Agent terminated early due to an API error: You've hit your session limit · resets 3:45pm". The main conversation is otherwise healthy.
Q: What is the correct way to handle this?
- A: Restart Claude Code entirely, since a subagent failure of this kind corrupts the parent session's conversation state.
* B: Wait until the session limit resets at the time shown, then ask Claude to retry the task or resume the subagent from where it stopped.
- C: Switch the subagent's model to a smaller one with /model, since session limits apply per model with a separate allowance.
- D: Run /rewind on the main conversation to undo the subagent invocation, since resetting the session limit requires clearing recent turns.

## p7-025 · D7 · 7.2 · factors=7
S: A team wants Claude Code to automatically fix flaky tests across their monorepo, with strong guardrails: destructive git operations must always require human approval, all edits should be logged for audit, and heavy log-searching work should not bloat the main session's context.
Q: Which combination of features addresses these three needs? (Select 3)
- A: The Agent tool with unrestricted access, letting the subagent fix tests and search logs, and requiring approval only for destructive git operations.
* B: A permissions.ask rule scoped to destructive Git commands, such as git reset, that forces Claude to prompt for confirmation before running them, in every permission mode.
* C: A PostToolUse hook that appends every Edit and Write tool call to an audit log file, ensuring all changes are recorded for review.
- D: A CLAUDE.md file listing the testing framework and layout, requiring approval for destructive git commands, and spawning a subagent for log searches.
* E: A subagent dedicated to searching logs and test output returns a concise summary to avoid cluttering the main session's context.
- F: The bypassPermissions permission mode for uninterrupted test fixing, along with an audit-logging hook and a log-search subagent.
