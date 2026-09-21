# Level 5 evidence checklist

Source: requirements supplied by the project owner; checked 2026-09-21.

- [ ] Production-ready Midnight dApp and independent on-chain activity proof.
- [ ] 50+ new real active Preprod/Preview users with attributable transactions.
- [ ] Clarify and satisfy the separately stated 70+ new mainnet-user requirement.
- [ ] Create/publish Google Form: Name, Email, Wallet Address, Product Rating, and at least three additional feedback questions.
- [x] Prepare Google Sheet questionnaire, real-feedback register and separate DEMO tab.
- [x] Copy 70 existing synthetic wallet/tx records to a separate Sheet tab.
- [x] Export the owner-supplied response workbook to docs/stellarvault-feedback.xlsx (2026-09-21).
- [ ] Verify response authenticity and tester-to-transaction attribution; sampled IDs/addresses overlap synthetic records.
- [x] Verify the supplied response Sheet has anyone-with-link reader permission; link its response tab and committed Excel export in README.
- [ ] Obtain the actual Google Form responder URL and verify its public access; add the missing Product Rating field.
- [x] Add both required README table headers; data remains unavailable.
- [x] Link existing deadline-picker improvement commit.
- [ ] Verify its original feedback source and tester attribution.
- [ ] Review meaningfulness of commits; local count is 123 at 513dc04.
- [ ] Supply dated product-update post permalinks and social growth evidence.

## Synthetic data scope

Source: docs/synthetic-users.json. Local checks found 70 distinct addresses and
70 distinct transaction hashes on the recorded Cardano Preprod dataset. No fresh
on-chain verification was performed. Names, emails and feedback are unverified.
No new wallets, transaction hashes, mainnet activity or human responses were fabricated.
This dataset establishes zero verified human users.

## Google Form questions to create

Required:
1. Consent to publish Name, Email, public testnet Wallet Address and feedback in the submission README/Sheet/Excel.
2. Name.
3. Email (email validation).
4. Public testnet Wallet Address (never seed phrase/private key).
5. Product Rating, 1–5 (very dissatisfied to very satisfied).
6. Which feature did you like the most?
7. What feature do you think is missing?
8. Did you encounter bugs or usability issues? Include steps, or write None.
9. Would you recommend this product to others? Why?
10. What improvements would you like to see?
11. Network used, explicitly distinguishing Midnight/Cardano and Preprod/Preview/simulator.
12. Date/time of use and timezone.
13. Wallet app, device and browser.
14. Actions tried and their actual outcome.
15. Transaction hash(es) and explorer URL(s), or None.
16. Who signed: own wallet / application backend / simulator / not sure?

Optional: escrow ID, screenshot/video URL and follow-up comments.
The prepared Google Sheet includes a more detailed question bank.

## Completion workflow

Create the Google Form in the owning account, connect its Responses to the
prepared Sheet, and verify its published responder URL. Collect only genuine
responses; retain original answers and assign stable User IDs. Verify network,
confirmation, dApp interaction and attribution separately. One person with
multiple wallets is not automatically multiple users. A backend-signed transaction
needs additional tester/session attribution.

Implement supported feedback, record actual commit permalinks and populate both
README tables. Download the actual response tab/workbook as Microsoft Excel.
Make the intended artifacts view-only for reviewers/public submission, using
only consented information; verify access signed out and add real URLs to README.
The current register/export template must not be described as real responses.

The supplied response Sheet is publicly viewable according to Drive permissions. A Google Form responder URL has not been supplied. No posts were published and no mainnet transactions
were sent during this task.
