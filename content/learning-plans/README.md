# Learning plan uploads

Each JSON file contains one plan and up to 2,000 entries. Every entry requires an English definition, at least one Chinese meaning, at least one synonym, a supported part of speech, and exactly two bilingual examples.

Upload a new plan:

```sh
npm run plan:upload -- content/learning-plans/simple-english-1000.sample.json
```

Existing plans are protected. After intentionally editing an existing plan, replace it with:

```sh
npm run plan:upload -- content/learning-plans/simple-english-1000.sample.json --replace
```

The uploader hides the plan while its entry batches are being replaced and publishes it only after every batch succeeds.
