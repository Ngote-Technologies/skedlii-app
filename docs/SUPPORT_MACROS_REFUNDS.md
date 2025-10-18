# Support Macros: 30‑Day Money‑Back Guarantee

These templates streamline refund handling and keep responses consistent with the Refund Policy (/refund).

## 1) Refund Info Request

Subject: Re: Your refund request

Hi {first_name},

Thanks for reaching out. I can help with your refund under our 30‑day money‑back guarantee. To locate the subscription, please confirm the account email used for billing and (optional) the last invoice number if you have it. Once I verify, I’ll process the refund and confirm.

Policy: https://skedlii.xyz/refund

Best,
{agent_name}

## 2) Refund Approved

Subject: Your refund has been processed

Hi {first_name},

I’ve issued a full refund under our 30‑day guarantee and canceled your subscription effective immediately. Refunds typically settle in 5–10 business days (bank dependent). You can export your data anytime from Settings.

If you’re open, what wasn’t a fit this time? Your feedback helps a lot.

Policy: https://skedlii.xyz/refund

Best,
{agent_name}

## 3) Not Eligible — Goodwill Option

Subject: About your refund request

Hi {first_name},

Our 30‑day guarantee covers the first charge within 30 days. Your request is outside that window. I can offer a one‑time {X% partial refund / account credit of $Y} as a goodwill gesture. Would you like me to proceed?

Policy: https://skedlii.xyz/refund

Best,
{agent_name}

---

## Internal Handling Checklist

- Verify eligibility: first subscription charge, within 30 days, no prior MBG refund.
- Stripe:
  - Cancel subscription immediately (not at period end).
  - Refund original Payment Intent for the first invoice (full amount).
  - Add metadata: `refund_reason=MBG`, `agent={agent_name}`, `ticket_id={id}`, `notes={short_reason}`.
- CRM:
  - Tag ticket `refund-MBG` and capture brief churn reason.
- SLA: Reply within 24 hours; quote settlement 5–10 business days.

