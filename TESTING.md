# Browser verification

## Static GitHub Pages package and phone PWA

`python tools/package_static.py` generates an allowlisted `site/` and a flat static ZIP, retaining every service-worker asset and original question JSON. `node tests/static-pages.cjs` serves only that package under a simulated `/admission-companion/` Pages path; checks the manifest/scope/icons, all cached files, offline pack import and visible collection selection, random practice and a model test, prior activity plus backup/restore, offline installed-start URL, and absence of runtime external requests. The packaging tool validates all source files before replacing its generated directory. The general PWA suite additionally checks waiting updates, failed updates, subdirectory support and preservation of all six student stores. A real GitHub deployment and Chrome installation, airplane-mode launch, backup download and storage persistence on the physical phone remain manual checks.

## Humanities past papers by university/year (2026-11-18)

`node tests/past-papers.cjs` exercises the 2017–2026 JU/GST/NU catalogue in an isolated Edge profile: historical no-exam intervals versus uncollected years; newest available selection; corrupt local-pack rejection without writes; offline selective imports and duplicate safety; saved previews/answers/explanations; exact university/year random practice and custom tests for all three targets; existing active-test questions/deadline preservation across year changes; explicit imported Humanities year records; original questions/bookmarks/activity; full backup/restore; offline reload; 360/390/768/1440-pixel layouts; no runtime external requests or JS errors. The only bundled selections are the existing 15 excerpts, with publisher claims kept separate from authenticated question provenance. Automated tests cannot authenticate the original papers or certify physical Android behaviour. Run the browser, PWA, admissions and Satt regression suites after changes to this module.

## Selected Satt Humanities excerpts

`node tests/satt-humanities.cjs` validates all 15 records directly against the public-page candidate snapshots: source keys, exact options, content hashes, 22-word excerpt cap, unique IDs, attribution and editorial labels, 30-row audit accounting and exclusion of an apparent source spelling problem/duplicates. An isolated browser then loads the old sample/starter packs, creates real test student activity, imports the new pack offline, checks idempotency and preservation of original questions/bookmarks/attempts/progress/completed exams/settings, verifies JU/GST/NU counts and previous-year exclusion, completes random practice and three-question model tests for every target, checks source links/Bangla feedback/responsive practice, export and backup/restore, and offline reload with no external requests. This verifies app behaviour and source matching, not original university-paper authenticity or expert factual certification. Actual student profiles are never used by these tests.

## Published subject expansion (17 November 2026)

`python tests/subject-source-grounding.py` compares **all 6,880 new records** directly with their original published sources, including SciQ support, GSM8K working, BLUCK missing-rationale labels, textbook keys/context and ICT public keys matched by publisher question ID. `node tests/subject-banks.cjs` loads every older and new collection in an isolated Edge profile, then imports all eight new packs offline, reaching **12,744 unique records**. It checks all JU/GST/NU target links, previous-year exclusion, collection filters, repeat-import deduplication, preserved older questions/bookmarks/attempts/completed tests/settings, random practice and model tests for every pack, source links/feedback, responsive bank layout, complete split-export downloads and reimports within the 20 MiB / 10,000 limit, license notices, full backup/restore and offline reload. No external runtime request is allowed. Run browser tests one at a time on this workstation; concurrent browser launches can time out before initial rendering.

Physical Android remains unverified: install/update and apply waiting worker, larger initial offline cache download, import speed/memory, Chrome/phone restart, downloaded multi-part exports/full backups, and persistence across a real update. No test in this repository operates on the student's actual browser profile.

The regression script ran against a Python static server on localhost using Playwright and headless Microsoft Edge. Each run uses an isolated browser context so test attempts are never inserted into the student's normal browser data.

## Passed flows

