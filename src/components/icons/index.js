import { h } from 'vue'
import Icon from './Icon.vue'

const make = (draw) => ({
  props: { size: [Number, String], sw: [Number, String], fill: String },
  setup(props) {
    return () => h(Icon, { ...props }, { default: () => draw() })
  },
})

const path = (d) => () => h('path', { d })
const many = (...nodes) => () => nodes.map((n) => h(n.tag, n.attrs))

export const IconPlus = make(path('M12 5v14M5 12h14'))
export const IconBriefs = make(() => [
  h('rect', { x: 3, y: 6, width: 18, height: 14, rx: 2 }),
  h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
  h('path', { d: 'M3 12h18' }),
])
export const IconKnowledge = make(() => [
  h('path', { d: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z' }),
  h('path', { d: 'M4 4.5v17' }),
  h('path', { d: 'M8 7h8M8 11h6' }),
])
export const IconUsers = make(() => [
  h('circle', { cx: 9, cy: 8, r: 3.2 }),
  h('path', { d: 'M3 20c.7-3.3 3.2-5 6-5s5.3 1.7 6 5' }),
  h('circle', { cx: 17, cy: 9, r: 2.6 }),
  h('path', { d: 'M16 15c2.6.3 4.4 1.9 5 5' }),
])
export const IconSettings = make(() => [
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('path', {
    d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  }),
])
export const IconSearch = make(() => [
  h('circle', { cx: 11, cy: 11, r: 7 }),
  h('path', { d: 'm20 20-3.5-3.5' }),
])
export const IconBell = make(() => [
  h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
  h('path', { d: 'M10.3 21a1.9 1.9 0 0 0 3.4 0' }),
])
export const IconChevronDown = make(path('m6 9 6 6 6-6'))
export const IconArrowRight = make(path('M5 12h14M13 6l6 6-6 6'))
export const IconArrowUpRight = make(path('M7 17 17 7M8 7h9v9'))
export const IconSparkle = make(
  path('M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6'),
)
export const IconMic = make(() => [
  h('rect', { x: 9, y: 3, width: 6, height: 12, rx: 3 }),
  h('path', { d: 'M5 11a7 7 0 0 0 14 0' }),
  h('path', { d: 'M12 18v3' }),
])
export const IconDoc = make(() => [
  h('path', { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' }),
  h('path', { d: 'M14 3v5h5' }),
  h('path', { d: 'M9 13h6M9 17h4' }),
])
export const IconCheck = make(path('m5 12 5 5L20 7'))
export const IconX = make(path('M6 6l12 12M18 6 6 18'))
export const IconMore = make(() => [
  h('circle', { cx: 6, cy: 12, r: 1 }),
  h('circle', { cx: 12, cy: 12, r: 1 }),
  h('circle', { cx: 18, cy: 12, r: 1 }),
])
export const IconFilter = make(path('M4 5h16M7 12h10M10 19h4'))
export const IconTrendUp = make(path('M3 17 9 11l4 4 8-8M14 6h7v7'))
export const IconClock = make(() => [
  h('circle', { cx: 12, cy: 12, r: 9 }),
  h('path', { d: 'M12 7v5l3 2' }),
])
export const IconSend = make(path('M22 2 11 13M22 2l-7 20-4-9-9-4z'))
export const IconList = make(path('M4 6h16M4 12h16M4 18h16'))
export const IconGrid = make(() => [
  h('rect', { x: 4, y: 4, width: 7, height: 7, rx: 1 }),
  h('rect', { x: 13, y: 4, width: 7, height: 7, rx: 1 }),
  h('rect', { x: 4, y: 13, width: 7, height: 7, rx: 1 }),
  h('rect', { x: 13, y: 13, width: 7, height: 7, rx: 1 }),
])
export const IconLock = make(() => [
  h('rect', { x: 4, y: 11, width: 16, height: 10, rx: 2 }),
  h('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }),
])
export const IconEye = make(() => [
  h('path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' }),
  h('circle', { cx: 12, cy: 12, r: 3 }),
])
export const IconShield = make(() => [
  h('path', { d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z' }),
  h('path', { d: 'm9 12 2 2 4-4' }),
])
export const IconBolt = make(path('M13 2 3 14h7l-1 8 10-12h-7l1-8z'))
export const IconLink = make(() => [
  h('path', { d: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1' }),
  h('path', { d: 'M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1' }),
])
export const IconCalendar = make(() => [
  h('rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }),
  h('path', { d: 'M3 10h18M8 3v4M16 3v4' }),
])
export const IconBuilding = make(() => [
  h('rect', { x: 4, y: 3, width: 16, height: 18, rx: 1 }),
  h('path', { d: 'M12 3v18' }),
])
