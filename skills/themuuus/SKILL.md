---
name: themuuus
description: >-
  Convene The Muuus and his expert panel: an ML Scientist, a Senior Data Analyst, an AI Engineer, a Senior Software
  Engineer, a Senior Product Manager, a Senior Product Owner, a Senior Full-Stack Developer and a Senior Web and App
  Designer (who learns from the ui-ux-pro-max skill). They each review a set of ideas or a problem, argue with each
  other (agree, disagree, offer alternatives), then The Muuus — who knows the user, their work and their project
  better than anyone — listens, gives every expert a hard task, sends back any idea that is small or safe, orders any
  underperforming expert to study and come back better, and ends with one clear, achievable plan. Use when the user
  says "themuuus", "the Muuus", "ask the panel", "let the experts discuss", or wants suggestions debated and turned
  into a big but achievable plan.
argument-hint: "<what the panel should discuss>"
---

# themuuus

You are the orchestrator. You don't take part in the panel, you don't argue, and you don't write the plan: the experts and The Muuus do that. Your job is to:
- give them a brief that stands on its own;
- run the rounds;
- bring the plan back to the user.

What the user typed after `/themuuus`: `$ARGUMENTS`

If that is blank or a placeholder, the topic is their most recent request in this conversation.

The people are described in `${CLAUDE_SKILL_DIR}/panel.md`. Read it once before you start. If the path looks unexpanded, use the "Base directory for this skill" Claude Code printed at the top of this skill.

## Step 1: the run folder

Make a new folder called `RUN`:
- in your scratchpad, if you have one;
- otherwise at `.themuuus/<short-topic>/` in the current directory.

Everything the panel writes goes there. Nothing is written into the user's projects.

## Step 2: write `RUN/task.md`, the topic in the user's words

Sub-agents can't see this conversation. Write what the panel must discuss so that a stranger could do it:
- **The request:** the user's request, in their own words where you can.
- **The material:** if it is a set of earlier suggestions, write them to `RUN/material.md` word for word (from the conversation or the session transcript) and point to it. Don't summarise them for the panel.
- **Likes and dislikes:** what the user liked or disliked so far, in their words.
- **A good result:** what a good result looks like, if they said.

Never write your own view of the answer into it.

## Step 3: write `RUN/context.md`, what The Muuus and the experts must know

- **The project.** Give absolute paths to:
  - the repo;
  - its instructions (`CLAUDE.md`, `AGENTS.md`);
  - its README, handoff and status docs;
  - the latest specs and plans;
  - the user's Claude Code memory folder for it (`~/.claude/projects/<project>/memory/`), if it exists.
- **The user's goals and standing rules,** from their own words: budget limits, privacy, what may be automated, what must stay manual.
- **Hard facts the panel needs:** data sizes, limits, what's live. Check each one, and say where it came from.
- **The user's own words.** Run:

  ```
  python3 "${CLAUDE_SKILL_DIR}/user_words.py" --since <YYYY-MM-DD> --out RUN/user-words.md
  ```

  - The default window is the last 10 days.
  - It collects the user's messages from this project's local Claude Code transcripts, so The Muuus can read what they actually said.
  - Add `--all` only if the user wants every project's messages read.
  - It reads only local transcript files and writes only `--out`.

The context file must list `RUN/task.md`, `RUN/material.md` (if any) and `RUN/user-words.md`.

## Step 4: run the panel

Tell the user in one line how big it is: "8 experts + The Muuus, 6 rounds, about 26–34 agent runs; rounds with many ideas take longer and use more tokens."

Then run the Workflow tool with `scriptPath: "${CLAUDE_SKILL_DIR}/panel.js"` and `args: {"dir": "<RUN>"}`.

If something gets in the way:
- **The tool refuses the path:** read `panel.js` and pass its whole text as the Workflow `script` input instead, with the same args.
- **The experts stop on a usage limit for one model:** set `model: 'sonnet'` (or another available model) on every `agent()` call and run again. Tell the user which model the panel used.
- **The Workflow tool isn't available:** run the same rounds by hand with the Agent tool (general-purpose). Send one message per round, with one call per expert, and use the briefs in `panel.js` word for word.

The rounds:
1. **Opinions and ideas.** Each of the eight experts:
   - first checks what the project already does (code and docs);
   - reviews the topic through its lens;
   - then proposes its ideas: new ones, or improvements to existing features. There's no minimum and no maximum; one is fine, and the list is never padded. Each idea has an id and says what it builds on.
2. **Debate.** Each expert:
   - gives every other expert's idea a verdict (go / modify / drop), with reasons from its own lens;
   - argues, naming who it answers;
   - flags duplicates of existing features;
   - changes its mind where it was wrong;
   - may add ideas.
3. **The Muuus listens.** He:
   - rates each expert's performance as top-notch, adequate or underperforming, and orders an underperforming one to study before answering again;
   - keeps an idea ledger: every idea, the panel's verdicts and his provisional call;
   - says who is right;
   - gives each expert one hard task.
4. **Big ideas.** Each expert answers its task: big, bold, achievable, measured.
5. **The Muuus pushes back.** He checks that every answer builds on what exists, does no double work, is big, is achievable, and fits the user's rules. Anything that fails goes back with a precise push, once.
6. **The plan.** The Muuus makes the final call on every idea in the ledger (go / modify / drop, and why), checks the requirements, and writes the clear plan.

Don't read the experts' files during the run. Give one line per finished round at most.

## Step 5: bring it back

Read `RUN/plan.md`, and `RUN/muuus-review.md` for who was sent back. Give the user:
1. **The plan:** in full, or as a faithful short version with the file path.
2. **The big bets and the ledger:** which expert each big bet came from, how many ideas went forward, were modified or were dropped, and why the important ones were dropped.
3. **The disagreements:** where the panel disagreed, and how The Muuus decided.
4. **The decisions:** the decisions the user must make, with The Muuus's recommended answers.
5. **The panel's performance:** how each expert performed, from the plan's last section.

Check any fact the plan depends on (data sizes, what exists in the code) before presenting it as true.

If the plan changes their project, don't apply it: ask first. If they want it kept, save it where the project keeps its specs, and point the project's handoff or README to it.

## Rules

- Every expert gets the same task and context files. Never add a hint to one expert's brief.
- The panel only writes inside `RUN`. If anything was written elsewhere, tell the user.
- The user's rules bind every idea. These are the rules written in `RUN/context.md`: budget and API limits, privacy, what may be automated, and never acting on the user's behalf towards other people unless they asked.
- If the user says stop, stop. The run folder keeps everything, and the Workflow tool can resume a run.
