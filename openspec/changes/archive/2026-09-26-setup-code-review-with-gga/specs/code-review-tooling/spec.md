# code-review-tooling Specification (delta)

## Purpose

This delta introduces the `code-review-tooling` capability: project-local GGA (Gentleman Guardian Angel) configuration, project-local review rules, and a one-command setup script that installs the pre-commit hook on a fresh clone.

It does NOT introduce behavior — the tooling is configuration only. No production code, no tests, no domain / application / infrastructure touches.

## ADDED Requirements

### Requirement: Project-local GGA provider configuration lives in `.gga`

The repository MUST contain a `.gga` file at the repo root with the following baseline:

- `PROVIDER="claude"` (default; contributors can override globally via `~/.config/gga/config`).
- `FILE_PATTERNS="*.ts,*.tsx,*.js,*.jsx"` (project source).
- `EXCLUDE_PATTERNS="*.test.ts,*.spec.ts,*.test.tsx,*.spec.tsx,*.d.ts"` (skip tests + ambient types).
- `RULES_FILE="AGENTS.md"`.
- `STRICT_MODE="true"` (no silent passes on ambiguous responses).

#### Scenario: A fresh clone sees the same baseline review configuration as the team

- **WHEN** a contributor opens `.gga` at the repo root
- **THEN** the file declares the source patterns, the rules file, strict mode, and a default provider that can be overridden locally.

### Requirement: Project-local review rules live in `AGENTS.md`

The repository MUST contain an `AGENTS.md` at the repo root that the reviewer reads as the rules file. The file MUST cover, at minimum: the hexagonal dependency rule (presentation → application → domain; infrastructure implements `application/ports`; only `composition.ts` knows concrete adapters), the entity / strategy / state patterns, the presentation rules (no business logic, no direct store mutation, no `Date.now()` leaks, no barrels, compound components over boolean props), the OpenSpec workflow, the persistence rules (versioned JSON, command queue, no default empty state before hydration), the PRD §4 literal functional messages, and the "Reject If" guard-rails.

#### Scenario: The reviewer reads the architecture before flagging a violation

- **WHEN** GGA reviews a diff and finds, for example, a business-rule computation inside a React component
- **THEN** the rule that triggered the flag is one of the sections in `AGENTS.md`, traceable to the project's hexagonal contract.

### Requirement: `pnpm setup:review` installs the GGA pre-commit hook

The `package.json` MUST expose a `setup:review` script that runs `gga install` so a contributor can wire the pre-commit hook on a fresh clone with a single command.

#### Scenario: One command installs the hook

- **WHEN** a contributor runs `pnpm setup:review` after cloning
- **THEN** `gga install` succeeds and `.git/hooks/pre-commit` contains the `gga run || exit 1` block (or the equivalent GGA-provided hook body).

#### Scenario: Removing the hook is straightforward

- **WHEN** a contributor runs `gga uninstall` (or `pnpm setup:review` with a removal flag)
- **THEN** the pre-commit hook is removed and ordinary commits work again.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.
