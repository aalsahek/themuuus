# The Muuus

A Claude Code skill that convenes **The Muuus** and a panel of eight senior experts:
- ML Scientist
- Senior Data Analyst
- AI Engineer
- Senior Software Engineer
- Senior Product Manager
- Senior Product Owner
- Senior Full-Stack Developer
- Senior Web and App Designer, who learns from the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill

## How the panel works

1. **Opinions.** Each expert first checks what your project already does, then proposes ideas: no quota, one is fine.
2. **Debate.** Each expert gives every other idea a verdict (go / modify / drop), with reasons.
3. **The Muuus listens.** He keeps an idea ledger and gives each expert one hard task. He also rates every expert's performance. An underperforming expert is ordered to study its field before answering again.
4. **Big ideas.** Each expert answers its task: big, bold and achievable.
5. **Push back.** The Muuus sends back anything small, safe, vague or duplicated.
6. **The plan.** The Muuus makes the final call on every idea and writes one clear plan, with a phased schedule, the decisions you must make and the risks to watch.

It works on any project: the panel reads your repo, your docs and your own words before proposing anything, and every idea respects the rules you set (budget, privacy, what may be automated). Adapt the experts in `skills/themuuus/panel.md` and `panel.js` if your team looks different.

## Install

**As a plugin (recommended).** In Claude Code:

```
/plugin marketplace add aalsahek/themuuus
/plugin install themuuus@themuuus
```

**As a plain skill.** Tell Claude Code: "Install the skill from https://github.com/aalsahek/themuuus". Or copy it yourself:

```bash
git clone https://github.com/aalsahek/themuuus /tmp/themuuus && mkdir -p ~/.claude/skills && cp -R /tmp/themuuus/skills/themuuus ~/.claude/skills/
```

## Use

```
/themuuus <what the panel should discuss>
```

It writes everything to a run folder (your session's scratchpad) and nothing into your projects. A panel is about 26–34 agent runs. Large topics use many tokens.

## Needs

- **Claude Code** with the Workflow tool, for the six rounds. Without it, the skill runs the rounds by hand with sub-agents.
- **Python 3**, optional, for `user_words.py`. It gathers your own past messages from this project's Claude Code transcripts on this machine, so The Muuus can read what you actually said. It reads only local files, only this project's unless you pass `--all`.