- Fresh launch shows an empty bank, zero attempts, and no fake statistics.
- Malformed JSON, a partially invalid file, and bad answer indices reject the whole import.
- The original 16-question testing dataset imports explicitly; reimported and in-file duplicates are skipped.
- A valid custom question imports; HTML-like question/profile text is safely rendered as text.
- Subject and search filters update the bank; full-bank JSON export contains all stored questions.
- Subject practice reveals correct answers/explanations, saves one answer per choice, and advances to the next question.
- Bookmark toggling persists and the bookmark practice view contains the saved question.
- An incorrect answer enters the mistake book; a correct retry clears its active mistake status while keeping history.
- Dashboard and Progress reflect the expected attempts, correct counts, accuracy, target, and test count.
- Model tests configure count/time/penalty, save selections, navigate questions, and resume after reload with the original deadline.
- Submission with one correct, one wrong, and one unanswered item at a 0.25 penalty scores 0.75/3. Detailed review and saved result review show all questions.
- Repeating the result write does not duplicate a result or answer history.
- Profile, theme, and daily target survive reload.
- All nine routes at 360, 390, 768, 1024, and 1440 pixels have no horizontal page overflow (45 combinations).
- After service-worker setup, a fresh tab with the network disabled loads the app from cache, reads IndexedDB, and records an offline practice answer.
- An offline model test can start; an expired saved deadline causes automatic submission on reopening Exams, preserving unanswered counts and excluding unanswered items from attempted-question statistics.
- No application JavaScript errors or external HTTP runtime requests occurred.
- A second test closed the actual browser process and reopened the same disk profile with networking disabled. The cached app, question bank, answer history, bookmarks, progress, and profile persisted.

## Repeat

Run the app's static server on port 8080. Developer automation requires Node.js, Playwright, and Microsoft Edge. These are not required to use the app. Install Playwright in a separate tools folder and expose its node_modules with NODE_PATH, or use an existing configured development environment.

From this project folder:

```sh
node tests/browser.cjs
node tests/reopen.cjs
node tests/pwa.cjs
node tests/question-bank.cjs
node tests/admissions.cjs
node tests/sourced-bank.cjs
node tests/licensed-reading.cjs
```

The script writes preview-desktop.png (fresh empty dashboard), preview-dark.png (real isolated test activity), and preview-mobile.png (practice UI). Test-generated data is confined to the isolated automation browser. The browser closes in a finally block.

For a manual phone check, host via HTTPS, wait for Ready for offline study, import your bank, install/add to home screen, turn off connectivity, and reopen. Try a practice answer and a short model test, then close/reopen and check saved progress. Localhost on the phone refers to the phone itself; a plain HTTP LAN host does not meet service-worker secure-context requirements.

## Not verified

Physical Android/iOS devices, installation prompts on actual phones, Safari/Firefox, a full screen-reader/accessibility audit, and very large question/history collections were not tested. Full backup/restore is tested in desktop Edge; phone file-picker/download behavior still requires physical testing. There is no automatic multi-device synchronization. Use a single tab for an active test.


## Android readiness audit (2026-11-16)

| Item | Result |
| --- | --- |
| Manifest | Existing valid manifest retained; stable relative id/scope; full name Admission Companion, short name Companion; standalone display; matching green theme and light background; start URL opens Dashboard. |
| Icons | Existing 192×192 and 512×512 PNGs verified, plus SVG; no missing icon references. PNGs use `purpose: any`, which Android supports; no maskable icon claimed. |
| Registration/cache | Secure-context registration, complete local shell precache, cache-first assets and navigation shell; additional backup/install modules cached. Active worker reports readiness after checking required files. |
| Installation | Settings option, user-triggered prompt, one-use dismissed event, manual instructions, installed-event and standalone detection; no automatic prompt/reminder. Synthetic browser-event checks passed; native Android UI untested. |
| Updates | No skipWaiting or forced reload; updates wait for every app window/tab to close. Successful/failed updates preserve all six stores. No update path clears student data. |
| Data | Browser-process restart preserves all six stores, including completed/active tests. Full backup restore validates format, questions, record shapes, checksum, and scoring before replacement. |

`tests/pwa.cjs` uses an ephemeral localhost server under `/phone/` to check relative hosting paths, manifest/start URL, PNG dimensions, offline start URL, full backup download/cancel/round-trip, damaged-file rejection, and rollback after a simulated mid-write storage failure. It tests synthetic install-event handling and both successful/waiting and failed service-worker updates. These checks use isolated profiles and simulated deployment responses, never rewriting project source or touching a student's browser profile.

