import { Google, Twitter, YouTube, Netflix, Facebook } from '@acx-ui/icons'

export const IconList = [
  {
    name: 'Facebook',
    icon: <span style={{ zoom: 0.5, paddingRight: '20px' }}><Facebook /></span>
  },
  {
    name: 'Google',
    icon: <span style={{ zoom: 0.5, paddingRight: '20px' }}><Google /></span>
  },
  {
    name: 'Twitter',
    icon: <span style={{ zoom: 0.3, paddingRight: '20px' }}><Twitter /></span>
  },
  {
    name: 'YouTube',
    icon: <span style={{ zoom: 0.3, paddingRight: '20px' }}><YouTube /></span>
  },
  {
    name: 'Netflix',
    icon: <span style={{ zoom: 0.3, paddingRight: '20px' }}><Netflix /></span>
  }
]

export function formatBytes (value: number): string {
  if (value < 1_000) {
    return `${value} kB`
  } else if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(0)} MB`
  } else {
    return `${(value / 1_000_000).toFixed(0)} GB`
  }
}
