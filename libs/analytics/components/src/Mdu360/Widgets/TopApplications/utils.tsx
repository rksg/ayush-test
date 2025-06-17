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
