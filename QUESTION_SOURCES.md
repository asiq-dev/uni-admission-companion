# Question sources and verification

## Selected public Satt Humanities excerpts — 17 November 2026

`data/satt-humanities.json` adds **15 new short questions: JU 3, GST 9, NU 3**. The existing 28-question sourced starter remains unchanged; the new pack is separately selectable as **Satt Academy — selected Humanities excerpts**. It includes 14 Bangla-language/literature questions and one Bengal-history question categorised under Bangladesh affairs. Bangla editorial explanations were written for this app; source explanations were not copied. Keys/options are retained from public individual question pages. Neither historical-paper authenticity nor independent expert verification is claimed. Difficulty defaults to medium and is not calibrated.

The fixed selection considered at most 30 individual public pages linked by three publicly indexed Humanities listings. Each included stem plus all four options contains at most 22 whitespace-delimited words. Six candidates failed the short-excerpt/four-distinct-options checks; five were already in the older sourced pack; three need further answer review; one contains a suspected book-title spelling problem and was excluded. **15 included + 15 excluded = 30 candidates.** This is a limited attributed personal-study excerpt selection, not a complete website bank, an open licence for Satt content or permission to bypass login/paywalls. No source explanation or full paper was reproduced. Source references and the exact review/audit trail remain available.

Inputs: `tools/satt-local-manifest.json`, `tools/satt-local-candidates.json`, `tools/satt-humanities-review.json`. The first two are collection/review snapshots; only the locked, selected editorial reviews become questions. Rebuild offline with `python tools/build_satt_humanities.py`; no runtime network or external API is used. `data/satt-humanities-audit.json` records every outcome, source content hash, source key and included question ID. The imported records carry source URLs, the publisher listing title, editorial/verification labels and target preparation links. University and year fields remain blank/null, and `previousYears` stays empty. JU C and GST B appear only as preparation-unit links from the reviewed source listings, not official eligibility or marking claims.

Load using **Question bank → Load selected Satt Humanities (15 questions)**, or choose `data/satt-humanities.json` through **Validate & import**. Then select your target, **Preparation + common questions**, and the collection in Practice or Examinations. NU/JU have three questions in this selection, so use a three-question custom test or combine with other collections. Reimports skip duplicates and do not overwrite content/progress. This import is explicit on each device; app-file updates alone do not import it. The previous all-pack total of 12,744 including samples becomes **12,759** with this selection.

The current additional-subject collection is documented in [SUBJECT_COVERAGE.md](SUBJECT_COVERAGE.md): **6,880 published questions/problems** across Bangla, Bangladesh affairs, science, arithmetic, sociology, ICT and US-focused international history/government. BLUCK retains source keys with an explicit missing-rationale notice; no detailed explanations or original examination provenance were invented. Other packs preserve supplied support/worked solutions or label related textbook context. All source/verification limitations remain attached to records. The earlier research and collections below remain relevant; their historical counts refer to those particular packs.

No previous-year questions were generated, bulk copied or automatically imported. The references below are for deliberate source collection. A real publisher page is not proof that every question on it was asked in the claimed examination.

## Official sources for admission rules and original-paper verification

