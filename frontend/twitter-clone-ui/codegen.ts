import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Use the committed schema file so codegen works without a running backend
  // (required for CI/CD environments like Render).
  // To regenerate after schema changes: update schema.graphql first, then run `pnpm codegen`.
  schema: './schema.graphql',

  // Scan all frontend source files for gql`` tagged documents.
  documents: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!lib/gql/**/*', // exclude the generated output folder
  ],

  ignoreNoDocuments: true,

  generates: {
    // All generated types and helpers land in lib/gql/.
    // The client-preset emits:
    //   - graphql.ts  → the typed `graphql()` tag function
    //   - gql.ts      → re-exports for convenience
    //   - index.ts    → barrel export
    //   - fragment-masking.ts → fragment helpers
    './lib/gql/': {
      preset: 'client',
      config: {
        // Keeps generated scalars strict (no `any`).
        strictScalars: true,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
