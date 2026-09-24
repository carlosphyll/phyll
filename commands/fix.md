---
description: Apply the fixes from the latest Phyll review, one finding at a time
argument-hint: "[finding ids such as UX-01 UX-03, or top, or all]"
disable-model-invocation: true
---

Apply fixes from the latest Phyll review.

Arguments: $ARGUMENTS

1. Find the newest folder in `.phyll/reports/` that has a `report.json`. If there is none, say so and suggest `/phyll:review` first.
2. Call the phyll guide tool with the name fixing, and follow that guide.
3. Scope: the finding ids in the arguments; `top` for the top three and the quick wins, which is the default; `all` for every open finding. Confirm the list with the person before changing code when it includes effort L or anything the guide asks you to check first.
4. Fix one finding at a time: run the project's checks, commit, and look at the screen again with the phyll browser tools.
5. When you are done, offer a new review with `/phyll:review` to measure the index again.
