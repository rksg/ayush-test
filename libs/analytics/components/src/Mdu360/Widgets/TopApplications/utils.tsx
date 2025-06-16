import {
  GoogleColored,
  TwitterColored,
  YouTube,
  Netflix,
  FacebookColored,
  LinkedInColored,
  ChromeColored,
  Apple,
  Microsoft,
  Whatsapp
} from '@acx-ui/icons'

const IconWrapper = ({ children, zoom = 0.3 }: { children: React.ReactNode; zoom?: number }) => (
  <span style={{ zoom, paddingRight: '20px' }}>{children}</span>
)

export const IconList = [
  { name: 'facebook', icon: <IconWrapper><FacebookColored /></IconWrapper> },
  { name: 'google', icon: <IconWrapper><GoogleColored /></IconWrapper> },
  { name: 'twitter', icon: <IconWrapper><TwitterColored /></IconWrapper> },
  { name: 'youtube', icon: <IconWrapper><YouTube /></IconWrapper> },
  { name: 'netflix', icon: <IconWrapper><Netflix /></IconWrapper> },
  { name: 'linkedin', icon: <IconWrapper><LinkedInColored /></IconWrapper> },
  { name: 'apple', icon: <IconWrapper zoom={0.4}><Apple /></IconWrapper> },
  { name: 'microsoft', icon: <IconWrapper zoom={0.4}><Microsoft /></IconWrapper> },
  { name: 'whatsapp', icon: <IconWrapper zoom={0.4}><Whatsapp /></IconWrapper> },
  { name: 'chrome', icon: <IconWrapper><ChromeColored /></IconWrapper> }
]

export function formatBytes (value: number): string {
  if (value < 1_000) {
    return `${value} KB`
  } else if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(0)} MB`
  } else {
    return `${(value / 1_000_000).toFixed(0)} GB`
  }
}
