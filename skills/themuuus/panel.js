export const meta = {
  name: 'themuuus',
  description: 'The Muuus and eight experts debate a topic, push for big achievable ideas, and write one clear plan',
  whenToUse: 'Run from the themuuus skill with args {dir: <run folder holding task.md, context.md, user-words.md>}',
  phases: [
    { title: 'Opinions', detail: 'each expert reviews the topic through its lens' },
    { title: 'Debate', detail: 'each expert argues with the others' },
    { title: 'Muuus listens', detail: 'The Muuus sums up and gives each expert a task' },
    { title: 'Big ideas', detail: 'each expert answers its task' },
    { title: 'Muuus pushes back', detail: 'small ideas go back for another round' },
    { title: 'The plan', detail: 'The Muuus writes the clear plan' },
  ],
}

const DIR = args && args.dir
if (!DIR) throw new Error('themuuus: pass args {dir: "<run folder>"} holding task.md, context.md and user-words.md')
const TASK = `${DIR}/task.md`
const CTX = `${DIR}/context.md`
const WORDS = `${DIR}/user-words.md`
const ROLES = [
  { key: 'ml', name: 'ML Scientist', lens: 'learning methods, evaluation validity, label quality, leakage, what can and cannot be learned at this data size, which techniques fit (LLM-as-judge, retrieval, distillation, active learning, entity and event resolution)' },
  { key: 'data', name: 'Senior Data Analyst', lens: 'what the data really contains and lacks, data quality and coverage across sources, metrics that mean something, baselines, reading numbers honestly, quick analyses that settle debates' },
  { key: 'aieng', name: 'AI Engineer', lens: 'reliable LLM systems: prompts and pipelines, quotas and cost, agents and tools, retrieval, guardrails, evals in CI, what ships in days with the tools already in place' },
  { key: 'swe', name: 'Senior Software Engineer', lens: 'architecture, data model, the existing codebase, maintainability for a small team run with AI agents, migrations, testing, operational risk' },
  { key: 'pm', name: 'Senior Product Manager', lens: "the user problem and outcomes: does it make the user's work easier and faster, adoption, trust, the north-star metric, what to build first for the biggest felt change, what to cut" },
  { key: 'po', name: 'Senior Product Owner', lens: 'an ordered, testable backlog: acceptance criteria, small shippable slices, dependencies, definition of done, sequencing with the work already planned' },
  { key: 'fullstack', name: 'Senior Full-Stack Developer', lens: 'the whole path from database to screen: the database (schema, access rules, migrations, views), server functions, the web and mobile clients, realtime and offline, performance, what a feature really costs end to end in this codebase' },
  { key: 'design', name: 'Senior Web and App Designer', lens: "how it looks, feels and is understood on every device the user works on: information architecture, visual hierarchy, interaction and motion, accessibility, the existing design system; you learn from the ui-ux-pro-max skill — find its SKILL.md with `find ~/.claude -path '*ui-ux-pro-max*' -name SKILL.md` and read it and the references it points to before proposing anything; if it is not installed, say so and use the best current practice it stands for — and you push the product to feel advanced" },
]
const MUUUS = `You are The Muuus. You know the user, their work and their project better than anyone: you read their own words (${WORDS}), the context pack and the project's docs and designs closely. You listen patiently to every expert, weigh who is right, and decide. You never accept small, incremental or safe ideas: you push for big, bold ideas that change how things work for the user, but they must be achievable by the user's team (often one developer working with AI agents) within weeks, within the user's rules written in the context pack (budget and API limits, privacy, what may be automated, never acting towards other people on the user's behalf unless asked). You are decisive and concrete. You are by far the most advanced person in the room and you judge every expert's performance: when one gives generic, shallow, unchecked or safe ideas, you say so plainly and order it to study its field properly (the code and data it skipped, the best current practice, the skills that hold that practice) and come back top-notch.`
const files = (prefix) => ROLES.map((x) => `${DIR}/${prefix}-${x.key}.md`).join(', ')
const common = (r) => `You are the ${r.name} on a panel of eight senior experts (ML Scientist, Senior Data Analyst, AI Engineer, Senior Software Engineer, Senior Product Manager, Senior Product Owner, Senior Full-Stack Developer, Senior Web and App Designer) advising the user, chaired by The Muuus. Your lens: ${r.lens}.
First read the topic ${TASK} and the context pack ${CTX} fully, then the files they list that matter for your lens (always ${WORDS}). Keep the user's main goals (in the context pack) at the centre. Be specific to their project, its data and its code; no generic advice. Never edit any file except the one you are told to write. Do not write to any database or service.
YOUR DUTY BEFORE SUGGESTING ANYTHING: check what the project already does — read the code (the repo named in the context pack) and the docs, status files and latest plans/specs the context pack names. Never propose something that already exists; build on what exists. For every idea, name the existing feature it builds on or improves, with the file path(s) you checked, or say "new — nothing like it exists (checked: <paths>)". Improving an existing feature is as welcome as a new idea.
Give every idea an id: <your key>-<number> (e.g. ${r.key}-1), and keep ids stable across rounds.`

