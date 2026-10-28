# CLAUDE.md

Index: `README.md` (install, dev workflow, skeuo limits), `docs/adr/` (decisions and the rules they set), `GLOSSARY.md` (terms to use and avoid), `.claude/skills/run-facet` (drive the built showcase).

## Before committing

1. `bun run lint`, `bunx tsc -b`, `bun run test:visual`.
2. Drive the change end to end with the `run-facet` skill.

When a snapshot differs, show the diff and ask before running `--update-snapshots`.

## Conventions

- Write docs in Chinese; code comments and commit messages in English.
- Commit straight to `main`; no feature branches.
