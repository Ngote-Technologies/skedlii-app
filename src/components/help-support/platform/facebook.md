# Facebook Integration Help

Skedlii supports publishing to Facebook Pages via the Meta Graph API. This guide covers setup, posting rules, and common fixes.

---

## ✅ Supported Use Cases

- Schedule and publish posts to your Facebook Pages
- Add text captions with links, emojis, and hashtags
- Reauthorize access when tokens expire

> Note: Posting to personal Facebook profiles is not supported by the API. Use a Facebook Page you manage.

---

## 🔗 Required Setup

To connect successfully, ensure:

1. You have Admin (or appropriate) permissions on the Facebook Page.
2. During OAuth, you grant all requested permissions, including:
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `business_management`

If any permission is skipped or later revoked, posting can fail until you reconnect.

---

## 🔐 Authentication & Token Expiry

Access can expire due to inactivity, permission changes, or manual revocation. When this happens:

- Skedlii marks the account as **Expired**
- Scheduled posts pause or are skipped
- Use **Reconnect** in Dashboard → Social Accounts to restore access

Reconnecting will not delete your drafts or scheduled content.

---

## ✍️ Posting Guidelines

### Content

- Text-only posts are supported
- Links in captions are clickable on Facebook
- Images and videos are supported; use standard formats (JPG/PNG, MP4/H.264)

### Media Tips

- Images: common aspect ratios (1:1, 4:5, 16:9) work best
- Videos: MP4 (H.264 + AAC), keep sizes reasonable for faster upload/processing

---

## ⏱️ Scheduling Behavior

- Skedlii queues your post and publishes via background workers at the scheduled time
- If an error occurs (e.g., permission error, expired token), you’ll see it in logs and on the account card

---

## ⚠️ Common Issues & Fixes

### ❌ "You do not have permission to post to this Page"
- Ensure you’re an Admin (or have posting rights) on the Page
- Reconnect and grant all requested permissions

### ❌ "Token expired"
- Click **Reconnect** in Social Accounts; no need to remove the account

### ❌ "Unsupported media"
- Re-encode images to JPG/PNG or videos to MP4 (H.264/AAC)

---

## 🧠 Best Practices

- Attach a relevant image/video to increase reach and engagement
- Keep captions concise; place key info and links near the start
- Reconnect proactively if you haven’t posted in a while to avoid surprise expiry

---

### Still Stuck?

- Manage connections under **Dashboard → Social Accounts**
- Contact [hello@skedlii.xyz](mailto:hello@skedlii.xyz) for persistent auth or posting issues

