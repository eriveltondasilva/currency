# ANTIGRAVITY.md

## Git Commit Rules

- Use Conventional Commits
- Keep commits atomic
- Never create vague commit messages
- Explain WHY the change exists
- Mention affected modules
- Group related changes only

## Commit Format

type(scope): short summary

Examples:

feat(auth): add JWT refresh token flow
fix(api): prevent duplicated user creation
refactor(ui): simplify dashboard sidebar state
perf(images): optimize avatar lazy loading

## Rules

- Subject max 72 chars
- Use imperative mood
- No generic messages like:
  - update code
  - fixes
  - changes
  - improvements

## Commit Body

Include:

- what changed
- why
- possible side effects

## Before committing

- Run tests
- Run lint
- Check build
