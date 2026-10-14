# नवोदय विजेता — project notes

This is a Hindi-first Navodaya Class 6 preparation app for आरुष and आयुष.

## Included
- 40 chapter guides with formulas, theory sections and solved examples
- 4,062 practice questions with explanations and figure rendering
- 36 mock papers, timed test player, answer review and scoring
- Hindi vocabulary practice, study tasks, mistake review and sibling battle mode
- Separate local progress for each student, XP/streaks, chapter completion
- Export/import progress code for moving progress between devices
- Responsive mobile navigation and install/PWA scaffolding

## Run locally
1. Install Node.js 22 or newer.
2. In this project folder run `npm ci`.
3. Run `npm run dev` and open the local address shown by the development server.
4. For a production check run `npm run build`.

The app stores progress in this browser's local storage. Use **प्रगति सिंक** to export a code and import it on another device; this is a manual transfer, not cloud synchronization.

## Maintenance note
Streak dates now use the device's local calendar rather than UTC, and storage write failures no longer crash the app (for example, in private browsing or when storage is full).