| Target | Primary source | Check result |
| --- | --- | --- |
| JU | [Jahangirnagar University](https://www.juniv.edu/) and [JU admissions](https://ju-admission.org/) | University homepage accessible. The admissions portal and indexed [2025–2026 revised circular](https://ju-admission.org/circular/JU_Admission_Circular_2025_2026_Revised.pdf) returned 502 during this research. No original past-paper archive was authenticated. |
| GST | [GST admissions](https://gstadmission.ac.bd/) | Portal and the indexed [prospectus URL](https://gstadmission.ac.bd/assets/pdf/docs/GST_Admission_Prospectus_2025_26.pdf) returned 403 to the research browser. Do not infer rules from inaccessible documents or similarly named unofficial domains. |
| NU | [National University](https://www.nu.ac.bd/) and [official admissions](https://www.nu.ac.bd/admissions/) | Official university notice listings were discoverable; admissions page exposed no readable content to the research browser. No official original-question archive was verified. |

Use the official current-session circular and any original paper released by the university/admission authority. The application deliberately includes **no prefilled official distribution/penalty** from these partially accessible sources.

## Question material found online

| Target/material | Source found | Status and use |
| --- | --- | --- |
| JU question collection | [Satt Academy JU MCQ bank](https://sattacademy.com/ques-bank/jahangirnagar-university/mcq) | Accessible third-party collection; unit/year labels were visible. Individual past-paper authenticity and answers are not certified here. Filter to the appropriate unit and check the original paper. |
| JU alternative | [Practiceclub JU previous-question listing](https://www.practiceclub.net/jahangirnagar-university-prev-question.list/4) | Accessible third-party university/unit listing; useful for locating candidate papers, not an official archive. |
| GST question collection | [Satt Academy GST collection](https://sattacademy.com/admission/gucch-biswbidzalygst) | Accessible third-party page with separate unit/session listings, including Humanities-labeled sets. Treat labels and solutions as claims until checked against the original paper. |
| NU question collection | [Satt Academy NU MCQ bank](https://sattacademy.com/ques-bank/national-university/mcq) | Accessible third-party collection covering different groups. The generic page can show non-Humanities material; filter carefully and verify each paper's identity. |
| NU Humanities original practice material | [Prothom Alo: Humanities model test 2](https://www.prothomalo.com/education/examination/3i9180wukm) | Publisher's own accessible model-test article, credited to lecturer Mahmud Bin Amin. This is identifiable authored practice material, **not a university previous-year paper or an official pattern**. The publication is a source for the model questions themselves. |

Satt Academy also advertises an AI explanation feature, so its explanations must not be treated as official university answer keys. No collection's claim of complete or accurate answers was independently verified. The original authored model-test page is the clearest publisher-attributed question source located in this search; it does not solve the separate task of authenticating historical papers.

## Curation workflow

1. Obtain the complete paper with its header showing university/system, unit, group (if applicable), session, date and shift/set. Check it against official notices or a reliable original scan. Do not confuse a coaching model test with an examination paper.
2. Keep a local copy and record its exact URL/title, page/question number and set/shift in source. Confirm the question and four options against the image; OCR can corrupt Bangla letters, punctuation and option order.
3. Check the answer using an official key when available; otherwise record the solution's author/reference and verify the explanation separately. Resolve disputed answers before import. Do not label a publisher's key official.
4. Add a previousYears record only after the actual occurrence is checked. Use admissionTargets for general preparation suitability and common for shared subject practice. Leave unknown university/year/source metadata blank instead of guessing.
5. Convert only checked material into the documented JSON format. Keep detailed explanations, use zero-based answer indexes, import a small batch, and review it in Bank/Practice before larger imports.
6. Retain source files and full student backups privately. The source websites are not runtime dependencies, and nothing is synchronized or fetched by the study app.

## First sourced practice pack — 17 November 2026

`data/sourced-practice.json` contains **28 selected short question excerpts**, retrieved from individually accessible Satt Academy admission-question pages: 15 JU-associated preparation items, 6 GST-associated items, and 7 NU-associated items. There are 17 English and 11 Bangla questions. It is a small starter collection, not a complete internet bank or an authenticated previous-year archive.

Use **Question bank → Load sourced practice (28 questions)**, or download/import the JSON. It appends questions; existing questions, bookmarks and progress are preserved. Practice already offers random question order. A target's normal Humanities preparation view includes that target's linked questions. Other general subject questions can be shared with the existing reuse controls.

The displayed question stems/options are short excerpts from the linked individual pages. Each excerpt is limited to 22 words across its stem and options. Options have been deterministically reordered and answer indexes recalculated. Website explanations were not copied. All explanations in this pack are **Admission Companion editorial explanations**, identified as such in each record. Structural checks and editorial key mapping do not certify a university's official answer key.

University/unit/year fields and previousYears are deliberately empty: source-site exam labels were not checked against original papers. Admission target links indicate preparation relevance only. `data/sourced-practice-audit.json` lists individual source URLs, retrieval date, excerpt counts, content hashes and inclusion/exclusion decisions. The overlapping prefix-meaning question was excluded. Passage-dependent questions without their passage, a spelling question without a correct option, and ambiguous sentence-choice items were not selected.

A complete copy of a commercial/copyrighted question-bank collection is not included. Further bulk expansion needs a reusable licensed export or source material the user is authorized to supply, with enough information to check answers and explanations. The one-time `tools/collect_source_candidates.py` only reads a fixed small review manifest, does not follow pagination, stops at sign-in/HTTP failures, and never runs inside the app. Its candidate output cannot be imported as a question bank before editorial review.

### Larger datasets investigated

- [BnMMLU](https://huggingface.co/datasets/samanjoy2/BnMMLU): a broad MCQ benchmark with a sign-in/acceptance gate; no file access was attempted around that gate. Its documented schema lacks detailed explanations and original exam provenance. It was not imported.
- [Hishab Bangla MMLU](https://huggingface.co/datasets/hishab/bangla-mmlu): mixed examination questions; the inspected metadata did not declare a dataset license, and the visible schema lacked detailed explanations/provenance. It was not imported.
- [SOMAJGYAAN](https://huggingface.co/datasets/farihashifa/SOMAJGYAAN): author metadata declares MIT, but the visible data has no explanations and contains apparent key issues (for example the Mughal-era name of Dhaka is keyed to a different city name). It was not bulk imported.
- [BanglaMedQA](https://huggingface.co/datasets/Oni279/BanglaMedQA): CC BY-SA 4.0 metadata and source exam labels/explanations, but the downloaded medical-admission CSV was biomedical rather than Humanities English/GK. It was inspected and not added to the brother's Humanities bank. The separate translated medical benchmark was not mistaken for authentic admission papers.

These findings explain why downloading thousands of rows blindly would not satisfy the earlier quality/provenance requirements. No gated dataset was accessed, no complete proprietary bank was copied, and no missing university/year/source or explanation was invented to inflate the bank.

## Larger licensed supplement — 17 November 2026

The user approved clearly labelled supplementary practice. The app now includes **2,875 licensed Bangla reading-comprehension exercises** in `data/licensed-reading.json`, in addition to the existing 28 university-associated starter questions. This provides **2,903 non-sample questions across two different kinds of collection**. Only the earlier 28 have third-party university associations; the supplement is shared preparation material, not 2,875 JU/GST/NU past papers.

### Source, permission and attribution

- Publisher: [Zenodo record 13764773](https://zenodo.org/records/13764773), DOI [10.5281/zenodo.13764773](https://doi.org/10.5281/zenodo.13764773).
- Creator names supplied by the publisher: **Shahriar-Hossain-Opu; Software-Machine-Intelligence-Lab**.
- Release: **Bangla-MCQ Dataset v-0.0.1**, published 15 September 2024, the archived repository release from the research project later described as NOIRBETTIK. The later repository/paper is not substituted for the pinned source.
- The publisher metadata declares **Creative Commons Attribution 4.0 International (CC BY 4.0)**: [license](https://creativecommons.org/licenses/by/4.0/). This is an openly downloadable release; no sign-in, CAPTCHA or access restriction was bypassed.
- Publisher archive checksum: `md5:22f53678baa2a5957d55309b2d8ff5bf`; verified against the downloaded file before processing.
- Raw archive and exact publisher metadata are retained under `data/source-material/`. The creator/license/changes notice is in `data/source-material/bangla-mcq-attribution.txt`, cached offline. Every imported question also retains attribution, license URL, release URL and worksheet row in its source field, so export/full backup preserve them.

The source corpus has passages and MCQs, not original university-paper metadata. The research project's data-source location or university affiliation is **not** evidence that its questions appeared in a JU examination.

### Selection and verification

Only the original Bangla worksheet is used. The parallel English translation is not counted again or added as independently verified English material. Of **3,818 nonblank source rows**, **2,875 unique records** are included and **943** are excluded. A further 971 formatted but empty worksheet rows are accounted for separately. Exclusions:

| Reason | Source rows |
| --- | ---: |
| Source-keyed answer text absent from passage | 142 |
| More than one answer option text found in passage | 361 |
| Conflicting duplicate question/answer records; all conflicting variants excluded | 34 |
| Duplicate answer options | 217 |
| Negative/ambiguous stem token requiring manual reasoning review | 175 |
| Missing required passage/question/option | 5 |
| Repeated identical record | 9 |
| **Nonblank rows excluded** | **943** |

The conversion preserves source passage, stem, option text and keys. It attaches the passage to each question so random practice remains self-contained, adds a supplementary label, and produces a deterministic editorial explanation quoting a passage sentence containing the keyed answer. No source questions or answer keys were generated or silently corrected. All four options must be distinct, and only the keyed option may match the passage. These checks are **structural/textual evidence checks, not independent expert semantic review**. A source key can still be wrong or the passage itself outdated; the per-question labels say so. The app's medium difficulty is a default, not an upstream difficulty assessment.

`data/licensed-reading-audit.json` accounts for every workbook row, with decisions and source hashes. `tools/build_licensed_reading_bank.py` reproduces the pack offline from the pinned archive and metadata. It verifies the publisher checksum and license declaration and rejects conflicting duplicates rather than guessing which key is correct. No runtime backend, external API or live scraping was added.

### Using the larger collection

1. Allow the application update to download online, close all its windows/tabs, and reopen.
2. Open Question bank and click **Load licensed reading supplement (2,875 questions)**. It appends records; existing questions, bookmarks, attempts and exam history remain.
3. In Practice, choose JU/GST/NU and Humanities, expand the additional filters, and choose **Bangla-MCQ — licensed supplementary reading** under Question collection. Keep Random order and start.
4. The same collection filter is available in model-test setup. These are personal reading drills unless you deliberately select a separately configured pattern. No official university marks distribution is implied.

The question JSON is about 12 MiB, so the first offline-cache setup/update needs a larger download. With the previous 16 testing samples plus both non-sample collections, the bank holds **2,919 records**, not three copies of the shared supplement. Full backups still have the documented 50 MiB restore limit. Physical Android memory/performance and a teacher's review of content remain needed; this expansion is not a claim to have collected all admission questions or all Humanities subject coverage.
## English vocabulary and general knowledge expansion (2026-11-17)

These two optional packs add **2,945 unique questions**, without claiming to be authentic JU, GST or NU admission questions. They are deterministic exercises adapted from reusable source data, not scraped proprietary question banks or AI-created past papers. They share Humanities preparation links to all three targets, with no invented examination years, admission units or marking patterns.

| Pack | Count | Scope | Source and reuse terms |
| --- | ---: | --- | --- |
| English vocabulary | 2,000 | Match a definition to a noun, verb or adjective; explanations compare all distractor senses | [Princeton WordNet 3.0](https://wordnet.princeton.edu/), under its [WordNet license](https://wordnet.princeton.edu/license-and-commercial-use); archived via the NLTK data mirror |
| General knowledge | 945 | 181 capitals, 182 currencies, 194 official-language, 194 region and 194 subregion exercises | [mledoze/countries contributors](https://github.com/mledoze/countries/tree/fa4f62182d19ff4f8b325cde6387c9cd9d80955a), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/); the adapted geography database is also ODbL 1.0 |

**Verification:** the converter matches answers to source fields/synsets and rejects known synonym distractors. It does not independently establish all distractor distinctions, current facts, admission relevance or expert difficulty. These limits appear in every source field and explanation. “Medium” is an uncalibrated schema default, not a measured rating. English definitions can have subtle or dated senses; answer the specific quoted sense. Geography asks about a pinned dataset snapshot, collected 2026-11-17, not independently checked current affairs. Regional classifications vary across references. This collection does not cover all of English grammar, Bangladesh affairs, history or the admission syllabus.

The geography converter uses records marked independent by the publisher, skips missing or multiple capital/currency values, and holds several capitals requiring administrative/political/transition nuance. For languages it includes one question per place, selects one listed language, and excludes every other listed language from distractors. These choices are selection rules, not a declaration about international recognition. All valid source language values remain in explanations and audit records.

**Reproduce offline:** run `python tools/build_english_gk_banks.py` from the project root. It checks SHA-256 digests of the bundled WordNet ZIP and Countries JSON before reading them, uses only Python's standard library and makes no network requests. The pinned commit is in `data/source-material/countries-release.json`. The output packs are `data/english-vocabulary.json` and `data/general-knowledge.json`, with corresponding `*-audit.json` files identifying lexical offsets/lemmas and geography record codes/fields. WordNet frequencies select common tagged senses; one definition and at most one exercise per lemma prevent synonym duplicates. Some adverbs cannot supply three different-category distractors and are omitted.

The source snapshots, full licenses and modification script are included so the adapted databases remain inspectable and reusable under their terms. Keep the supplied license notices with shared copies/exports. These database terms do not relicense unrelated app code or the other independently sourced collections.

**Use:** update/reopen the app, wait for offline readiness, open Question bank, and press **Load English vocabulary** and **Load general knowledge**. Imports append only; repeats skip existing records. Select a collection in Practice/Examinations and keep Random order for shuffled practice. Switching JU/GST/NU reuses the same records; selecting Previous-year questions excludes both supplements. Use **All targets** for unrelated or unassigned imports. No external source is fetched by the app at runtime.

