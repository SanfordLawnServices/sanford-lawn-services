# Sanford SmartQuote — development only

This feature is being developed on `feature/sanford-smartquote`. The production `main` branch and existing Formspree quote form are unchanged.

## Implemented
- `smartquote.html`: mobile-friendly, self-contained owner-testing prototype
- Service-specific photo checklist, local-only image previews (10 images max, 8 MB each), intake summary and copy action
- Explicit non-operational status: no image upload, email submission, AI analysis, market lookup or actual quote

## Required before customer deployment
1. Private, authenticated backend and photo storage with upload size limits, retention policy, abuse controls, and consent notice.
2. Secure server-side image analysis and verified property measurements (do not infer square footage from unscaled photos).
3. Cost model calibrated to real completed jobs: solo labor, equipment, travel, overhead, materials, disposal, target margin.
4. Dated Sanford-area competitor/market benchmarks with source provenance and appropriate comparability.
5. Private owner dashboard with authenticated approval before any binding quote or customer communication.
6. Integration with existing Formspree intake and email workflow without duplicate notifications.
7. Accessibility, security, privacy, mobile and regression testing, followed by owner review and explicit approval to merge.

Never store secrets or customer photos in GitHub Pages or the public repository. GitHub Pages is static hosting and cannot securely run the AI backend by itself.
