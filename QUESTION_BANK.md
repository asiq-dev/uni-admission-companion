# Question-bank authoring guide

Admission Companion keeps the question bank and study records on this device. No backend or API is used. This guide describes the exact supported import contract. Older bank files without `source` or `language` still work, and existing question IDs are unchanged.

## File format

Save **UTF-8 JSON**, using either a top-level array of questions or an object with a `questions` array. An optional top-level `description` is informational only and is not saved on individual questions. No comments, trailing commas, Markdown fences, or JavaScript expressions belong in the actual JSON file. A UTF-8 BOM is accepted.

| Field | Type and rules | Required/default |
| --- | --- | --- |
| `subject` | One of the eight subject names below | Required |
| `question` | Nonblank string, at most 3000 characters | Required |
| `options` | Exactly four nonblank strings, each at most 1000 characters; distinct after Unicode/case/whitespace normalization | Required |
| `correctAnswer` | JSON integer `0`, `1`, `2`, or `3` | Required |
| `explanation` | Nonblank string, at most 5000 characters | Required |
| `collection` | Optional collection label, at most 200 characters, or null; used by Bank/Practice/Examinations filters | Empty string |
| `chapter` | String, at most 200 characters, or null | Empty string |
| `topic` | String, at most 200 characters, or null | Empty string |
| `university` | String, at most 200 characters, or null | Empty string |
| `admissionUnit` | String, at most 200 characters, or null | Empty string |
| `examYear` | Integer 1900–2100 or null; use the verified examination year | null |
| `difficulty` | `easy`, `medium`, or `hard`; omission/null defaults to medium | medium |
| `source` | Reference text, at most 1000 characters, or null | Empty string |
| `language` | `bn`, `en`, `mixed`, or null | null (unspecified) |
| `common` | Boolean; explicitly share across preparation targets | false |
| `admissionTargets` | Up to 100 target/unit/group preparation links; see ADMISSION_TARGETS.md | Empty array |
| `previousYears` | Up to 100 sourced target/unit/group/year occurrences; forbidden on samples | Empty array |
| `isSample` | Boolean; omitted/null defaults to false | false |

The application trims outer whitespace from text, preserves Bangla/English and paragraph breaks, and renders content as plain text. Use `\n` inside JSON strings for explanation paragraphs; HTML and Markdown are not interpreted. Limits count JavaScript string units (not bytes or visible glyphs). Unknown question properties are ignored; use the exact field names/casing above. Application IDs are generated locally, so do not assign your own `id`.

Subjects (use these names consistently):

- বাংলা
- English
- সাধারণ জ্ঞান
- বাংলাদেশ বিষয়াবলি
- আন্তর্জাতিক বিষয়াবলি
- সাধারণ বিজ্ঞান
- ICT
- মানসিক দক্ষতা
- সমাজবিজ্ঞান

`subject` is the study category, independent of the language used in the question. Bangla explanations may accompany English questions; use `language: "mixed"` for mixed content. Bundled fonts work offline. The optional language tag helps filtering and assistive technology; it does not translate content.

## Complete five-question example

These are **original format/testing exercises**, not authentic previous-year questions. University/unit/year are deliberately empty or null. Their source labels describe their actual origin, not an official examination. Copy the JSON contents into a `.json` file to import them. The downloadable `data/sample-questions.json` includes these five plus eleven other clearly labeled testing examples.