## Physical Android acceptance checklist

Run these on your brother's phone after deploying the final folder over HTTPS:

- [ ] Open the stable production address in regular Chrome; wait for Ready for offline study.
- [ ] Import the real question bank and check the expected count.
- [ ] Install from Settings → Install App or Chrome's menu. If dismissed, verify there is no repeated automatic prompt.
- [ ] Open the home-screen icon: confirm the name/icon, standalone window, Dashboard, and same bank/progress.
- [ ] Turn on airplane mode **and turn Wi-Fi off**; close and reopen from the icon.
- [ ] Read Dashboard, answer MCQs, bookmark a question, and complete a model test offline.
- [ ] Close/reopen Chrome and the installed app (then reboot the phone); confirm questions, answers, test history, and progress remain. Resume an unfinished test with its original deadline.
- [ ] Download a full backup to Files/Downloads; copy it somewhere safe. Validate it, cancel, and confirm nothing changed. Restore it and verify counts, progress, settings, and test reviews. Use disposable test activity for this check.
- [ ] Request persistent storage and note whether Chrome grants it. A denial should not block saving.
- [ ] With a backup saved, deploy an update to the same hosting project and bump the worker cache version. Keep a test open while online; verify it is not interrupted. Close all app/Chrome tabs for this site and reopen; verify the update and saved records, then reopen offline again.

Do not clear site/browser data as an update step. If an offline cache is damaged and ordinary reopening online does not recover it, first export a full backup. A developer can unregister only this site's service worker in browser DevTools and reload online to recache; do not delete IndexedDB or use Clear site data.

## Structured question-bank checks (2026-11-16)

`tests/question-bank.cjs` imports the five-question JSON example directly from QUESTION_BANK.md. It verifies legacy records without source/language remain byte-for-byte equivalent, and that existing bookmarks, attempts, progress, settings and exam history survive subsequent imports. Tests cover Unicode NFC/NFD duplicate identity, UTF-8 BOM, Bangla/English/mixed content, multiline explanations, source display/escaping/export, all metadata filters, zero-match practice selection, and immediate same-page navigation from import to filtered practice and a submitted model test with explanations/source in its review.

A 10,000-record synthetic import passed in approximately six seconds on this desktop Edge workstation; records are generated only inside the isolated test browser and are not study material. A 10,000-invalid-row file produced a complete downloadable error report. Tests also check within-file/stored duplicates, conflicting answers, malformed metadata/answers/explanations, row and byte limits, 50-item previews, import rollback after a simulated mid-transaction failure, expanded filter layouts at 360/390/768/1440 pixels, and filtered practice while offline.

The full browser, PWA/update/backup, restart, and question-bank test suites pass. Physical Android performance with the real bank, human review of factual content/answer keys, and source authenticity remain manual acceptance checks. No validation code claims to authenticate a past paper or certify its answers.

## Admission-target checks (2026-11-16)

`tests/admissions.cjs` uses isolated, explicitly synthetic units/papers/patterns to verify:

- JU, GST, NU, Other priority selectors; Humanities as the initial preparation group.
- Target/unit/group filtering, explicit common questions, and a single question shared by JU and GST without duplicate records.
- Previous-year-only mode excludes preparation/common questions and matches each occurrence's university, unit, group and year together.
- UI assignment adds study links without adding previous-year claims or changing question IDs.
- Configuration file validation/import, additional university targets, and independent target-specific subject counts, duration, correct marks and wrong-answer penalties (including section overrides).
- Exact selection without repeated question IDs; insufficient subject pools reject generation without saving a test.
- Test rules/context survive reload and results show the saved marks; switching targets clears the earlier pattern and marking settings.
- Full backup validates/restores admission configuration, shared question links, results and student records; model tests generate offline.
- Existing bookmarks, attempts, progress and completed history stay unchanged by target/configuration operations.

All five test suites pass on desktop Edge. No fixture is saved into the real bank and no synthetic paper/year/unit is distributed as real study material. Physical Android behavior remains a manual check. Internet research located official portals, third-party collections and a publisher-attributed model test; it did not authenticate an official university past-paper archive. Sources and access failures are recorded in QUESTION_SOURCES.md.

