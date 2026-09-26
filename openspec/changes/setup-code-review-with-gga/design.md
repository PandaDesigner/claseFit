## Context

The project has high architectural standards (hexagonal, strict TS, OpenSpec workflow) but no automated gate. Code review happens after commits land in the PR. The user wants a pre-commit review with rules that match the architecture.

GGA (`brew install gga`, Homebrew tap `gentleman-programming/tap`) is the chosen tool: provider-agnostic, configurable rules file (`AGENTS.md`), supports file-pattern filters, runs locally without network dependency on a remote service, integrates with git hooks.

## Goals / Non-Goals

**Goals:**

- One `pnpm` command (`pnpm setup:review`) installs the pre-commit hook.
- Project-local rules in `AGENTS.md` (no global config).
- File-pattern filter that focuses on the project's source (`*.ts, *.tsx, *.js, *.jsx`) and excludes test files / type declarations.
- Strict mode on by default so ambiguous AI responses fail the commit (no silent passes).

**Non-Goals:**

- No CI integration. The hook fires locally; CI is a follow-up.
- No auto-bump of the GGA formula. The user installs via Homebrew outside this PR.
- No review of test files or `.d.ts` declarations (excluded by pattern).
- No commit-msg hook — message discipline is enforced by review, not tooling.

## Decisions

### `.gga` lives at the project root

The project-level `.gga` file is the source of truth for which files GGA reviews and which provider it uses. It is committed to the repo so every contributor gets the same baseline. Per-developer provider override lives at `~/.config/gga/config` (global config); the project config wins on conflicts.

### `AGENTS.md` is the review rules file

GGA reads `RULES_FILE="AGENTS.md"` (configurable; default). Putting the rules at the repo root means the reviewer sees the same architecture / domain / presentation / OpenSpec standards the human reviewers already enforce. The file is a focused subset of `openspec/config.yaml` — what the reviewer needs to make judgement calls, not the full RFC / PRD history.

### File patterns match the project's source

```
FILE_PATTERNS="*.ts,*.tsx,*.js,*.jsx"
EXCLUDE_PATTERNS="*.test.ts,*.spec.ts,*.test.tsx,*.spec.tsx,*.d.ts"
```

TypeScript and JSX for the React Native source. Test files are excluded because they encode behavior already covered by `pnpm test`; reviewing them with AI adds latency without much signal. `.d.ts` declarations are excluded because they are ambient and not behavior-bearing.

### Strict mode on

`STRICT_MODE="true"` aborts commits when the AI response is ambiguous (e.g., JSON parse failure, missing severity tag). This matches the project's "no silent passes" posture — if the reviewer can't decide, the human reviewer (or the next `pnpm test` run) gets a chance.

### Hook lives outside git; script makes it reproducible

`.git/hooks/*` is intentionally not tracked by git (it is a per-clone local setting). To keep the team's experience consistent without forcing a husky / lefthook dependency, the project exposes:

```json
"scripts": {
  "setup:review": "gga install"
}
```

Every contributor runs `pnpm setup:review` once after `git clone`. Anyone who skips it just doesn't get the pre-commit gate; their PR review still enforces the same standards manually.

### Provider stays the user's choice

The committed `.gga` defaults to `PROVIDER="claude"`. Individual contributors can override globally with `~/.config/gga/config` or per-run with `gga run --no-cache`. The README and `AGENTS.md` document the available providers. We do NOT pin the provider in this PR — switching providers is a one-line config change, not a code change.

## Files to be created or modified

```
openspec/changes/setup-code-review-with-gga/
├── proposal.md
├── design.md
└── tasks.md

.gga                                (new — provider config, file patterns, strict mode)
AGENTS.md                           (new — review rules)
package.json                        (modified — adds scripts.setup:review)
```

No production code, no test changes, no domain / application / infrastructure touches.

## Affected ports

- None. `BookingRepository`, `BookingStateStore`, `Clock` are unchanged.

## TDD cycle per task

This is a tooling change, not behavior. No RED test required. Verification gates:
- `pnpm setup:review` exits 0 (install succeeds).
- `pnpm test`, `pnpm typecheck`, `pnpm lint` still green (no regressions).
- `pnpm dev` (or `pnpm test:watch`) still works after hook install.

## Risks

- **Provider not configured** — if a contributor runs `gga install` without setting up their provider CLI (e.g., `claude` / `opencode` / `gemini`), every commit aborts with a provider error. Mitigation: AGENTS.md and the README call out the per-provider setup steps; the hook can be removed with `gga uninstall` if needed.
- **Latency on local commits** — AI review can take 5–60 seconds per commit depending on diff size and provider. Contributors may want to skip with `git commit --no-verify` for trivial commits; this is left to personal workflow.
- **False positives blocking commits** — strict mode plus an opinionated reviewer can flag style nits as blocking. The team should treat a GGA failure as a review request, not a defect — fix what is real, ignore what isn't, and tune `.gga` / `AGENTS.md` over time.

## Verification

- `pnpm setup:review` runs `gga install` and exits 0
- `.git/hooks/pre-commit` contains the `gga run || exit 1` block
- `pnpm test` still 75/75 green (tooling-only change)
- `pnpm typecheck` clean
- `pnpm lint` 0 warnings