phase('Opinions')
await parallel(ROLES.map((r) => () => agent(`${common(r)}

Round 1, your opinion and your ideas. First review everything the topic asks the panel to discuss: for each part that matters through your lens, keep / change / drop and why, and what is missing entirely.
Then propose your ideas — there is no minimum and no maximum: one strong idea is fine, more only if each one is worth it — new ideas or improvements to features that already exist. Never pad the list to look thorough. For each idea: id, what it is, why it matters for his goals, builds on / improves (existing feature + paths you checked, or "new" + what you checked), how success is measured, rough effort.
End with the 3 things most likely to waste effort.
Write it to ${DIR}/r1-${r.key}.md (markdown, as long as your ideas need, no padding). Reply only: DONE ${r.key}`, { label: `opinion: ${r.name}`, phase: 'Opinions' })))

phase('Debate')
await parallel(ROLES.map((r) => () => agent(`${common(r)}

Round 2, the debate. Read all eight round-1 opinions: ${files('r1')}.
Debate every idea the other seven proposed, from your own perspective. For EACH idea id give a verdict — GO, MODIFY (say exactly how) or DROP — with your reason; check its "builds on" claim against the code if your lens cares (flag any idea that duplicates something the project already does). Argue like a real panel: name the colleague you answer, agree where they are right, disagree with evidence, offer alternatives, and change your own mind where you were wrong (say so). You may add new ideas (new ids) that the debate sparked, with the same fields as round 1.
Write it to ${DIR}/r2-${r.key}.md: first a verdict table (id | verdict | one-line reason), then the arguments that matter most. Reply only: DONE ${r.key}`, { label: `debate: ${r.name}`, phase: 'Debate' })))

phase('Muuus listens')
const KEYS = ROLES.map((r) => r.key)
const TASKS = { type: 'object', properties: { summary_file: { type: 'string' }, tasks: { type: 'array', items: { type: 'object', properties: { role: { type: 'string', enum: KEYS }, task: { type: 'string' } }, required: ['role', 'task'] } } }, required: ['summary_file', 'tasks'] }
const t = await agent(`${MUUUS}

First read ${TASK}, ${CTX}, ${WORDS} and what you need from the files they list. Then read the whole panel closely: round 1 ${files('r1')} and round 2 ${files('r2')}.
1. Write ${DIR}/muuus-listening.md: an IDEA LEDGER — every idea id from rounds 1–2 with the panel's verdicts (count of GO / MODIFY / DROP and who), your provisional call (go / modify / drop) and one line why; flag any idea that duplicates an existing feature or ignores one it should build on. Then: where the panel agrees, the real disagreements and who you think is right, and what everyone is still thinking too small about, given the user's goals.
Then PERFORMANCE: rate each of the eight experts top-notch / adequate / underperforming, with one line of evidence (generic, unchecked against the code, safe, duplicating an existing feature, or excellent).
2. Give each of the eight experts (${KEYS.join(', ')}) one task: a hard, specific challenge to come up with a better, bigger, achievable idea in its area. Say what "big" means here and what must be true for it to be achievable. Never assign a small or safe task. For an underperforming expert, the task starts with an order to learn: exactly what to study before answering (files, data, the best current practice in its field, skills such as ui-ux-pro-max), then the challenge.
Return summary_file = the path you wrote, and the eight tasks.`, { label: 'The Muuus listens', phase: 'Muuus listens', schema: TASKS })

