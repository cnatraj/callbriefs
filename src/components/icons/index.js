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
export const IconChevronUpDown = make(path('M8 9l4-4 4 4M8 15l4 4 4-4'))
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
export const IconMail = make(() => [
  h('rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }),
  h('path', { d: 'm3 7 9 6 9-6' }),
])
export const IconCopy = make(() => [
  h('rect', { x: 9, y: 9, width: 12, height: 12, rx: 2 }),
  h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
])
export const IconRotateCcw = make(() => [
  h('path', { d: 'M3 12a9 9 0 1 0 3-6.7L3 8' }),
  h('path', { d: 'M3 3v5h5' }),
])
export const IconArrowDownToLine = make(() => [
  h('path', { d: 'M12 17V3' }),
  h('path', { d: 'm6 11 6 6 6-6' }),
  h('path', { d: 'M5 21h14' }),
])
export const IconMonitor = make(() => [
  h('rect', { x: 2, y: 4, width: 20, height: 13, rx: 2 }),
  h('path', { d: 'M8 21h8M12 17v4' }),
])
export const IconPhone = make(() => [
  h('rect', { x: 6, y: 2, width: 12, height: 20, rx: 2 }),
  h('path', { d: 'M11 18h2' }),
])

// Speed / momentum
export const IconZap = make(path('M13 2 3 14h7l-1 8 10-12h-7l1-8z'))
export const IconTimer = make(() => [
  h('path', { d: 'M9 2h6' }),
  h('circle', { cx: 12, cy: 14, r: 8 }),
  h('path', { d: 'M12 10v4l3 2' }),
])
export const IconRocket = make(() => [
  h('path', {
    d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
  }),
  h('path', {
    d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
  }),
  h('path', { d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' }),
  h('path', { d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' }),
])

// Trust / proof
export const IconBadgeCheck = make(() => [
  h('path', {
    d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
  }),
  h('path', { d: 'm9 12 2 2 4-4' }),
])
export const IconStar = make(
  path(
    'M12 2l2.6 6.7L22 9.4l-5.6 4.7L18 22l-6-3.6L6 22l1.6-7.9L2 9.4l7.4-.7z',
  ),
)

// Polish / ease
export const IconSparkles = make(() => [
  h('path', {
    d: 'M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z',
  }),
  h('path', { d: 'M20 3v4M22 5h-4M4 17v2M5 18H3' }),
])
export const IconSliders = make(() => [
  h('path', {
    d: 'M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3',
  }),
  h('path', { d: 'M2 14h4M10 8h4M18 16h4' }),
])
export const IconMousePointerClick = make(() => [
  h('path', { d: 'M9 9l5 12 1.8-5.2L21 14z' }),
  h('path', { d: 'M7.2 2.2 8 5.1' }),
  h('path', { d: 'M2.2 7.2 5.1 8' }),
  h('path', { d: 'M11.7 3.9 13.7 1.9' }),
  h('path', { d: 'M3.9 11.7 1.9 13.7' }),
])

// People / partnership
export const IconHeadphones = make(() => [
  h('path', { d: 'M3 14a9 9 0 0 1 18 0' }),
  h('path', {
    d: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1z',
  }),
  h('path', {
    d: 'M21 14h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1z',
  }),
])
export const IconHandshake = make(() => [
  h('path', { d: 'm11 17 2 2a1 1 0 0 0 3-3' }),
  h('path', {
    d: 'm14 14 2.5 2.5a1 1 0 0 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87L21 4',
  }),
  h('path', { d: 'M3 4h7l-1 11 6.5 6.5a1 1 0 1 0 3-3' }),
])

// Insights / intelligence
export const IconBarChart2 = make(() => [
  h('path', { d: 'M3 20h18' }),
  h('path', { d: 'M18 20V10M12 20V4M6 20v-6' }),
])
export const IconBrain = make(() => [
  h('path', {
    d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z',
  }),
  h('path', {
    d: 'M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z',
  }),
  h('path', { d: 'M12 5v13' }),
])

// Connectivity / scale
export const IconPlug = make(() => [
  h('path', { d: 'M12 22v-5' }),
  h('path', { d: 'M9 7V2' }),
  h('path', { d: 'M15 7V2' }),
  h('path', {
    d: 'M6 13V8h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4Z',
  }),
])
export const IconGlobe = make(() => [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }),
  h('path', { d: 'M2 12h20' }),
])
export const IconLayers = make(() => [
  h('path', { d: 'm12 2 9 4.9-9 4.9-9-4.9z' }),
  h('path', { d: 'm3 12 9 4.9 9-4.9' }),
  h('path', { d: 'm3 17 9 4.9 9-4.9' }),
])
