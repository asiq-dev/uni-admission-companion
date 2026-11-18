# Humanities past papers

Open **Practice → Past papers by year**, the matching link in **Question bank** or **Examinations**, or `#/past-papers` directly. Desktop also has a Past papers navigation item.

Choose JU, GST or NU, then the examination calendar year. The current ten-year window is **2017–2026**; academic sessions are shown separately. This is a growing catalogue, **not a complete ten-year question archive**.

Opening the module or changing university selects the newest year with saved questions or an available local selection, so an empty current-year slot does not hide the existing material. You can still select every year manually.

## Current question coverage

| Target | Claimed examination year | Academic session | Unit / set | Bundled questions |
| --- | --- | --- | --- | --- |
| JU | 2024 | 2023–24 | C / L | 3 selected excerpts |
| GST | 2023 | 2022–23 | B | 9 selected excerpts |
| NU | 2025 | 2024–25 | Humanities | 3 selected excerpts |

These are the existing Satt personal-study selections, **not 15 additional questions**. Publisher paper/year/key claims have not been independently authenticated against original papers. Each question has its source link, source answer key and a separately written editorial explanation. Full source explanations are not copied. No full-paper reuse licence is claimed. Other supplementary packs do not become previous-year papers merely because they are useful preparation.

Use **Load this selection**, then **View saved questions and explanations**, **Practise this year** or **Custom test from this year**. Imports are append-only, skip duplicates, and preserve bookmarks, attempts, progress, settings and completed exams. A saved active test must be resumed/submitted before starting another. Custom tests use personal marking settings, not an inferred official pattern. Preview lists show at most 50 questions; practice uses the full saved selection.

## Year status

- **N saved**: questions already in this browser for the selected university/year.
- **N excerpts available**: a small local pack can be loaded; it is not a full paper.
- **Not collected**: no bundled paper for that year. This is not a claim that no examination occurred.
- **Not held**: a historical gap for this specific examination category. GST's combined system began with the 2020–21 session, in 2021; 2017–2020 are not GST examination years. NU regular affiliated-college honours admissions used SSC/HSC results during 2017–2024, with the test returning in 2025. This does not describe separate NU on-campus programmes or honours course examinations.

Historical references: [GST application launch, March 2021](https://www.dhakatribune.com/bangladesh/education/242655/uniform-admission-test-application-process-begins), [NU admission test return, June 2025](https://www.jagonews24.com/en/education/news/83693). Publisher listings are linked in the module. Links require internet; bundled metadata and saved questions work offline after **Ready for offline study**.

## Adding real papers

Use the JSON schema in [QUESTION_BANK.md](QUESTION_BANK.md). A question can have multiple `previousYears` entries; each must include the exact `targetId` (`ju`, `gst` or `nu`), `unit`, `group: "Humanities"`, numerical examination `examYear`, and a real source. Existing question identities can be reused across occurrences without copying records. The module uses these explicit links, not a guessed year or a generic preparation target. Imported source claims remain claims until independently checked. A claim conflicting with a not-held interval is shown with a warning.

For curated local selections, maintain `tools/build_past_paper_catalog.py` and rebuild `data/past-papers.json`. It references existing question IDs and preserves the original question metadata. Add only source-checked material with appropriate reuse permission, keep calendar year/session/unit/set separate, and update the cache version when shipping files. Do not fill missing years with generated questions or course-exam samples. The earlier linked official NU BA sample concerns honours course examinations; it must not be presented as an admission paper.

After an update, close all app tabs/windows and reopen; wait for **Ready for offline study**. Never clear site data to update. Download a full backup regularly. The catalogue does not change the IndexedDB schema or delete student data.
