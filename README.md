# Usora introduction & policies

A lightweight English website for Usora, with responsive policy pages, accessible navigation, printable policies, and no runtime dependencies or third-party browser scripts. Node.js 20+ and Firebase CLI are sufficient.

## Preview

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. Routes:

- `/`: introduction and policy directory
- `/policy-privacy`: Privacy Policy
- `/policy-terms`: Terms of Service
- `/policy-deletion`: account and data deletion information

Copy lives in `content/policies.mjs`; operator details and publication status live in `content/site.json`. Generated files go to `dist/`. Styling and browser enhancement are in `public/`. Content is readable without JavaScript. Unknown URLs return a real 404 rather than a generic SPA response.

## Publication status

The site is deployed at **https://usora.web.app** at the user’s request for a permanent production URL. Policy content remains a **labeled draft** with noindex until operator details and practices are verified. Confirm the following with the operator before publication:

1. Public operator name and a working support/privacy email.
2. Actual data practices, provider list (including any backend analytics, advertising, or AI services), minimum age, retention rules, and how permanent deletion is handled.
3. Hosting is resolved: use the dedicated `usora` site. Keep `social-story-staging` (OpenCono) unchanged.

Set `operator`, `email`, and `policyVerified` after incorporating the answers. Deployment is restricted to `usora`. Do not set verification flags merely to bypass deployment checks.

The source app at `../../APP/usora` was inspected read-only. Its Profile → Delete Account action invokes `DELETE auth/me`, but the code calls the action `deactivateAccount` and the dialog says the account will be deactivated. Backend deletion semantics have not been verified. The policy accurately discloses this uncertainty; confirm and implement permanent deletion before relying on that flow for App Review. The app's existing policy screens load `about-usora` API content, so publishing this website does not automatically update those in-app screens.

## Firebase

Project: `fe-social-story`. Dedicated Hosting site: `usora`.

Live origin: https://usora.web.app. To publish the labeled draft at the permanent URL, use `npm run deploy -- --allow-draft`. This preserves the draft notice and noindex; it does not mark policy details as verified.

```sh
npm run deploy
```

The deployment command builds and validates the website, then checks publication details and dedicated site selection. It deploys only Hosting. Static English HTML is available directly at the clean URLs, without authentication. The Firebase configuration includes CSP and other response headers.

After deployment, verify the live policy URLs and add `/policy-privacy` to App Store Connect's Privacy Policy URL. Make the same policy available in the app. Ensure App Store privacy disclosures match app and backend behavior.

## Verification performed

- Build and internal links/assets/anchor validation: `npm run build && npm run check`.
- Chromium: desktop and 390px mobile routes, no horizontal overflow, table-of-contents navigation, actual 404, no JavaScript errors, policy readability with JavaScript disabled.
- Screenshots: `artifacts/privacy-desktop.png` and `artifacts/privacy-mobile.png` (local only, not deployed).

Apple references:

- https://developer.apple.com/app-store/review/
- https://developer.apple.com/support/offering-account-deletion-in-your-app

Policy pages support submission preparation; App Store approval also depends on the app's actual behavior and Apple's review.

## Navigation

Internal links and policy tabs use the History API to update content without reloading the document. Page content is bundled in the versioned script, so switching policies requires no network request. Tab switches preserve scroll and keyboard focus; Back/Forward restores the route, metadata, and scroll position. Direct URLs and no-JavaScript navigation still use the generated static HTML.

Browser regression check: `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/navigation-check.mjs`. Set `TEST_ORIGIN` to check a deployed site.
