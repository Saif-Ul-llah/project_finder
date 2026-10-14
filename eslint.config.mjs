import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// `pnpm lint` existed in package.json long before eslint was a dependency, so
// it could never run — while the source already carried
// `eslint-disable-next-line` comments written in the expectation that it did.
// This is the config that makes the script real.
//
// Flat config via the native exports, not @eslint/eslintrc's FlatCompat:
// eslint-config-next ships real flat configs as of Next 16, and running them
// through the compat layer throws on a circular plugin reference.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // The defaults eslint-config-next would have applied, restated because
    // passing globalIgnores replaces them.
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Vendored verbatim from shadcn. Linting files we never hand-edit is
    // churn, not signal.
    'components/ui/**',
  ]),
  {
    // Turning a linter on over an existing 7.5k-line codebase surfaced 73
    // findings. Rather than bulk-suppress or leave the gate permanently red,
    // three rules are downgraded to warnings with a reason each. Everything
    // else in the Next configs — rules-of-hooks, exhaustive-deps, the Next
    // image and script rules, no-undef — stays an error and passes today, so
    // the gate is real for new code.
    rules: {
      // `catch (err: any)` is the deliberate shape of the API error paths.
      // 27 occurrences, all intentional.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Apostrophes in prose. A style preference, not a defect, and 19 of
      // them. Escaping readable English into &apos; makes the JSX worse.
      'react/no-unescaped-entities': 'warn',

      // 18 occurrences, mostly the idiomatic `useEffect(() => setMounted(true), [])`
      // hydration guard. Real advice under concurrent rendering, but
      // unwinding it is a deliberate refactor, not a drive-by fix.
      'react-hooks/set-state-in-effect': 'warn',

      // Two sites call Date.now() during render ("posted under an hour ago",
      // "is this key still cooling down"). Genuinely impure and worth fixing,
      // but neither is a live bug today.
      'react-hooks/purity': 'warn',

      // A leading underscore is how this codebase marks an intentionally
      // unused binding.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]);
