# Frontend Migration — Posting Pipeline (SSOT, JSON, Idempotency)

Owner: Frontend Team
Status: Draft (actionable)
Scope: Post flow (accounts → caption → media → schedule/submit), API layer

## Goals
- Switch to SSOT payloads and JSON submission for both immediate and scheduled posts.
- Backend-centric media: upload to Cloudinary via server-issued signature; send refs/URLs to API.
- Add Idempotency-Key header per submission to avoid duplicates.

## Changes At-a-Glance
- Stop using multipart FormData for post submit.
- Build SSOT payloads:
  - `targets: [{ platform, socialAccountId }]` using internal account `_id`.
  - `media: [{ type, url, width, height, durationSec?, ref? }]` using Cloudinary `secure_url` and `publicId`.
  - `content: string`, `scheduleAt?: ISO string`.
- Use new JSON API calls:
  - POST `/social-posts/post-to-platforms` for immediate (scheduleAt = null).
  - POST `/scheduled-posts` for schedule.
- Add `Idempotency-Key` header.

## Files To Update

- skedlii-app/src/api/upload.ts
  - Request body to signature endpoint must be `{ publicId, folder }` (not `public_id`).
  - Keep `public_id` only in the Cloudinary multipart form to Cloudinary.

- skedlii-app/src/api/socialApi/index.ts
  - Add JSON helpers:
    - `postNowSSOT(data: { content: string; targets: Target[]; media?: MediaItem[] }, config?)` → POST `/social-posts/post-to-platforms` with JSON.
    - `scheduleSSOT(data: { content: string; targets: Target[]; media?: MediaItem[]; scheduleAt: string }, config?)` → POST `/scheduled-posts` with JSON.
  - Ensure `Content-Type` is `application/json` (default axios instance already does this).
  - Remove/stop using `postToMultiPlatform` and `schedulePost` multipart methods for new flow.

- skedlii-app/src/components/posts/post-flow/hooks/usePostSubmission.ts
  - Remove FormData usage (`handleFormData`, `media` file loops`).
  - Before submit, ensure all media is uploaded to Cloudinary and you have `publicId` and `secure_url`.
  - Build SSOT payload:
    - `content`: use global or per-platform overrides as you do now.
    - `targets`: from selected accounts → `{ platform: acc.platform, socialAccountId: acc._id }`.
    - `media`: from local `media` state → `{ type, url: secure_url, width, height, durationSec?, ref: publicId }`.
    - Immediate: call `postNowSSOT`.
    - Scheduled: call `scheduleSSOT` with `scheduleAt` ISO string.
  - Generate and attach `Idempotency-Key` header:
    - Compute a stable hash from `{ orgId, content, targets[], media[], scheduleAt }`.
    - Use `axios` request config `{ headers: { 'Idempotency-Key': key } }`.

- skedlii-app/src/api/axios.ts
  - Already injects `x-organization-id` header for v2; no changes needed.
  - Optionally export a helper to attach `Idempotency-Key` from caller.

- skedlii-app/src/components/posts/post-flow/PostFlow.tsx
  - Ensure submit invokes new SSOT calls; validate YouTube rule before submit: if any target platform is `youtube`, require exactly one video in `media`.

- skedlii-app/src/components/posts/post-flow/MediaUpload.tsx
  - Ensure Cloudinary upload runs before submit; keep `publicId` and `secure_url` in `MediaItem`.
  - For videos, capture `durationSec` if available; keep `width`/`height` from existing utilities.

## Data Shapes

```ts
export type Target = { platform: 'twitter'|'linkedin'|'instagram'|'threads'|'tiktok'|'youtube'|'facebook'; socialAccountId: string };
export type MediaItem = { type: 'image'|'video'; url: string; width?: number; height?: number; durationSec?: number; ref?: string };
```

## API Calls (examples)

- Immediate
```ts
await socialApi.postNowSSOT(
  { content, targets, media },
  { headers: { 'Idempotency-Key': key } }
);
```
- Scheduled
```ts
await socialApi.scheduleSSOT(
  { content, targets, media, scheduleAt: new Date(scheduledDate!).toISOString() },
  { headers: { 'Idempotency-Key': key } }
);
```

## UX/Validation Checklist
- Block submit when:
  - No accounts selected or caption empty.
  - YouTube among targets but `media` is not exactly one video.
  - Media count exceeds MVP caps (1 video or up to 4 images).
- Errors mapping:
  - `validation_error`: show inline field errors.
  - `token_expired`: show reconnect prompt for affected platform, then retry.
  - `plan_limit_exceeded`: show upgrade banner with messaging.
  - Timeouts: Show toast with retry option; re-submit with same Idempotency-Key is safe.

## Optional (Post-MVP)
- Retry UI: call `POST /scheduled-posts/:id/retry-failed` to re-enqueue failed targets; show progress and avoid duplicating published targets.
- Per-platform caption overrides in payload (server normalization can remain caption-agnostic initially).