```json
{
  "description": "Original format examples only; not historical university admission questions.",
  "questions": [
    {
      "subject": "বাংলা",
      "chapter": "ব্যাকরণ",
      "topic": "পদ",
      "question": "‘সে বই পড়ে।’ বাক্যে ‘বই’ কোন পদ?",
      "options": [
        "বিশেষ্য",
        "বিশেষণ",
        "সর্বনাম",
        "ক্রিয়া"
      ],
      "correctAnswer": 0,
      "explanation": "‘বই’ একটি বস্তুর নাম, তাই এটি বিশেষ্য পদ।\nবাক্যে ‘সে’ সর্বনাম এবং ‘পড়ে’ ক্রিয়া; কোন শব্দের পদ জানতে চাওয়া হয়েছে তা আগে চিহ্নিত করতে হবে।",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true,
      "source": "Original app testing example; not a previous-year admission question.",
      "language": "bn"
    },
    {
      "subject": "বাংলা",
      "chapter": "শব্দভাণ্ডার",
      "topic": "বিপরীত শব্দ",
      "question": "‘আলো’ শব্দের বিপরীত শব্দ কোনটি?",
      "options": [
        "অন্ধকার",
        "আকাশ",
        "সকাল",
        "কিরণ"
      ],
      "correctAnswer": 0,
      "explanation": "আলোর বিপরীত অর্থ প্রকাশ করে অন্ধকার।",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true,
      "source": "Original app testing example; not a previous-year admission question.",
      "language": "bn"
    },
    {
      "subject": "English",
      "chapter": "Grammar",
      "topic": "Subject–verb agreement",
      "question": "Choose the correct sentence.",
      "options": [
        "She go to school.",
        "She goes to school.",
        "She going to school.",
        "She gone to school."
      ],
      "correctAnswer": 1,
      "explanation": "In the simple present, the third-person singular subject “she” takes “goes”.\n“She go” lacks the required verb ending. “She going” and “She gone” lack an auxiliary verb and do not form the requested simple-present sentence.",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true,
      "source": "Original app testing example; not a previous-year admission question.",
      "language": "en"
    },
    {
      "subject": "English",
      "chapter": "Vocabulary",
      "topic": "Antonyms",
      "question": "Which word is the opposite of ‘ancient’?",
      "options": [
        "Old",
        "Historic",
        "Modern",
        "Early"
      ],
      "correctAnswer": 2,
      "explanation": "Ancient refers to the distant past; modern refers to the present or recent times.",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true,
      "source": "Original app testing example; not a previous-year admission question.",
      "language": "en"
    },
    {
      "subject": "সাধারণ জ্ঞান",
      "chapter": "ভূগোল",
      "topic": "মহাদেশ",
      "question": "বাংলাদেশ কোন মহাদেশে অবস্থিত?",
      "options": [
        "এশিয়া",
        "আফ্রিকা",
        "ইউরোপ",
        "অস্ট্রেলিয়া"
      ],
      "correctAnswer": 0,
      "explanation": "বাংলাদেশ দক্ষিণ এশিয়ায় অবস্থিত।",
      "university": "",
      "admissionUnit": "",
      "examYear": null,
      "difficulty": "easy",
      "isSample": true,
      "source": "Original app testing example; not a previous-year admission question.",
      "language": "bn"
    }
  ]
}
```

## Adding new questions

1. Download a full backup in Settings before a substantial bank change. Retain original source documents separately.
2. Copy an example object. Set the subject, chapter and topic using consistent spellings. Enter exactly four different options.
3. Check the answer against a reliable source. Set the numeric correctAnswer using the mapping below, and write an explanation of **why** it is correct. Explain common traps or the rejected alternatives when useful. Do not merely repeat the answer.
4. Record the actual source: document/book title, edition, page/question number, or an official paper URL plus page/question number. A URL is saved as reference text; HTTP(S) references are clickable, and are fetched only if you deliberately open them. Keep a local copy of any material needed while offline. Leave unknown sources empty; the app displays “Source: not recorded”. Validation checks structure, not factual accuracy or source authenticity.

## Published subject collections and large exports

See [SUBJECT_COVERAGE.md](SUBJECT_COVERAGE.md) for the eight additional published-question packs, exact counts and limitations. They follow the existing schema and add `সমাজবিজ্ঞান` as an allowed subject. No IDs, original student questions or attempts are migrated or deleted. Each question can be reused across JU/GST/NU Humanities through preparation links.

BLUCK is an explicitly labelled **source-key-only** exception to the recommended detailed-rationale authoring standard: original MCQ stems/options/keys are retained, but feedback honestly states that no detailed rationale or original-paper/year link was supplied. It does not invent a rationale to satisfy the text field. Other packs retain original supporting paragraphs/worked answers or label mechanically selected section context. Keys and context are not independently expert-verified. These records must not be relabelled as authenticated JU/GST/NU past papers.

Question-bank exports larger than 20 MiB or 10,000 questions produce several **Download part N / M** buttons. Each compact JSON part has `questions` plus applicable `notices`, and is within the existing importer limits. Download/import **all** parts; no progress is included. Full backup remains the way to preserve attempts/bookmarks/exams/settings. Old single-array files and old full backups remain supported.
5. Set difficulty as your own editorial estimate, then review it after your brother practices. Mark original exercises `isSample: true` so they cannot be confused with verified past papers. Do not invent institutions, units, years, citations or provenance.
6. Save and open **Practice → Question bank → Validate & import**. Wait until “Saved on this device”. Validation reports one-based row numbers. Any invalid row rejects the entire file before writing; fix all reported errors and retry. Download the full report if there are many errors.
7. Check bank previews and filters. Open **Practice** or **Examinations** immediately; no reload or restart is necessary. Under “Chapter, topic, university and other filters”, choose the desired subset. An empty combination disables starting; change a filter to widen the selection. Options come from the selected subject, and filters combine with AND.
8. Answer one question, read the explanation, and check Progress. Keep full backups outside this browser. Bank-only exports omit progress; Settings full backups include it.

