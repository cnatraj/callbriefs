export const BRIEFS = [
  { id: 'B-2041', company: 'Northwind Materials',  logo: 'NM', rep: { name: 'Ava Chen',      initials: 'AC' }, created: 'Today, 10:42',     status: 'sent',       views: 14, pct: 100 },
  { id: 'B-2040', company: 'Fieldstone Labs',      logo: 'FL', rep: { name: 'Marcus Ortiz',  initials: 'MO' }, created: 'Today, 09:15',     status: 'viewed',     views: 6,  pct: 100 },
  { id: 'B-2039', company: 'Harbor & Oak',         logo: 'HO', rep: { name: 'Priya Raman',   initials: 'PR' }, created: 'Yesterday, 17:02', status: 'draft',      views: 0,  pct: 60  },
  { id: 'B-2038', company: 'Kestrel Dynamics',     logo: 'KD', rep: { name: 'Sam Whitfield', initials: 'SW' }, created: 'Yesterday, 14:30', status: 'sent',       views: 3,  pct: 100 },
  { id: 'B-2037', company: 'Meridian Freight Co.', logo: 'MF', rep: { name: 'Ava Chen',      initials: 'AC' }, created: 'Apr 20, 11:20',    status: 'viewed',     views: 22, pct: 100 },
  { id: 'B-2036', company: 'Lattice & Boom',       logo: 'LB', rep: { name: 'Derek Vance',   initials: 'DV' }, created: 'Apr 19, 16:48',    status: 'sent',       views: 9,  pct: 100 },
  { id: 'B-2035', company: 'Cardinal Supply',      logo: 'CS', rep: { name: 'Priya Raman',   initials: 'PR' }, created: 'Apr 19, 10:05',    status: 'processing', views: 0,  pct: 35  },
  { id: 'B-2034', company: 'Ridgeline Robotics',   logo: 'RR', rep: { name: 'Marcus Ortiz',  initials: 'MO' }, created: 'Apr 18, 13:17',    status: 'sent',       views: 5,  pct: 100 },
]

export const STATS = [
  { key: 'sent',  label: 'Total briefs sent', value: '284',    delta: '+12 this week',  trend: 'up'   },
  { key: 'month', label: 'Briefs this month', value: '47',     delta: '+18% vs. March', trend: 'up'   },
  { key: 'time',  label: 'Avg. time to send', value: '6m 12s', delta: '−41s vs. March', trend: 'down' },
]
