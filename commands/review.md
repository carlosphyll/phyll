---
description: Review the UX of this app as a first-time user would, with screenshots as evidence
argument-hint: "[app address] [who the end user is]"
disable-model-invocation: true
---

Run a Phyll UX review.

Arguments: $ARGUMENTS

1. Work out where the app runs. An address in the arguments is the running app; otherwise use `entryUrl` in `.phyll/config.json`, or start the project's dev script. Anything else in the arguments describes the end user or the jobs to focus on.
2. Launch the `phyll:phyll-reviewer` agent with the address, the project folder and any description of the end user. It follows `${CLAUDE_PLUGIN_ROOT}/skills/phyll/SKILL.md` with the phyll tools and returns the report path, the index and the three findings that most block the end user.
3. If agents are not available, follow `${CLAUDE_PLUGIN_ROOT}/skills/phyll/SKILL.md` yourself.
4. Show the person the index, those three findings and the path to `report.md`, and offer to apply fixes with `/phyll:fix`.