## Correct-answer rules

| Visible option | Array position | correctAnswer |
| --- | --- | --- |
| A / first | options[0] | 0 |
| B / second | options[1] | 1 |
| C / third | options[2] | 2 |
| D / fourth | options[3] | 3 |

Use the integer `1`, not `"1"`, `"B"`, or answer text. Zero is valid. The value is always zero-based, even when the source paper labels choices ক/খ/গ/ঘ or 1/2/3/4. If you reorder options, recalculate the index. Do not import an ambiguous or disputed key until it has been checked; describe any necessary context in the explanation.

## University-wise organization

Keep one consistent verified university name, the **unit name used by that examination**, and the verified examination year on each record. Do not copy today's unit name onto older papers without checking. The year field represents a single examination year, not an academic-session string; put the session label in `source` if needed. If the year cannot be established, use null. Unknown university/unit values remain empty.

Organize authoring files into folders by university, unit, and paper/year, with subject/chapter/topic on individual records. Import each file into the same application. In Bank, Practice, or Examinations, filter by university, then unit/year and subject to study that collection. Source and difficulty remain visible in question previews, practice, and saved test reviews.

The original university/unit/year/source fields remain supported. For multiple preparation targets or checked previous-year occurrences, use the additional `admissionTargets`, `previousYears` and `common` fields in [ADMISSION_TARGETS.md](ADMISSION_TARGETS.md). One question can serve JU, GST, NU and other targets without creating more question records. Source research and verification limits are documented in [QUESTION_SOURCES.md](QUESTION_SOURCES.md).

Identity remains normalized subject + question text, hashed with SHA-256. Reimporting matching content may add explicit target/provenance links; original question content and legacy metadata stay intact. Different options, answer indices or explanations are conflicts and do not merge links. Reports distinguish within-file and stored duplicates and list reused records. Existing bookmarks, attempts and exam snapshots retain their original links/content. Never delete site data to reorganize a bank.

## Large-bank limits and recovery

Each import accepts **1–10,000 questions and up to 20 MiB (20 × 1024 × 1024 bytes)**. Split larger collections into multiple files. Validation yields regularly to the interface and reports progress. Preview rendering starts with 50 matches and loads more on demand. All additions commit in one IndexedDB transaction; invalid rows or a storage failure leave the existing bank and study records unchanged. A bank can grow across multiple imports, but phone performance and browser storage are finite; these limits are guardrails, not a guarantee for every Android device.

A whole-bank export contains every question, including source/language fields. If it exceeds an import limit, split its array into valid chunks before reimporting. A full backup has its separate 50 MiB restore limit. If storage fills, keep existing data, download a full backup, and free unrelated device storage before retrying. Do not clear browser/site data.

## Licensed supplementary reading collection

Question bank includes an opt-in **Load licensed reading supplement (2,875 questions)** action. These are original-source Bangla reading exercises adapted from an archived CC BY 4.0 release, not questions authenticated as JU/GST/NU past papers. Every question includes the passage, source row/link, license/creator attribution and a source-key-plus-passage verification label. Explanations quote matching passage evidence and disclose the limited check. Passages may contain dated or inaccurate world facts: answer according to the supplied passage, and do not use them as current-affairs facts.

The same 2,875 records carry Humanities preparation links to all three targets; they are not stored three times. Use the **Question collection** filter under the additional filters to select them in Bank, Practice or Examinations. Source questions with their same identity are not duplicated on a second import. See QUESTION_SOURCES.md for license, full row audit, exclusions and scope limits.
## Bundled English and GK supplements

Question bank now offers separate **Load English vocabulary (2,000 questions)** and **Load general knowledge (945 questions)** buttons. These use the same JSON schema documented below. Records are shared JU/GST/NU Humanities preparation, with `previousYears: []`, `university: ""`, `examYear: null` and `language: "en"`; the GK subject is `সাধারণ জ্ঞান`. Their collection fields distinguish **WordNet — supplementary English vocabulary** and **Countries — supplementary world geography**. Filter by collection/topic in the bank, random practice or model tests. No official examination pattern is implied.

Both imports preserve existing records and report duplicates. All questions include source references, source-derived explanations and the limit **NOT independently verified**. These are adapted drills, not claimed historic admission questions. See [sources and reproducible conversion](QUESTION_SOURCES.md). New-pack exports use `{ "questions": [...], "notices": {...} }` so full reuse licenses travel with the data; this is accepted by the existing importer. Keep `notices` with copies even though only `questions` is imported into IndexedDB. Older array exports remain accepted. Full backups include notices without changing their data/checksum schema or restore compatibility.

