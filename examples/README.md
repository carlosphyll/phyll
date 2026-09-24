# Examples

[Leia em português](README.pt-BR.md)

Four small apps, each built twice.

- `before/` is the app the way a code generator tends to write it.
- `after/` is the same app after the Phyll review, with the same colors and components and much less to fill in.
- `review/` is the Phyll review of the before app: the scan, screenshots, probe measurements, `report.json` and the rendered `report.md`.
- `screenshots/` holds side-by-side comparisons of the same moment in both versions.

| Folder | App | Language | The first job | Review |
| --- | --- | --- | --- | --- |
| `dm-automation` | Replyloop, DMs for Instagram comments | English | Send a DM to everyone who comments a keyword | [report.md](dm-automation/review/report.md) |
| `booking` | Navalha Barbearia | Portuguese | Book a haircut | [report.md](booking/review/report.md) |
| `quote` | Orça Já, quotes for small businesses | Portuguese | Write a quote and send it to the client | [report.md](quote/review/report.md) |
| `menu` | Brasa Burger, a burger place | Portuguese | Order a burger for delivery | [report.md](menu/review/report.md) |

| Example | Fields, before and after | Clicks, before and after | AI tell index, before and after | Style kept |
| --- | --- | --- | --- | --- |
| Replyloop | 9 and 2 | 9 and 3 | 75 and 7 | 10 of 10 traits |
| Navalha Barbearia | 20 and 4 | 18 and 4 | 54 and 6 | 9 of 9 traits |
| Orça Já | 41 and 4 | 10 and 2 | 66 and 6 | 9 of 10 traits |
| Brasa Burger | 33 and 4 | 15 and 5 | 53 and 6 | 8 of 8 traits |

Fields and clicks are what a first-time user had to do for the first job. None of the before apps got that person to the result: the automation could not go live, the booking confirmed someone else's appointment, the quote could not be sent, and the order ended on the home page with no order number.

## Run them

All four share one package in this folder. Install it once, then start the two versions of an example, each in its own terminal:

```bash
cd examples
npm install
npm run dev:booking-before
```

In a second terminal, in the same folder:

```bash
npm run dev:booking-after
```

Run `npm install` inside this folder. From the repository root, `npm --prefix examples install` adds the repository itself as a dependency of the examples.

| Example | Before | After |
| --- | --- | --- |
| `dm-automation` | `dev:dm-before`, port 5173 | `dev:dm-after`, port 5174 |
| `booking` | `dev:booking-before`, port 5175 | `dev:booking-after`, port 5176 |
| `quote` | `dev:quote-before`, port 5177 | `dev:quote-after`, port 5178 |
| `menu` | `dev:menu-before`, port 5179 | `dev:menu-after`, port 5180 |

The apps have no server. The after versions keep their data in the browser, and nothing reaches Instagram, WhatsApp or a payment provider.

## Review one yourself

With Claude Code and the Phyll plugin installed, start a before app and run:

```
/phyll:review http://localhost:5175 Clientes de uma barbearia que marcam horário pelo celular
```

Or scan the source without opening the app:

```bash
node skills/phyll/scripts/scan.mjs examples/booking/before --format text
```

## Regenerate the comparisons

Start both versions of an example, then run from the repository root:

```bash
node scripts/example-screenshots.mjs booking
```

The moments captured for each example, and the clicks that reach them, are listed in `scripts/example-screenshots.mjs`. The script needs Playwright: run `npm install` and `npx playwright install chromium` at the root.

## What the tests check

`tests/example.test.mjs` scans every example on each run.

- Together, the before apps show every tell the scanner can detect.
- Each after app scores 25 or less on the AI tell index and keeps none of the tells a fix must remove.
- Each after app keeps the design: at least 80% of the before app's style traits are still there, and its style index moves by 20 points or less.
- Each review is a valid report, and every screenshot and probe file it cites exists.
