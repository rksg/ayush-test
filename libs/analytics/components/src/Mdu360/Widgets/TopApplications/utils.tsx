import { Divider } from 'antd'

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
  Whatsapp,
  Applications
} from '@acx-ui/icons'

import * as UI from './styledComponents'

export interface ApplicationData {
  name: string
  value: string
}

const columnSize = 5

const IconWrapper = ({ children, zoom = 0.3 }: { children: React.ReactNode; zoom?: number }) => (
  <span style={{ zoom, paddingRight: '20px' }}>{children}</span>
)

export const iconList = [
  { name: 'facebook', icon: <IconWrapper><FacebookColored /></IconWrapper> },
  { name: 'google', icon: <IconWrapper><GoogleColored /></IconWrapper> },
  { name: 'twitter', icon: <IconWrapper zoom={0.33}><TwitterColored /></IconWrapper> },
  { name: 'youtube', icon: <IconWrapper><YouTube /></IconWrapper> },
  { name: 'netflix', icon: <IconWrapper><Netflix /></IconWrapper> },
  { name: 'linkedin', icon: <IconWrapper><LinkedInColored /></IconWrapper> },
  { name: 'apple', icon: <IconWrapper zoom={0.35}><Apple /></IconWrapper> },
  { name: 'microsoft', icon: <IconWrapper zoom={0.35}><Microsoft /></IconWrapper> },
  { name: 'whatsapp', icon: <IconWrapper zoom={0.4}><Whatsapp /></IconWrapper> },
  { name: 'chrome', icon: <IconWrapper><ChromeColored /></IconWrapper> },
  { name: 'applications', icon: <IconWrapper zoom={0.25}><Applications /></IconWrapper> }
]

const getIconForApplication = (name: string) => {
  return iconList.find(icon => name.toLowerCase().includes(icon.name))?.icon ||
    iconList.find(icon => icon.name === 'applications')?.icon
}

const renderApplicationItem = (item: ApplicationData) => {
  const { name, value } = item
  const icon = getIconForApplication(name)
  return (
    <UI.ColumnItemWrapper key={name}>
      <UI.ColumnItemIconWrapper>
        {icon}
        <span>{name}</span>
      </UI.ColumnItemIconWrapper>
      <UI.ColumnValue>{value}</UI.ColumnValue>
    </UI.ColumnItemWrapper>
  )
}

const renderColumn = (items: ApplicationData[]) => (
  <UI.ColumnHeaderWrapper>
    {items.map(item => renderApplicationItem(item))}
  </UI.ColumnHeaderWrapper>
)

export const renderContent = (data: ApplicationData[]) => {
  const leftColumn = data.slice(0, columnSize)
  const rightColumn = data.slice(columnSize)

  return (
    <UI.ColumnWrapper>
      {renderColumn(leftColumn)}
      <Divider
        type='vertical'
        style={{ height: '135px', marginInline: 16 }}
      />
      {renderColumn(rightColumn)}
    </UI.ColumnWrapper>
  )
}
