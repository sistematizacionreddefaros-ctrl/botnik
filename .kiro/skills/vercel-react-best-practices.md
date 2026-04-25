---
inclusion: auto
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React applications, maintained by Vercel. Contains 69 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:

- Writing new React components
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category                  | Impact      | Prefix       |
| -------- | ------------------------- | ----------- | ------------ |
| 1        | Eliminating Waterfalls    | CRITICAL    | `async-`     |
| 2        | Bundle Size Optimization  | CRITICAL    | `bundle-`    |
| 3        | Server-Side Performance   | HIGH        | `server-`    |
| 4        | Client-Side Data Fetching | MEDIUM-HIGH | `client-`    |
| 5        | Re-render Optimization    | MEDIUM      | `rerender-`  |
| 6        | Rendering Performance     | MEDIUM      | `rendering-` |
| 7        | JavaScript Performance    | LOW-MEDIUM  | `js-`        |
| 8        | Advanced Patterns         | LOW         | `advanced-`  |

## 1. Eliminating Waterfalls (CRITICAL)

- Check cheap sync conditions before awaiting flags or remote values
- Move await into branches where actually used (defer await)
- Use Promise.all() for independent async operations
- Use Suspense boundaries to stream content progressively
- Start promises early, await late

## 2. Bundle Size Optimization (CRITICAL)

- Import directly from modules, avoid barrel files (index.ts re-exports)
- Use dynamic imports (lazy/Suspense) for heavy components
- Defer third-party scripts (analytics, logging) until after hydration
- Load modules conditionally only when a feature is activated
- Preload on hover/focus for perceived speed

## 3. Server-Side Performance (HIGH)

- Authenticate server actions like API routes
- Use React.cache() for per-request deduplication
- Avoid duplicate serialization in RSC props
- Hoist static I/O (fonts, logos) to module level
- Minimize data passed to client components
- Restructure components to parallelize fetches

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

- Use SWR or React Query for automatic request deduplication
- Deduplicate global event listeners
- Use passive listeners for scroll events
- Version and minimize localStorage data

## 5. Re-render Optimization (MEDIUM)

- Don't subscribe to state only used in callbacks (defer reads)
- Extract expensive work into memoized components
- Hoist default non-primitive props outside component
- Use primitive dependencies in effects
- Subscribe to derived booleans, not raw values
- Derive state during render, not in effects
- Use functional setState for stable callbacks
- Pass function to useState for expensive initial values
- Avoid useMemo for simple primitive expressions
- Split hooks with independent dependencies
- Put interaction logic in event handlers, not effects
- Use startTransition for non-urgent updates
- Use useDeferredValue to keep input responsive
- Use refs for transient frequent values (mouse position, scroll)
- Never define components inside other components

## 6. Rendering Performance (MEDIUM)

- Animate div wrapper, not SVG element directly
- Use content-visibility: auto for long off-screen lists
- Extract static JSX outside components
- Reduce SVG coordinate precision
- Use ternary operator, not && for conditional rendering
- Prefer useTransition over boolean loading state

## 7. JavaScript Performance (LOW-MEDIUM)

- Group CSS changes via classes or cssText (batch DOM)
- Build Map/Set for repeated lookups instead of array.find()
- Cache object properties in tight loops
- Combine multiple filter/map into one loop
- Check array length before expensive comparison
- Return early from functions
- Hoist RegExp creation outside loops
- Use Set/Map for O(1) lookups
- Use flatMap to map and filter in one pass

## 8. Advanced Patterns (LOW)

- Don't put useEffectEvent results in effect deps
- Store event handlers in refs for stable references
- Initialize app-level setup once per app load
- useLatest pattern for stable callback refs