## Practice zero-question guidance (2026-11-17)

The question-bank regression test checks a fresh empty Practice view, the explicit no-import guidance, an unlinked sample bank filtered to JU, and Show all bank questions restoring the available count without changing any IndexedDB records. Empty mistake/bookmark collections retain their separate guidance.

## Sourced starter pack (2026-11-17)

`tests/sourced-bank.cjs` validates all 28 real-content records against the app import path, checks source/audit alignment, confirms university/year provenance is unset and explanations are editorial, and exercises the new loader while networking is disabled. After loading the original 16 testing samples, the sourced loader appends 28 records (44 total), preserves existing question/answer/bookmark/progress records, and reimporting the pack skips all 28 duplicates without changes.

JU/GST/NU preparation filters yield 15/6/7 sourced questions, while previous-year-only mode yields none because historical-paper authentication is not claimed. Random JU practice saves an answer and displays its explanation; an offline GST model test generates three unique questions and submits/reviews correctly. Responsive checks pass at 360/390/768/1440 pixels, with no application errors or external runtime requests. The general browser and PWA/update/backup tests also pass after the loader/cache update. Factual/editorial review is not equivalent to authentication of original examination papers.

## Licensed large reading bank (2026-11-17)

`tests/licensed-reading.cjs` checks the pinned source archive checksum, publisher-declared CC BY 4.0 attribution, all 2,875 generated records against the row audit, duplicate/conflict accounting, and the absence of invented university/year provenance. The source questions/keys are retained; explanations and verification labels describe passage-text checks, not expert certification or current-affairs verification.

The browser test first loads the 16 samples and 28 starter items and seeds saved student activity. It then disables networking and loads the entire 2,875-question supplement from the app cache, reaching 2,919 records. Existing original questions, bookmarks, attempts, progress and settings remain unchanged. Reimporting adds zero records. All three Humanities targets reuse the same 2,875 records; collection filtering works and previous-year-only mode excludes them. The test exercises random JU reading practice with full passage/evidence explanation, a five-question offline GST model test/review without repeated IDs, large full-backup validation, Dashboard reload, mobile/desktop overflow checks, and zero external runtime requests.

The first large import took about two seconds in an isolated desktop Edge run. A long loader-button label initially caused 360-pixel Bank overflow; wrapping the label fixed it, and the general 45-view responsive regression passed afterward. Physical Android download, storage, rendering and import performance remain unverified, as does expert semantic/factual review of the upstream reading passages and keys.

Final desktop verification for this expansion: all seven scripts passed — browser.cjs, pwa.cjs, reopen.cjs, question-bank.cjs, admissions.cjs, sourced-bank.cjs and licensed-reading.cjs. The final quiet-server large import took about 2.4 seconds. The local test server was restarted on the same origin to avoid accumulated terminal logging blocking test requests; student site storage was not cleared.
## English and GK expansion checks

Run `node tests/english-gk.cjs` with Playwright available and the static server at `http://127.0.0.1:8080/`. It uses an isolated browser profile and never changes the student's browser data. The test checks source checksums, all geography keys/distractors against the snapshot, unique stems, per-record labels, all three target links, offline imports, duplicate reimports, coexistence of all 5,864 records, preserved prior questions/attempts/bookmarks/completed tests/settings, university/collection filtering, exclusion from previous-year results, random practice and explanations for each new pack, model tests for both, clickable source links, licenses in exports/backups, full backup/restore, offline reload and responsive bank layout. No external runtime requests are allowed. Run `python tests/english-source-grounding.py` to independently check every English answer/definition and all 6,000 distractor sense comparisons against the raw WordNet archive. Neither check replaces expert review of admission relevance or up-to-date facts.

Physical Android checks remain: install/update the PWA through Chrome, close/restart Chrome and the phone, open offline, import both packs and time their loading on the actual device, complete random practice and tests, verify an exported backup can be found on the phone, and confirm data persists after a real PWA update. Desktop automation cannot certify Android storage eviction, download handling or device performance. Keep a backup outside browser storage.

