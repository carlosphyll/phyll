---
description: Quick static scan for AI tells in the source, without opening the app
argument-hint: "[folder]"
disable-model-invocation: true
---

Run Phyll's static scan on the folder in the arguments, or on the current project when there is none.

Arguments: $ARGUMENTS

Call the phyll scan tool with that folder. When the phyll tools are not available, run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/phyll/scripts/scan.mjs" <folder> --format text
```

Summarize the result for the person: the static AI tell index, each tell found with one example location, the routes and the longest form. Say that this is a hint from the source only, and that `/phyll:review` opens the app and checks what people actually see.
