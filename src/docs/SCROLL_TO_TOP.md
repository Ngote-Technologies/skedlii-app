# Scroll-to-Top Implementation

This document explains the scroll-to-top functionality implemented for dashboard navigation.

## Problem Solved

When navigating between dashboard routes, users would maintain their previous scroll position, which can be confusing when viewing new content. The implementation ensures users always start at the top of each new route.

## Implementation Overview

### 1. Custom Hook: `useScrollToTop`

**Location:** `src/hooks/useScrollToTop.ts`

Two variants:
- `useScrollToTop(containerRef, options)` - For specific containers
- `useWindowScrollToTop(options)` - For window-level scrolling

**Features:**
- Detects actual route changes (ignores URL params by default)
- Smooth scrolling with configurable delay
- Prevents unnecessary scrolls on same route

**Usage:**
```typescript
import { useScrollToTop } from '../hooks/useScrollToTop';

function MyComponent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useScrollToTop(scrollRef, {
    behavior: 'smooth',
    delay: 100,
    excludeParams: true
  });

  return <div ref={scrollRef}>...</div>;
}
```

### 2. Dashboard Integration

**Location:** `src/layouts/DashboardLayout.tsx`

The main dashboard layout automatically scrolls the content container to top on route changes:

```typescript
// Automatically scroll to top when navigating between dashboard routes
useScrollToTop(mainContentRef, {
  behavior: "smooth",
  delay: 100, // Small delay to ensure content is rendered
});
```

**HTML Structure:**
```html
<div 
  ref={mainContentRef}
  data-dashboard-content
  className="flex-1 overflow-y-auto"
>
  <!-- Dashboard content here -->
</div>
```

### 3. Component Alternative: `DashboardScrollToTop`

**Location:** `src/components/layout/DashboardScrollToTop.tsx`

For cases where hooks aren't preferred, provides a component that handles scroll-to-top:

```typescript
import DashboardScrollToTop from '../components/layout/DashboardScrollToTop';

function MyRoute() {
  return (
    <>
      <DashboardScrollToTop />
      {/* Your route content */}
    </>
  );
}
```

### 4. Utility Functions: `scrollUtils.ts`

**Location:** `src/lib/scrollUtils.ts`

Provides various scroll utilities:

- `scrollContainerToTop(container, options)` - Scroll specific container
- `scrollWindowToTop(options)` - Scroll window
- `scrollDashboardToTop(options)` - Smart dashboard scrolling
- `smartScrollToTop(options)` - Auto-detects context
- `scrollToElement(element, container, options)` - Scroll to specific element

## Configuration Options

All scroll functions accept an options object:

```typescript
interface ScrollOptions {
  behavior?: ScrollBehavior;  // 'smooth' | 'instant'
  delay?: number;            // Delay in milliseconds
  offset?: number;           // Offset from top in pixels
}
```

## Current Implementation

✅ **Dashboard Layout**: Automatically scrolls main content container on route changes
✅ **Smooth Scrolling**: Uses smooth scroll behavior by default
✅ **Smart Detection**: Only scrolls on actual route changes, not parameter changes
✅ **Delay Handling**: 100ms delay to ensure content is rendered
✅ **Fallback Strategy**: Multiple selectors to find scrollable container

## Testing

### Manual Testing Steps

1. Navigate to `/dashboard`
2. Scroll down on any dashboard page
3. Navigate to a different dashboard route
4. Verify that you start at the top of the new page

### Routes to Test

- `/dashboard` → `/dashboard/collections`
- `/dashboard/collections` → `/dashboard/accounts`
- `/dashboard/accounts` → `/dashboard/posts`
- `/dashboard/posts` → `/dashboard/analytics`

## Browser Compatibility

- **Modern Browsers**: Full support with smooth scrolling
- **Legacy Browsers**: Falls back to instant scrolling
- **Mobile**: Works with touch scrolling

## Performance Considerations

- **Minimal Impact**: Hook only runs on route changes
- **Efficient Detection**: Uses ref comparison to prevent unnecessary scrolls
- **Memory Safe**: Proper cleanup of timeouts

## Customization

### Disable for Specific Routes

```typescript
// In a specific route component
useScrollToTop(containerRef, {
  behavior: 'instant', // or skip the hook entirely
});
```

### Different Scroll Behavior

```typescript
useScrollToTop(containerRef, {
  behavior: 'instant',  // No animation
  delay: 0,            // Immediate scroll
});
```

### Custom Container Selection

```typescript
// Using the component approach
<DashboardScrollToTop 
  containerSelector=".my-custom-container"
  behavior="smooth"
  delay={200}
/>
```

## Troubleshooting

### Scroll Not Working

1. Check if container has `overflow-y-auto` class
2. Verify container ref is properly attached
3. Check browser console for warnings
4. Test with component approach instead of hook

### Scroll Too Fast/Slow

Adjust the delay parameter:

```typescript
useScrollToTop(containerRef, {
  delay: 200, // Increase for slower response
});
```

### Conflicts with Existing Scroll

The implementation avoids conflicts by:
- Only triggering on route changes
- Using specific container targeting
- Providing fallback strategies

## Future Enhancements

- [ ] Animation customization options
- [ ] Scroll position restoration for back navigation
- [ ] Integration with React Router's ScrollRestoration
- [ ] Accessibility improvements (respect prefers-reduced-motion)
- [ ] Analytics tracking for scroll behavior

## Related Files

- `src/hooks/useScrollToTop.ts` - Main hook implementation
- `src/layouts/DashboardLayout.tsx` - Dashboard integration
- `src/components/layout/DashboardScrollToTop.tsx` - Component alternative
- `src/lib/scrollUtils.ts` - Utility functions
- `src/components/layout/ScrollToTop.tsx` - Original window scroll component