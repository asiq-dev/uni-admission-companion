# Admission Companion

A personal, frontend-only offline study app for one Bangladeshi university admission candidate with SSC and HSC Humanities backgrounds. No account, backend, remote database, API, npm install, or build step.

## Start studying

**New: [Humanities past papers by university/year](PAST_PAPERS.md).** Open **Practice → Past papers by year**, or the matching link in Question bank / Examinations. Browse JU, GST and NU across 2017–2026, load a selected year's questions, read explanations, practise randomly or create a custom test. Current bundled coverage is **JU 2024: 3, GST 2023: 9, NU 2025: 3 selected excerpts**, reused from the existing 15-question Satt pack. This is not a complete ten-year archive; missing papers, historical no-exam years and unverified publisher claims are labelled explicitly. No new question count is claimed.

For the small, target-associated Bangladeshi selection, open **Question bank → Load selected Satt Humanities (15 questions)**. It adds **JU 3 / GST 9 / NU 3** short public-page excerpts with source keys, Bangla editorial explanations and links. Original-paper/year claims remain unverified; these are not new authenticated past papers. This is a limited personal-study selection, not a full Satt bank or open redistribution licence. A further source option with a suspected book-title typo was excluded during final review. Existing records and study progress are preserved. The JSON can also be selected manually from `data/satt-humanities.json` using the existing file picker if a cached screen lacks the button.

1. Serve this folder over HTTP locally or HTTPS on an ordinary static host.
2. Open the app and wait for **Ready for offline study**. This confirms that the application files, fonts, icons, and testing bank have been cached.
3. Open **Practice → Question bank** (also available from Home and Profile).
4. Load the subject packs you want. New published-question packs include **Bangla (1,301)**, **Bangladesh affairs (785)**, **science (3,000)**, **mental arithmetic (1,500)**, **sociology (166)**, **ICT (45)**, **international history (51)** and **comparative government (32)**. BLUCK Bangla/BD packs have **source keys only, without detailed source rationales**. Other packs supply original support/worked solutions or mechanically selected textbook context. Earlier English vocabulary, GK/geography, Bangla reading and third-party packs remain available. These are shared JU/GST/NU Humanities preparation, not independently authenticated university past papers. See [exact coverage and limitations](SUBJECT_COVERAGE.md). The separate **16-question testing sample** is for learning the controls. Nothing is loaded automatically; repeat imports skip duplicates.
5. Open **Practice**, choose your target/subject and optionally **Question collection** under the additional filters, keep Random order, then **Start practice**. For the reading supplement, answer using the supplied passage; its facts are not independently verified current affairs.

A fresh dashboard shows zero attempts, zero completed tests, and an empty accuracy value. There are no fictional progress statistics. Samples are labeled original testing examples, not historical university questions. If you answer sample questions, those actual attempts count in your saved progress.

After an app update downloads, close all app tabs/windows and reopen online, then wait for **Ready for offline study** before loading the new packs. The **Update ready** status now remains visible until the waiting update is applied. Loading all packs gives **12,743 study questions**, or **12,759 including testing samples**, including the new 15-question Satt selection. Choose your university target and **Question collection** in Practice or Examinations to use the new packs immediately; leave the content type at Preparation + common questions rather than Previous-year-only. No official units or marking rules are inferred. Full backup/restore and question exports retain source labels and applicable license notices. Large bank exports offer separate **Download part N / M** buttons; download/import every part. See [question sources](QUESTION_SOURCES.md) and [reuse notices](THIRD_PARTY_NOTICES.md). A separately hosted website needs a fresh deployment of these project files; local edits do not update that host automatically. Never clear site data to apply an app update.

## Run locally

Open a terminal **inside this folder**. With Python 3 installed:

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

On macOS/Linux:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

On this Codex workstation, if `py` reports that Python is missing, the bundled runtime is also available:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 8080 --bind 127.0.0.1
```

Visit **http://127.0.0.1:8080/**. Ctrl+C stops the static file server. You can also use VS Code's Live Server extension on `index.html`. This is only a static file server, not an application backend. Do not open the HTML using `file://`; JavaScript modules and service workers need an HTTP origin.

