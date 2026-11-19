# Sanford SmartQuote — Implementation notes

## Phase 1: ready for review
This branch improves the customer intake form while preserving the established Formspree endpoint (`https://formspree.io/f/mrejwbop`) and the exact email subject `New Quote Request - Sanford Lawn & Exterior Services`, so the existing Gmail lead monitor continues to match submissions.

The new intake captures separate optional email and phone, preferred contact method, frequency, lawn area and height, terrain, gate access, debris volume and disposal, washing surface and measurements, and an automatically generated request reference. The customer can separately email or text photographs including the reference. The form itself does **not** upload photographs or issue quotes.

### Approval and communication safety
* **Current behavior:** submission to Formspree only; the preexisting automated Gmail workflow creates **unsent drafts**. Nobody automatically receives a service price. Formspree notifications should be tested from a noncustomer address before merge.
* **Desired future behavior:** qualify simple, well-documented recurring lawn jobs for owner-approved automatic sending after a private estimating service is built. For every automatically sent message, simultaneously record owner, lead ID, recipient, email, service address, evidence, cost model version, margin threshold, final price and timestamp in a private audit store; send owner a copy. For any ambiguity, missing dimensions, overgrown conditions, difficult access, hauling, washing, multifaceted jobs, or low confidence, route for personal approval/onsite inspection.
* GitHub Pages is a static host; it cannot securely hold a private quoting engine, customer records, API keys or email sending credentials. Those components **are not deployed**, and no auto-send claim should be made.
* The existing Formspree notification subject is intentionally unchanged for legacy Gmail automation compatibility.
* No actual profitability guarantee can be inferred from photos. Configure private cost thresholds (labor, travel, equipment, materials, disposal, insurance/overhead, profit) and calibrate on recorded completed jobs. Verify current local competing quotes by equivalent scope before enabling offers.
* Sending a competitive preliminary estimate and making a binding fixed-price commitment are distinct; owner-approved rules must govern which can be sent.

## Test before publishing
1. Review mobile and desktop layout, tabs and other site sections.
2. Use a designated test customer identity and submit with the existing Formspree endpoint; verify message arrived with the expected subject, all fields, generated lead ID and the known hourly Gmail monitoring flow. Avoid generating a real customer-facing email.
3. Verify optional sections and accessibility on mobile and that customers are not shown a dollar price.
4. Test separately texted/emailed photos and ensure name/address/reference can be matched.
5. Configure a suitable private backend, protected upload mechanism, authoritative lead ledger, margin gates and owner notification workflow before any customer auto-send is enabled.

## Customer photo checklist
- Mowing: whole front/back yard, slopes, obstacles, mower gate with known width, grass height; ideally approximate mowable square footage.
- Cleanup: each affected area plus close-ups showing depth and volume, disposal and truck access, beds/shrubs.
- Washing: the complete driveway or structure, measured dimensions, stained areas, water access and delicate surfaces.
