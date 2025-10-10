# TikTok Integration Help

Skedlii connects to TikTok so you can schedule and publish videos to your TikTok account. Use this guide to understand requirements, supported content, and common fixes.

---

## ✅ Supported Use Cases

- Schedule and publish single-video posts to a connected TikTok account
- Add captions with text, emojis, and hashtags
- Reauthorize an account if access expires

> Note: TikTok currently supports video posts only via API (no image-only posts or carousels).

---

## 🔐 Authentication & Tokens

- Skedlii uses OAuth to connect your TikTok account securely
- Access can expire due to inactivity, manual revocation, or policy changes
- When expired, the account appears as "Expired" and scheduled posts are paused
- Click Reauthorize from Dashboard → Social Accounts to restore access

---

## ✍️ Posting Guidelines

### Video

- Use MP4 (H.264) with AAC audio for best compatibility
- Vertical 9:16 is strongly recommended (e.g., 1080 × 1920)
- Keep file sizes reasonable; extremely large files can upload slowly or time out

### Caption

- Captions support text, emojis, and hashtags
- Only a small portion is visible before “more” — keep the hook short
- Avoid copyrighted music claims by using original or licensed audio

---

## ⏱️ Scheduling Behavior

- Your video is uploaded and queued by background workers
- If an error occurs (e.g., invalid format, auth), it’s surfaced in logs and the account card
- Reauthorize and reschedule if needed — your drafts are preserved

---

## ⚠️ Common Issues & Fixes

### ❌ "Video format not supported"
- Convert to MP4 (H.264) and try again
- Ensure dimensions are within typical vertical ranges (e.g., 1080×1920)

### ❌ "Token expired"
- Reconnect from Social Accounts; no need to remove the account

### ❌ "Upload failed or very slow"
- Reduce file size/bitrate and try again
- Avoid very long videos; shorter clips publish more reliably

---

## 🧠 Best Practices

- Keep videos vertical and concise to maximize watch time
- Front-load value in the caption’s first line
- Use a clean audio track with usage rights

---

### Still Stuck?

- Manage connections under **Dashboard → Social Accounts**
- Contact [hello@skedlii.xyz](mailto:hello@skedlii.xyz) if uploads or auth repeatedly fail