Use a consistent hostname and port: localhost, 127.0.0.1, a different port, and an HTTPS hostname each have separate local databases.

## Deploy to free HTTPS hosting

### GitHub Pages (recommended for this project)

The application already is plain static **HTML + CSS + JavaScript + local JSON**. No conversion, npm install, build framework, backend, API key or database server is required. Question collections, their answers/explanations and source labels stay bundled. The collection selector is visible in Question bank, Practice and Examinations. Importing a pack saves it in that browser's IndexedDB; deployment does not automatically import every pack.

**Simplest upload — ready-to-host files:**

1. Generate the deployment folder with `python tools/package_static.py` (or `py tools/package_static.py` on Windows). This also creates `admission-companion-static.zip`. On this workstation use the bundled Python path shown under Run locally if necessary. Python only copies files; it is not needed by the hosted app.
2. Unzip `admission-companion-static.zip`. Create a GitHub repository, for example `admission-companion`. For GitHub Free Pages, use a public repository. Upload the **contents** of the extracted directory to the repository root, keeping `assets`, `css`, `js` and `data` intact. `index.html`, `manifest.json` and `service-worker.js` must be at the root, not inside another `site` folder. Keep `.nojekyll` too.
3. In the repository open **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**. Select your actual default branch if it has a different name.
4. Wait for deployment to finish. Open the Pages address shown there, normally `https://YOUR-USERNAME.github.io/admission-companion/`. Use the trailing slash. Hash routes such as `#/past-papers` work without server rewrites.
5. Wait for **Ready for offline study**. Open Question bank and load the collections you want, or restore your previous full backup as explained below. Select the collection in Practice or Examinations.

**Automatic deployment — full development repository:**

Commit the project including `.github/workflows/pages.yml` and `tools/package_static.py`. In **Settings → Pages**, select **GitHub Actions** as the source. Push to `main` or `master`, or run **Actions → Deploy Admission Companion → Run workflow**. The workflow copies the app into `site/`, uploads that static artifact and deploys it; the phone only receives HTML/CSS/JS/JSON and assets. It does not publish research archives, tests or temporary files in the Pages artifact. If your branch has another name, change the workflow's branch list. Use this method instead of branch-based publishing for the development repository.

For updates, regenerate and replace the static files in the **same repository**, or push a source change with the workflow. Bump the `CACHE` version in `service-worker.js` whenever shipped app files change. After deployment, open online, wait for the update to download, close **all** app tabs/windows, reopen and wait for **Ready for offline study**. Do not clear site data. Question IDs, collection labels and existing student records are preserved by the import/update logic.

**Move existing study progress:** localhost and GitHub Pages are different origins. Before moving, use **Settings → Download full backup** on the old address. Open the new HTTPS address → **Settings → Restore a full backup → Validate backup**, review the counts and choose **Replace data and restore**. This transfers collections, questions, bookmarks, attempts, progress, completed exams and settings. Restore replaces data on the destination; back up that destination first if you have already studied there. A question-only export does not transfer progress. Browser data and backups are not included in the deployment package.

