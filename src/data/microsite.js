export const MICROSITE = {
  sender: { name: 'GTR' },
  prospect: { name: 'Fieldstone' },
  rep: {
    name: 'Ava Chen',
    title: 'Sr. AE',
    email: 'ava@gtr.co',
    initials: 'AC',
    replyNote: 'replies within the hour',
    timeSlot: '30 min · this week',
  },
  recipient: { firstName: 'Jess' },
  preparedOn: 'Apr 23, 2026',
  readMinutes: 7,
  greeting: {
    eyebrow: 'A personal follow-up · for Jess',
    title: 'Hi Jess — here’s a recap of what we heard, and where we think GTR fits in.',
    lede: 'Based on our call Tuesday, this is the shortest path we see from where Fieldstone is now to where you want to be by Q3. Everything here is tailored to what you shared.',
  },
  heard: [
    {
      mark: '01',
      quote:
        '“Our AEs are spending 40 minutes on follow-up after every discovery call — it’s killing our pipeline velocity.”',
      attrib: 'On rep capacity',
    },
    {
      mark: '02',
      quote:
        '“We’ve got case studies buried in Drive folders — nobody can find the right one for the buyer in the moment.”',
      attrib: 'On knowledge access',
    },
    {
      mark: '03',
      quote:
        '“Our buyers ghost us after great calls. We send a generic follow-up email and never hear back.”',
      attrib: 'On deal slippage',
    },
  ],
  solutions: [
    {
      tag: 'PROBLEM 01',
      title: 'Cut post-call follow-up from 40 min to 6 min, per call.',
      body: 'GTR drafts a tailored microsite in the background the moment your call ends — pulling the prospect’s own language, your next steps, and their priorities. Reps review, not write.',
    },
    {
      tag: 'PROBLEM 02',
      title: 'Your Knowledge library, pulled in automatically.',
      body: 'Every artifact in Fieldstone’s library — case studies, pricing, one-pagers — becomes indexed reference material. The brief cites what the buyer needs, not what’s easy to find.',
    },
    {
      tag: 'PROBLEM 03',
      title: 'A follow-up your buyer actually opens.',
      body: 'Microsites average 3.4 opens per recipient vs. 0.6 for email. You see when the CFO forwards it, which section they linger on, and where the deal is warming or cooling.',
    },
  ],
  metrics: [
    { label: 'Hours back per rep, each week', value: '7.5', unit: 'hrs', source: 'Based on 12 reps, 4 calls/day' },
    { label: 'Projected increase in reply rate', value: '3.1', unit: '×', source: 'Avg. across 47 GTR customers' },
    { label: 'Fewer days in stage (discovery → evaluation)', value: '−5.4', unit: 'days', source: 'Modeled on your 2025 funnel' },
  ],
  nextSteps: [
    { n: '01', title: 'Our 45-min call covered discovery + requirements', status: 'done', meta: 'Completed Apr 21 · Ava & Jess' },
    { n: '02', title: 'Share this brief with Priya (RevOps) and Marcus (CRO)', status: 'next', meta: 'Due this week' },
    { n: '03', title: 'Live walkthrough with your GTM leadership', status: 'todo', meta: '30 min · tentative Apr 29' },
    { n: '04', title: 'Two-week pilot with 4 reps on live calls', status: 'todo', meta: 'No-risk · pay only if you renew' },
  ],
  pitch: {
    statValue: '+34%',
    statLabel: 'reply rate',
    copy: 'Across 2,400+ reps on GTR, teams see an average 34% lift in post-call reply rate within the first 60 days — and cut follow-up time by 80%.',
  },
  diffs: [
    { icon: 'bolt', title: 'Built for the moment after the call', body: 'We don’t replace your CRM or your sequencer. We fix the 40 minutes that sit between a great call and a sent follow-up — the hours reps lose most.' },
    { icon: 'link', title: 'Native to your stack', body: 'Two-way Salesforce, HubSpot, Gong, Zoom, and Chorus. Knowledge lives where you already keep it — Drive, Notion, SharePoint.' },
    { icon: 'shield', title: 'SOC 2 Type II · GDPR · zero retention', body: 'Your transcripts never train a foundation model. Sensitive fields are redacted before a single token leaves your tenant.' },
    { icon: 'users', title: 'Works the way your reps already work', body: 'Reps review, never rewrite. The microsite matches your brand, your voice, and your buyer’s language — not ours.' },
  ],
  customerStory: {
    company: 'Northwind Materials',
    quote:
      '“We rolled GTR out to our 18-person sales team in a week. Within a month, our discovery-to-demo conversion was up 41% and our AEs were actually excited to do follow-up.”',
    attribInitials: 'DL',
    attribName: 'Dana Li',
    attribRole: 'VP Sales, Northwind Materials',
    kpis: [
      { value: '+41%', label: 'Disco → demo' },
      { value: '6 min', label: 'Avg. send time' },
      { value: '92%', label: 'Rep adoption' },
    ],
  },
  socialProofLogos: ['Northwind', 'Kestrel', 'Meridian', 'Harbor&Oak', 'Lattice', 'Cardinal'],
  briefId: 'FL-0421',
  expiresOn: 'May 21',
}
