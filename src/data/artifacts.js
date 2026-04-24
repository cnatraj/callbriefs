export const ARTIFACTS = [
  { id: 'A-118', name: 'Q2 Pricing Sheet — Enterprise.pdf',       kind: 'pdf',   size: '1.4 MB',  tags: ['pricing','enterprise'],       owner: 'Priya Raman',   updated: 'Today, 11:02', usage: 42,  status: 'indexed'      },
  { id: 'A-117', name: 'Platform overview deck (v4.3).pptx',      kind: 'deck',  size: '12.8 MB', tags: ['deck','overview'],            owner: 'Ava Chen',      updated: 'Today, 09:40', usage: 128, status: 'indexed'      },
  { id: 'A-116', name: 'Security & compliance one-pager.pdf',     kind: 'pdf',   size: '640 KB',  tags: ['security','soc2'],            owner: 'Marcus Ortiz',  updated: 'Yesterday',    usage: 67,  status: 'indexed'      },
  { id: 'A-115', name: 'Northwind case study.mp4',                kind: 'video', size: '84 MB',   tags: ['case-study'],                 owner: 'Derek Vance',   updated: 'Yesterday',    usage: 9,   status: 'processing', pct: 72 },
  { id: 'A-114', name: 'Objection-handling playbook.docx',        kind: 'doc',   size: '220 KB',  tags: ['playbook','internal'],        owner: 'Ava Chen',      updated: 'Apr 20',       usage: 34,  status: 'indexed'      },
  { id: 'A-113', name: 'ROI calculator — logistics.xlsx',         kind: 'sheet', size: '180 KB',  tags: ['calculator','logistics'],     owner: 'Sam Whitfield', updated: 'Apr 19',       usage: 18,  status: 'indexed'      },
  { id: 'A-112', name: 'Product screenshots (April refresh).zip', kind: 'image', size: '48 MB',   tags: ['screenshots','assets'],       owner: 'Priya Raman',   updated: 'Apr 19',       usage: 55,  status: 'indexed'      },
  { id: 'A-111', name: 'Integrations — Salesforce guide.pdf',     kind: 'pdf',   size: '2.1 MB',  tags: ['integrations','crm'],         owner: 'Marcus Ortiz',  updated: 'Apr 18',       usage: 11,  status: 'needs-review' },
  { id: 'A-110', name: 'Competitor matrix — Q2.pdf',              kind: 'pdf',   size: '1.8 MB',  tags: ['competition'],                owner: 'Derek Vance',   updated: 'Apr 17',       usage: 73,  status: 'indexed'      },
  { id: 'A-109', name: 'Customer intro — Fieldstone.mp3',         kind: 'audio', size: '22 MB',   tags: ['call'],                       owner: 'Ava Chen',      updated: 'Apr 16',       usage: 4,   status: 'indexed'      },
]

export const COLLECTIONS = [
  { name: 'All artifacts',       count: 186, active: true },
  { name: 'Pricing & packaging', count: 14 },
  { name: 'Security & legal',    count: 22 },
  { name: 'Case studies',        count: 31 },
  { name: 'Product & demos',     count: 48 },
  { name: 'Objection handling',  count: 9  },
  { name: 'Call recordings',     count: 62 },
]

export const KIND_META = {
  pdf:   { label: 'PDF',   tint: 'oklch(64% 0.17 25)' },
  deck:  { label: 'Deck',  tint: 'oklch(68% 0.17 45)' },
  doc:   { label: 'Doc',   tint: 'oklch(60% 0.14 240)' },
  sheet: { label: 'Sheet', tint: 'oklch(62% 0.15 150)' },
  image: { label: 'Image', tint: 'oklch(62% 0.17 300)' },
  video: { label: 'Video', tint: 'oklch(64% 0.17 10)' },
  audio: { label: 'Audio', tint: 'oklch(68% 0.15 90)' },
}