Deployment references: [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom Actions workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Other static hosts

One simple option is Netlify's Free plan (subject to its usage limits). No build command or backend is needed.

1. Sign in at [Netlify Drop](https://app.netlify.com/drop).
2. Generate `site/` with `python tools/package_static.py`, then drag that **site folder** into the upload area. `index.html`, `manifest.json`, and `service-worker.js` must be at the uploaded folder's top level, alongside `js`, `css`, `assets`, and `data`. The generated folder contains the complete offline app and bundled collections.
3. Open the assigned **HTTPS** site address and check that it says **Ready for offline study**. Keep this production address for your brother.
4. For later updates, regenerate `site/`, open the **same project's Deploys page** and upload the updated folder there. Keep the same hostname; creating a different site gives it separate student storage. No redirects or SPA rewrite rules are needed for hash routes.

See [Netlify's manual deployment instructions](https://docs.netlify.com/manage/projects/add-new-project/) and [Free plan limits](https://www.netlify.com/pricing/). Hosting serves public application files; imported bank/progress data stays on the phone.

## Install on Android using Chrome

1. Open the production HTTPS address in regular **Chrome**, outside private/incognito mode or an in-app browser.
2. Stay online until **Ready for offline study** appears. Import your real bank in **Practice → Question bank** (the bundled sample is for testing only).
3. Open **Settings** using the gear, or **Profile → Settings**. Under **Install on your phone**, tap **Install App** and accept Chrome's installation dialog.
4. If Chrome has not supplied the prompt, follow the displayed instructions: **Chrome ⋮ menu → Add to Home screen → Install**. Wording varies; another browser may require its own Add to Home screen option. If the app is already installed, open its existing icon.
5. Open **Admission Companion** from the home screen. It should launch without the normal browser address bar and show the same questions/progress.
6. In Settings, tap **Request persistence**, then **Download full backup**. Confirm the backup exists in Downloads/Files and keep another copy somewhere safe.

Install dialogs are opened only after a deliberate tap; there are no automatic reminders or repeated prompts. A dismissed browser event is consumed once. Standalone launches and the browser's `appinstalled` event hide installation controls. Browsers cannot universally tell a normal tab whether an app was installed earlier; instructions remain available in that case. See [the browser installation API guidance](https://web.dev/learn/pwa/installation-prompt).

A plain HTTP LAN address (such as `http://192.168...`) does not enable Android service workers. Desktop localhost is allowed; localhost on the phone means the phone itself.

## Open and study offline

After the first successful online setup, enable airplane mode, **also turn Wi-Fi off**, close the app, and open its home-screen icon again. Check Dashboard, answer a practice question, and finish a short model test. Close/reopen and check the new progress. Practice sessions are temporary, but recorded answers persist; an active model test resumes with its original deadline.

All required scripts, styles, fonts, icons, and testing questions are cached locally. Already imported questions, dashboard statistics, bookmarks, mistake retries, model tests, local-file imports, and backup/export/restore work offline. New deployments and initial installation require internet access. No external runtime requests are made.

## Full backup and restore

**Settings → Download full backup** saves one JSON file with the question bank, answer history, bookmarks, completed tests, per-question progress, profile/preferences, and any active test. Store it outside browser storage, and back up after significant study sessions and before updates or moving phones. Files are unencrypted; keep them private. Exports contain a format version and checksum to catch accidental corruption, not to authenticate a sender.

To restore, close other app windows/tabs, download a backup of the current data, choose the saved full-backup file in Settings, and tap **Validate backup**. Review the counts, then tap **Replace data and restore**. This replaces all current data with the backup, including its saved test deadline. Cancel leaves data unchanged. Invalid/unsupported files are rejected before writes; the replacement uses one transaction across all six stores, so a failed write rolls back. Restore accepts files up to 50 MB; keep backups within this limit. Very large histories still require device testing.

**Question bank → Export** saves questions only; it cannot restore progress. Original bank JSON files are imported through Question bank, not the full-backup restore control. Full backups can transfer records to a new phone/origin manually; there is no automatic sync.

## Question JSON format

Use a UTF-8 `.json` file containing an array, or an object with a `questions` array. Each question has four distinct options. **`correctAnswer` is a zero-based integer**: 0 is the first option and 3 is the fourth.

```json
{
  "questions": [
    {
      "subject": "English",
      "chapter": "Grammar",
      "topic": "Subject–verb agreement",
      "question": "Choose the correct sentence.",
      "options": ["She go home.", "She goes home.", "She going home.", "She gone home."],
      "correctAnswer": 1,
      "explanation": "The third-person singular subject takes goes in the simple present.",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true
    }
  ]
}
```

Required fields: `subject`, `question`, `options`, `correctAnswer`, `explanation`. Other fields above are supported and optional. `source` (reference text up to 1000 characters) and `language` (`bn`, `en`, `mixed`, or null) are also optional. See [QUESTION_BANK.md](QUESTION_BANK.md) for the complete format, five-question example, source rules, university-wise organization, and import reports. Omitted difficulty defaults to `medium`; omitted `isSample` defaults to `false`. Only add university/unit/year metadata when you know the question's source. Leave it blank or null for original exercises.

Supported subjects (copy these exact names):

- বাংলা
- English
- সাধারণ জ্ঞান
- বাংলাদেশ বিষয়াবলি
- আন্তর্জাতিক বিষয়াবলি
- সাধারণ বিজ্ঞান
- ICT
- মানসিক দক্ষতা
- সমাজবিজ্ঞান

Validation limits:

- Up to 20 MiB and 10,000 questions per import; split larger banks into files.
- Non-empty question (max 3000 characters), exactly four different non-empty option strings (max 1000 each), and non-empty explanation (max 5000).
- Chapter, topic, university, and admissionUnit: strings up to 200 characters.
- `examYear`: integer 1900–2100 or null. `difficulty`: `easy`, `medium`, or `hard`. `isSample`: boolean.
- All rows must validate before anything is imported. Validation reports row numbers; malformed files import nothing.
- Duplicate identity is SHA-256 of normalized **subject + question text**. Unicode NFC, case, and whitespace are normalized. Duplicates inside a file and existing-bank duplicates are skipped. Existing question content is not overwritten, even if options or explanations differ. Explicit target/provenance links may merge only when answer content matches; conflicts are reported. IDs are generated locally.

Question Bank supports subject/difficulty and chapter/topic/university/unit/year/language filters, text search including source references, expandable answer previews, and full-bank JSON export. Practice and model-test setup use the same additional filters. Import reports distinguish within-file/already-stored duplicates and conflicting answer content; existing content and legacy metadata are kept, while explicit admission links may be added to matching records. Export includes every stored question regardless of active filters and can be reimported. The bundled [sample file](data/sample-questions.json) is a complete format reference.

## Admission targets

JU, GST, NU and expandable Other universities are separate preparation categories with Humanities primary. Bank, Practice and Examinations expose target/group/unit selectors. Questions can link to several targets or be explicitly common without duplicating records. Sourced previous-year occurrences are separate from preparation links. Existing IDs and student records are preserved.

See [ADMISSION_TARGETS.md](ADMISSION_TARGETS.md) for link/import fields, local configuration of units/groups and independent subject distributions/marking, and model-test generation. No official exam patterns are prefilled. See [QUESTION_SOURCES.md](QUESTION_SOURCES.md) for researched official portals and third-party question sources, including what could not be authenticated.

## Study features and calculations

**Practice:** Select a subject or all subjects, then random or bank order. Each session uses each selected question once. Selecting an option immediately saves one attempt, reveals the correct answer and explanation, and unlocks Next. Bookmarks can be toggled from the question. A practice session itself is temporary; recorded answers and bookmarks persist.

**Mistake Book:** Automatically includes any question whose latest saved attempt was incorrect, including submitted model-test attempts. A correct retry removes it from the active mistake book while preserving the full history. Review it from Practice, Home, or Profile. Bookmarks have a separate practice view.

**Model tests:** Select subject, question count (up to the available bank), 1–180 minutes, and a wrong-answer penalty (0, 0.25, 0.5, or 1). Questions are chosen randomly without repetition. Navigate by question number or Previous/Next; change or clear answers. Submission asks you to confirm the unanswered count. Custom tests default to 1 mark per correct answer and allow a positive personal mark value; configured patterns can set section-specific marks and penalties. Wrong answers lose the saved penalty; unanswered questions earn 0. Negative total scores are allowed. Detailed review shows all correct options, your answers, and explanations.

One active test is saved with question snapshots, answers, and an absolute deadline. Reloading or navigating away does not reset or pause the timer. If time expires while the app is closed, reopening Exams submits it automatically. A unique result ID prevents duplicate results/history on repeated submissions. Use one app tab for an active test; simultaneous editing across tabs is not supported.

**Progress:** Total attempts and accuracy use saved practice answers plus answered questions from submitted tests; unanswered exam items are excluded from accuracy. Repeated attempts count separately. Subject bars show unique questions attempted / current bank questions, not syllabus mastery. Weak subjects are those below 60% on at least one attempt; small samples are labeled an early signal. Daily targets use Bangladesh time (Asia/Dhaka). Examination history opens the original stored review.

## Storage and privacy

All study data lives in IndexedDB database `admission-companion`:

| Store | Contents |
| --- | --- |
| questions | Validated question bank |
| history | Individual submitted answers |
| bookmarks | Saved question IDs |
| exams | Completed test scores and question/answer snapshots |
| progress | Per-question attempts, correct counts, and mistake status |
| settings | Name, university goal, daily target, theme, active test and admission configuration |

Writes are transactional and the UI reports success only after commit. Theme also has a localStorage mirror to apply it before page paint. Cache Storage holds application files, not study records. Data survives ordinary closes and restarts in the same browser profile/origin. Settings includes an optional persistent-storage request; the browser may decline it.

**Clearing site data, uninstall settings that clear storage, private browsing, or browser eviction can remove local records.** Keep full backups outside this browser and retain original question files. Ordinary application updates never clear IndexedDB or localStorage. This is a personal app, not an account service.

## Project structure

```text
admission-companion/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   ├── styles.css                 # Shared theme and responsive foundation
│   └── study.css                  # Working practice/exam/bank interface
├── js/
│   ├── app.js                     # Routing, dashboard, progress, profile/settings
│   ├── practice.js
│   ├── examinations.js
│   ├── bank.js
│   ├── theme-init.js
│   ├── components/                # Shared navigation, icons, UI helpers
│   └── services/
│       ├── db.js                  # IndexedDB and atomic study writes
│       ├── questions.js           # Validation, duplicate identity, import/export
│       ├── analytics.js           # Derived real statistics
│       ├── exams.js               # Pure scoring calculation
│       └── theme.js
├── data/sample-questions.json
├── assets/
│   ├── fonts/                     # Inter, Noto Sans Bengali, licenses
│   ├── icons/                     # SVG and 192/512 PNG PWA icons
│   └── vendor/                    # Bootstrap 5.3.3 CSS and license
├── tests/                         # Browser flows and process-restart tests
├── README.md
├── QUESTION_BANK.md             # Authoring, exact JSON contract and examples
├── TESTING.md
├── THIRD_PARTY_NOTICES.md
└── preview-*.png
```

Views are rendered by small ES modules into the shared HTML shell. Hash routing works on static hosts without rewrite rules. Mistakes, bookmarks, and question bank are accessible under Practice/Profile, preserving the five main navigation destinations.

## Maintaining the offline cache

`service-worker.js` precaches every required application asset during installation. A failed asset prevents installation and displays a setup failure; no partial installation is presented as offline-ready. Application navigations and assets use the cached shell. Updates remain waiting while any app window/tab is open, avoiding a code change during practice or a test. Close all app windows/tabs and reopen to activate a downloaded update. Activation removes older application-file caches without deleting IndexedDB or localStorage. Initial installation claims the page so it can reopen offline.

When changing app files, bump `CACHE` in **service-worker.js** only. Reopen online to download the update, close all app windows/tabs, then reopen. There is no forced reload. Offline readiness is checked with the active worker; there is no duplicated UI cache version. Add newly required assets to `FILES`. Database schema changes need their own version upgrade in `db.js`. Never clear IndexedDB just to deploy an interface update.

## Tests and limits

See [TESTING.md](TESTING.md) for the actual browser checks, offline verification, and how to repeat them. The automated browser test is optional developer tooling; it is not an application dependency.

Automated desktop checks pass for the documented flows; the physical Android checklist in TESTING.md remains required before relying on the phone. Verification used desktop Microsoft Edge at mobile/desktop sizes, not a physical Android device or Safari/Firefox. The exam clock relies on the device clock; this is a personal study tool, not a proctored examination system. Screen-reader testing and a full accessibility audit have not been performed.


## Larger reading supplement

The bundled collections now offer **12,743 non-sample study records**, including the **6,880 published-question additions** described in [SUBJECT_COVERAGE.md](SUBJECT_COVERAGE.md), the earlier 5,848 study records and 15 selected Satt Humanities excerpts. This is preparation material, not an authenticated JU/GST/NU past-paper archive. Original source answer keys are retained where supplied; BLUCK provides no detailed rationales, so those records explicitly say source-key-only. Source references, copyright/license attribution and verification limits accompany each record. Collections are separately filterable in Bank, Practice and Examinations. The packs total roughly 34 MiB before audits and other app assets; allow the larger initial download to finish. Physical Android performance remains to be checked.
