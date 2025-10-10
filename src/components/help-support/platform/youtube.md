# YouTube Integration Help

Skedlii integrates with YouTube so you can upload and schedule video publishes to your channel. This guide covers authentication, supported formats, scheduling, and common errors.

---

## ✅ Supported Use Cases

- Upload a single video and schedule it to publish later
- Set title and description; add hashtags in the description if desired
- Reauthorize account when tokens expire

> Note: Live streaming, playlists, and comments moderation are out of scope for the current integration.

---

## 🔐 Authentication & Tokens

- Skedlii uses Google OAuth to connect your YouTube channel
- Access can expire or be revoked from your Google Account security settings
- When access expires, we’ll mark the account as **Expired** and pause scheduled publishes until you reconnect

---

## ✍️ Posting Guidelines

### Video

- Use MP4 (H.264 video + AAC audio) for best compatibility
- Landscape 16:9 is common; Shorts use vertical 9:16 (e.g., 1080×1920)
- Large files can take time to upload and process — keep sizes moderate for reliability

### Metadata

- Provide a clear title and a description; hashtags in description are supported
- Thumbnails may be auto-generated; custom thumbnails support may be limited in the current UI

---

## ⏱️ Scheduling Behavior

- Skedlii uploads your video, sets visibility and publish time, and queues it
- Processing time on YouTube can delay the actual publish; this is normal
- If processing fails, you’ll see an error and the video won’t publish

---

## ⚠️ Common Issues & Fixes

### ❌ "Quota Exceeded"
- The YouTube Data API enforces daily quotas
- Try again later or reduce frequent metadata updates

### ❌ "Unsupported Codec or Container"
- Re-encode to MP4 (H.264/AAC)
- Avoid exotic codecs or extremely high bitrates

### ❌ "Token expired"
- Reconnect your Google account from Social Accounts; no need to remove the account

---

## 🧠 Best Practices

- Keep titles concise and front-load keywords
- Choose an aspect ratio that matches the intended surface: 16:9 for standard videos, 9:16 for Shorts
- Allow extra time before the scheduled publish to accommodate upload and processing

---

### Still Stuck?

- Manage connections under **Dashboard → Social Accounts**
- Contact [hello@skedlii.xyz](mailto:hello@skedlii.xyz) for persistent auth, upload, or processing issues

