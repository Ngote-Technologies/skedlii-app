# Skedlii App

Authenticated Skedlii dashboard app built with React, TypeScript, Vite, Zustand, TanStack Query, and Tailwind/Radix UI.

Production defaults:

- Marketing site: `https://www.skedlii.com`
- App: `https://app.skedlii.com`
- API: `https://api.skedlii.com`

Current capabilities include authentication, organization switching, organization settings/members, invitations, teams, social accounts, post creation, scheduled posts, billing, and admin job views.

## Development

- `npm run dev` - start Vite dev server
- `npm run build` - TypeScript build and Vite production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

Relevant environment variables:

- `VITE_API_V2_URL=https://api.skedlii.com/api`
- `VITE_MARKETING_APP_BASE=https://www.skedlii.com`
- `VITE_USE_V2_API=true`

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
