# Learning plan uploads

Each JSON file contains one plan and up to 2,000 entries. Every entry requires an English definition, at least one Chinese meaning, a synonym array (which may be empty), a supported part of speech, and between 2 and 100 bilingual examples.

Upload a new plan:

```sh
npm run plan:upload -- content/learning-plans/simple-english-1000.sample.json
```

Existing plans are protected. After intentionally editing an existing plan, replace it with:

```sh
npm run plan:upload -- content/learning-plans/simple-english-1000.sample.json --replace
```

The uploader hides the plan while its entry batches are being replaced and publishes it only after every batch succeeds.

Entries may label examples with `sense`, `meaning`, and `pattern`. If supplied, every example needs all three fields, and each sense needs at least two distinct examples with consistent labels.
