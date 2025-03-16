# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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

# Duel Learn Frontend

## Authentication Architecture

The application uses a centralized authentication architecture:

### Key Components:

1. **AuthContext** - Manages authentication state and provides login/logout functionality
   - Stores the authentication token
   - Provides methods for logging in, signing up, and logging out

2. **AuthTokenSynchronizer** - Ensures the token is kept in sync between AuthContext and the API client
   - Automatically refreshes tokens before they expire
   - No visual component, just synchronization logic

3. **apiClient** - Centralized API client that handles all requests to the backend
   - Automatically includes authentication tokens in requests
   - Handles common error scenarios like 401 Unauthorized

4. **Service Layer** - Domain-specific services that abstract API calls
   - `userService.ts` - User-related API operations
   - `authService.ts` - Authentication-related API operations

### Authentication Flow:

1. User logs in through AuthContext
2. AuthContext stores the token in state and localStorage
3. AuthTokenSynchronizer ensures the apiClient has the latest token
4. Components use services that use apiClient to make authenticated requests
5. Tokens are refreshed automatically to prevent expiration

### Data Refresh Approach

The application uses an explicit refresh approach for user data:

1. **Manual Refresh** - Instead of periodic polling:
   - User data is refreshed through explicit user actions
   - Refresh buttons are available in the Profile and Account Settings pages
   - The `refreshUserData()` function in UserContext can be called after actions that modify user data

2. **Benefits**:
   - Reduced server load - API calls only happen when needed
   - Lower bandwidth usage - no unnecessary data transfers
   - Better control over when data is refreshed
   - Improved user experience - users know when data is being refreshed

3. **Implementation**:
   - The UserContext provides a `refreshUserData()` function that any component can call
   - Profile and settings pages have refresh buttons that give visual feedback during refresh

### Benefits:

- Centralized token management 
- No need to pass tokens as parameters
- Clear separation of concerns
- Easier to maintain and extend
- Efficient data refresh mechanisms that work with MySQL backend

## Getting Started
