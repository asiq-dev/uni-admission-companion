# Admission targets and examination configuration

The priorities are JU, GST, NU, then Other universities. The group selector starts with Humanities. These are preparation categories, **not declarations of eligibility or official exam rules**. No university units, marks distributions, penalties, or official patterns are prefilled. Use the current official circular for the intended session before configuring one. This application models MCQ practice, not university merit calculations, practical/written examinations or eligibility decisions.

## Select a target

Question Bank and Examinations have a visible **Admission target / university** selector, followed by preparation group, admission unit, question category and previous examination year. Practice has the same controls. Choose JU, GST, NU or Other; unit choices come from your configuration and recorded question links. Humanities is the primary group; choose another group when needed. With All targets selected, unit/group controls are inactive and legacy questions remain available.

Preparation includes questions explicitly linked to the selected target and questions you explicitly marked as common preparation. Questions without links remain in All targets; they are not silently assigned to JU/GST/NU. A blank unit/group on a preparation link means broad study relevance for that target. This is not evidence that any group may apply for an admission unit.

Previous-year mode excludes common/preparation-only records and matches a single recorded occurrence's target, unit, group and year together. An unspecified group/unit does not prove an exact group/unit match; choose All groups/All units to include such provenance. An old record's university/unit/year/source fields remain intact; recognized JU/GST/NU labels can be filtered without migrating records. Such legacy records need a source and year and must not be samples to enter previous-year mode. A source string is a citation supplied by the author, not automatic authenticity verification.

## Share questions without duplicating records

In Bank, leave the target on All targets, tick the question checkboxes, and use **Reuse questions for admission targets**. Select the target, optional unit and preparation group, then click **Link selected to target**. Repeat for another target. Alternatively, **Mark selected as common preparation** makes that same stored question available across targets for general subject study. These actions add links only; they never assert a previous-year occurrence.

All links reference the original question ID. Its bookmarks, attempts, progress and saved exam snapshots keep working. Target counts may overlap; they are not additional records. Importing identical question/answer/explanation content can also merge explicit links. Conflicting options/answers/explanations reject link merging for that duplicate. Original content and legacy metadata are never overwritten. There is no automatic correction or removal of old provenance.

## Additional question JSON fields

The ordinary fields in QUESTION_BANK.md still apply. Add these optional fields to an existing question object:

```json
{
  "common": false,
  "admissionTargets": [
    {"targetId": "ju", "unit": "", "group": "Humanities"},
    {"targetId": "gst", "unit": "", "group": "Humanities"},
    {"targetId": "nu", "unit": "", "group": "Humanities"}
  ],
  "previousYears": []
}
```

This is metadata to add to a complete question, not a standalone importable question. `common` is a boolean (default false). Arrays default empty and accept at most 100 entries each. Target IDs must be 1–60 lowercase ASCII letters/digits/hyphens, beginning with a letter/digit. Unit/group are optional strings up to 200 characters. Trimmed empty values mean unspecified. Duplicate links are removed.

A `previousYears` entry has `targetId`, optional `unit` and `group`, integer `examYear` (1900–2100), and nonblank `source` (up to 1000 characters). Populate it **only after checking the actual paper**; preserve its year, unit, group, shift/set and question number in the citation. The source can include a URL plus page/question identifiers. Sample questions (`isSample: true`) cannot carry previous-year records. Never infer an examination year from a website publication/upload year. A question can carry several independently checked occurrences without duplicating its content.

Old single-source fields (`university`, `admissionUnit`, `examYear`, `source`) still export/restore unchanged. Advanced chapter/topic/source-field filters remain available and combine with the target controls. The new target/occurrence controls are the preferred way to organize shared questions.

## Configure units, groups and examination patterns

Open **Bank → Reuse questions for admission targets → Configure universities, units and examination patterns**. Export the configuration, edit the JSON file, then **Validate & save configuration**. This is entirely local, works offline, and is included in Settings full backups. Configuration imports are limited to 1 MiB. Reopen Examinations after saving. Keep all existing target IDs; add custom targets after the priority targets rather than reusing an ID for a different institution.

