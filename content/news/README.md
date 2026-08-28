# Daily news upload

1. Copy `template.json` to a real dated filename, for example `days-2026-08-28.json`.
2. Replace every placeholder with the daily article content and source details.
3. Set `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and Application Default Credentials in `.env` or `.env.local`.
4. Publish it:

```sh
npm run news:upload -- content/news/days-2026-08-28.json
```

Existing dates are protected from accidental overwrites. To intentionally replace one:

```sh
npm run news:upload -- content/news/days-2026-08-28.json --replace
```

The command validates the date, required text, paragraph limits, and source URL before connecting to Firebase.
