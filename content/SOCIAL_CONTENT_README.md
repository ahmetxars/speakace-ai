# SpeakAce social content queue

`social-content-queue.json` contains 24 draft posts: two posts per platform per week for TikTok, Instagram, and LinkedIn across a four-week campaign.

The queue is deliberately publishing-disabled. The export script performs no network requests and never connects to a platform account. A human must review brand voice, exam accuracy, privacy, source rights, and the final media before importing the output into a scheduler.

Validate the queue:

```sh
npm run export:social -- --validate-only
```

Export a deterministic CSV, using a Monday as the campaign start:

```sh
npm run export:social -- --start 2026-08-10 --format csv --out exports/social-2026-08-10.csv
```

Use `npm run --silent export:social -- --start 2026-08-10 --format json` for clean JSON on stdout, or add `--out <path>` for an automation system that reads a file. The script refuses to overwrite an existing output file unless `--force` is explicitly supplied.

Every exported row includes its same-site destination plus a deterministic tracking URL. The base is `NEXT_PUBLIC_SITE_URL` when configured and otherwise `https://speakace.org`; UTM values identify the platform, `organic_social`, the `speaking_score_retry_4w` campaign, and the post ID. For Instagram and TikTok, place the relevant tracking URL in the active link-in-bio destination before scheduling the matching post.

Illustrative transcript, score, and retry assets must keep their on-asset disclosure. Replacing one with real learner material requires written, purpose-specific, revocable consent for the exact transcript/audio/image, platforms, edit, and publication period. Anonymization alone is not consent.
