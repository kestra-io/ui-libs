# Coding Agent Guidelines for kestra-io/ui-libs

**⚠️ This repository is sunsetting.** All components have been moved into the
[design system](https://github.com/kestra-io/kestra/tree/develop/ui/packages)
of the Kestra OSS repository. We are no longer accepting pull requests from
external contributors. Please open issues and feature requests in the
[main Kestra repository](https://github.com/kestra-io/kestra/issues) instead.

New versions may still be released if required to support a previous Kestra LTS release.

## Where the code lives now

| What | Location |
|------|----------|
| Design system components | [`ui/packages/design-system`](https://github.com/kestra-io/kestra/tree/develop/ui/packages/design-system) |
| Topology components | [`ui/packages/topology`](https://github.com/kestra-io/kestra/tree/develop/ui/packages/topology) |

## This repository

Vue 3 component library previously shared between the Kestra UI and the docs site.

**Tech stack:** Vue 3, TypeScript, Vite, Vitest, Storybook

## Guidelines

- **Surgical changes only** — touch only what is strictly necessary.
- **No new features** — this repo only accepts bug fixes or patches required for LTS compatibility.
- **Build and test before finishing** — run `npm run build` and `npm run test`.
- **Type-check** — run `npm run build:types` and fix all errors before pushing.

## Commands

```bash
npm run build        # production build
npm run build:types  # type declarations
npm run watch        # rebuild on change (for local linking)
npm run test         # run tests
npm run lint         # lint
npm run storybook    # component development (local only, not published)
```