Initial configuration:

```json
{
  "version": 1,
  "targets": [
    {"id":"ju","name":"Jahangirnagar University (JU)","units":[],"groups":["Humanities","Science","Business Studies"]},
    {"id":"gst","name":"GST Integrated Admission System","units":[],"groups":["Humanities","Science","Business Studies"]},
    {"id":"nu","name":"National University (NU)","units":[],"groups":["Humanities","Science","Business Studies"]},
    {"id":"other","name":"Other universities","units":[],"groups":["Humanities","Science","Business Studies"]}
  ],
  "patterns": []
}
```

Each target requires a unique ID, nonblank name, and `units` / `groups` arrays of unique nonblank strings up to 200 characters. Up to 50 targets and 100 units/groups per target are supported. The built-in ju/gst/nu/other IDs must remain present. Group names are user-maintained preparation labels. Add verified unit names for the relevant session; do not assume a unit letter means the same thing at different universities or across sessions.

Each pattern requires:

| Field | Meaning |
| --- | --- |
| id, name | Unique stable pattern ID (same ID syntax as targets), human-readable name |
| targetId | Existing configuration target ID |
| unit, group | Strings; nonblank values must occur in that target's units/groups arrays |
| session | String, e.g. the actual session copied from a circular; blank if not applicable |
| source | Nonblank reference text up to 1000 characters; label personal patterns explicitly |
| durationMinutes | Integer 1–180 |
| correctMarks | Positive number up to 100 |
| wrongPenalty | Nonnegative number up to 100; absolute marks deducted per wrong answer |
| sections | Nonempty array of distinct subjects, each with positive integer count |

Section subject names must match the app's question subjects. A section can optionally override `correctMarks` and `wrongPenalty`; otherwise it inherits the pattern values. Total questions must be at most 10,000; up to 50 sections and 200 patterns are supported. A pattern must be MCQ-only. If a real pattern has features the app cannot represent, keep it as a personal practice approximation and state that in its name/source.

The following is a **personal practice example**, not JU's actual pattern. Add it to `patterns` only if you want these personal settings:

```json
{
  "id": "personal-ju-practice",
  "name": "Personal short JU preparation drill — not an official pattern",
  "targetId": "ju",
  "unit": "",
  "group": "Humanities",
  "session": "",
  "source": "Personal practice settings; not an official admission pattern",
  "durationMinutes": 10,
  "correctMarks": 1,
  "wrongPenalty": 0,
  "sections": [
    {"subject": "বাংলা", "count": 5},
    {"subject": "English", "count": 5}
  ]
}
```

In Examinations, choose the target/group/unit, then select a configured pattern. Its exact subject counts, duration and marking apply; selected chapter/difficulty/source filters may further restrict the candidate pool. Shortages stop generation; the app never silently fills from another target, repeats a question or changes the distribution. Each question is selected once, even if it has several target/provenance links. Common preparation questions are eligible for preparation-mode tests, but do not enter previous-year-only tests.

Without a configured pattern, **Custom practice test — personal settings** retains the existing workflow. Its defaults are ordinary app settings, not university rules. Changing targets resets pattern selection and personal marking defaults so another target's rules are not carried across accidentally. Scores use the saved per-question marks; unanswered questions earn zero. Results and active tests snapshot target, pattern, session, source, selected questions and marking. Editing configuration later never recalculates old scores or resets a running test.

## Sources and acceptance

See QUESTION_SOURCES.md for researched official portals, question-collection links, verification limits and a safe curation workflow. No website is queried by the application; links are references for you to open separately while online.

Automated tests cover JU/GST/NU filtering, common/shared records, occurrence-level filtering, duplicate-link merging, configurable subject distributions and scoring, insufficient pools, configuration backup/restore, offline model tests and legacy record preservation. Physical Android layout, downloads and performance still need a check on the intended phone.
