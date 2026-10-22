# CARD-0034 template API check

- Checked at: 2026-10-22 21:19 +03:00
- Public endpoint: `https://smart-card-qr-api.koyeb.app/api/social/CARD-0034`
- Observed response fields: `card_code: CARD-0034`, `template: dark`, `business_data.business_name: Sixty six`.
- Conclusion: the backend has saved the selected `dark` template and returns it at the top level. The displayed page remains light because the frontend currently served on `localhost:3000` does not appear to be consuming the latest edited landing-page code.