phase('Big ideas')
const taskOf = (k) => ((t && t.tasks) || []).find((x) => x.role === k)?.task || "Propose your single biggest achievable idea in your area for the user's goals."
await parallel(ROLES.map((r) => () => agent(`${common(r)}

Round 3. Read The Muuus's notes ${DIR}/muuus-listening.md and the round-2 debate (${files('r2')}).
The Muuus gave you this task (if it starts with an order to learn, do that study first and show what you learned):
"""${taskOf(r.key)}"""
Answer it with a big, bold and achievable idea (or a tight set of ideas): what it is, why it changes things for the user, how it works on his real data and code, what the first 2 weeks deliver, how success is measured, the biggest risk and how you'd retire it. Small or safe answers will be sent back.
Write it to ${DIR}/r3-${r.key}.md (600–1,100 words). Reply only: DONE ${r.key}`, { label: `big idea: ${r.name}`, phase: 'Big ideas' })))

phase('Muuus pushes back')
const REVIEW = { type: 'object', properties: { send_back: { type: 'array', items: { type: 'object', properties: { role: { type: 'string', enum: KEYS }, push: { type: 'string' } }, required: ['role', 'push'] } } }, required: ['send_back'] }
const rv = await agent(`${MUUUS}

Read ${DIR}/muuus-listening.md and the eight round-3 answers: ${files('r3')}.
Write ${DIR}/muuus-review.md: for each expert, accepted or sent back, and why, and its performance now (top-notch / adequate / underperforming) compared with round 1–2. Check every answer meets the requirements: it builds on what the project already has (no double work — verify its "builds on" claim against the code when in doubt), it is big and achievable, measured, and within the user's rules. Send back any answer that is small, safe, vague, duplicates an existing feature, or is not achievable, with a precise push saying what to change; an expert that is still underperforming gets an order to study (what, exactly) before it rewrites. Return send_back (empty if all are good enough).`, { label: 'The Muuus reviews', phase: 'Muuus pushes back', schema: REVIEW })
const back = (rv && rv.send_back) || []
log(`The Muuus sent back ${back.length} of 8: ${back.map((b) => b.role).join(', ') || 'none'}`)
await parallel(back.map((b) => () => {
  const r = ROLES.find((x) => x.key === b.role)
  if (!r) return null
  return agent(`${common(r)}

Round 4. The Muuus sent your round-3 answer back (${DIR}/r3-${r.key}.md). His push:
"""${b.push}"""
Read ${DIR}/muuus-review.md, then rewrite your answer to meet the push: bigger and bolder, still achievable, concrete on the real data and code. Overwrite ${DIR}/r3-${r.key}.md with the improved answer (same structure). Reply only: DONE ${r.key}`, { label: `redo: ${r.name}`, phase: 'Muuus pushes back' })
}))

phase('The plan')
const plan = await agent(`${MUUUS}

You have listened to everything. Read ${TASK}, ${CTX}, ${WORDS}, ${DIR}/muuus-listening.md, ${DIR}/muuus-review.md, all round-2 files (${files('r2')}) and all final round-3 answers (${files('r3')}).
Now write THE CLEAR PLAN for the user to ${DIR}/plan.md (markdown, plain words, every technical term explained in one line; as long as the idea ledger needs):
1. The big picture: what changes, in 3–5 sentences.
2. The big bets you chose (and which expert ideas they come from), each with why it's big and why it's achievable.
3. THE IDEA LEDGER — your final call on EVERY idea the panel raised (id | idea | builds on | final call: go / modify (how) / drop | why). You listened to everyone; the call is yours.
3b. The requirements check: confirm each "go" idea does not duplicate an existing feature, builds on what exists (name it), is achievable by the user's team in weeks, and respects the user's rules; say how you checked.
4. The phased plan: phases of 1–2 weeks, each with what ships, how success is measured, and a stop-or-change rule. Fit it with the work already planned (named in the context pack).
5. What the user must decide, as short questions with your recommended answer.
6. The risks that could sink it and how each is watched.
7. The panel's performance: one line per expert (top-notch / adequate / underperforming) and what each must learn before the next panel.
Reply with the plan's path only.`, { label: 'The Muuus writes the plan', phase: 'The plan' })
return { plan, sent_back: back.map((b) => b.role) }
