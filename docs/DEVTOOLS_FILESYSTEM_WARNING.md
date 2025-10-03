# DevTools Filesystem Warning

## Issue
You may see this error in the browser console during login/logout:
```
Unable to add filesystem: <illegal path>
```

## What causes it

This is a **browser DevTools issue**, not an application bug. It happens when:

1. **DevTools Workspace/Overrides**: If you previously mapped a local folder in DevTools (Settings > Workspace) or enabled Sources > Overrides, and that folder path becomes invalid (moved, deleted, or inaccessible).

2. **Authentication state changes**: During login/logout, DevTools may attempt to reattach workspace folders or override paths that are no longer valid.

3. **Browser extensions**: Some extensions (React DevTools, Redux DevTools) can try to hook DevTools' filesystem features with invalid paths.

4. **Development environment**: Moving the project, switching branches, or using WSL/remote paths can leave DevTools with stale path entries.

## Impact

- **Harmless**: This error doesn't affect your application functionality or the Next.js dev server.
- **Console noise**: It just creates noise in the browser console.

## How to fix

Try these in order (in the browser where you see the error):

### 1. Remove stale Workspaces
- Open DevTools (F12) → Settings (gear icon) → Workspace tab
- Remove any listed folders, especially ones that don't exist anymore
- Close DevTools and reload your page

### 2. Disable or clear Overrides  
- Open DevTools → Sources panel → look for "Overrides" in the left sidebar
- If enabled, right-click and "Disable Overrides" or remove the folder
- If you don't see Overrides, go to Settings → Experiments tab and make sure Overrides aren't enabled

### 3. Restore DevTools defaults
- DevTools Settings → scroll to bottom → click "Restore defaults and reload"
- This clears saved DevTools configuration, including old paths

### 4. Rule out extensions
- Open the page in Incognito mode with extensions disabled
- If the error disappears, re-enable extensions one by one to find the culprit
- Temporarily disable DevTools-related extensions (React DevTools, Redux DevTools, etc.)

### 5. Try another browser/profile
- Test in a clean Chrome/Edge profile or Firefox to confirm it's DevTools-specific

## Prevention

- Avoid mapping project folders as DevTools Workspaces unless necessary
- If you use Overrides, clean them up when switching projects
- Use relative paths when possible in DevTools configurations

## Notes

- This warning is more common in development due to React Strict Mode and frequent auth state changes
- The error timing (login/logout) is coincidental - DevTools just tries to reattach paths when the page context changes
- No code changes are needed in your application to fix this